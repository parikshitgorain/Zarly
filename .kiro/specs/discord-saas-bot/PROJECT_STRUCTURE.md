# 🏗️ Discord SaaS Bot - Complete Project Structure

## Overview

This document defines the complete folder and file structure for the Discord SaaS Bot system. Every task in `tasks.md` must follow this structure and comply with the rules defined in `PROJECT_MASTER_LOCK.md`.

**CRITICAL**: This is a production-grade, multi-tenant Discord SaaS system with 11 architectural layers. All features must be fully wired across all layers before being considered complete.

---

## 📋 Compliance Reference

This structure enforces the **PROJECT_MASTER_LOCK.md** protocol:

✅ **11 Architectural Layers**:
1. Bot Layer
2. API Layer
3. Database Layer
4. Redis Layer
5. Worker Layer
6. Dashboard Layer
7. Permission Layer
8. Logging Layer
9. Premium Gating Layer
10. Test Layer
11. Documentation Layer

✅ **Full Feature Lifecycle** (14 Steps per feature)
✅ **90%+ Test Coverage** (lines, branches, functions, statements)
✅ **Multi-Tenant Isolation** (per-guild data separation)
✅ **Premium Feature Gating**
✅ **Comprehensive Error Handling**

---

## 🗂️ Root Project Structure

```
discord-saas-bot/
├── packages/
│   ├── bot/                    # Discord bot service
│   ├── api/                    # REST API service
│   ├── worker/                 # Background job processor
│   ├── dashboard/              # Next.js web dashboard
│   └── shared/                 # Shared types and utilities
├── .kiro/
│   ├── specs/
│   │   └── discord-saas-bot/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       ├── tasks.md
│   │       ├── PROJECT_MASTER_LOCK.md
│   │       └── PROJECT_STRUCTURE.md (this file)
│   └── steering/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📦 Package: Bot Service

**Location**: `packages/bot/`

**Purpose**: Discord.js bot with sharding, command handling, event processing, and AutoMod

**Compliance**: Bot Layer, Permission Layer, Logging Layer

```
packages/bot/
├── src/
│   ├── index.ts                      # Bot entry point with shard manager
│   ├── config/
│   │   ├── discord.config.ts         # Discord client configuration
│   │   └── sharding.config.ts        # Shard calculation and distribution
│   ├── commands/
│   │   ├── CommandHandler.ts         # Slash command registration and execution
│   │   ├── moderation/
│   │   │   ├── warn.ts
│   │   │   ├── timeout.ts
│   │   │   ├── kick.ts
│   │   │   └── ban.ts
│   │   ├── giveaway/
│   │   │   ├── create-giveaway.ts
│   │   │   ├── enter-giveaway.ts
│   │   │   └── reroll-giveaway.ts
│   │   ├── xp/
│   │   │   ├── view-xp.ts
│   │   │   ├── set-xp.ts
│   │   │   └── reset-xp.ts
│   │   ├── roles/
│   │   │   ├── create-role-panel.ts
│   │   │   └── assign-timed-role.ts
│   │   ├── automation/
│   │   │   ├── schedule-message.ts
│   │   │   ├── create-reminder.ts
│   │   │   └── create-trigger.ts
│   │   ├── tickets/
│   │   │   └── setup-tickets.ts
│   │   └── ai/
│   │       └── ask-ai.ts
│   ├── events/
│   │   ├── EventHandler.ts           # Discord event dispatcher
│   │   ├── messageCreate.ts          # Message events (XP, AutoMod, triggers)
│   │   ├── messageDelete.ts          # Logging
│   │   ├── messageUpdate.ts          # Logging
│   │   ├── guildMemberAdd.ts         # Welcome, auto-roles
│   │   ├── guildMemberRemove.ts      # Goodbye
│   │   ├── guildMemberUpdate.ts      # Role logging
│   │   ├── voiceStateUpdate.ts       # Voice XP, logging
│   │   ├── interactionCreate.ts      # Button/select menu handling
│   │   └── ready.ts                  # Bot ready event
│   ├── automod/
│   │   ├── AutoModEngine.ts          # Main AutoMod coordinator
│   │   ├── SpamDetector.ts           # Message frequency + similarity hash
│   │   ├── CapsDetector.ts           # Caps ratio detection
│   │   ├── LinkFilter.ts             # Invite/URL filtering
│   │   ├── BadWordFilter.ts          # Regex pattern matching
│   │   └── MentionDetector.ts        # Mass mention detection
│   ├── moderation/
│   │   ├── ModerationService.ts      # Moderation action execution
│   │   ├── EscalationEngine.ts       # Warning threshold calculation
│   │   └── CaseManager.ts            # Case ID generation and tracking
│   ├── xp/
│   │   ├── XPService.ts              # XP tracking and leveling
│   │   ├── TextXPHandler.ts          # Message XP with cooldowns
│   │   ├── VoiceXPHandler.ts         # Voice XP with anti-AFK
│   │   └── LevelRewardManager.ts     # Role rewards on level-up
│   ├── roles/
│   │   ├── ComponentRoleHandler.ts   # Button/select menu role assignment
│   │   ├── AutoRoleManager.ts        # Auto-assign on join/verify/level
│   │   └── TimedRoleManager.ts       # Premium timed role tracking
│   ├── giveaways/
│   │   ├── GiveawayService.ts        # Giveaway creation and entry
│   │   ├── WinnerSelector.ts         # Random winner selection
│   │   └── ClaimHandler.ts           # Claim button interaction
│   ├── tickets/
│   │   ├── TicketService.ts          # Ticket creation and management
│   │   └── TranscriptGenerator.ts    # Ticket transcript creation
│   ├── automation/
│   │   ├── TriggerEngine.ts          # Keyword/regex trigger matching
│   │   └── VariableSubstitution.ts   # Variable replacement
│   ├── community/
│   │   ├── WelcomeService.ts         # Welcome/goodbye messages
│   │   ├── SuggestionService.ts      # Suggestion voting
│   │   └── StarboardService.ts       # Starboard posting
│   ├── ai/
│   │   ├── AIService.ts              # OpenAI integration
│   │   ├── RAGManager.ts             # Vector search and context retrieval
│   │   └── ThreadMemory.ts           # Conversation context management
│   ├── permissions/
│   │   └── PermissionGuard.ts        # Role hierarchy and permission validation
│   ├── cache/
│   │   └── GuildConfigCache.ts       # Redis-backed guild config caching
│   └── utils/
│       ├── logger.ts                 # Logging utility
│       ├── redis.ts                  # Redis client
│       ├── api-client.ts             # API communication
│       └── error-handler.ts          # Bot-specific error handling
├── tests/
│   ├── unit/
│   │   ├── commands/
│   │   ├── automod/
│   │   ├── moderation/
│   │   ├── xp/
│   │   ├── roles/
│   │   ├── giveaways/
│   │   └── permissions/
│   ├── integration/
│   │   └── bot-api.test.ts
│   └── properties/
│       ├── role-hierarchy.test.ts    # Property 1
│       ├── self-targeting.test.ts    # Property 2
│       └── permission-validation.test.ts # Property 5
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## 📦 Package: API Service

