# Design Document: Discord SaaS Bot System

## Overview

This design document specifies the architecture and implementation details for a production-grade, multi-tenant Discord SaaS bot system. The system implements a comprehensive suite of moderation, automation, engagement, and AI features across 11 architectural layers with strict isolation, premium feature gating, and enterprise-level reliability.

### System Goals

- Support unlimited Discord guilds with complete data isolation
- Achieve 99.9% uptime with graceful degradation during partial failures
- Handle 1000+ concurrent operations without performance degradation
- Maintain 90%+ test coverage across all modules
- Enforce strict security controls and abuse prevention
- Provide seamless premium feature gating and billing integration

### Technology Stack

- **Bot Framework**: Discord.js v14 with sharding support
- **Backend API**: Node.js with Express.js
- **Database**: PostgreSQL 15+ with pgvector extension
- **Cache**: Redis 7+ with pub/sub support
- **Worker Queue**: BullMQ for async job processing
- **Dashboard**: React with Next.js and OAuth2 authentication
- **Testing**: Jest with 90%+ coverage requirement
- **Deployment**: Docker containers with horizontal scaling


## Architecture

### System Architecture Diagram

```mermaid
flowchart TD
    User[Discord User] --> Gateway[Discord Gateway]
    Gateway --> ShardManager[Shard Manager]
    ShardManager --> Shard0[Shard 0]
    ShardManager --> Shard1[Shard 1]
    ShardManager --> ShardN[Shard N]
    
    Shard0 --> Redis[(Redis Cache)]
    Shard1 --> Redis
    ShardN --> Redis
    
    Shard0 --> API[Central API]
    Shard1 --> API
    ShardN --> API
    
    Dashboard[Web Dashboard] --> API
    PublicAPI[Public Webhooks] --> API
    
    API --> PostgreSQL[(PostgreSQL)]
    API --> Redis
    API --> WorkerQueue[BullMQ Queue]
    
    WorkerQueue --> Worker1[Worker Process 1]
    WorkerQueue --> Worker2[Worker Process 2]
    
    Worker1 --> PostgreSQL
    Worker1 --> Redis
    Worker2 --> PostgreSQL
    Worker2 --> Redis
    
    API --> AIService[AI Service]
    Worker1 --> AIService
    
    Twitch[Twitch EventSub] --> API
    Kick[Kick API] --> Worker1
    YouTube[YouTube WebSub] --> API
```

### Layer Architecture

The system implements 11 distinct architectural layers with strict separation of concerns:

1. **Bot Layer**: Discord.js sharded bot processes handling events and commands
2. **API Layer**: Express.js REST API for dashboard and webhook integrations
3. **Database Layer**: PostgreSQL with migrations and connection pooling
4. **Redis Layer**: In-memory cache for configs, cooldowns, and rate limits
5. **Worker Layer**: BullMQ background job processors for async tasks
6. **Dashboard Layer**: Next.js web interface with OAuth2 authentication
7. **Permission Layer**: Role hierarchy validation and access control
8. **Logging Layer**: Comprehensive event logging and audit trails
9. **Premium Gating Layer**: Subscription validation and feature access control
10. **Test Layer**: Jest test suites with 90%+ coverage
11. **Documentation Layer**: API docs, deployment guides, and runbooks


### Sharding Strategy

Discord requires sharding for bots in 2500+ guilds. This system implements sharding from day one:

- **Shard Calculation**: `shard_id = (guild_id >> 22) % total_shards`
- **Shard Manager**: Spawns and manages multiple bot processes
- **Shared State**: Redis provides shared state across all shards
- **Guild Distribution**: Guilds automatically distributed across shards
- **Horizontal Scaling**: Add shards dynamically as guild count grows

### Data Flow Patterns

**Command Execution Flow**:
1. User executes slash command in Discord
2. Discord Gateway routes to appropriate shard
3. Shard validates permissions and checks Redis cache
4. Shard calls API endpoint with validated data
5. API validates input schema and guild ownership
6. API performs database operations
7. API updates Redis cache
8. API returns response to shard
9. Shard sends reply to Discord

**Background Job Flow**:
1. API or Bot adds job to BullMQ queue
2. Worker process picks up job from Redis queue
3. Worker executes job with idempotent logic
4. Worker updates database and cache
5. Worker logs execution status
6. On failure, job retries with exponential backoff
7. After max retries, job moves to dead-letter queue


## Components and Interfaces

### Bot Layer Components

#### CommandHandler
Manages slash command registration and execution.

```typescript
interface CommandHandler {
  registerCommands(guildId: string): Promise<void>;
  executeCommand(interaction: CommandInteraction): Promise<void>;
  validatePermissions(interaction: CommandInteraction): Promise<boolean>;
  validateRoleHierarchy(executor: GuildMember, target: GuildMember): boolean;
}
```

#### EventHandler
Processes Discord gateway events.

```typescript
interface EventHandler {
  handleMessageCreate(message: Message): Promise<void>;
  handleMessageDelete(message: Message): Promise<void>;
  handleMessageUpdate(oldMessage: Message, newMessage: Message): Promise<void>;
  handleMemberJoin(member: GuildMember): Promise<void>;
  handleMemberLeave(member: GuildMember): Promise<void>;
  handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void>;
}
```

#### AutoModEngine
Implements automated content moderation.

```typescript
interface AutoModEngine {
  checkSpam(message: Message): Promise<boolean>;
  checkCapsRatio(content: string): boolean;
  checkInviteLinks(content: string): boolean;
  checkBadWords(content: string, patterns: RegExp[]): boolean;
  checkMassMention(message: Message): boolean;
  applyPunishment(member: GuildMember, violation: ViolationType): Promise<void>;
}
```

#### PermissionGuard
Validates permissions and role hierarchy.

```typescript
interface PermissionGuard {
  hasPermission(member: GuildMember, permission: PermissionResolvable): boolean;
  canTargetMember(executor: GuildMember, target: GuildMember): boolean;
  canManageRole(member: GuildMember, role: Role): boolean;
  isGuildOwner(member: GuildMember): boolean;
}
```


### API Layer Components

#### GuildConfigController
Manages guild configuration via REST API.

```typescript
interface GuildConfigController {
  getConfig(guildId: string, userId: string): Promise<GuildConfig>;
  updateConfig(guildId: string, userId: string, updates: Partial<GuildConfig>): Promise<GuildConfig>;
  validateOwnership(guildId: string, userId: string): Promise<boolean>;
  invalidateCache(guildId: string): Promise<void>;
}
```

#### ModerationController
Handles moderation actions and case management.