**Location**: `packages/api/`

**Purpose**: Express REST API with authentication, validation, and business logic

**Compliance**: API Layer, Database Layer, Redis Layer, Premium Gating Layer, Logging Layer

```
packages/api/
├── src/
│   ├── index.ts                      # API server entry point
│   ├── config/
│   │   ├── express.config.ts         # Express middleware setup
│   │   ├── database.config.ts        # PostgreSQL connection pool
│   │   └── redis.config.ts           # Redis client configuration
│   ├── middleware/
│   │   ├── auth.middleware.ts        # JWT validation
│   │   ├── csrf.middleware.ts        # CSRF token validation
│   │   ├── validation.middleware.ts  # Input schema validation (Zod/Joi)
│   │   ├── guild-access.middleware.ts # Guild ownership verification
│   │   ├── rate-limit.middleware.ts  # Rate limiting per IP/user
│   │   ├── error.middleware.ts       # Global error handler
│   │   └── logging.middleware.ts     # Request logging
│   ├── controllers/
│   │   ├── auth.controller.ts        # OAuth2 and JWT management
│   │   ├── guild.controller.ts       # Guild configuration
│   │   ├── moderation.controller.ts  # Moderation cases and warnings
│   │   ├── giveaway.controller.ts    # Giveaway CRUD and reroll
│   │   ├── xp.controller.ts          # XP and leaderboard
│   │   ├── role.controller.ts        # Role panels and timed roles
│   │   ├── automation.controller.ts  # Scheduled messages, triggers, workflows
│   │   ├── community.controller.ts   # Welcome, suggestions, starboard
│   │   ├── streaming.controller.ts   # Streamer management
│   │   ├── ai.controller.ts          # AI configuration and RAG documents
│   │   ├── ticket.controller.ts      # Ticket management and transcripts
│   │   ├── logs.controller.ts        # Event log viewer
│   │   ├── analytics.controller.ts   # Analytics and metrics
│   │   └── premium.controller.ts     # Premium status and upgrade
│   ├── services/
│   │   ├── auth.service.ts           # Discord OAuth2 integration
│   │   ├── guild.service.ts          # Guild data management
│   │   ├── moderation.service.ts     # Moderation logic
│   │   ├── giveaway.service.ts       # Giveaway business logic
│   │   ├── xp.service.ts             # XP calculations
│   │   ├── role.service.ts           # Role management
│   │   ├── automation.service.ts     # Automation logic
│   │   ├── community.service.ts      # Community features
│   │   ├── streaming.service.ts      # Streaming platform integration
│   │   ├── ai.service.ts             # AI request handling
│   │   ├── ticket.service.ts         # Ticket operations
│   │   ├── logs.service.ts           # Log querying
│   │   ├── analytics.service.ts      # Metrics calculation
│   │   └── premium.service.ts        # Premium validation
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.up.sql
│   │   │   ├── 001_initial_schema.down.sql
│   │   │   ├── 002_moderation_tables.up.sql
│   │   │   ├── 002_moderation_tables.down.sql
│   │   │   ├── 003_giveaway_tables.up.sql
│   │   │   ├── 003_giveaway_tables.down.sql
│   │   │   ├── 004_xp_tables.up.sql
│   │   │   ├── 004_xp_tables.down.sql
│   │   │   ├── 005_feature_tables.up.sql
│   │   │   ├── 005_feature_tables.down.sql
│   │   │   ├── 006_component_role_tables.up.sql
│   │   │   └── 006_component_role_tables.down.sql
│   │   ├── repositories/
│   │   │   ├── guild.repository.ts
│   │   │   ├── moderation.repository.ts
│   │   │   ├── giveaway.repository.ts
│   │   │   ├── xp.repository.ts
│   │   │   ├── role.repository.ts
│   │   │   ├── automation.repository.ts
│   │   │   ├── community.repository.ts
│   │   │   ├── streaming.repository.ts
│   │   │   ├── ai.repository.ts
│   │   │   ├── ticket.repository.ts
│   │   │   ├── logs.repository.ts
│   │   │   └── premium.repository.ts
│   │   └── connection.ts             # Database connection pool
│   ├── cache/
│   │   ├── RedisCache.ts             # Redis cache interface
│   │   └── RateLimiter.ts            # Redis-based rate limiting
│   ├── validators/
│   │   ├── guild.validator.ts        # Guild config validation schemas
│   │   ├── moderation.validator.ts   # Moderation input schemas
│   │   ├── giveaway.validator.ts     # Giveaway input schemas
│   │   ├── xp.validator.ts           # XP input schemas
│   │   ├── role.validator.ts         # Role input schemas
│   │   ├── automation.validator.ts   # Automation input schemas
│   │   ├── community.validator.ts    # Community input schemas
│   │   ├── streaming.validator.ts    # Streaming input schemas
│   │   └── ai.validator.ts           # AI input schemas
│   ├── webhooks/
│   │   ├── twitch.webhook.ts         # Twitch EventSub handler
│   │   └── youtube.webhook.ts        # YouTube WebSub handler
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── guild.routes.ts
│   │   ├── moderation.routes.ts
│   │   ├── giveaway.routes.ts
│   │   ├── xp.routes.ts
│   │   ├── role.routes.ts
│   │   ├── automation.routes.ts
│   │   ├── community.routes.ts
│   │   ├── streaming.routes.ts
│   │   ├── ai.routes.ts
│   │   ├── ticket.routes.ts
│   │   ├── logs.routes.ts
│   │   ├── analytics.routes.ts
│   │   ├── premium.routes.ts
│   │   └── webhook.routes.ts
│   └── utils/
│       ├── logger.ts
│       ├── error-handler.ts          # Error formatting and handling
│       ├── jwt.ts                    # JWT utilities
│       └── sanitization.ts           # Input sanitization
├── tests/
│   ├── unit/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── validators/
│   ├── integration/
│   │   └── api-database.test.ts
│   └── properties/
│       ├── guild-ownership.test.ts   # Property 28
│       └── sql-injection.test.ts     # Property 32
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## 📦 Package: Worker Service

**Location**: `packages/worker/`

**Purpose**: BullMQ background job processor for async tasks

**Compliance**: Worker Layer, Database Layer, Redis Layer, Logging Layer

```
packages/worker/
├── src/
│   ├── index.ts                      # Worker entry point
│   ├── config/
│   │   ├── bullmq.config.ts          # Queue configuration
│   │   └── database.config.ts        # Database connection
│   ├── queues/
│   │   ├── giveaway.queue.ts         # Giveaway timer queue
│   │   ├── scheduled-message.queue.ts # Scheduled message queue
│   │   ├── reminder.queue.ts         # Reminder queue
│   │   ├── warning-decay.queue.ts    # Warning expiration queue
│   │   ├── timed-role.queue.ts       # Timed role expiration queue
│   │   └── streaming.queue.ts        # Kick polling queue
│   ├── processors/
│   │   ├── giveaway.processor.ts     # Giveaway end and auto-reroll
│   │   ├── scheduled-message.processor.ts
│   │   ├── reminder.processor.ts
│   │   ├── warning-decay.processor.ts
│   │   ├── timed-role.processor.ts
│   │   └── streaming.processor.ts    # Kick API polling
│   ├── jobs/
│   │   ├── GiveawayEndJob.ts
│   │   ├── GiveawayRerollJob.ts
│   │   ├── ScheduledMessageJob.ts
│   │   ├── ReminderJob.ts
│   │   ├── WarningDecayJob.ts
│   │   ├── TimedRoleExpirationJob.ts
│   │   └── KickPollingJob.ts
│   └── utils/
│       ├── logger.ts
│       ├── retry.ts                  # Exponential backoff logic
│       └── idempotency.ts            # Duplicate job detection
├── tests/
│   ├── unit/
│   │   ├── processors/
│   │   └── jobs/
│   └── properties/
│       ├── idempotent-execution.test.ts # Property 23
│       └── retry-backoff.test.ts     # Property 29
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## 📦 Package: Dashboard (Next.js)

**Location**: `packages/dashboard/`

**Purpose**: Web dashboard for guild configuration and management

**Compliance**: Dashboard Layer, Premium Gating Layer, Test Layer

```
packages/dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   ├── login/
│   │   │   └── page.tsx              # OAuth2 login
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── page.tsx          # OAuth2 callback handler
│   │   └── dashboard/
│   │       └── [guildId]/
│   │           ├── layout.tsx        # Dashboard layout with sidebar
│   │           ├── page.tsx          # Dashboard home/overview
│   │           ├── settings/
│   │           │   └── page.tsx      # Feature toggles
│   │           ├── moderation/
│   │           │   └── page.tsx      # Moderation cases viewer
│   │           ├── giveaways/
│   │           │   ├── page.tsx      # Giveaway manager
│   │           │   └── [id]/
│   │           │       └── page.tsx  # Giveaway details
│   │           ├── leaderboard/
│   │           │   └── page.tsx      # XP leaderboard
│   │           ├── roles/
│   │           │   └── page.tsx      # Role panel builder
│   │           ├── automation/
│   │           │   ├── scheduled/
│   │           │   │   └── page.tsx  # Scheduled messages
│   │           │   ├── triggers/
│   │           │   │   └── page.tsx  # Trigger manager
│   │           │   └── workflows/
│   │           │       └── page.tsx  # Multi-stage automation (Premium)
│   │           ├── community/
│   │           │   ├── welcome/
│   │           │   │   └── page.tsx  # Welcome/goodbye config
│   │           │   ├── suggestions/
│   │           │   │   └── page.tsx  # Suggestion manager
│   │           │   └── starboard/
│   │           │       └── page.tsx  # Starboard config
│   │           ├── streaming/
│   │           │   └── page.tsx      # Stream manager
│   │           ├── ai/
│   │           │   └── page.tsx      # AI control panel
│   │           ├── tickets/
│   │           │   ├── page.tsx      # Ticket list
│   │           │   └── [id]/
│   │           │       └── page.tsx  # Ticket transcript viewer
│   │           ├── logs/
│   │           │   └── page.tsx      # Event logs viewer
│   │           └── analytics/
│   │               └── page.tsx      # Analytics dashboard
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── GuildSwitcher.tsx
│   │   ├── auth/
│   │   │   ├── LoginButton.tsx
│   │   │   └── LogoutButton.tsx
│   │   ├── giveaways/
│   │   │   ├── GiveawayList.tsx
│   │   │   ├── GiveawayForm.tsx
│   │   │   ├── GiveawayDetails.tsx
│   │   │   └── RerollButton.tsx
│   │   ├── xp/
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── XPConfigForm.tsx
│   │   │   ├── LevelRewardsManager.tsx
│   │   │   └── UserXPManager.tsx
│   │   ├── roles/
│   │   │   ├── RolePanelBuilder.tsx
│   │   │   ├── AutoRoleConfig.tsx
│   │   │   └── TimedRoleManager.tsx
│   │   ├── automation/
│   │   │   ├── ScheduledMessageForm.tsx
│   │   │   ├── TriggerForm.tsx
│   │   │   └── WorkflowBuilder.tsx
│   │   ├── community/
│   │   │   ├── WelcomeConfigForm.tsx
│   │   │   ├── SuggestionManager.tsx
│   │   │   ├── StarboardConfig.tsx
│   │   │   └── EmbedBuilder.tsx
│   │   ├── streaming/
│   │   │   ├── StreamerList.tsx
│   │   │   ├── AddStreamerForm.tsx
│   │   │   └── StreamAnalytics.tsx
│   │   ├── ai/
│   │   │   ├── AIControlPanel.tsx
│   │   │   ├── ChannelConfig.tsx
│   │   │   ├── RAGDocumentManager.tsx
│   │   │   └── AIUsageAnalytics.tsx
│   │   ├── tickets/
│   │   │   ├── TicketList.tsx
│   │   │   ├── TicketTranscript.tsx
│   │   │   └── TicketConfig.tsx
│   │   ├── logs/
│   │   │   └── LogViewer.tsx
│   │   ├── analytics/
│   │   │   ├── OverviewMetrics.tsx
│   │   │   ├── ActivityChart.tsx
│   │   │   └── ExportButton.tsx
│   │   ├── premium/
│   │   │   ├── PremiumBadge.tsx
│   │   │   ├── PremiumGate.tsx
│   │   │   └── UpgradePrompt.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorMessage.tsx
│   │       ├── ConfirmDialog.tsx
│   │       └── Toast.tsx
│   ├── lib/
│   │   ├── api-client.ts            # API communication
│   │   ├── auth.ts                  # JWT and session management
│   │   └── utils.ts                 # Utility functions
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useGuild.ts
│   │   ├── useAPI.ts
│   │   └── usePremium.ts
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── guild.types.ts
│   │   └── user.types.ts
│   └── styles/
│       └── globals.css
├── public/
│   ├── images/
│   └── icons/
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   └── hooks/
│   └── integration/
│       └── dashboard-api.test.ts
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── jest.config.js
```