```typescript
interface ModerationController {
  createWarn(guildId: string, targetId: string, moderatorId: string, reason: string): Promise<Case>;
  createTimeout(guildId: string, targetId: string, duration: number, reason: string): Promise<Case>;
  createKick(guildId: string, targetId: string, reason: string): Promise<Case>;
  createBan(guildId: string, targetId: string, reason: string): Promise<Case>;
  getCaseHistory(guildId: string, userId: string): Promise<Case[]>;
  getActiveWarnings(guildId: string, userId: string): Promise<number>;
}
```

#### GiveawayController
Manages giveaway lifecycle and winner selection.

```typescript
interface GiveawayController {
  createGiveaway(guildId: string, config: GiveawayConfig): Promise<Giveaway>;
  enterGiveaway(giveawayId: string, userId: string): Promise<boolean>;
  selectWinner(giveawayId: string): Promise<string>;
  claimPrize(giveawayId: string, userId: string): Promise<boolean>;
  rerollWinner(giveawayId: string): Promise<string>;
  validateEntry(giveawayId: string, userId: string): Promise<boolean>;
}
```

#### StreamingController
Handles streaming platform integrations.

```typescript
interface StreamingController {
  handleTwitchWebhook(payload: TwitchEventSubPayload): Promise<void>;
  handleYouTubeWebhook(payload: YouTubeWebSubPayload): Promise<void>;
  addStreamer(guildId: string, platform: Platform, streamerId: string): Promise<void>;
  removeStreamer(guildId: string, streamerId: string): Promise<void>;
  notifyStream(guildId: string, streamData: StreamData): Promise<void>;
}
```


### Cache Layer Components

#### RedisCache
Provides high-performance caching with TTL support.

```typescript
interface RedisCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  increment(key: string, amount?: number): Promise<number>;
  expire(key: string, ttl: number): Promise<void>;
}
```

**Key Naming Convention**: `bot:{guildId}:{feature}:{key}`

Examples:
- `bot:123456789:config:main` - Guild configuration
- `bot:123456789:xp:987654321` - User XP data
- `bot:123456789:cooldown:987654321:message` - Message cooldown
- `bot:123456789:giveaway:555555:claim` - Giveaway claim timer

#### RateLimiter
Implements rate limiting using Redis.

```typescript
interface RateLimiter {
  checkLimit(key: string, maxRequests: number, windowSeconds: number): Promise<boolean>;
  getRemainingRequests(key: string): Promise<number>;
  resetLimit(key: string): Promise<void>;
}
```

### Worker Layer Components

#### GiveawayWorker
Processes giveaway timers and auto-rerolls.

```typescript
interface GiveawayWorker {
  processGiveawayEnd(giveawayId: string): Promise<void>;
  processClaimTimeout(giveawayId: string, winnerId: string): Promise<void>;
  processAutoReroll(giveawayId: string): Promise<void>;
}
```

#### ScheduledMessageWorker
Executes scheduled messages based on cron schedules.

```typescript
interface ScheduledMessageWorker {
  processScheduledMessage(messageId: string): Promise<void>;
  validateSchedule(cronExpression: string): boolean;
}
```

#### ReminderWorker
Dispatches user reminders at scheduled times.

```typescript
interface ReminderWorker {
  processReminder(reminderId: string): Promise<void>;
  scheduleReminder(userId: string, timestamp: number, message: string): Promise<string>;
}
```


### Premium Layer Components

#### PremiumValidator
Validates premium subscription status.

```typescript
interface PremiumValidator {
  isPremium(guildId: string): Promise<boolean>;
  getPremiumTier(guildId: string): Promise<PremiumTier>;
  validateFeatureAccess(guildId: string, feature: PremiumFeature): Promise<boolean>;
  getFeatureLimits(guildId: string): Promise<FeatureLimits>;
}
```

#### FeatureGate
Controls access to premium features.

```typescript
interface FeatureGate {
  checkAccess(guildId: string, feature: PremiumFeature): Promise<boolean>;
  getUpgradeMessage(feature: PremiumFeature): string;
  logAccessAttempt(guildId: string, feature: PremiumFeature, granted: boolean): Promise<void>;
}
```

### AI Layer Components

#### AIAssistant
Handles AI request processing with RAG support.

```typescript
interface AIAssistant {
  processRequest(guildId: string, userId: string, message: string): Promise<string>;
  fetchRAGContext(guildId: string, query: string): Promise<string[]>;
  enforceRateLimit(userId: string): Promise<boolean>;
  enforceQuota(guildId: string): Promise<boolean>;
  handleTimeout(): string;
}
```

#### RAGManager
Manages retrieval-augmented generation knowledge base.

```typescript
interface RAGManager {
  uploadDocument(guildId: string, content: string, metadata: DocumentMetadata): Promise<string>;
  deleteDocument(guildId: string, documentId: string): Promise<void>;
  searchSimilar(guildId: string, query: string, limit: number): Promise<Document[]>;
  generateEmbedding(text: string): Promise<number[]>;
}
```


## Data Models

### Database Schema

#### guilds
Stores guild configuration and settings.

```sql
CREATE TABLE guilds (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  premium_tier VARCHAR(20) DEFAULT 'free',
  premium_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_guilds_premium ON guilds(premium_tier, premium_expires_at);
```

#### guild_configs
Stores detailed guild configuration.

```sql
CREATE TABLE guild_configs (
  guild_id VARCHAR(20) PRIMARY KEY REFERENCES guilds(id) ON DELETE CASCADE,
  prefix VARCHAR(10) DEFAULT '!',
  log_channel_id VARCHAR(20),
  mod_role_id VARCHAR(20),
  automod_enabled BOOLEAN DEFAULT true,
  automod_spam_enabled BOOLEAN DEFAULT true,
  automod_caps_threshold DECIMAL(3,2) DEFAULT 0.70,
  automod_links_enabled BOOLEAN DEFAULT false,
  automod_badwords_patterns TEXT[],
  escalation_warn_threshold INTEGER DEFAULT 3,
  escalation_timeout_threshold INTEGER DEFAULT 5,
  escalation_kick_threshold INTEGER DEFAULT 7,
  escalation_ban_threshold INTEGER DEFAULT 10,
  warning_decay_days INTEGER DEFAULT 30,
  xp_enabled BOOLEAN DEFAULT true,
  xp_cooldown_seconds INTEGER DEFAULT 60,
  xp_multiplier DECIMAL(3,2) DEFAULT 1.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### moderation_cases
Stores moderation actions and case history.

```sql
CREATE TABLE moderation_cases (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  case_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(20) NOT NULL,
  moderator_id VARCHAR(20) NOT NULL,
  action_type VARCHAR(20) NOT NULL,
  reason TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, case_id)
);