---

## 📦 Package: Shared

**Location**: `packages/shared/`

**Purpose**: Shared types, utilities, and constants across all packages

**Compliance**: All Layers

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── guild.types.ts
│   │   ├── user.types.ts
│   │   ├── moderation.types.ts
│   │   ├── giveaway.types.ts
│   │   ├── xp.types.ts
│   │   ├── role.types.ts
│   │   ├── automation.types.ts
│   │   ├── community.types.ts
│   │   ├── streaming.types.ts
│   │   ├── ai.types.ts
│   │   ├── ticket.types.ts
│   │   ├── logs.types.ts
│   │   ├── analytics.types.ts
│   │   ├── premium.types.ts
│   │   └── error.types.ts           # Error response types
│   ├── constants/
│   │   ├── redis-keys.ts            # Redis key naming patterns
│   │   ├── permissions.ts           # Discord permission constants
│   │   ├── limits.ts                # Rate limits and quotas
│   │   └── errors.ts                # Error codes and messages
│   ├── utils/
│   │   ├── validation.ts            # Shared validation utilities
│   │   ├── formatting.ts            # String and data formatting
│   │   ├── date.ts                  # Date/time utilities
│   │   ├── error-handler.ts         # Error handling utilities
│   │   └── sanitization.ts          # Input sanitization utilities
│   └── enums/
│       ├── premium-tier.enum.ts
│       ├── moderation-action.enum.ts
│       ├── event-type.enum.ts
│       └── error-code.enum.ts       # Standardized error codes
├── package.json
└── tsconfig.json
```

---

## 🗄️ Database Structure

**Location**: `packages/api/src/database/migrations/`

**Compliance**: Database Layer, Migration Rules (PROJECT_MASTER_LOCK.md Section 5)

### Migration Files

Each migration must have:
- Forward migration (`.up.sql`)
- Rollback migration (`.down.sql`)
- Index validation
- Foreign key validation
- Default value handling
- Backward compatibility

### Tables Overview

```
guilds                      # Guild configuration and premium status
guild_configs               # Detailed guild settings
moderation_cases            # Moderation actions and case history
giveaways                   # Giveaway configuration
giveaway_entries            # Giveaway participants
user_xp                     # User experience points and levels
tickets                     # Support ticket information
ticket_transcripts          # Ticket conversation history
scheduled_messages          # Scheduled message configurations
reminders                   # User reminders
triggers                    # Automation trigger configurations
streamers                   # Streaming platform integrations
ai_knowledge_base           # RAG documents with vector embeddings
event_logs                  # Comprehensive event logging
component_role_panels       # Interactive role assignment panels
component_roles             # Individual roles in panels
timed_roles                 # Roles with expiration timestamps
suggestions                 # Community suggestions
starboard_entries           # Starboard message entries
embed_themes                # Custom embed templates (Premium)
automation_workflows        # Multi-stage automation (Premium)
automation_stages           # Individual workflow stages
schema_migrations           # Migration version tracking
```

---

## 🔑 Redis Key Structure

**Location**: All packages using Redis

**Compliance**: Redis Layer Rules (PROJECT_MASTER_LOCK.md Section 6)

**Format**: `bot:{guildId}:{feature}:{key}`

### Key Examples

```
# Guild Configuration
bot:123456789:config:main

# XP Data
bot:123456789:xp:987654321

# Cooldowns
bot:123456789:cooldown:987654321:message
bot:123456789:cooldown:987654321:voice

# Rate Limits
bot:123456789:ratelimit:component_role:987654321
bot:123456789:ratelimit:ai:987654321

# Giveaway Claim Timers
bot:123456789:giveaway:555555:claim

# Premium Status Cache
bot:123456789:premium:status

# Active Warnings Count
bot:123456789:warnings:987654321:count

# Message Frequency (AutoMod)
bot:123456789:automod:spam:987654321
```

**Rules**:
- All keys MUST include guild ID
- TTL MUST be defined for temporary data
- Cleanup MUST be defined
- Keys MUST be shard-safe
- NO cross-guild leakage

---

## 🧪 Testing Structure

**Location**: `packages/*/tests/`

**Compliance**: Test Layer (PROJECT_MASTER_LOCK.md Section 3)

### Test Organization

```
tests/
├── unit/                   # Unit tests for individual components
│   ├── commands/
│   ├── services/
│   ├── controllers/
│   ├── middleware/
│   └── utils/
├── integration/            # Integration tests between layers
│   ├── bot-api.test.ts
│   ├── api-database.test.ts
│   └── end-to-end.test.ts
└── properties/             # Property-based tests
    ├── role-hierarchy.test.ts          # Property 1
    ├── self-targeting.test.ts          # Property 2
    ├── guild-isolation.test.ts         # Property 3
    ├── config-caching.test.ts          # Property 4
    ├── permission-validation.test.ts   # Property 5
    ├── spam-detection.test.ts          # Property 6
    ├── caps-detection.test.ts          # Property 7
    ├── pattern-matching.test.ts        # Property 8
    ├── automod-response-time.test.ts   # Property 9
    ├── case-id-generation.test.ts      # Property 10
    ├── escalation-threshold.test.ts    # Property 11
    ├── offense-count.test.ts           # Property 12
    ├── duplicate-entry.test.ts         # Property 13
    ├── winner-selection.test.ts        # Property 14
    ├── reroll-exclusion.test.ts        # Property 15
    ├── reroll-limit.test.ts            # Property 16
    ├── xp-cooldown.test.ts             # Property 17
    ├── level-up.test.ts                # Property 18
    ├── xp-sync.test.ts                 # Property 19
    ├── role-toggle.test.ts             # Property 20
    ├── rate-limiting.test.ts           # Property 21
    ├── trigger-matching.test.ts        # Property 22
    ├── idempotent-execution.test.ts    # Property 23
    ├── stream-deduplication.test.ts    # Property 24
    ├── token-limit.test.ts             # Property 25
    ├── premium-access.test.ts          # Property 26
    ├── redis-key-naming.test.ts        # Property 27
    ├── guild-ownership.test.ts         # Property 28
    ├── retry-backoff.test.ts           # Property 29
    ├── concurrent-commands.test.ts     # Property 30
    ├── response-time.test.ts           # Property 31
    ├── sql-injection.test.ts           # Property 32
    └── redis-failure.test.ts           # Property 33
```

### Required Test Types (Per Feature)

1. ✅ Happy path tests
2. ✅ Permission denied tests
3. ✅ Invalid input tests
4. ✅ Rate limit exceeded tests
5. ✅ Redis failure tests
6. ✅ Database failure tests
7. ✅ Worker failure tests
8. ✅ External API failure tests
9. ✅ Premium expired tests
10. ✅ Cross-guild isolation tests
11. ✅ Concurrency tests
12. ✅ Duplicate execution tests

### Coverage Requirements

- **90%+ line coverage**
- **90%+ branch coverage**
- **90%+ function coverage**
- **90%+ statement coverage**

---

## 📚 Documentation Structure

**Location**: Root and package-specific docs

**Compliance**: Documentation Layer (PROJECT_MASTER_LOCK.md)

```
docs/
├── api/
│   ├── authentication.md
│   ├── endpoints.md
│   └── error-codes.md
├── bot/
│   ├── commands.md
│   ├── permissions.md
│   └── events.md
├── deployment/
│   ├── docker.md
│   ├── environment-variables.md
│   ├── scaling.md
│   └── monitoring.md
├── architecture/
│   ├── overview.md
│   ├── sharding.md
│   ├── caching.md
│   └── data-flow.md
├── development/
│   ├── setup.md
│   ├── testing.md
│   └── contributing.md
└── user-guides/
    ├── dashboard.md
    ├── moderation.md
    ├── giveaways.md
    ├── xp-system.md
    └── premium-features.md
```

---

## 🐳 Docker & Deployment Structure

**Location**: Root directory

**Compliance**: Deployment and Scaling Requirements

```
docker/
├── bot/
│   └── Dockerfile
├── api/
│   └── Dockerfile
├── worker/
│   └── Dockerfile
└── dashboard/
    └── Dockerfile

docker-compose.yml              # Local development setup
docker-compose.prod.yml         # Production setup
.dockerignore
```

### Docker Compose Services

```yaml
services:
  bot:                          # Discord bot (multiple shards)
  api:                          # REST API (multiple replicas)
  worker:                       # Background job processor (multiple replicas)
  dashboard:                    # Next.js web dashboard
  redis:                        # Redis cache
  postgres:                     # PostgreSQL database
```

---

## 🔐 Environment Variables

**Location**: `.env.example` (root)

**Compliance**: Security and Configuration Requirements

### Required Variables

```bash
# Discord Configuration
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=

# Database Configuration
DATABASE_URL=
DB_POOL_MIN=10
DB_POOL_MAX=50

# Redis Configuration
REDIS_URL=
REDIS_PASSWORD=

# API Configuration
API_PORT=3000
API_BASE_URL=
JWT_SECRET=
CSRF_SECRET=

# AI Configuration
OPENAI_API_KEY=
AI_MODEL=gpt-4
AI_MAX_TOKENS=2000

# Streaming Configuration
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
TWITCH_WEBHOOK_SECRET=
YOUTUBE_API_KEY=

# Premium Configuration
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Monitoring
SENTRY_DSN=
LOG_LEVEL=info
```

---

## 📋 Task-to-Structure Mapping

This section maps each task from `tasks.md` to the corresponding files/folders in this structure.

### Phase 1: Foundation and Infrastructure

**Task 1**: Set up project structure
- Creates: Root structure, all package folders, docker-compose.yml, .env.example

**Task 2**: Implement database layer
- Creates: `packages/api/src/database/migrations/*.sql`
- Creates: `packages/api/src/database/connection.ts`
- Creates: `packages/api/src/database/repositories/*.ts`

**Task 3**: Implement Redis cache layer
- Creates: `packages/api/src/cache/RedisCache.ts`
- Creates: `packages/api/src/cache/RateLimiter.ts`
- Creates: `packages/bot/src/cache/GuildConfigCache.ts`

### Phase 2: Bot Foundation

**Task 5**: Implement Discord bot client
- Creates: `packages/bot/src/index.ts`
- Creates: `packages/bot/src/config/sharding.config.ts`
- Creates: `packages/bot/src/permissions/PermissionGuard.ts`

**Task 6**: Implement slash command system
- Creates: `packages/bot/src/commands/CommandHandler.ts`
- Creates: `packages/bot/src/commands/*/` (all command files)

### Phase 3: AutoMod and Moderation

**Task 8**: Implement AutoMod engine
- Creates: `packages/bot/src/automod/*.ts`

**Task 9**: Implement moderation actions
- Creates: `packages/bot/src/moderation/*.ts`
- Creates: `packages/api/src/controllers/moderation.controller.ts`kages/api/src/controllers/moderation.controller.ts`
- Creates: `packages/api/src/services/moderation.service.ts`

**Task 10**: Implement warning decay and escalation
- Creates: `packages/bot/src/moderation/EscalationEngine.ts`
- Creates: `packages/worker/src/processors/warning-decay.processor.ts`

### Phase 4: Giveaway System (Full-Stack)

**Task 12-13**: Implement giveaway backend
- Creates: `packages/bot/src/giveaways/*.ts`
- Creates: `packages/api/src/controllers/giveaway.controller.ts`
- Creates: `packages/api/src/services/giveaway.service.ts`
- Creates: `packages/worker/src/processors/giveaway.processor.ts`

**Task 14**: Implement giveaway dashboard UI
- Creates: `packages/dashboard/src/app/dashboard/[guildId]/giveaways/page.tsx`
- Creates: `packages/dashboard/src/components/giveaways/*.tsx`

### Phase 5: XP System and Role Management (Full-Stack)

**Task 16**: Implement XP backend
- Creates: `packages/bot/src/xp/*.ts`
- Creates: `packages/api/src/controllers/xp.controller.ts`

**Task 17**: Implement XP dashboard UI
- Creates: `packages/dashboard/src/app/dashboard/[guildId]/leaderboard/page.tsx`
- Creates: `packages/dashboard/src/components/xp/*.tsx`

**Task 18**: Implement role management backend
- Creates: `packages/bot/src/roles/*.ts`
- Creates: `packages/api/src/controllers/role.controller.ts`

**Task 19**: Implement role dashboard UI
- Creates: `packages/dashboard/src/app/dashboard/[guildId]/roles/page.tsx`
- Creates: `packages/dashboard/src/components/roles/*.tsx`

### Phase 6: Automation and Community (Full-Stack)

**Task 21**: Implement automation backend
- Creates: `packages/bot/src/automation/*.ts`
- Creates: `packages/api/src/controllers/automation.controller.ts`
- Creates: `packages/worker/src/processors/scheduled-message.processor.ts`
- Creates: `packages/worker/src/processors/reminder.processor.ts`

**Task 22**: Implement automation dashboard UI
- Creates: `packages/dashboard/src/app/dashboard/[guildId]/automation/*/page.tsx`
- Creates: `packages/dashboard/src/components/automation/*.tsx`

**Task 23**: Implement community backend
- Creates: `packages/bot/src/community/*.ts`
- Creates: `packages/api/src/controllers/community.controller.ts`

**Task 24**: Implement community dashboard UI
- Creates: `packages/dashboard/src/app/dashboard/[guildId]/community/*/page.tsx`
- Creates: `packages/dashboard/src/components/community/*.tsx`

### Phase 7: Streaming and AI (Full-Stack)

**Task 26**: Implement streaming backend
- Creates: `packages/api/src/webhooks/twitch.webhook.ts`
- Creates: `packages/api/src/webhooks/youtube.webhook.ts`
- Creates: `packages/worker/src/processors/streaming.processor.ts`

**Task 27**: Implement streaming dashboard UI
- Creates: `packages/dashboard/src/app/dashboard/[guildId]/streaming/page.tsx`
- Creates: `packages/dashboard/src/components/streaming/*.tsx`

**Task 28**: Implement AI backend
- Creates: `packages/bot/src/ai/*.ts`
- Creates: `packages/api/src/controllers/ai.controller.ts`
- Creates: `packages/api/src/services/ai.service.ts`

**Task 29**: Implement AI dashboard UI
- Creates: `packages/dashboard/src/app/dashboard/[guildId]/ai/page.tsx`
- Creates: `packages/dashboard/src/components/ai/*.tsx`

### Phase 8: Dashboard Foundation

**Task 31**: Implement REST API foundation
- Creates: `packages/api/src/middleware/*.ts`
- Creates: `packages/api/src/routes/*.ts`

**Task 32**: Implement premium system
- Creates: `packages/api/src/services/premium.service.ts`
- Creates: `packages/dashboard/src/components/premium/*.tsx`

**Task 33**: Implement dashboard foundation
- Creates: `packages/dashboard/src/app/layout.tsx`
- Creates: `packages/dashboard/src/app/dashboard/[guildId]/layout.tsx`
- Creates: `packages/dashboard/src/components/layout/*.tsx`

**Task 34**: Implement ticket system
- Creates: `packages/bot/src/tickets/*.ts`
- Creates: `packages/api/src/controllers/ticket.controller.ts`
- Creates: `packages/dashboard/src/app/dashboard/[guildId]/tickets/*/page.tsx`

### Phase 9-11: Logging, Workers, Testing, Deployment

**Task 36**: Implement logging
- Creates: `packages/bot/src/events/*.ts` (logging logic)
- Creates: `packages/api/src/controllers/logs.controller.ts`

**Task 37**: Implement worker system
- Creates: `packages/worker/src/queues/*.ts`
- Creates: `packages/worker/src/jobs/*.ts`

**Task 44**: Implement test suite
- Creates: `packages/*/tests/**/*.test.ts`

**Task 45**: Create deployment configuration
- Creates: `docker/*/Dockerfile`
- Creates: `docker-compose.yml`

**Task 46**: Create documentation
- Creates: `docs/**/*.md`

---

## ✅ PROJECT_MASTER_LOCK.md Compliance Checklist

This structure ensures compliance with all rules from PROJECT_MASTER_LOCK.md:

### 1️⃣ Core Principle: Full Layer Wiring

- ✅ **Bot Layer**: `packages/bot/`
- ✅ **API Layer**: `packages/api/`
- ✅ **Database Layer**: `packages/api/src/database/`
- ✅ **Redis Layer**: `packages/api/src/cache/` + `packages/bot/src/cache/`
- ✅ **Worker Layer**: `packages/worker/`
- ✅ **Dashboard Layer**: `packages/dashboard/`
- ✅ **Permission Layer**: `packages/bot/src/permissions/`
- ✅ **Logging Layer**: `packages/bot/src/events/` + `packages/api/src/controllers/logs.controller.ts`
- ✅ **Premium Gating Layer**: `packages/api/src/services/premium.service.ts` + `packages/dashboard/src/components/premium/`
- ✅ **Test Layer**: `packages/*/tests/`
- ✅ **Documentation Layer**: `docs/`

### 2️⃣ Full Feature Lifecycle (14 Steps)

Each feature implementation follows this structure:

1. ✅ **Define lifecycle**: Documented in `requirements.md` and `design.md`
2. ✅ **DB schema**: Migration files in `packages/api/src/database/migrations/`
3. ✅ **Migration**: Both `.up.sql` and `.down.sql` files
4. ✅ **Redis keys**: Defined in `packages/shared/src/constants/redis-keys.ts`
5. ✅ **API routes**: Files in `packages/api/src/routes/`
6. ✅ **Bot commands**: Files in `packages/bot/src/commands/`
7. ✅ **Worker jobs**: Files in `packages/worker/src/processors/`
8. ✅ **Dashboard UI**: Files in `packages/dashboard/src/app/dashboard/[guildId]/`
9. ✅ **Permissions**: Enforced in `packages/bot/src/permissions/PermissionGuard.ts`
10. ✅ **Logging**: Implemented in `packages/bot/src/events/` and `packages/api/src/controllers/logs.controller.ts`
11. ✅ **Premium gating**: Validated in `packages/api/src/services/premium.service.ts`
12. ✅ **Tests**: Files in `packages/*/tests/`
13. ✅ **Coverage**: Verified with Jest coverage reports (90%+ required)
14. ✅ **Regression**: Tested with property-based tests in `packages/*/tests/properties/`

### 3️⃣ Testing Enforcement

- ✅ **90% coverage**: Enforced by Jest configuration in each package
- ✅ **12 test types**: All implemented in test files
- ✅ **Mock data**: Standardized in `packages/*/tests/unit/` with realistic IDs

### 4️⃣ Mock Data Standard

- ✅ **Structured mocks**: Created in test setup files
- ✅ **No real IDs**: All tests use mock guild/user/role IDs
- ✅ **Multi-guild simulation**: Tests include multiple guild scenarios
- ✅ **Multi-shard simulation**: Tests include shard distribution scenarios

### 5️⃣ Database Rules

- ✅ **Migration files**: Both forward and rollback in `packages/api/src/database/migrations/`
- ✅ **Index validation**: Defined in migration files
- ✅ **Foreign keys**: Defined in migration files
- ✅ **Default values**: Specified in migration files
- ✅ **Backward compatibility**: Enforced by migration structure

### 6️⃣ Redis Rules

- ✅ **Key format**: `bot:{guildId}:{feature}:{key}` enforced in `packages/shared/src/constants/redis-keys.ts`
- ✅ **Guild namespacing**: All keys include guild ID
- ✅ **TTL defined**: Specified in cache implementation
- ✅ **Cleanup defined**: Implemented in cache layer
- ✅ **Shard-safe**: Keys work across all shards
- ✅ **No cross-guild leakage**: Enforced by key structure

### 7️⃣ Worker Rules

- ✅ **Idempotent**: All jobs in `packages/worker/src/jobs/` are idempotent
- ✅ **Retry policy**: Configured in `packages/worker/src/config/bullmq.config.ts`
- ✅ **Timeout guard**: Implemented in job processors
- ✅ **Failure logging**: Implemented in `packages/worker/src/utils/logger.ts`
- ✅ **Duplicate protection**: Implemented in `packages/worker/src/utils/idempotency.ts`
- ✅ **Dead-letter handling**: Configured in BullMQ setup

### 8️⃣ Bot Layer Rules

- ✅ **No direct DB**: Bot uses API client in `packages/bot/src/utils/api-client.ts`
- ✅ **Redis cache**: Guild configs cached in `packages/bot/src/cache/GuildConfigCache.ts`
- ✅ **Role hierarchy**: Validated in `packages/bot/src/permissions/PermissionGuard.ts`
- ✅ **Permission validation**: Enforced before all commands
- ✅ **Shard distribution**: Handled by `packages/bot/src/config/sharding.config.ts`
- ✅ **Cooldowns**: Enforced via Redis

### 9️⃣ API Rules

- ✅ **Input validation**: Middleware in `packages/api/src/middleware/validation.middleware.ts`
- ✅ **JWT validation**: Middleware in `packages/api/src/middleware/auth.middleware.ts`
- ✅ **Guild ownership**: Middleware in `packages/api/src/middleware/guild-access.middleware.ts`
- ✅ **Permission guards**: Enforced in controllers
- ✅ **Premium gates**: Validated in `packages/api/src/services/premium.service.ts`
- ✅ **Error structure**: Consistent format in `packages/api/src/middleware/error.middleware.ts`

### 🔟 Dashboard Rules

- ✅ **UI toggle**: Feature toggles in `packages/dashboard/src/app/dashboard/[guildId]/settings/page.tsx`
- ✅ **State sync**: Real-time updates via API calls
- ✅ **Loading states**: Implemented in all components
- ✅ **Error display**: Implemented in `packages/dashboard/src/components/common/ErrorMessage.tsx`
- ✅ **Permission filter**: Premium gates in `packages/dashboard/src/components/premium/PremiumGate.tsx`

### 1️⃣1️⃣ Premium Enforcement

- ✅ **API validation**: In `packages/api/src/services/premium.service.ts`
- ✅ **Execution validation**: In bot command handlers
- ✅ **Graceful downgrade**: Implemented in premium service
- ✅ **No data deletion**: Enforced in downgrade logic
- ✅ **Failure logging**: Logged in `packages/api/src/controllers/premium.controller.ts`

### 1️⃣2️⃣ AI System Rules

- ✅ **Guild isolation**: Enforced in `packages/bot/src/ai/AIService.ts`
- ✅ **No data leakage**: RAG documents filtered by guild ID
- ✅ **Token limits**: Enforced in `packages/bot/src/ai/AIService.ts`
- ✅ **Timeout fallback**: Implemented in AI service
- ✅ **Per-user cooldown**: Enforced via Redis
- ✅ **Per-guild quota**: Tracked in database
- ✅ **Failure logging**: Logged in AI service
- ✅ **Prompt injection protection**: Input sanitization in API

### 1️⃣3️⃣ Performance Rules

- ✅ **1000 concurrent events**: Tested in `packages/*/tests/properties/concurrent-commands.test.ts`
- ✅ **500 XP/sec**: Tested in performance tests
- ✅ **Giveaway stress test**: Included in test suite
- ✅ **Redis load test**: Included in test suite
- ✅ **Worker retry simulation**: Tested in `packages/worker/tests/properties/retry-backoff.test.ts`
- ✅ **No blocking operations**: Enforced by worker queue usage

### 1️⃣4️⃣ Security Rules

- ✅ **Role hierarchy abuse**: Prevented by `PermissionGuard.ts`
- ✅ **Self-punishment**: Prevented by permission validation
- ✅ **Mass mention abuse**: Detected by AutoMod
- ✅ **API abuse**: Rate limiting in `packages/api/src/middleware/rate-limit.middleware.ts`
- ✅ **Rate limit bypass**: Prevented by Redis-based rate limiting
- ✅ **Cross-guild exposure**: Prevented by guild ID filtering

### 1️⃣5️⃣ Regression Protection

- ✅ **Full test suite**: Run before all deployments
- ✅ **New tests**: Added for behavior changes
- ✅ **Backward compatibility**: Enforced by migration structure
- ✅ **Migration compatibility**: Tested with rollback migrations
- ✅ **Downgrade compatibility**: Tested in premium downgrade tests

---

## 🚀 Implementation Workflow

When implementing a task from `tasks.md`, follow this workflow:

1. **Read the task** in `tasks.md`
2. **Reference this structure** to know where files should be created
3. **Follow PROJECT_MASTER_LOCK.md** rules for the feature
4. **Create all required files** across all 11 layers
5. **Write tests** to achieve 90%+ coverage
6. **Run tests** and verify they pass
7. **Update checkpoint** in `tasks.md`
8. **Move to next task**

### Example: Implementing Giveaway System (Task 12-14)

1. Create backend files:
   - `packages/bot/src/giveaways/GiveawayService.ts`
   - `packages/bot/src/giveaways/WinnerSelector.ts`
   - `packages/bot/src/giveaways/ClaimHandler.ts`
   - `packages/bot/src/commands/giveaway/create-giveaway.ts`

2. Create API files:
   - `packages/api/src/controllers/giveaway.controller.ts`
   - `packages/api/src/services/giveaway.service.ts`
   - `packages/api/src/routes/giveaway.routes.ts`
   - `packages/api/src/validators/giveaway.validator.ts`

3. Create database files:
   - `packages/api/src/database/migrations/003_giveaway_tables.up.sql`
   - `packages/api/src/database/migrations/003_giveaway_tables.down.sql`
   - `packages/api/src/database/repositories/giveaway.repository.ts`

4. Create worker files:
   - `packages/worker/src/processors/giveaway.processor.ts`
   - `packages/worker/src/jobs/GiveawayEndJob.ts`
   - `packages/worker/src/jobs/GiveawayRerollJob.ts`

5. Create dashboard files:
   - `packages/dashboard/src/app/dashboard/[guildId]/giveaways/page.tsx`
   - `packages/dashboard/src/components/giveaways/GiveawayList.tsx`
   - `packages/dashboard/src/components/giveaways/GiveawayForm.tsx`
   - `packages/dashboard/src/components/giveaways/GiveawayDetails.tsx`
   - `packages/dashboard/src/components/giveaways/RerollButton.tsx`

6. Create test files:
   - `packages/bot/tests/unit/giveaways/GiveawayService.test.ts`
   - `packages/api/tests/unit/controllers/giveaway.controller.test.ts`
   - `packages/worker/tests/unit/processors/giveaway.processor.test.ts`
   - `packages/dashboard/tests/unit/components/giveaways/GiveawayForm.test.ts`
   - `packages/bot/tests/properties/duplicate-entry.test.ts` (Property 13)
   - `packages/bot/tests/properties/winner-selection.test.ts` (Property 14)
   - `packages/bot/tests/properties/reroll-exclusion.test.ts` (Property 15)
   - `packages/bot/tests/properties/reroll-limit.test.ts` (Property 16)

7. Run tests and verify 90%+ coverage

8. Mark tasks 12, 13, 14 as complete in `tasks.md`

---

## 📝 Summary

This project structure document provides:

✅ **Complete folder hierarchy** for all packages
✅ **File-by-file breakdown** of what goes where
✅ **Compliance mapping** to PROJECT_MASTER_LOCK.md rules
✅ **Task-to-structure mapping** for implementation guidance
✅ **Example workflow** for implementing features

**Every task in `tasks.md` must follow this structure and comply with PROJECT_MASTER_LOCK.md rules.**

**No feature is complete unless it exists in all 11 architectural layers with 90%+ test coverage.**

---

*Last Updated: 2024*
*Maintained by: Discord SaaS Bot Development Team*