CREATE INDEX idx_cases_guild_user ON moderation_cases(guild_id, user_id);
CREATE INDEX idx_cases_expires ON moderation_cases(expires_at) WHERE expires_at IS NOT NULL;
```


#### giveaways
Stores giveaway configuration and state.

```sql
CREATE TABLE giveaways (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  channel_id VARCHAR(20) NOT NULL,
  message_id VARCHAR(20),
  prize TEXT NOT NULL,
  winner_id VARCHAR(20),
  required_role_id VARCHAR(20),
  minimum_level INTEGER,
  minimum_account_age_days INTEGER,
  claim_timeout_seconds INTEGER DEFAULT 300,
  max_reroll_count INTEGER DEFAULT 5,
  current_reroll_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  ends_at TIMESTAMP NOT NULL,
  claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_giveaways_guild ON giveaways(guild_id);
CREATE INDEX idx_giveaways_status ON giveaways(status, ends_at);
```

#### giveaway_entries
Stores giveaway participant entries.

```sql
CREATE TABLE giveaway_entries (
  id SERIAL PRIMARY KEY,
  giveaway_id INTEGER NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
  user_id VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(giveaway_id, user_id)
);

CREATE INDEX idx_entries_giveaway ON giveaway_entries(giveaway_id);
```

#### user_xp
Stores user experience points and levels.

```sql
CREATE TABLE user_xp (
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id VARCHAR(20) NOT NULL,
  text_xp INTEGER DEFAULT 0,
  voice_xp INTEGER DEFAULT 0,
  total_xp INTEGER GENERATED ALWAYS AS (text_xp + voice_xp) STORED,
  level INTEGER DEFAULT 0,
  last_message_at TIMESTAMP,
  last_voice_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY(guild_id, user_id)
);

CREATE INDEX idx_xp_leaderboard ON user_xp(guild_id, total_xp DESC);
```


#### tickets
Stores support ticket information.

```sql
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  thread_id VARCHAR(20) NOT NULL UNIQUE,
  creator_id VARCHAR(20) NOT NULL,
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'open',
  closed_by VARCHAR(20),
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tickets_guild_status ON tickets(guild_id, status);
```

#### ticket_transcripts
Stores ticket conversation transcripts.

```sql
CREATE TABLE ticket_transcripts (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### scheduled_messages
Stores scheduled message configurations.

```sql
CREATE TABLE scheduled_messages (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  channel_id VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  embed_data JSONB,
  cron_schedule VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_executed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scheduled_guild ON scheduled_messages(guild_id, enabled);
```

#### reminders
Stores user reminders.

```sql
CREATE TABLE reminders (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL,
  guild_id VARCHAR(20) REFERENCES guilds(id) ON DELETE CASCADE,
  channel_id VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  remind_at TIMESTAMP NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reminders_pending ON reminders(remind_at) WHERE completed = false;
```


#### triggers
Stores automation trigger configurations.

```sql
CREATE TABLE triggers (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  trigger_type VARCHAR(20) NOT NULL,
  pattern TEXT NOT NULL,
  response TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_triggers_guild ON triggers(guild_id, enabled);
```

#### streamers
Stores streaming platform integrations.

```sql
CREATE TABLE streamers (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL,
  streamer_id VARCHAR(100) NOT NULL,
  streamer_name VARCHAR(100) NOT NULL,
  notification_channel_id VARCHAR(20) NOT NULL,
  mention_role_id VARCHAR(20),
  last_stream_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, platform, streamer_id)
);

CREATE INDEX idx_streamers_guild ON streamers(guild_id);
```

#### ai_knowledge_base
Stores RAG documents with vector embeddings.

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE ai_knowledge_base (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_kb_guild ON ai_knowledge_base(guild_id);
CREATE INDEX idx_ai_kb_embedding ON ai_knowledge_base USING ivfflat (embedding vector_cosine_ops);
```


#### event_logs
Stores comprehensive event logging.

```sql
CREATE TABLE event_logs (
  id BIGSERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(20),
  channel_id VARCHAR(20),
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logs_guild_type ON event_logs(guild_id, event_type, created_at DESC);
CREATE INDEX idx_logs_user ON event_logs(guild_id, user_id, created_at DESC);
```

### Redis Data Structures

#### Guild Configuration Cache
```
Key: bot:{guildId}:config:main
Type: Hash
TTL: 300 seconds (5 minutes)
Fields: All guild_configs columns as hash fields
```

#### XP Cooldowns
```
Key: bot:{guildId}:cooldown:{userId}:message
Type: String
TTL: 60 seconds
Value: timestamp
```

#### Rate Limits
```
Key: bot:{guildId}:ratelimit:{feature}:{userId}
Type: String
TTL: Variable based on feature
Value: request count
```

#### Giveaway Claim Timers
```
Key: bot:{guildId}:giveaway:{giveawayId}:claim
Type: String
TTL: 300 seconds (5 minutes, configurable)
Value: winner user ID
```

#### Premium Status Cache
```
Key: bot:{guildId}:premium:status
Type: Hash
TTL: 300 seconds (5 minutes)
Fields: tier, expires_at
```

#### Active Warnings Count
```
Key: bot:{guildId}:warnings:{userId}:count
Type: String
TTL: 86400 seconds (24 hours)
Value: warning count
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Role Hierarchy Enforcement

*For any* moderation command or role manipulation operation, when an executor attempts to target a user, the operation should be rejected if the target has an equal or higher role in the hierarchy than the executor.

**Validates: Requirements 1.4, 3.9, 19.1**

### Property 2: Self-Targeting Prevention

*For any* punishment command (warn, timeout, kick, ban), when the executor and target are the same user, the operation should be rejected.

**Validates: Requirements 1.6**

### Property 3: Guild Data Isolation

*For any* two distinct guilds A and B, when querying data for guild A through any interface (Bot, API, Dashboard), the results should never contain data belonging to guild B.

**Validates: Requirements 1.9, 16.4**

### Property 4: Configuration Caching

*For any* guild configuration, after the first database load, subsequent reads within the TTL period should be served from Redis cache without database queries.

**Validates: Requirements 1.8**

### Property 5: Permission Validation Before Execution

*For any* command execution, permission validation should occur before any state changes or Discord API calls are made.

**Validates: Requirements 1.3**


### Property 6: AutoMod Spam Detection

*For any* sequence of messages from the same user, when messages have high similarity (hash match) and are sent within a short time window, spam should be detected and the configured action applied.

**Validates: Requirements 2.1**

### Property 7: AutoMod Caps Ratio Detection

*For any* message content, when the ratio of uppercase to total characters exceeds the configured threshold, the message should be flagged as a caps violation.

**Validates: Requirements 2.2**

### Property 8: AutoMod Pattern Matching

*For any* message content and configured regex pattern, when the pattern matches the content, the message should be flagged as a violation.

**Validates: Requirements 2.5**

### Property 9: AutoMod Response Time

*For any* AutoMod violation detection, the configured action should be applied within 200 milliseconds of detection.

**Validates: Requirements 2.8**

### Property 10: Unique Case ID Generation

*For any* moderation action within a guild, the generated Case_ID should be unique within that guild's moderation history.

**Validates: Requirements 3.1, 3.5**

### Property 11: Escalation Threshold Calculation

*For any* user warning count and guild escalation configuration, the calculated punishment level should match the highest threshold that the warning count meets or exceeds.

**Validates: Requirements 4.3**

### Property 12: Offense Count Consistency

*For any* user in a guild, the offense count stored in Redis should match the count of non-expired warnings in PostgreSQL.

**Validates: Requirements 4.9**


### Property 13: Giveaway Duplicate Entry Prevention

*For any* user and giveaway, when the user attempts to enter the same giveaway multiple times, only the first entry should be accepted and subsequent attempts should be rejected.

**Validates: Requirements 6.5**

### Property 14: Giveaway Winner Selection Validity

*For any* giveaway with valid entries, when a winner is selected, the winner's user ID should exist in the giveaway's entry list.

**Validates: Requirements 6.6**

### Property 15: Giveaway Auto-Reroll Exclusion

*For any* giveaway reroll, when selecting a new winner, users who previously failed to claim should be excluded from the selection pool.

**Validates: Requirements 6.11**

### Property 16: Giveaway Maximum Reroll Limit

*For any* giveaway, when the reroll counter reaches the configured maximum, no additional winner selection attempts should occur.

**Validates: Requirements 6.13**

### Property 17: XP Cooldown Enforcement

*For any* user in a guild, when text XP is awarded, subsequent XP awards should be blocked until the cooldown period (60 seconds) has elapsed.

**Validates: Requirements 7.1**

### Property 18: Level-Up Threshold Detection

*For any* user XP gain, when the total XP crosses a level threshold, the user's level should increment by exactly one.

**Validates: Requirements 7.5**

### Property 19: XP Synchronization Consistency

*For any* user in a guild, after the batch synchronization period, the XP value in PostgreSQL should match the XP value in Redis.

**Validates: Requirements 7.9**


### Property 20: Component Role Toggle Behavior

*For any* user and component role, when the user clicks the role button, if the user currently has the role it should be removed, and if the user does not have the role it should be added.

**Validates: Requirements 8.2**

### Property 21: Rate Limiting Enforcement

*For any* rate-limited operation (component roles, AI requests, etc.), when a user exceeds the configured request limit within the time window, subsequent requests should be rejected until the window resets.

**Validates: Requirements 8.3, 13.2**

### Property 22: Trigger Keyword Matching

*For any* message and configured trigger, when the message content matches the trigger's keyword or pattern, the configured response should be sent.

**Validates: Requirements 9.5**

### Property 23: Idempotent Job Execution

*For any* worker job with a unique job identifier, executing the job multiple times should produce the same final state as executing it once.

**Validates: Requirements 9.12, 17.14**

### Property 24: Stream Notification Deduplication

*For any* stream session, when the stream goes live, only one notification should be sent regardless of how many times the live event is received.

**Validates: Requirements 12.7**

### Property 25: AI Token Limit Enforcement

*For any* AI response generation, the total token count (prompt + response) should not exceed the configured maximum token limit.

**Validates: Requirements 13.6**


### Property 26: Premium Feature Access Control

*For any* premium feature request, when the guild's premium status is expired or inactive, access should be denied and an upgrade message should be returned.

**Validates: Requirements 15.1, 15.3**

### Property 27: Redis Key Naming Convention

*For any* Redis key created by the system, the key should follow the format `bot:{guildId}:{feature}:{key}` where guildId is the Discord guild ID.

**Validates: Requirements 16.1**

### Property 28: API Guild Ownership Validation

*For any* API request accessing guild data, the authenticated user should have administrator permissions in the target guild or the request should be rejected.

**Validates: Requirements 16.3**

### Property 29: Worker Job Retry with Exponential Backoff

*For any* failed worker job, the system should retry up to 3 times with exponentially increasing delays (e.g., 1s, 2s, 4s) before moving to the dead-letter queue.

**Validates: Requirements 17.7, 21.4**

### Property 30: Concurrent Command Handling

*For any* set of 1000 concurrent command executions, all commands should complete successfully without errors or timeouts under normal system load.

**Validates: Requirements 18.1**

### Property 31: Command Response Time

*For any* command execution under normal load, the response should be sent to Discord within 200 milliseconds of receiving the command.

**Validates: Requirements 18.3**

### Property 32: SQL Injection Prevention

*For any* user input containing SQL injection attempts (e.g., `'; DROP TABLE users; --`), the input should be sanitized or parameterized such that no SQL injection occurs.

**Validates: Requirements 19.12**


### Property 33: Graceful Redis Failure Handling

*For any* operation when Redis is unavailable, the system should log the error, continue operation with degraded functionality (e.g., skip caching), and not crash or throw unhandled exceptions.

**Validates: Requirements 21.1**

## Error Handling

### Error Categories

The system implements comprehensive error handling across four categories:

1. **Client Errors (4xx)**: Invalid input, permission denied, rate limit exceeded
2. **Server Errors (5xx)**: Database failures, external API failures, internal errors
3. **Discord API Errors**: Rate limits, missing permissions, invalid requests
4. **External Service Errors**: AI service timeouts, streaming platform failures

### Error Response Format

All API endpoints return consistent error structures:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
  };
}
```

### Retry Strategies

**Exponential Backoff**: Used for worker jobs and external API calls
- Initial delay: 1 second
- Multiplier: 2x
- Maximum attempts: 3
- Maximum delay: 30 seconds

**Circuit Breaker**: Used for external services (AI, streaming platforms)
- Failure threshold: 5 consecutive failures
- Timeout: 60 seconds
- Half-open test: Single request after timeout

### Graceful Degradation

When dependencies fail, the system degrades gracefully:

- **Redis Failure**: Skip caching, query database directly, log performance impact
- **PostgreSQL Failure**: Queue operations for retry, return cached data if available
- **AI Service Failure**: Return timeout message, disable AI temporarily after repeated failures
- **Discord API Rate Limit**: Respect rate limit headers, queue requests, retry after reset


## Testing Strategy

### Dual Testing Approach

The system requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
- Specific command executions with known inputs/outputs
- Edge cases (empty strings, null values, boundary conditions)
- Error conditions (missing permissions, invalid input)
- Integration points between components

**Property Tests**: Verify universal properties across all inputs
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Minimum 100 iterations per property test
- Each property test references its design document property

Together, unit tests catch concrete bugs while property tests verify general correctness.

### Property-Based Testing Configuration

**Library**: fast-check (JavaScript/TypeScript property-based testing library)

**Configuration**:
```typescript
fc.assert(
  fc.property(
    // generators
    fc.string(), fc.integer(), etc.
  ),
  (input) => {
    // property assertion
  },
  { numRuns: 100 } // minimum 100 iterations
);
```

**Test Tagging**: Each property test must include a comment tag:
```typescript
// Feature: discord-saas-bot, Property 3: Guild Data Isolation
test('guild data should never leak across guilds', () => {
  fc.assert(
    fc.property(
      fc.record({ guildId: fc.string(), data: fc.anything() }),
      fc.record({ guildId: fc.string(), data: fc.anything() }),
      (guildA, guildB) => {
        // test that querying guildA never returns guildB data
      }
    ),
    { numRuns: 100 }
  );
});
```


### Test Coverage Requirements

**Minimum Coverage**: 90% across all metrics
- 90% line coverage
- 90% branch coverage
- 90% function coverage
- 90% statement coverage

**Required Test Types** (from PROJECT_MASTER_LOCK.md):

1. **Happy Path Tests**: Normal operation with valid inputs
2. **Permission Denied Tests**: Operations without required permissions
3. **Invalid Input Tests**: Malformed, missing, or out-of-range inputs
4. **Rate Limit Tests**: Exceeding configured rate limits
5. **Redis Failure Tests**: Simulated Redis unavailability
6. **Database Failure Tests**: Simulated PostgreSQL unavailability
7. **Worker Failure Tests**: Job execution failures and retries
8. **External API Failure Tests**: Streaming platform and AI service failures
9. **Premium Expired Tests**: Premium feature access with expired subscription
10. **Cross-Guild Isolation Tests**: Data leakage prevention
11. **Concurrency Tests**: Simultaneous operations on same resources
12. **Duplicate Execution Tests**: Idempotency verification

### Mock Data Standards

All tests use structured mock data with realistic identifiers:

```typescript
const mockGuild = {
  id: '123456789012345678',
  name: 'Test Guild',
  premium_tier: 'premium',
  premium_expires_at: new Date('2025-12-31')
};

const mockUser = {
  id: '987654321098765432',
  username: 'testuser',
  discriminator: '1234'
};

const mockRole = {
  id: '555555555555555555',
  name: 'Moderator',
  position: 5
};
```

### Test Organization

Tests are organized by layer and component:

```
tests/
├── bot/
│   ├── commands/
│   ├── events/
│   ├── automod/
│   └── permissions/
├── api/
│   ├── controllers/
│   ├── middleware/
│   └── validation/
├── workers/
│   ├── giveaway/
│   ├── scheduled/
│   └── reminders/
├── integration/
│   ├── bot-api/
│   ├── api-database/
│   └── end-to-end/
└── properties/
    ├── isolation.test.ts
    ├── permissions.test.ts
    ├── giveaways.test.ts
    └── [one file per property group]
```


## Additional Component Details

### Legacy Prefix Command System

The system supports optional prefix commands for backward compatibility:

```typescript
interface PrefixCommandHandler {
  parseCommand(message: Message, prefix: string): ParsedCommand | null;
  validateIntent(bot: Client): boolean; // Check Message Content Intent
  enforceRateLimit(userId: string, guildId: string): Promise<boolean>;
  isEnabled(guildId: string): Promise<boolean>;
}

interface ParsedCommand {
  name: string;
  args: string[];
  rawArgs: string;
}
```

**Configuration**:
- Disabled by default per guild
- Configurable prefix (default: `!`)
- Hard rate limit: 5 commands per 10 seconds per user
- Requires Message Content Intent (privileged, requires 100+ servers approval)

### Component Role System

Implements interactive role assignment via Discord components:

```typescript
interface ComponentRolePanel {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string;
  type: 'button' | 'select_menu';
  roles: ComponentRole[];
  maxSelections?: number; // For select menus
  minSelections?: number; // For select menus
}

interface ComponentRole {
  roleId: string;
  label: string;
  emoji?: string;
  style?: ButtonStyle; // For buttons
  description?: string; // For select menus
}
```

**Button Panel Example**:
```
[🎮 Gamer] [🎨 Artist] [🎵 Musician]
```

**Select Menu Example**:
```
Select your roles (up to 3):
▼ [Dropdown with role options]
```

**Rate Limiting**: 3 interactions per 10 seconds per user via Redis


### Timed Roles System (Premium)

Implements automatic role expiration:

```typescript
interface TimedRole {
  id: string;
  guildId: string;
  userId: string;
  roleId: string;
  expiresAt: Date;
  assignedBy: string;
  reason?: string;
}

interface TimedRoleWorker {
  scheduleExpiration(timedRole: TimedRole): Promise<void>;
  processExpiration(timedRoleId: string): Promise<void>;
  checkExpiredRoles(): Promise<void>; // Runs every 5 minutes
}
```

**Worker Logic**:
1. Check database for roles with `expires_at < NOW()`
2. Remove role from user via Discord API
3. Log removal in audit log
4. Delete timed role record
5. Handle cases where user left guild

### Welcome and Goodbye System

Implements customizable member join/leave messages:

```typescript
interface WelcomeConfig {
  guildId: string;
  enabled: boolean;
  channelId: string;
  message: string;
  embedEnabled: boolean;
  embedData?: EmbedData;
}

interface GoodbyeConfig {
  guildId: string;
  enabled: boolean;
  channelId: string;
  message: string;
}
```

**Variable Substitution**:
- `{user}` - User mention (@User#1234)
- `{username}` - Username without mention
- `{server}` - Server name
- `{membercount}` - Current member count
- `{channel}` - Channel mention

**Example**:
```
Welcome {user} to {server}! You are member #{membercount}!
```


### Suggestion System

Implements community suggestion voting:

```typescript
interface Suggestion {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string;
  authorId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  status: 'pending' | 'approved' | 'denied' | 'implemented';
  createdAt: Date;
}

interface SuggestionConfig {
  guildId: string;
  channelId: string;
  upvoteEmoji: string; // Default: 👍
  downvoteEmoji: string; // Default: 👎
  autoApproveThreshold?: number; // Auto-approve at X upvotes
}
```

**Flow**:
1. User submits suggestion via command
2. Bot posts suggestion in configured channel
3. Bot adds upvote and downvote reactions
4. Bot tracks vote counts in database
5. Moderators can approve/deny via commands

### Starboard System

Implements message highlighting based on reactions:

```typescript
interface StarboardConfig {
  guildId: string;
  enabled: boolean;
  channelId: string;
  emoji: string; // Default: ⭐
  threshold: number; // Default: 5
  selfStar: boolean; // Allow self-starring, default: false
}

interface StarboardEntry {
  id: string;
  guildId: string;
  originalMessageId: string;
  originalChannelId: string;
  starboardMessageId: string;
  starCount: number;
  createdAt: Date;
}
```

**Logic**:
1. Monitor reaction add events for configured emoji
2. Count reactions on message
3. When threshold reached, post to starboard channel
4. Update star count on existing starboard posts
5. Prevent duplicate entries (check by originalMessageId)


### Custom Embed Builder

Provides rich embed creation interface:

```typescript
interface EmbedBuilder {
  title?: string;
  description?: string;
  color?: string; // Hex color
  author?: {
    name: string;
    iconUrl?: string;
    url?: string;
  };
  thumbnail?: string;
  image?: string;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
    iconUrl?: string;
  };
  timestamp?: boolean;
}
```

**Premium Feature**: Custom embed themes with saved templates

### Voice XP Anti-AFK System

Implements strict voice XP validation:

```typescript
interface VoiceXPValidator {
  isEligibleForXP(voiceState: VoiceState): boolean;
}

// Validation Rules:
function isEligibleForXP(voiceState: VoiceState): boolean {
  // Must be in a voice channel
  if (!voiceState.channelId) return false;
  
  // Must not be muted (server or self)
  if (voiceState.mute || voiceState.selfMute) return false;
  
  // Must not be deafened (server or self)
  if (voiceState.deaf || voiceState.selfDeaf) return false;
  
  // Must not be alone in channel
  const channel = voiceState.channel;
  if (channel.members.size <= 1) return false;
  
  return true;
}
```

**XP Award Rate**: 1 XP per minute of eligible voice time, batched every 5 minutes


### Kick Streaming Integration

Implements polling-based Kick.com stream detection:

```typescript
interface KickPoller {
  pollInterval: number; // 60 seconds
  pollStreamer(streamerId: string): Promise<KickStreamData | null>;
  processStreamStatus(streamer: Streamer, data: KickStreamData | null): Promise<void>;
}

interface KickStreamData {
  isLive: boolean;
  streamId: string;
  title: string;
  viewerCount: number;
  thumbnailUrl: string;
}
```

**Polling Logic**:
1. Worker runs every 60 seconds
2. Fetch all Kick streamers from database
3. Poll Kick API for each streamer's status
4. Compare with `last_stream_id` to detect new streams
5. If new stream detected, trigger notification
6. Update `last_stream_id` to prevent duplicates

**Rate Limiting**: Batch requests, respect Kick API limits

### Multi-Stage Automation (Premium)

Implements conditional automation workflows:

```typescript
interface AutomationStage {
  id: string;
  order: number;
  condition?: AutomationCondition;
  action: AutomationAction;
  delay?: number; // Seconds to wait before next stage
}

interface AutomationCondition {
  type: 'role_has' | 'role_missing' | 'level_gte' | 'level_lte' | 'custom';
  value: string | number;
}

interface AutomationAction {
  type: 'send_message' | 'add_role' | 'remove_role' | 'send_dm' | 'create_thread';
  parameters: Record<string, any>;
}
```

**Example Workflow**:
```
Stage 1: User joins → Add "New Member" role
Stage 2: Wait 24 hours
Stage 3: If user has "New Member" role → Send welcome DM
Stage 4: Remove "New Member" role → Add "Member" role
```


### Dashboard Security Implementation

Implements comprehensive web security:

```typescript
interface DashboardSecurity {
  authenticateOAuth(code: string): Promise<OAuthUser>;
  generateJWT(user: OAuthUser): string;
  validateJWT(token: string): Promise<JWTPayload>;
  generateCSRFToken(sessionId: string): string;
  validateCSRFToken(token: string, sessionId: string): boolean;
  validateGuildAccess(userId: string, guildId: string): Promise<boolean>;
}

interface JWTPayload {
  userId: string;
  username: string;
  discriminator: string;
  avatar: string;
  guilds: string[]; // Guild IDs user has access to
  iat: number; // Issued at
  exp: number; // Expires at (24 hours)
}
```

**OAuth2 Flow**:
1. User clicks "Login with Discord"
2. Redirect to Discord OAuth2 authorization
3. Discord redirects back with authorization code
4. Exchange code for access token
5. Fetch user info and guild list
6. Generate JWT with 24-hour expiration
7. Store JWT in httpOnly cookie

**CSRF Protection**:
- Generate unique token per session
- Include token in all state-changing forms
- Validate token on server before processing
- Rotate token after successful operation

**Guild Access Validation**:
```typescript
async function validateGuildAccess(userId: string, guildId: string): Promise<boolean> {
  // Fetch user's guilds from Discord API
  const guilds = await fetchUserGuilds(userId);
  
  // Check if user is in guild
  const guild = guilds.find(g => g.id === guildId);
  if (!guild) return false;
  
  // Check if user has ADMINISTRATOR permission
  const hasAdmin = (guild.permissions & 0x8) === 0x8;
  return hasAdmin;
}
```


### Premium Features Implementation

#### Custom Webhook Avatar Simulation (Premium)

Allows guilds to customize bot appearance per message:

```typescript
interface WebhookAvatarConfig {
  guildId: string;
  enabled: boolean;
  defaultName?: string;
  defaultAvatarUrl?: string;
  perChannelOverrides?: Map<string, {
    name: string;
    avatarUrl: string;
  }>;
}

interface WebhookManager {
  getOrCreateWebhook(channelId: string): Promise<Webhook>;
  sendAsWebhook(channelId: string, content: string, options: WebhookOptions): Promise<void>;
}
```

**Implementation**:
1. Create webhook in target channel (cached)
2. Send message via webhook with custom name/avatar
3. Appears as if from different user
4. Useful for roleplay, announcements, etc.

#### Custom Embed Themes (Premium)

Allows saving and reusing embed templates:

```typescript
interface EmbedTheme {
  id: string;
  guildId: string;
  name: string;
  template: EmbedBuilder;
  createdAt: Date;
}

interface EmbedThemeManager {
  saveTheme(guildId: string, name: string, template: EmbedBuilder): Promise<EmbedTheme>;
  getTheme(guildId: string, name: string): Promise<EmbedTheme | null>;
  listThemes(guildId: string): Promise<EmbedTheme[]>;
  applyTheme(themeId: string, content: string): Promise<MessageEmbed>;
}
```

#### Advanced Analytics Export (Premium)

Provides detailed engagement metrics:

```typescript
interface AnalyticsExport {
  guildId: string;
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    totalMessages: number;
    activeUsers: number;
    commandsExecuted: number;
    moderationActions: number;
    xpGained: number;
    voiceMinutes: number;
    topChannels: Array<{ channelId: string; messageCount: number }>;
    topUsers: Array<{ userId: string; xp: number; messages: number }>;
    hourlyActivity: Array<{ hour: number; messages: number }>;
  };
}
```

**Export Formats**: JSON, CSV, PDF


### Database Connection Pooling

Implements efficient PostgreSQL connection management:

```typescript
interface PoolConfig {
  min: 10; // Minimum connections
  max: 50; // Maximum connections
  idleTimeoutMillis: 30000; // 30 seconds
  connectionTimeoutMillis: 5000; // 5 seconds
  maxUses: 7500; // Recycle connection after 7500 uses
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ...PoolConfig
});
```

**Connection Lifecycle**:
1. Pool maintains minimum 10 idle connections
2. Creates new connections up to maximum 50 as needed
3. Recycles connections after 7500 queries
4. Closes idle connections after 30 seconds
5. Handles connection errors with automatic retry

### Redis Pub/Sub for Cross-Shard Communication

Implements shard-to-shard messaging:

```typescript
interface ShardMessenger {
  publish(channel: string, message: any): Promise<void>;
  subscribe(channel: string, handler: (message: any) => void): void;
  unsubscribe(channel: string): void;
}

// Example: Broadcast config update to all shards
async function broadcastConfigUpdate(guildId: string) {
  await redis.publish('config:update', {
    guildId,
    timestamp: Date.now()
  });
}

// Each shard subscribes to config updates
redis.subscribe('config:update', async (message) => {
  const { guildId } = message;
  // Invalidate local cache
  await cache.delete(`bot:${guildId}:config:main`);
});
```

**Pub/Sub Channels**:
- `config:update` - Guild configuration changes
- `premium:update` - Premium status changes
- `shard:broadcast` - General shard-to-shard messages
- `giveaway:winner` - Giveaway winner announcements


### Analytics Dashboard Implementation

Provides real-time engagement metrics:

```typescript
interface AnalyticsDashboard {
  getOverview(guildId: string): Promise<GuildOverview>;
  getCommandStats(guildId: string, period: TimePeriod): Promise<CommandStats>;
  getUserActivity(guildId: string, period: TimePeriod): Promise<UserActivity>;
  getChannelActivity(guildId: string, period: TimePeriod): Promise<ChannelActivity>;
  getModerationStats(guildId: string, period: TimePeriod): Promise<ModerationStats>;
}

interface GuildOverview {
  totalMembers: number;
  activeMembers: number; // Active in last 7 days
  totalMessages: number;
  totalCommands: number;
  totalXP: number;
  averageLevel: number;
  moderationActions: number;
  activeGiveaways: number;
}

interface CommandStats {
  totalExecutions: number;
  topCommands: Array<{
    command: string;
    count: number;
    successRate: number;
  }>;
  executionsByHour: Array<{
    hour: number;
    count: number;
  }>;
  errorRate: number;
}

interface UserActivity {
  activeUsers: number;
  newUsers: number;
  leftUsers: number;
  topContributors: Array<{
    userId: string;
    messages: number;
    xp: number;
    level: number;
  }>;
  retentionRate: number;
}
```

**Real-Time Updates**: Dashboard polls API every 30 seconds for live metrics

**Visualization**: Charts for hourly activity, command usage, user growth


### Additional Database Tables

#### component_role_panels
Stores interactive role assignment panels.

```sql
CREATE TABLE component_role_panels (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  channel_id VARCHAR(20) NOT NULL,
  message_id VARCHAR(20) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL, -- 'button' or 'select_menu'
  max_selections INTEGER,
  min_selections INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_panels_guild ON component_role_panels(guild_id);
```

#### component_roles
Stores individual roles in panels.

```sql
CREATE TABLE component_roles (
  id SERIAL PRIMARY KEY,
  panel_id INTEGER NOT NULL REFERENCES component_role_panels(id) ON DELETE CASCADE,
  role_id VARCHAR(20) NOT NULL,
  label VARCHAR(100) NOT NULL,
  emoji VARCHAR(100),
  style VARCHAR(20), -- For buttons: 'primary', 'secondary', 'success', 'danger'
  description TEXT, -- For select menus
  position INTEGER DEFAULT 0
);

CREATE INDEX idx_component_roles_panel ON component_roles(panel_id);
```

#### timed_roles
Stores roles with expiration timestamps.

```sql
CREATE TABLE timed_roles (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id VARCHAR(20) NOT NULL,
  role_id VARCHAR(20) NOT NULL,
  assigned_by VARCHAR(20) NOT NULL,
  reason TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, user_id, role_id)
);

CREATE INDEX idx_timed_roles_expires ON timed_roles(expires_at) WHERE expires_at > NOW();
```


#### suggestions
Stores community suggestions.

```sql
CREATE TABLE suggestions (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  channel_id VARCHAR(20) NOT NULL,
  message_id VARCHAR(20) NOT NULL UNIQUE,
  author_id VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_suggestions_guild_status ON suggestions(guild_id, status);
```

#### starboard_entries
Stores starboard message entries.

```sql
CREATE TABLE starboard_entries (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  original_message_id VARCHAR(20) NOT NULL,
  original_channel_id VARCHAR(20) NOT NULL,
  starboard_message_id VARCHAR(20) NOT NULL,
  star_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, original_message_id)
);

CREATE INDEX idx_starboard_guild ON starboard_entries(guild_id);
```

#### embed_themes
Stores custom embed templates (Premium).

```sql
CREATE TABLE embed_themes (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  template JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, name)
);

CREATE INDEX idx_themes_guild ON embed_themes(guild_id);
```

#### automation_workflows
Stores multi-stage automation configurations (Premium).

```sql
CREATE TABLE automation_workflows (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL,
  trigger_config JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflows_guild ON automation_workflows(guild_id, enabled);
```

#### automation_stages
Stores individual stages in workflows.

```sql
CREATE TABLE automation_stages (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER NOT NULL REFERENCES automation_workflows(id) ON DELETE CASCADE,
  stage_order INTEGER NOT NULL,
  condition_type VARCHAR(50),
  condition_value TEXT,
  action_type VARCHAR(50) NOT NULL,
  action_parameters JSONB NOT NULL,
  delay_seconds INTEGER DEFAULT 0
);

CREATE INDEX idx_stages_workflow ON automation_stages(workflow_id, stage_order);
```


## API Endpoints

### Authentication Endpoints

```
POST   /api/auth/login          - Initiate Discord OAuth2 flow
GET    /api/auth/callback       - OAuth2 callback handler
POST   /api/auth/logout         - Invalidate session
GET    /api/auth/me             - Get current user info
```

### Guild Configuration Endpoints

```
GET    /api/guilds/:guildId/config              - Get guild configuration
PATCH  /api/guilds/:guildId/config              - Update guild configuration
GET    /api/guilds/:guildId/premium             - Get premium status
POST   /api/guilds/:guildId/premium/upgrade     - Initiate premium upgrade
```

### Moderation Endpoints

```
GET    /api/guilds/:guildId/cases               - List moderation cases
GET    /api/guilds/:guildId/cases/:caseId       - Get case details
POST   /api/guilds/:guildId/cases               - Create moderation case
GET    /api/guilds/:guildId/users/:userId/warnings - Get user warnings
DELETE /api/guilds/:guildId/cases/:caseId       - Delete case (admin only)
```

### Giveaway Endpoints

```
GET    /api/guilds/:guildId/giveaways           - List giveaways
POST   /api/guilds/:guildId/giveaways           - Create giveaway
GET    /api/guilds/:guildId/giveaways/:id       - Get giveaway details
PATCH  /api/guilds/:guildId/giveaways/:id       - Update giveaway
DELETE /api/guilds/:guildId/giveaways/:id       - Delete giveaway
POST   /api/guilds/:guildId/giveaways/:id/reroll - Manual reroll
GET    /api/guilds/:guildId/giveaways/:id/entries - List entries
```

### Role Management Endpoints

```
GET    /api/guilds/:guildId/role-panels         - List role panels
POST   /api/guilds/:guildId/role-panels         - Create role panel
DELETE /api/guilds/:guildId/role-panels/:id     - Delete role panel
GET    /api/guilds/:guildId/timed-roles         - List timed roles (Premium)
POST   /api/guilds/:guildId/timed-roles         - Create timed role (Premium)
DELETE /api/guilds/:guildId/timed-roles/:id     - Remove timed role (Premium)
```

### XP and Leveling Endpoints

```
GET    /api/guilds/:guildId/leaderboard         - Get XP leaderboard
GET    /api/guilds/:guildId/users/:userId/xp    - Get user XP
POST   /api/guilds/:guildId/users/:userId/xp    - Set user XP (admin)
DELETE /api/guilds/:guildId/users/:userId/xp    - Reset user XP (admin)
```

### Streaming Endpoints

```
GET    /api/guilds/:guildId/streamers           - List streamers
POST   /api/guilds/:guildId/streamers           - Add streamer
DELETE /api/guilds/:guildId/streamers/:id       - Remove streamer
POST   /api/webhooks/twitch                     - Twitch EventSub webhook
POST   /api/webhooks/youtube                    - YouTube WebSub webhook
```

### AI Assistant Endpoints

```
GET    /api/guilds/:guildId/ai/config           - Get AI configuration
PATCH  /api/guilds/:guildId/ai/config           - Update AI configuration
GET    /api/guilds/:guildId/ai/documents        - List RAG documents (Premium)
POST   /api/guilds/:guildId/ai/documents        - Upload RAG document (Premium)
DELETE /api/guilds/:guildId/ai/documents/:id    - Delete RAG document (Premium)
```

### Logging and Analytics Endpoints

```
GET    /api/guilds/:guildId/logs                - Get event logs
GET    /api/guilds/:guildId/analytics           - Get analytics overview
GET    /api/guilds/:guildId/analytics/export    - Export analytics (Premium)
```

### Ticket Endpoints

```
GET    /api/guilds/:guildId/tickets             - List tickets
GET    /api/guilds/:guildId/tickets/:id         - Get ticket details
GET    /api/guilds/:guildId/tickets/:id/transcript - Get ticket transcript
```


## Deployment Architecture

### Container Structure

```yaml
services:
  bot:
    image: discord-bot:latest
    replicas: 3 # Multiple shards
    environment:
      - SHARD_COUNT=3
      - SHARD_ID=${SHARD_ID}
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:5432/discord_bot
    depends_on:
      - redis
      - postgres
      - api

  api:
    image: discord-api:latest
    replicas: 2
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:5432/discord_bot
    depends_on:
      - redis
      - postgres

  worker:
    image: discord-worker:latest
    replicas: 2
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:5432/discord_bot
    depends_on:
      - redis
      - postgres

  dashboard:
    image: discord-dashboard:latest
    ports:
      - "3001:3000"
    environment:
      - API_URL=http://api:3000
    depends_on:
      - api

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=discord_bot
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Environment Variables

```bash
# Discord Configuration
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/callback

# Database Configuration
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DB_POOL_MIN=10
DB_POOL_MAX=50

# Redis Configuration
REDIS_URL=redis://host:6379
REDIS_PASSWORD=your_redis_password

# API Configuration
API_PORT=3000
API_BASE_URL=https://api.yourdomain.com
JWT_SECRET=your_jwt_secret
CSRF_SECRET=your_csrf_secret

# AI Configuration
OPENAI_API_KEY=your_openai_key
AI_MODEL=gpt-4
AI_MAX_TOKENS=2000

# Streaming Configuration
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_secret
TWITCH_WEBHOOK_SECRET=your_webhook_secret
YOUTUBE_API_KEY=your_youtube_key

# Premium Configuration
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
```


## Database Migration Examples

### Migration File Structure

```
migrations/
├── 001_initial_schema.up.sql
├── 001_initial_schema.down.sql
├── 002_add_giveaways.up.sql
├── 002_add_giveaways.down.sql
├── 003_add_timed_roles.up.sql
├── 003_add_timed_roles.down.sql
└── ...
```

### Example Migration: Adding Timed Roles

**003_add_timed_roles.up.sql**:
```sql
-- Forward migration
CREATE TABLE timed_roles (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id VARCHAR(20) NOT NULL,
  role_id VARCHAR(20) NOT NULL,
  assigned_by VARCHAR(20) NOT NULL,
  reason TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, user_id, role_id)
);

CREATE INDEX idx_timed_roles_expires ON timed_roles(expires_at) WHERE expires_at > NOW();

-- Add migration record
INSERT INTO schema_migrations (version, applied_at) VALUES (3, NOW());
```

**003_add_timed_roles.down.sql**:
```sql
-- Rollback migration
DROP TABLE IF EXISTS timed_roles;

-- Remove migration record
DELETE FROM schema_migrations WHERE version = 3;
```

### Migration Execution

```typescript
interface MigrationRunner {
  runMigrations(): Promise<void>;
  rollbackMigration(version: number): Promise<void>;
  getCurrentVersion(): Promise<number>;
  validateMigrations(): Promise<boolean>;
}

async function runMigrations() {
  const currentVersion = await getCurrentVersion();
  const migrations = await loadMigrations();
  
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`Running migration ${migration.version}...`);
      await executeMigration(migration.up);
      console.log(`Migration ${migration.version} completed`);
    }
  }
}
```

