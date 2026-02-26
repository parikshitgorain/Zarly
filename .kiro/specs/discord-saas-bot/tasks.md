# Implementation Plan: Discord SaaS Bot System

## Overview

This implementation plan breaks down the production-grade Discord SaaS bot system into discrete, incremental coding tasks. Each task builds on previous work and includes comprehensive testing. The system spans 11 architectural layers: Bot, API, Database, Redis, Worker, Dashboard, Permission, Logging, Premium Gating, Test, and Documentation.

**CRITICAL IMPLEMENTATION APPROACH**: Each feature is implemented as a complete full-stack vertical slice (Bot → API → Database → Dashboard → Tests) within its task group. Dashboard UI components are wired immediately when the backend service is created, not deferred to a later phase. This ensures nothing is missed and the dashboard stays in sync with backend capabilities.

The implementation follows a feature-driven approach: infrastructure first, then each feature built completely (backend + frontend + tests) before moving to the next feature.

---

## 🔒 MANDATORY COMPLIANCE DOCUMENTS

**BEFORE STARTING ANY TASK, YOU MUST:**

1. **Read PROJECT_MASTER_LOCK.md** - Contains the 15 mandatory rules that govern ALL development
   - Every feature MUST pass ALL rules in this document
   - No exceptions, no shortcuts
   - A feature is NOT complete unless it complies with ALL rules

2. **Reference PROJECT_STRUCTURE.md** - Defines WHERE every file must be created
   - Shows the complete folder structure for all packages
   - Maps each task to specific files and folders
   - Ensures consistency across the entire codebase

**These documents are your source of truth. Refer to them constantly during implementation.**

---

## Tasks

**📋 TASK EXECUTION PROTOCOL:**

For EVERY task below:
1. ✅ Check PROJECT_MASTER_LOCK.md for compliance rules
2. ✅ Check PROJECT_STRUCTURE.md for file locations
3. ✅ Implement across ALL 11 architectural layers
4. ✅ Write tests to achieve 90%+ coverage
5. ✅ Verify all rules from PROJECT_MASTER_LOCK.md are satisfied

---

### Phase 1: Foundation and Infrastructure

**📚 Reference Documents:**
- PROJECT_MASTER_LOCK.md: Sections 5 (Database Rules), 6 (Redis Rules), 8 (Bot Layer Rules)
- PROJECT_STRUCTURE.md: Root structure, packages/api/src/database/, packages/api/src/cache/

- [x] 1. Set up project structure and core infrastructure
  - **Compliance Check**: Verify against PROJECT_MASTER_LOCK.md Section 1 (Core Principle)
  - **Structure Reference**: PROJECT_STRUCTURE.md - Root Project Structure
  - Create monorepo structure with separate packages for bot, api, worker, and dashboard
  - Configure TypeScript with strict mode and shared tsconfig
  - Set up ESLint and Prettier for code quality
  - Initialize package.json files with dependencies (Discord.js, Express, BullMQ, Redis, PostgreSQL)
  - Create Docker Compose configuration for local development
  - Set up environment variable management with dotenv
  - _Requirements: 16.1, 16.2, 18.7_

- [x] 1.1 Write unit tests for project configuration
  - Test environment variable loading
  - Test TypeScript compilation
  - _Requirements: 22.5_

- [x] 2. Implement database layer with migrations
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 5 (Database Rules)
  - **Structure Reference**: PROJECT_STRUCTURE.md - Database Structure section
  - [x] 2.1 Create PostgreSQL connection pool with configuration
    - Implement connection pooling with min 10, max 50 connections
    - Add connection error handling and retry logic
    - Configure idle timeout and connection recycling
    - _Requirements: 18.7, 20.1_

  - [ ] 2.2 Write unit tests for database connection pool
    - Test connection acquisition and release
    - Test connection pool exhaustion handling
    - Test connection error recovery
    - _Requirements: 22.10_

  - [x] 2.3 Create initial database schema migration
    - Create guilds table with premium fields
    - Create guild_configs table with all configuration options
    - Create schema_migrations tracking table
    - Add indexes for performance
    - _Requirements: 20.1, 20.3, 20.7_

  - [x] 2.4 Create moderation tables migration
    - Create moderation_cases table with case_id and expiration
    - Add indexes for guild_id, user_id, and expires_at
    - _Requirements: 3.1, 3.5, 3.7, 20.1_

  - [x] 2.5 Create giveaway tables migration
    - Create giveaways table with claim timeout and reroll tracking
    - Create giveaway_entries table with unique constraint
    - Add indexes for status and end time queries
    - _Requirements: 6.1, 6.5, 6.16, 20.1_

  - [x] 2.6 Create XP and leveling tables migration
    - Create user_xp table with text_xp, voice_xp, and computed total_xp
    - Add index for leaderboard queries (guild_id, total_xp DESC)
    - _Requirements: 7.1, 7.9, 20.1_

  - [x] 2.7 Create remaining feature tables migration
    - Create tickets, ticket_transcripts tables
    - Create scheduled_messages, reminders, triggers tables
    - Create streamers table for platform integrations
    - Create ai_knowledge_base table with pgvector extension
    - Create event_logs table for comprehensive logging
    - Add all necessary indexes
    - _Requirements: 5.1, 5.4, 9.1, 9.3, 10.8, 12.1, 13.4, 20.1_

  - [x] 2.8 Create component role and premium feature tables migration
    - Create component_role_panels and component_roles tables
    - Create timed_roles table for premium feature
    - Create suggestions, starboard_entries tables
    - Create embed_themes, automation_workflows, automation_stages tables
    - Add all necessary indexes and foreign keys
    - _Requirements: 8.1, 8.7, 11.3, 11.5, 15.8, 20.1_

  - [ ] 2.9 Write migration rollback tests
    - Test forward and rollback migrations for all tables
    - Verify data integrity after rollback
    - Test migration version tracking
    - _Requirements: 20.2, 20.10_

- [ ] 3. Implement Redis cache layer
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 6 (Redis Rules)
  - **Structure Reference**: PROJECT_STRUCTURE.md - Redis Key Structure section
  - [ ] 3.1 Create Redis client with connection handling
    - Initialize Redis client with connection pooling
    - Implement connection error handling and reconnection logic
    - Add health check functionality
    - _Requirements: 18.6, 21.1_

  - [ ] 3.2 Write unit tests for Redis client
    - Test connection establishment and failure handling
    - Test reconnection logic
    - Simulate Redis unavailability
    - _Requirements: 22.9_

  - [ ] 3.3 Implement RedisCache interface with TTL support
    - Implement get, set, delete, exists, increment, expire methods
    - Enforce key naming convention: bot:{guildId}:{feature}:{key}
    - Add key validation to prevent cross-guild leakage
    - _Requirements: 16.1, 18.8_

  - [ ] 3.4 Write property test for Redis key naming convention
    - **Property 27: Redis Key Naming Convention**
    - **Validates: Requirements 16.1**

  - [ ] 3.5 Implement RateLimiter using Redis
    - Implement checkLimit, getRemainingRequests, resetLimit methods
    - Use sliding window algorithm for accurate rate limiting
    - _Requirements: 18.10, 19.8_

  - [ ] 3.6 Write property test for rate limiting
    - **Property 21: Rate Limiting Enforcement**
    - **Validates: Requirements 8.3, 13.2**

- [ ] 4. Checkpoint - Verify infrastructure
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2: Bot Foundation and Permission System

**📚 Reference Documents:**
- PROJECT_MASTER_LOCK.md: Section 8 (Bot Layer Rules), Section 14 (Security Rules)
- PROJECT_STRUCTURE.md: packages/bot/ structure

- [ ] 5. Implement Discord bot client with sharding
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 8 (Bot Layer Rules)
  - **Structure Reference**: PROJECT_STRUCTURE.md - Package: Bot Service
  - [ ] 5.1 Create ShardManager with configuration
    - Initialize Discord.js client with sharding support
    - Configure shard count calculation based on guild count
    - Implement shard spawn and management logic
    - Add shard event handlers for ready, error, disconnect
    - _Requirements: 1.10, 16.6_

  - [ ] 5.2 Write unit tests for shard management
    - Test shard spawn and distribution
    - Test shard failure handling
    - _Requirements: 22.17_

  - [ ] 5.3 Implement PermissionGuard for role hierarchy validation
    - Implement hasPermission, canTargetMember, canManageRole, isGuildOwner methods
    - Add role position comparison logic
    - Prevent self-targeting and owner targeting
    - _Requirements: 1.3, 1.4, 1.6, 1.7, 3.9, 19.1, 19.2, 19.3_

  - [ ] 5.4 Write property test for role hierarchy enforcement
    - **Property 1: Role Hierarchy Enforcement**
    - **Validates: Requirements 1.4, 3.9, 19.1**

  - [ ] 5.5 Write property test for self-targeting prevention
    - **Property 2: Self-Targeting Prevention**
    - **Validates: Requirements 1.6**

  - [ ] 5.6 Write property test for permission validation
    - **Property 5: Permission Validation Before Execution**
    - **Validates: Requirements 1.3**

  - [ ] 5.7 Implement guild configuration caching
    - Create GuildConfigCache that loads from DB and caches in Redis
    - Implement cache invalidation on config updates
    - Add 5-minute TTL for cached configs
    - _Requirements: 1.8, 18.4_

  - [ ] 5.8 Write property test for configuration caching
    - **Property 4: Configuration Caching**
    - **Validates: Requirements 1.8**

- [ ] 6. Implement slash command system
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 8 (Bot Layer Rules), Section 14 (Security Rules)
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/bot/src/commands/
  - [ ] 6.1 Create CommandHandler with registration
    - Implement command registration for guilds and global
    - Create command structure with options and permissions
    - Add command execution dispatcher
    - _Requirements: 1.1_

  - [ ] 6.2 Implement command permission validation
    - Validate user permissions before command execution
    - Validate bot permissions before Discord API calls
    - Validate role hierarchy for target-based commands
    - Return permission denied errors with clear messages
    - _Requirements: 1.3, 1.4, 1.5_

  - [ ] 6.3 Write unit tests for command permission validation
    - Test permission denied scenarios
    - Test role hierarchy validation
    - Test bot permission checks
    - _Requirements: 22.6_

  - [ ] 6.4 Implement legacy prefix command system (optional)
    - Create PrefixCommandHandler with configurable prefix
    - Add Message Content Intent validation
    - Implement hard rate limiting (5 commands per 10 seconds)
    - Make system disabled by default per guild
    - _Requirements: 1.2_

- [ ] 7. Checkpoint - Verify bot foundation
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: AutoMod and Moderation System

**📚 Reference Documents:**
- PROJECT_MASTER_LOCK.md: Section 2 (Full Feature Lifecycle), Section 3 (Testing Enforcement)
- PROJECT_STRUCTURE.md: packages/bot/src/automod/, packages/bot/src/moderation/

- [ ] 8. Implement AutoMod engine
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 2 (14-step lifecycle), Section 13 (Performance Rules)
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/bot/src/automod/
  - [ ] 8.1 Create AutoModEngine with spam detection
    - Implement message frequency tracking in Redis
    - Implement similarity hash calculation for duplicate detection
    - Add 60-second TTL for frequency data
    - _Requirements: 2.1, 2.9_

  - [ ] 8.2 Write property test for spam detection
    - **Property 6: AutoMod Spam Detection**
    - **Validates: Requirements 2.1**

  - [ ] 8.3 Implement caps ratio detection
    - Calculate uppercase to total character ratio
    - Compare against configurable threshold (default 0.70)
    - _Requirements: 2.2_

  - [ ] 8.4 Write property test for caps ratio detection
    - **Property 7: AutoMod Caps Ratio Detection**
    - **Validates: Requirements 2.2**

  - [ ] 8.5 Implement link and invite filtering
    - Add regex patterns for Discord invite links
    - Add regex patterns for URLs
    - Make filters configurable per guild
    - _Requirements: 2.3, 2.4_

  - [ ] 8.6 Implement bad word filtering with regex
    - Load bad word patterns from guild config
    - Apply regex matching to message content
    - _Requirements: 2.5_

  - [ ] 8.7 Write property test for pattern matching
    - **Property 8: AutoMod Pattern Matching**
    - **Validates: Requirements 2.5**

  - [ ] 8.8 Implement mass mention detection
    - Detect @everyone and @here abuse
    - Count role and user mentions
    - Apply configurable thresholds
    - _Requirements: 2.6, 19.4_

  - [ ] 8.9 Implement AutoMod action execution
    - Create offense records in PostgreSQL
    - Apply configured actions (warn, timeout, kick, ban)
    - Ensure actions complete within 200ms
    - _Requirements: 2.7, 2.8_

  - [ ] 8.10 Write property test for AutoMod response time
    - **Property 9: AutoMod Response Time**
    - **Validates: Requirements 2.8**

- [ ] 9. Implement moderation actions system
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 2 (Full Feature Lifecycle), Section 10 (Logging)
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/bot/src/moderation/, packages/api/src/controllers/moderation.controller.ts
  - [ ] 9.1 Create ModerationController with case management
    - Implement createWarn, createTimeout, createKick, createBan methods
    - Generate unique Case_ID per guild
    - Store cases in PostgreSQL with moderator tracking
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7_

  - [ ] 9.2 Write property test for unique case ID generation
    - **Property 10: Unique Case ID Generation**
    - **Validates: Requirements 3.1, 3.5**

  - [ ] 9.3 Implement moderation logging
    - Post moderation actions to configured log channel
    - Include Case_ID, moderator, target, reason, timestamp
    - Store logs in event_logs table
    - _Requirements: 3.6, 3.8, 10.11_

  - [ ] 9.4 Write unit tests for moderation actions
    - Test warn, timeout, kick, ban execution
    - Test permission denied scenarios
    - Test role hierarchy enforcement
    - _Requirements: 22.6_

- [ ] 10. Implement warning decay and escalation system
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 7 (Worker Rules)
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/worker/src/processors/warning-decay.processor.ts
  - [ ] 10.1 Create EscalationEngine with threshold calculation
    - Implement escalation threshold evaluation
    - Support configurable thresholds per guild
    - Calculate appropriate punishment level based on warning count
    - _Requirements: 4.3, 4.5, 4.6_

  - [ ] 10.2 Write property test for escalation threshold calculation
    - **Property 11: Escalation Threshold Calculation**
    - **Validates: Requirements 4.3**

  - [ ] 10.3 Implement warning decay worker
    - Create worker job that runs every 60 minutes
    - Remove expired warnings based on guild configuration
    - Update active warning counts in Redis
    - _Requirements: 4.1, 4.2, 4.8_

  - [ ] 10.4 Implement active warning count caching
    - Cache warning counts in Redis with 24-hour TTL
    - Synchronize with PostgreSQL on updates
    - _Requirements: 4.9_

  - [ ] 10.5 Write property test for offense count consistency
    - **Property 12: Offense Count Consistency**
    - **Validates: Requirements 4.9**

  - [ ] 10.6 Write unit tests for warning decay
    - Test expiration calculation
    - Test decay worker execution
    - _Requirements: 22.11_

- [ ] 11. Checkpoint - Verify moderation system
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: Giveaway System (Full-Stack)

**📚 Reference Documents:**
- PROJECT_MASTER_LOCK.md: ALL sections (complete full-stack feature)
- PROJECT_STRUCTURE.md: packages/bot/src/giveaways/, packages/api/src/controllers/giveaway.controller.ts, packages/worker/src/processors/giveaway.processor.ts, packages/dashboard/src/app/dashboard/[guildId]/giveaways/

**⚠️ CRITICAL**: This is a COMPLETE vertical slice. Must implement Bot + API + Database + Worker + Dashboard + Tests.

- [ ] 12. Implement giveaway backend and API
  - **Compliance Check**: PROJECT_MASTER_LOCK.md - Complete 14-step lifecycle
  - **Structure Reference**: PROJECT_STRUCTURE.md - Task-to-Structure Mapping: Phase 4
  - [ ] 12.1 Create GiveawayController with creation logic
    - Implement createGiveaway with validation
    - Store giveaway configuration in PostgreSQL
    - Schedule end timer in worker queue
    - _Requirements: 6.1_

  - [ ] 12.2 Implement giveaway entry validation
    - Validate role requirements before accepting entry
    - Validate minimum level requirements
    - Validate account age requirements
    - Prevent duplicate entries with unique constraint
    - Check blacklist before accepting entry
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.19_

  - [ ] 12.3 Write property test for duplicate entry prevention
    - **Property 13: Giveaway Duplicate Entry Prevention**
    - **Validates: Requirements 6.5**

  - [ ] 12.4 Write unit tests for entry validation
    - Test role requirement validation
    - Test level requirement validation
    - Test account age validation
    - Test blacklist checking
    - _Requirements: 22.5_

  - [ ] 12.5 Implement giveaway API endpoints
    - GET /api/guilds/:guildId/giveaways - List giveaways
    - POST /api/guilds/:guildId/giveaways - Create giveaway
    - GET /api/guilds/:guildId/giveaways/:id - Get giveaway details
    - PATCH /api/guilds/:guildId/giveaways/:id - Update giveaway
    - DELETE /api/guilds/:guildId/giveaways/:id - Delete giveaway
    - POST /api/guilds/:guildId/giveaways/:id/reroll - Manual reroll
    - GET /api/guilds/:guildId/giveaways/:id/entries - List entries
    - _Requirements: 14.3, 14.4_

- [ ] 13. Implement giveaway winner selection and claim system
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 7 (Worker Rules - idempotency)
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/worker/src/processors/giveaway.processor.ts
  - [ ] 13.1 Create GiveawayWorker for winner selection
    - Implement random winner selection from valid entries
    - Revalidate winner hasn't left guild
    - Revalidate winner still meets role requirements
    - Post announcement with claim button
    - _Requirements: 6.6, 6.7, 6.14, 6.15_

  - [ ] 13.2 Write property test for winner selection validity
    - **Property 14: Giveaway Winner Selection Validity**
    - **Validates: Requirements 6.6**

  - [ ] 13.3 Implement claim verification system
    - Verify clicker is the announced winner
    - Mark giveaway as completed on successful claim
    - Store claim timestamp
    - _Requirements: 6.8, 6.9_

  - [ ] 13.4 Implement auto-reroll system
    - Create claim timeout timer in Redis (default 300 seconds)
    - Trigger reroll when timeout expires without claim
    - Exclude non-claiming winners from future selection
    - Increment reroll counter
    - Stop rerolling when maximum limit reached
    - _Requirements: 6.10, 6.11, 6.12, 6.13, 6.16_

  - [ ] 13.5 Write property test for auto-reroll exclusion
    - **Property 15: Giveaway Auto-Reroll Exclusion**
    - **Validates: Requirements 6.11**

  - [ ] 13.6 Write property test for maximum reroll limit
    - **Property 16: Giveaway Maximum Reroll Limit**
    - **Validates: Requirements 6.13**

  - [ ] 13.7 Implement manual reroll command
    - Add slash command for manual reroll
    - Validate permissions before reroll
    - Use same winner selection logic
    - _Requirements: 6.17_

  - [ ] 13.8 Implement giveaway logging
    - Log all giveaway events (creation, entries, winners, claims, rerolls)
    - Store logs in PostgreSQL
    - Support export via dashboard for premium guilds
    - _Requirements: 6.18, 6.20_

  - [ ] 13.9 Write unit tests for giveaway system
    - Test claim timeout handling
    - Test reroll logic
    - Test manual reroll
    - _Requirements: 22.5_

- [ ] 14. Implement giveaway dashboard UI (Next.js)
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 10 (Dashboard Rules)
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/dashboard/src/app/dashboard/[guildId]/giveaways/
  - [ ] 14.1 Create giveaway manager page
    - Create /dashboard/[guildId]/giveaways route
    - Display active and past giveaways in tabs
    - Show giveaway status, prize, entries, winner
    - _Requirements: 14.8_

  - [ ] 14.2 Create giveaway creation form
    - Build form with prize, duration, requirements fields
    - Support role requirements, level requirements, account age
    - Validate inputs before submission
    - Call POST /api/guilds/:guildId/giveaways
    - _Requirements: 14.8_

  - [ ] 14.3 Implement giveaway details view
    - Show entry count and participant list
    - Display winner information and claim status
    - Show reroll history
    - _Requirements: 14.8_

  - [ ] 14.4 Implement manual reroll button
    - Add "Reroll Winner" button for admins
    - Confirm action before executing
    - Call POST /api/guilds/:guildId/giveaways/:id/reroll
    - Update UI with new winner
    - _Requirements: 14.8_

  - [ ] 14.5 Implement giveaway export (Premium)
    - Add "Export Logs" button for premium guilds
    - Download giveaway history as CSV/JSON
    - _Requirements: 6.20, 14.8_

  - [ ] 14.6 Write unit tests for giveaway dashboard
    - Test form validation
    - Test API integration
    - Test premium feature gating
    - _Requirements: 22.5_

- [ ] 15. Checkpoint - Verify giveaway system (full-stack)
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5: XP System and Role Management (Full-Stack)

**📚 Reference Documents:**
- PROJECT_MASTER_LOCK.md: ALL sections (complete full-stack feature)
- PROJECT_STRUCTURE.md: packages/bot/src/xp/, packages/bot/src/roles/, packages/dashboard/src/app/dashboard/[guildId]/leaderboard/, packages/dashboard/src/app/dashboard/[guildId]/roles/

**⚠️ CRITICAL**: This is a COMPLETE vertical slice. Must implement Bot + API + Database + Dashboard + Tests.

- [ ] 16. Implement XP backend and leveling system
  - **Compliance Check**: PROJECT_MASTER_LOCK.md - Complete 14-step lifecycle
  - **Structure Reference**: PROJECT_STRUCTURE.md - Task-to-Structure Mapping: Phase 5
  - [ ] 16.1 Create XP tracking with cooldowns
    - Implement text XP award with 60-second cooldown in Redis
    - Implement voice XP tracking with anti-AFK validation
    - Batch XP updates to PostgreSQL every 5 minutes
    - _Requirements: 7.1, 7.2, 7.4, 7.9_

  - [ ] 16.2 Write property test for XP cooldown enforcement
    - **Property 17: XP Cooldown Enforcement**
    - **Validates: Requirements 7.1**

  - [ ] 16.3 Implement voice XP anti-AFK validation
    - Check user is unmuted (server and self)
    - Check user is undeafened (server and self)
    - Check user is not alone in channel
    - Only award XP when all conditions met
    - _Requirements: 7.3_

  - [ ] 16.4 Write unit tests for voice XP validation
    - Test muted user scenarios
    - Test deafened user scenarios
    - Test alone in channel scenario
    - _Requirements: 22.5_

  - [ ] 16.5 Implement level-up detection and role rewards
    - Calculate level from total XP
    - Detect level-up threshold crossing
    - Assign configured role rewards
    - Send level-up notification to configured channel
    - _Requirements: 7.5, 7.6, 7.7_

  - [ ] 16.6 Write property test for level-up threshold detection
    - **Property 18: Level-Up Threshold Detection**
    - **Validates: Requirements 7.5**

  - [ ] 16.7 Write property test for XP synchronization consistency
    - **Property 19: XP Synchronization Consistency**
    - **Validates: Requirements 7.9**

  - [ ] 16.8 Implement XP multipliers and spam prevention
    - Apply configurable XP multipliers per guild
    - Prevent XP gain from AutoMod-detected spam
    - _Requirements: 7.8, 7.11_

  - [ ] 16.9 Implement XP management commands
    - Add slash command to view user XP
    - Add admin command to set user XP
    - Add admin command to reset user XP
    - _Requirements: 7.12_

  - [ ] 16.10 Implement XP API endpoints
    - GET /api/guilds/:guildId/leaderboard - Get XP leaderboard
    - GET /api/guilds/:guildId/users/:userId/xp - Get user XP
    - POST /api/guilds/:guildId/users/:userId/xp - Set user XP (admin)
    - DELETE /api/guilds/:guildId/users/:userId/xp - Reset user XP (admin)
    - _Requirements: 7.10, 14.3, 14.4_

- [ ] 17. Implement XP dashboard UI (Next.js)
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 10 (Dashboard Rules)
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/dashboard/src/app/dashboard/[guildId]/leaderboard/
  - [ ] 17.1 Create leaderboard page
    - Create /dashboard/[guildId]/leaderboard route
    - Display top users by total XP with pagination
    - Show username, level, text XP, voice XP, total XP
    - Implement search and filtering
    - _Requirements: 7.10, 14.13_

  - [ ] 17.2 Create XP configuration panel
    - Build form for XP multiplier settings
    - Configure XP cooldown duration
    - Enable/disable text XP and voice XP
    - Call PATCH /api/guilds/:guildId/config
    - _Requirements: 14.6_

  - [ ] 17.3 Create level rewards configuration
    - Display list of level milestones and role rewards
    - Add/edit/remove level reward mappings
    - Validate role hierarchy before saving
    - _Requirements: 14.6_

  - [ ] 17.4 Implement user XP management interface
    - Search for user by name/ID
    - Display user's current XP and level
    - Admin controls to set/reset XP
    - Call POST/DELETE /api/guilds/:guildId/users/:userId/xp
    - _Requirements: 7.12, 14.3_

  - [ ] 17.5 Write unit tests for XP dashboard
    - Test leaderboard rendering
    - Test configuration updates
    - Test admin XP management
    - _Requirements: 22.5_

- [ ] 18. Implement role management backend
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 11 (Premium Enforcement) for timed roles
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/bot/src/roles/
  - [ ] 18.1 Create component role panel system
    - Implement button-based role panels
    - Implement select menu-based role panels
    - Store panel configuration in PostgreSQL
    - _Requirements: 8.1_

  - [ ] 18.2 Implement component role interaction handling
    - Handle button clicks for role toggle
    - Handle select menu selections
    - Apply rate limiting (3 interactions per 10 seconds)
    - _Requirements: 8.2, 8.3_

  - [ ] 18.3 Write property test for component role toggle behavior
    - **Property 20: Component Role Toggle Behavior**
    - **Validates: Requirements 8.2**

  - [ ] 18.4 Implement auto-role assignment
    - Assign roles on member join
    - Assign roles on rules screen completion
    - Assign roles on level milestones
    - _Requirements: 8.4, 8.5, 8.6_

  - [ ] 18.5 Implement timed roles system (Premium)
    - Store timed roles with expiration timestamps
    - Create worker to check and remove expired roles every 5 minutes
    - Handle cases where user left guild
    - _Requirements: 8.7, 8.8_

  - [ ] 18.6 Write unit tests for timed roles
    - Test role expiration
    - Test worker execution
    - Test premium gating
    - _Requirements: 22.13_

  - [ ] 18.7 Implement role hierarchy validation
    - Validate bot can manage target role
    - Validate role hierarchy before assignment
    - Prevent privilege escalation
    - _Requirements: 8.10, 8.12_

  - [ ] 18.8 Implement role change logging
    - Log all role assignments and removals
    - Include timestamp, moderator, and reason
    - Post to configured audit log channel
    - _Requirements: 8.11_

  - [ ] 18.9 Implement role management API endpoints
    - GET /api/guilds/:guildId/role-panels - List role panels
    - POST /api/guilds/:guildId/role-panels - Create role panel
    - DELETE /api/guilds/:guildId/role-panels/:id - Delete role panel
    - GET /api/guilds/:guildId/timed-roles - List timed roles (Premium)
    - POST /api/guilds/:guildId/timed-roles - Create timed role (Premium)
    - DELETE /api/guilds/:guildId/timed-roles/:id - Remove timed role (Premium)
    - _Requirements: 14.3, 14.4_

- [ ] 19. Implement role management dashboard UI (Next.js)
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 10 (Dashboard Rules)
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/dashboard/src/app/dashboard/[guildId]/roles/
  - [ ] 19.1 Create role panel builder page
    - Create /dashboard/[guildId]/roles route
    - Display existing role panels
    - Show panel type (button/select menu), channel, roles
    - _Requirements: 14.7_

  - [ ] 19.2 Create role panel creation form
    - Select panel type (button or select menu)
    - Choose target channel
    - Add roles with labels, emojis, descriptions
    - Configure max/min selections for select menus
    - Preview panel before posting
    - Call POST /api/guilds/:guildId/role-panels
    - _Requirements: 14.7_

  - [ ] 19.3 Implement auto-role configuration
    - Configure roles assigned on member join
    - Configure roles assigned on verification
    - Link level rewards to roles
    - _Requirements: 14.6_

  - [ ] 19.4 Create timed roles manager (Premium)
    - Display active timed roles with expiration times
    - Add new timed role with duration picker
    - Remove timed role before expiration
    - Show premium badge/gate for free guilds
    - Call POST/DELETE /api/guilds/:guildId/timed-roles
    - _Requirements: 14.7, 14.18_

  - [ ] 19.5 Write unit tests for role dashboard
    - Test panel builder
    - Test auto-role configuration
    - Test timed roles (premium gating)
    - _Requirements: 22.5_

- [ ] 20. Checkpoint - Verify XP and role systems (full-stack)
  - Ensure all tests pass, ask the user if questions arise.

### Phase 6: Automation and Community Features (Full-Stack)

**📚 Reference Documents:**
- PROJECT_MASTER_LOCK.md: ALL sections (complete full-stack features)
- PROJECT_STRUCTURE.md: packages/bot/src/automation/, packages/bot/src/community/, packages/dashboard/src/app/dashboard/[guildId]/automation/, packages/dashboard/src/app/dashboard/[guildId]/community/

**⚠️ CRITICAL**: These are COMPLETE vertical slices. Must implement Bot + API + Database + Worker + Dashboard + Tests.

- [ ] 21. Implement automation backend
  - **Compliance Check**: PROJECT_MASTER_LOCK.md - Complete 14-step lifecycle
  - **Structure Reference**: PROJECT_STRUCTURE.md - Task-to-Structure Mapping: Phase 6
  - [ ] 21.1 Create scheduled message system
    - Store cron schedules in PostgreSQL
    - Create worker to execute scheduled messages
    - Validate cron expressions
    - Apply rate limiting
    - _Requirements: 9.1, 9.2, 9.9_

  - [ ] 21.2 Implement reminder system
    - Store reminders with target timestamps
    - Create worker to dispatch reminders
    - Send reminders to users at scheduled time
    - _Requirements: 9.3, 9.4_

  - [ ] 21.3 Implement trigger engine
    - Match messages against keyword triggers
    - Send configured responses
    - Support variable substitution (user, server, channel, membercount)
    - Apply rate limiting to prevent spam
    - _Requirements: 9.5, 9.7, 9.9_

  - [ ] 21.4 Write property test for trigger keyword matching
    - **Property 22: Trigger Keyword Matching**
    - **Validates: Requirements 9.5**

  - [ ] 21.5 Implement regex trigger support (Premium)
    - Add regex pattern matching for triggers
    - Validate regex patterns before saving
    - _Requirements: 9.6_

  - [ ] 21.6 Implement multi-stage automation (Premium)
    - Create workflow system with conditional stages
    - Support delays between stages
    - Execute stages in order
    - _Requirements: 9.8_

  - [ ] 21.7 Write unit tests for automation
    - Test scheduled message execution
    - Test reminder dispatch
    - Test trigger matching
    - Test premium gating
    - _Requirements: 22.13_

  - [ ] 21.8 Implement idempotent worker execution
    - Add job identifiers to prevent duplicates
    - Implement duplicate detection
    - _Requirements: 9.12, 17.14_

  - [ ] 21.9 Write property test for idempotent job execution
    - **Property 23: Idempotent Job Execution**
    - **Validates: Requirements 9.12, 17.14**

  - [ ] 21.10 Implement automation API endpoints
    - GET /api/guilds/:guildId/scheduled-messages - List scheduled messages
    - POST /api/guilds/:guildId/scheduled-messages - Create scheduled message
    - DELETE /api/guilds/:guildId/scheduled-messages/:id - Delete scheduled message
    - GET /api/guilds/:guildId/triggers - List triggers
    - POST /api/guilds/:guildId/triggers - Create trigger
    - DELETE /api/guilds/:guildId/triggers/:id - Delete trigger
    - GET /api/guilds/:guildId/workflows - List workflows (Premium)
    - POST /api/guilds/:guildId/workflows - Create workflow (Premium)
    - _Requirements: 14.3, 14.4_

- [ ] 22. Implement automation dashboard UI (Next.js)
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 10 (Dashboard Rules)
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/dashboard/src/app/dashboard/[guildId]/automation/
  - [ ] 22.1 Create scheduled messages page
    - Create /dashboard/[guildId]/automation/scheduled route
    - Display list of scheduled messages with cron schedule
    - Show next execution time
    - _Requirements: 14.6_

  - [ ] 22.2 Create scheduled message form
    - Build form with channel selector, message content, cron schedule
    - Validate cron expression
    - Support embed builder integration
    - Call POST /api/guilds/:guildId/scheduled-messages
    - _Requirements: 14.6_

  - [ ] 22.3 Create triggers page
    - Create /dashboard/[guildId]/automation/triggers route
    - Display list of triggers with keywords and responses
    - Show enabled/disabled status
    - _Requirements: 14.6_

  - [ ] 22.4 Create trigger form
    - Build form with trigger type (keyword/regex), pattern, response
    - Support variable substitution preview
    - Mark regex triggers as Premium
    - Call POST /api/guilds/:guildId/triggers
    - _Requirements: 14.6, 14.18_

  - [ ] 22.5 Create multi-stage automation builder (Premium)
    - Create /dashboard/[guildId]/automation/workflows route
    - Visual workflow builder with stages
    - Configure conditions and actions per stage
    - Set delays between stages
    - Show premium gate for free guilds
    - Call POST /api/guilds/:guildId/workflows
    - _Requirements: 14.6, 14.18_

  - [ ] 22.6 Write unit tests for automation dashboard
    - Test scheduled message form
    - Test trigger configuration
    - Test workflow builder (premium gating)
    - _Requirements: 22.5_

- [ ] 23. Implement community engagement backend
  - **Compliance Check**: PROJECT_MASTER_LOCK.md - Complete 14-step lifecycle
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/bot/src/community/
  - [ ] 23.1 Create welcome and goodbye system
    - Implement welcome message with variable substitution
    - Implement goodbye message
    - Support custom embeds
    - Validate configured channels exist
    - _Requirements: 11.1, 11.2, 11.7, 11.8_

  - [ ] 23.2 Implement suggestion system
    - Create suggestion posts with upvote/downvote reactions
    - Track vote counts in PostgreSQL
    - Support configurable reaction emojis
    - Add moderator approve/deny commands
    - _Requirements: 11.3, 11.4, 11.9_

  - [ ] 23.3 Implement starboard system
    - Monitor reaction add events for configured emoji
    - Post to starboard when threshold reached
    - Update star count on existing posts
    - Prevent duplicate entries
    - _Requirements: 11.5, 11.6_

  - [ ] 23.4 Implement custom embed builder
    - Create embed builder interface
    - Support all embed fields (title, description, color, fields, etc.)
    - Add embed preview functionality
    - _Requirements: 11.7_

  - [ ] 23.5 Write unit tests for community features
    - Test welcome message variable substitution
    - Test suggestion voting
    - Test starboard threshold detection
    - _Requirements: 22.5_

  - [ ] 23.6 Implement community API endpoints
    - GET /api/guilds/:guildId/welcome-config - Get welcome configuration
    - PATCH /api/guilds/:guildId/welcome-config - Update welcome configuration
    - GET /api/guilds/:guildId/suggestions - List suggestions
    - PATCH /api/guilds/:guildId/suggestions/:id - Update suggestion status
    - GET /api/guilds/:guildId/starboard-config - Get starboard configuration
    - PATCH /api/guilds/:guildId/starboard-config - Update starboard configuration
    - _Requirements: 14.3, 14.4_

- [ ] 24. Implement community features dashboard UI (Next.js)
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 10 (Dashboard Rules)
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/dashboard/src/app/dashboard/[guildId]/community/
  - [ ] 24.1 Create welcome/goodbye configuration page
    - Create /dashboard/[guildId]/community/welcome route
    - Configure welcome message with variable substitution
    - Configure goodbye message
    - Select target channels
    - Embed builder integration
    - Call PATCH /api/guilds/:guildId/welcome-config
    - _Requirements: 14.6, 14.7_

  - [ ] 24.2 Create suggestions manager
    - Create /dashboard/[guildId]/community/suggestions route
    - Display pending, approved, denied suggestions
    - Show vote counts
    - Moderator controls to approve/deny
    - Configure suggestion channel and emojis
    - Call PATCH /api/guilds/:guildId/suggestions/:id
    - _Requirements: 14.6_

  - [ ] 24.3 Create starboard configuration
    - Create /dashboard/[guildId]/community/starboard route
    - Configure starboard channel, emoji, threshold
    - Enable/disable self-starring
    - Preview starboard posts
    - Call PATCH /api/guilds/:guildId/starboard-config
    - _Requirements: 14.6_

  - [ ] 24.4 Create embed builder component
    - Reusable embed builder for welcome, announcements, etc.
    - Live preview of embed
    - Support all Discord embed fields
    - Save embed templates (Premium)
    - _Requirements: 14.7_

  - [ ] 24.5 Write unit tests for community dashboard
    - Test welcome configuration
    - Test suggestion management
    - Test starboard configuration
    - Test embed builder
    - _Requirements: 22.5_

- [ ] 25. Checkpoint - Verify automation and community features (full-stack)
  - Ensure all tests pass, ask the user if questions arise.

### Phase 7: Streaming Integrations and AI System (Full-Stack)

**📚 Reference Documents:**
- PROJECT_MASTER_LOCK.md: ALL sections (complete full-stack features), Section 12 (AI System Rules)
- PROJECT_STRUCTURE.md: packages/api/src/webhooks/, packages/bot/src/ai/, packages/dashboard/src/app/dashboard/[guildId]/streaming/, packages/dashboard/src/app/dashboard/[guildId]/ai/

**⚠️ CRITICAL**: These are COMPLETE vertical slices. Must implement Bot + API + Database + Worker + Dashboard + Tests.

- [ ] 26. Implement streaming platform integrations backend
  - **Compliance Check**: PROJECT_MASTER_LOCK.md - Complete 14-step lifecycle
  - **Structure Reference**: PROJECT_STRUCTURE.md - Task-to-Structure Mapping: Phase 7
  - [ ] 26.1 Create Twitch EventSub webhook handler
    - Implement webhook endpoint for Twitch events
    - Validate webhook signatures
    - Handle stream.online events
    - Store stream session data
    - _Requirements: 12.1, 12.11_

  - [ ] 26.2 Implement Kick polling system
    - Create worker that polls Kick API every 60 seconds
    - Detect new streams by comparing stream IDs
    - Update last_stream_id to prevent duplicates
    - Respect Kick API rate limits
    - _Requirements: 12.2, 12.12_

  - [ ] 26.3 Implement YouTube WebSub webhook handler
    - Implement webhook endpoint for YouTube notifications
    - Validate webhook signatures
    - Handle live stream notifications
    - _Requirements: 12.3, 12.11_

  - [ ] 26.4 Implement stream notification system
    - Post notifications to configured channels
    - Mention configured roles
    - Prevent duplicate notifications for same stream session
    - Apply rate limiting
    - _Requirements: 12.4, 12.5, 12.7, 12.9_

  - [ ] 26.5 Write property test for stream notification deduplication
    - **Property 24: Stream Notification Deduplication**
    - **Validates: Requirements 12.7**

  - [ ] 26.6 Write unit tests for streaming integrations
    - Test webhook signature validation
    - Test duplicate detection
    - Test rate limiting
    - _Requirements: 22.12_

  - [ ] 26.7 Implement streaming API endpoints
    - GET /api/guilds/:guildId/streamers - List streamers
    - POST /api/guilds/:guildId/streamers - Add streamer
    - DELETE /api/guilds/:guildId/streamers/:id - Remove streamer
    - PATCH /api/guilds/:guildId/streamers/:id - Update streamer config
    - POST /api/webhooks/twitch - Twitch EventSub webhook
    - POST /api/webhooks/youtube - YouTube WebSub webhook
    - _Requirements: 12.6, 12.10, 14.3, 14.4_

- [ ] 27. Implement streaming dashboard UI (Next.js)
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 10 (Dashboard Rules)
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/dashboard/src/app/dashboard/[guildId]/streaming/
  - [ ] 27.1 Create stream manager page
    - Create /dashboard/[guildId]/streaming route
    - Display list of configured streamers
    - Show platform, streamer name, notification channel
    - Show live status and last stream info
    - _Requirements: 14.9_

  - [ ] 27.2 Create add streamer form
    - Select platform (Twitch, Kick, YouTube)
    - Input streamer ID/username
    - Select notification channel
    - Select mention role (optional)
    - Validate streamer exists on platform
    - Call POST /api/guilds/:guildId/streamers
    - _Requirements: 14.9_

  - [ ] 27.3 Implement streamer configuration
    - Edit notification channel per streamer
    - Edit mention role per streamer
    - Enable/disable notifications per streamer
    - Remove streamer
    - Call PATCH/DELETE /api/guilds/:guildId/streamers/:id
    - _Requirements: 14.9_

  - [ ] 27.4 Display stream analytics
    - Show stream history per streamer
    - Display viewer counts, stream duration
    - Show notification delivery status
    - _Requirements: 14.13_

  - [ ] 27.5 Write unit tests for streaming dashboard
    - Test add streamer form
    - Test streamer configuration
    - Test platform validation
    - _Requirements: 22.5_

- [ ] 28. Implement AI assistant backend
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 12 (AI System Rules) - CRITICAL for data isolation
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/bot/src/ai/
  - [ ] 28.1 Create AI service integration
    - Integrate with OpenAI API
    - Implement request/response handling
    - Add timeout handling (30 seconds)
    - _Requirements: 13.1, 13.7, 21.12_

  - [ ] 28.2 Implement AI rate limiting and quotas
    - Enforce per-user cooldown via Redis
    - Enforce per-guild quota limits
    - Track usage in PostgreSQL
    - _Requirements: 13.2, 13.3_

  - [ ] 28.3 Write property test for rate limiting
    - **Property 21: Rate Limiting Enforcement**
    - **Validates: Requirements 8.3, 13.2**

  - [ ] 28.4 Implement RAG knowledge base system (Premium)
    - Create document upload functionality
    - Generate embeddings using OpenAI
    - Store embeddings in pgvector
    - Implement similarity search
    - _Requirements: 13.4, 13.5_

  - [ ] 28.5 Implement AI context retrieval
    - Fetch relevant documents from RAG knowledge base
    - Build context from retrieved documents
    - Limit context size to prevent token overflow
    - _Requirements: 13.4_

  - [ ] 28.6 Implement token limit enforcement
    - Calculate token count for prompt and response
    - Enforce maximum token limit
    - Truncate context if needed
    - _Requirements: 13.6_

  - [ ] 28.7 Write property test for AI token limit enforcement
    - **Property 25: AI Token Limit Enforcement**
    - **Validates: Requirements 13.6**

  - [ ] 28.8 Implement thread memory system
    - Maintain conversation context per thread
    - Limit context to recent messages
    - Clear context after inactivity
    - _Requirements: 13.8_

  - [ ] 28.9 Implement AI data isolation
    - Isolate RAG documents per guild
    - Prevent cross-guild information leakage
    - Validate guild ownership for all AI operations
    - _Requirements: 13.9, 16.12_

  - [ ] 28.10 Implement AI failure handling
    - Return fallback message on timeout
    - Temporarily disable AI after repeated failures
    - Notify administrators of AI issues
    - Log all AI requests and failures
    - _Requirements: 13.7, 13.10, 13.12_

  - [ ] 28.11 Implement AI channel configuration
    - Add per-channel AI enable/disable
    - Validate channel configuration before processing
    - _Requirements: 13.11_

  - [ ] 28.12 Write unit tests for AI system
    - Test rate limiting
    - Test quota enforcement
    - Test timeout handling
    - Test premium gating
    - Test data isolation
    - _Requirements: 22.13, 22.14_

  - [ ] 28.13 Implement AI API endpoints
    - GET /api/guilds/:guildId/ai/config - Get AI configuration
    - PATCH /api/guilds/:guildId/ai/config - Update AI configuration
    - GET /api/guilds/:guildId/ai/documents - List RAG documents (Premium)
    - POST /api/guilds/:guildId/ai/documents - Upload RAG document (Premium)
    - DELETE /api/guilds/:guildId/ai/documents/:id - Delete RAG document (Premium)
    - GET /api/guilds/:guildId/ai/usage - Get AI usage statistics
    - _Requirements: 14.3, 14.4_

- [ ] 29. Implement AI dashboard UI (Next.js)
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 10 (Dashboard Rules), Section 11 (Premium Enforcement)
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/dashboard/src/app/dashboard/[guildId]/ai/
  - [ ] 29.1 Create AI control panel page
    - Create /dashboard/[guildId]/ai route
    - Display AI enabled/disabled status
    - Show usage statistics (requests, tokens used, quota remaining)
    - _Requirements: 14.10_

  - [ ] 29.2 Create AI channel configuration
    - List all channels with AI enable/disable toggles
    - Bulk enable/disable for channel categories
    - Call PATCH /api/guilds/:guildId/ai/config
    - _Requirements: 14.10_

  - [ ] 29.3 Create RAG knowledge base manager (Premium)
    - Display list of uploaded documents
    - Show document title, upload date, size
    - Upload new documents (text, PDF, markdown)
    - Delete documents
    - Show premium gate for free guilds
    - Call POST/DELETE /api/guilds/:guildId/ai/documents
    - _Requirements: 14.10, 14.18_

  - [ ] 29.4 Display AI usage analytics
    - Show requests per day/week/month
    - Display token usage trends
    - Show most active channels
    - Alert when approaching quota limits
    - _Requirements: 14.10, 14.13_

  - [ ] 29.5 Create AI settings panel
    - Configure AI personality/system prompt
    - Set token limits per request
    - Configure cooldown duration
    - Enable/disable RAG context (Premium)
    - Call PATCH /api/guilds/:guildId/ai/config
    - _Requirements: 14.10_

  - [ ] 29.6 Write unit tests for AI dashboard
    - Test channel configuration
    - Test document upload (premium gating)
    - Test usage analytics
    - _Requirements: 22.5_

- [ ] 30. Checkpoint - Verify streaming and AI systems (full-stack)
  - Ensure all tests pass, ask the user if questions arise.

### Phase 8: Dashboard Foundation, API Core, and Premium System

**📚 Reference Documents:**
- PROJECT_MASTER_LOCK.md: Section 9 (API Rules), Section 10 (Dashboard Rules), Section 11 (Premium Enforcement)
- PROJECT_STRUCTURE.md: packages/api/src/middleware/, packages/dashboard/src/app/, packages/api/src/services/premium.service.ts

**⚠️ CRITICAL**: This phase establishes core infrastructure for all dashboard features.

- [ ] 31. Implement REST API foundation
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 9 (API Rules) - ALL rules apply
  - **Structure Reference**: PROJECT_STRUCTURE.md - Package: API Service
  - [ ] 31.1 Create Express API server with middleware
    - Initialize Express with CORS and body parsing
    - Add request logging middleware
    - Add error handling middleware
    - Configure rate limiting per IP
    - _Requirements: 18.10, 19.8_

  - [ ] 31.2 Implement authentication system
    - Create Discord OAuth2 flow
    - Implement JWT generation and validation
    - Add session management
    - Store JWT in httpOnly cookies
    - _Requirements: 14.1, 14.2_

  - [ ] 31.3 Implement CSRF protection
    - Generate CSRF tokens per session
    - Validate tokens on state-changing requests
    - Rotate tokens after successful operations
    - _Requirements: 14.14, 19.6_

  - [ ] 31.4 Implement guild ownership validation middleware
    - Fetch user's guilds from Discord API
    - Verify user has administrator permissions
    - Cache guild access in Redis
    - _Requirements: 14.3, 16.3, 16.10_

  - [ ] 31.5 Write property test for API guild ownership validation
    - **Property 28: API Guild Ownership Validation**
    - **Validates: Requirements 16.3**

  - [ ] 31.6 Implement input validation middleware
    - Validate request schemas using Zod or Joi
    - Sanitize inputs to prevent injection
    - Return 400 errors for invalid input
    - _Requirements: 14.4, 19.7, 19.12_

  - [ ] 31.7 Write property test for SQL injection prevention
    - **Property 32: SQL Injection Prevention**
    - **Validates: Requirements 19.12**

  - [ ] 31.8 Implement consistent error response format
    - Create error response structure with code, message, details
    - Return appropriate HTTP status codes (400, 401, 403, 429, 500)
    - Include timestamps in error responses
    - _Requirements: 21.10_

  - [ ] 31.9 Implement guild configuration endpoints
    - GET /api/guilds/:guildId/config - Get guild configuration
    - PATCH /api/guilds/:guildId/config - Update guild configuration
    - Validate ownership and permissions
    - Update PostgreSQL and invalidate Redis cache
    - _Requirements: 14.5_

  - [ ] 31.10 Implement moderation API endpoints
    - GET /api/guilds/:guildId/cases - List moderation cases
    - GET /api/guilds/:guildId/cases/:caseId - Get case details
    - POST /api/guilds/:guildId/cases - Create moderation case
    - GET /api/guilds/:guildId/users/:userId/warnings - Get user warnings
    - _Requirements: 14.3, 14.4_

  - [ ] 31.11 Write unit tests for API endpoints
    - Test authentication flow
    - Test permission validation
    - Test input validation
    - Test error responses
    - _Requirements: 22.6, 22.7, 22.8_

- [ ] 32. Implement premium feature system
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 11 (Premium Enforcement) - ALL rules apply
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/api/src/services/premium.service.ts
  - [ ] 32.1 Create PremiumValidator service
    - Implement isPremium, getPremiumTier, validateFeatureAccess methods
    - Cache premium status in Redis with 5-minute TTL
    - Query PostgreSQL for premium subscription data
    - _Requirements: 15.1, 15.15_

  - [ ] 32.2 Implement premium feature gating
    - Validate premium status at API layer
    - Validate premium status at Bot execution layer
    - Return upgrade message when premium expired
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [ ] 32.3 Write property test for premium feature access control
    - **Property 26: Premium Feature Access Control**
    - **Validates: Requirements 15.1, 15.3**

  - [ ] 32.4 Implement graceful premium downgrade
    - Disable premium features without deleting data
    - Preserve user data for potential re-upgrade
    - _Requirements: 15.5_

  - [ ] 32.5 Implement premium feature limits
    - Increase limits for roles, triggers, giveaways on premium
    - Enforce limits based on premium tier
    - _Requirements: 15.12_

  - [ ] 32.6 Implement premium-specific features
    - Custom webhook avatar simulation
    - Custom embed themes
    - Timed roles
    - Advanced multi-stage automation
    - AI RAG knowledge base
    - Advanced analytics export
    - _Requirements: 15.6, 15.7, 15.8, 15.9, 15.10, 15.11_

  - [ ] 32.7 Implement premium validation logging
    - Log all premium validation failures
    - Store logs for billing audit
    - _Requirements: 15.13_

  - [ ] 32.8 Write unit tests for premium system
    - Test premium validation
    - Test feature gating
    - Test graceful downgrade
    - _Requirements: 22.13_

  - [ ] 32.9 Implement premium API endpoints
    - GET /api/guilds/:guildId/premium - Get premium status
    - POST /api/guilds/:guildId/premium/upgrade - Initiate premium upgrade
    - _Requirements: 14.3_

- [ ] 33. Implement web dashboard foundation (Next.js)
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 10 (Dashboard Rules)
  - **Structure Reference**: PROJECT_STRUCTURE.md - Package: Dashboard (Next.js)
  - [ ] 33.1 Create Next.js dashboard application
    - Initialize Next.js project with TypeScript
    - Configure API client for backend communication
    - Set up routing for guild management pages
    - Configure Tailwind CSS or preferred styling
    - _Requirements: 14.6_

  - [ ] 33.2 Implement OAuth2 authentication flow
    - Create login page with Discord OAuth2 button
    - Handle OAuth2 callback
    - Store JWT in cookies
    - Implement logout functionality
    - _Requirements: 14.1, 14.2_

  - [ ] 33.3 Implement guild selection and navigation
    - Display user's guilds with admin permissions
    - Create guild dashboard navigation sidebar
    - Show premium status badge
    - Implement guild switcher
    - _Requirements: 14.3_

  - [ ] 33.4 Create main dashboard layout
    - Header with user info and logout
    - Sidebar navigation for all features
    - Main content area
    - Loading states and error boundaries
    - _Requirements: 14.16, 14.17_

  - [ ] 33.5 Implement feature toggle controls page
    - Create /dashboard/[guildId]/settings route
    - Display all major features with enable/disable toggles
    - Show current configuration state
    - Update via API calls to PATCH /api/guilds/:guildId/config
    - _Requirements: 14.6_

  - [ ] 33.6 Implement premium feature filtering
    - Hide premium features for free guilds
    - Show upgrade prompts for premium features
    - Display premium status clearly in UI
    - Add "Upgrade to Premium" call-to-action
    - _Requirements: 14.18_

  - [ ] 33.7 Create moderation dashboard page
    - Create /dashboard/[guildId]/moderation route
    - Display recent moderation cases
    - Show case ID, user, moderator, action, reason, timestamp
    - Search and filter cases
    - Call GET /api/guilds/:guildId/cases
    - _Requirements: 14.3_

  - [ ] 33.8 Create logs viewer page
    - Create /dashboard/[guildId]/logs route
    - Display event logs with filtering
    - Support search by event type, user, date
    - Paginate results
    - Call GET /api/guilds/:guildId/logs
    - _Requirements: 14.11_

  - [ ] 33.9 Create analytics dashboard page
    - Create /dashboard/[guildId]/analytics route
    - Display engagement metrics overview
    - Show charts for activity trends
    - Support analytics export (Premium)
    - Call GET /api/guilds/:guildId/analytics
    - _Requirements: 14.13_

  - [ ] 33.10 Implement loading and error states
    - Show loading spinners during API calls
    - Display error messages with actionable guidance
    - Handle network failures gracefully
    - Implement retry mechanisms
    - _Requirements: 14.16, 14.17_

  - [ ] 33.11 Write unit tests for dashboard foundation
    - Test authentication flow
    - Test guild selection
    - Test navigation
    - Test error handling
    - _Requirements: 22.5_

- [ ] 34. Implement ticket system backend and dashboard
  - **Compliance Check**: PROJECT_MASTER_LOCK.md - Complete 14-step lifecycle
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/bot/src/tickets/, packages/dashboard/src/app/dashboard/[guildId]/tickets/
  - [ ] 34.1 Create ticket system backend
    - Implement ticket creation via button
    - Create private threads with staff roles
    - Handle ticket closing with transcript generation
    - Store transcripts in PostgreSQL
    - Support auto-close after inactivity
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 5.7, 5.8, 5.9_

  - [ ] 34.2 Implement ticket API endpoints
    - GET /api/guilds/:guildId/tickets - List tickets
    - GET /api/guilds/:guildId/tickets/:id - Get ticket details
    - GET /api/guilds/:guildId/tickets/:id/transcript - Get ticket transcript
    - PATCH /api/guilds/:guildId/tickets/:id - Update ticket (close, etc.)
    - _Requirements: 14.3, 14.4_

  - [ ] 34.3 Create ticket dashboard page
    - Create /dashboard/[guildId]/tickets route
    - Display open and closed tickets
    - Show ticket creator, category, status, created date
    - Filter by status and category
    - Call GET /api/guilds/:guildId/tickets
    - _Requirements: 14.12_

  - [ ] 34.4 Create ticket transcript viewer
    - Display full ticket conversation
    - Show timestamps and user names
    - Support export (Premium)
    - Call GET /api/guilds/:guildId/tickets/:id/transcript
    - _Requirements: 5.5, 14.12_

  - [ ] 34.5 Create ticket configuration page
    - Configure ticket categories
    - Set staff roles
    - Configure auto-close duration
    - Set concurrent ticket limits
    - Call PATCH /api/guilds/:guildId/config
    - _Requirements: 5.7, 5.8, 14.6_

  - [ ] 34.6 Write unit tests for ticket system
    - Test ticket creation
    - Test transcript generation
    - Test auto-close
    - Test dashboard integration
    - _Requirements: 22.5_

- [ ] 35. Checkpoint - Verify API, dashboard foundation, premium, and tickets (full-stack)
  - Ensure all tests pass, ask the user if questions arise.
### Phase 9: Logging, Worker System, and Data Isolation

**📚 Reference Documents:**
- PROJECT_MASTER_LOCK.md: Section 7 (Worker Rules), Section 8 (Logging Layer), Section 15 (Regression Protection)
- PROJECT_STRUCTURE.md: packages/worker/, packages/bot/src/events/, packages/api/src/controllers/logs.controller.ts

**⚠️ CRITICAL**: This phase ensures system reliability, observability, and multi-tenant security.

- [ ] 36. Implement comprehensive logging system
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 8 (Logging Layer)
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/bot/src/events/
  - [ ] 36.1 Create EventLogger service
    - Implement logging for all event types
    - Store logs in event_logs table
    - Include guild_id, event_type, user_id, channel_id, data, timestamp
    - _Requirements: 10.8_

  - [ ] 36.2 Implement message logging
    - Log message deletions with content, author, timestamp
    - Log message edits with before/after content
    - _Requirements: 10.1, 10.2_

  - [ ] 36.3 Implement member and role logging
    - Log member joins and leaves
    - Log role updates with before/after role lists
    - _Requirements: 10.3, 10.4_

  - [ ] 36.4 Implement channel and voice logging
    - Log channel create, update, delete events
    - Log voice state changes including channel transitions
    - _Requirements: 10.5, 10.6_

  - [ ] 36.5 Implement command logging
    - Log all command executions with user, timestamp, parameters
    - Track command success/failure
    - _Requirements: 10.7_

  - [ ] 36.6 Implement log channel posting
    - Send log messages to configured log channel in real-time
    - Format logs with embeds for readability
    - Include Case_ID references for moderation logs
    - _Requirements: 10.9, 10.11_

  - [ ] 36.7 Implement log viewer API
    - Create searchable log endpoint with filtering
    - Support filtering by event type, user, date range
    - Implement pagination
    - _Requirements: 10.10_

  - [ ] 36.8 Implement log channel permission validation
    - Validate configured log channel exists
    - Respect channel permissions
    - _Requirements: 10.12_

  - [ ] 36.9 Write unit tests for logging system
    - Test all event type logging
    - Test log channel posting
    - Test log filtering
    - _Requirements: 22.5_

- [ ] 37. Implement worker system with BullMQ
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 7 (Worker Rules) - ALL rules apply
  - **Structure Reference**: PROJECT_STRUCTURE.md - Package: Worker Service
  - [ ] 37.1 Create BullMQ queue configuration
    - Initialize Redis-backed queues
    - Configure queue options (concurrency, retry, timeout)
    - Set up dead-letter queue
    - _Requirements: 17.12_

  - [ ] 37.2 Implement worker job processors
    - Create processors for giveaway end timers
    - Create processors for auto-reroll timers
    - Create processors for scheduled messages
    - Create processors for reminder dispatch
    - Create processors for warning decay
    - Create processors for timed role expiration
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

  - [ ] 37.3 Implement retry logic with exponential backoff
    - Configure retry attempts (max 3)
    - Implement exponential backoff (1s, 2s, 4s)
    - Move failed jobs to dead-letter queue after max retries
    - _Requirements: 17.7, 21.4_

  - [ ] 37.4 Write property test for worker retry with exponential backoff
    - **Property 29: Worker Job Retry with Exponential Backoff**
    - **Validates: Requirements 17.7, 21.4**

  - [ ] 37.5 Implement job timeout guards
    - Set 30-second default timeout for all jobs
    - Handle timeout errors gracefully
    - Log timeout events
    - _Requirements: 17.9, 21.12_

  - [ ] 37.6 Implement worker job logging
    - Log all job executions with status, duration, error details
    - Track job success/failure rates
    - _Requirements: 17.10_

  - [ ] 37.7 Implement concurrent job processing
    - Configure concurrency limits per queue
    - Prevent resource exhaustion
    - _Requirements: 17.13_

  - [ ] 37.8 Write unit tests for worker system
    - Test job execution
    - Test retry logic
    - Test timeout handling
    - Test dead-letter queue
    - _Requirements: 22.11_

- [ ] 38. Implement multi-tenant data isolation
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 1 (Core Principle), Section 14 (Security Rules)
  - **Structure Reference**: PROJECT_STRUCTURE.md - Redis Key Structure, Database Structure
  - [ ] 38.1 Implement Redis key namespacing
    - Enforce bot:{guildId}:{feature}:{key} format
    - Add validation to prevent malformed keys
    - _Requirements: 16.1_

  - [ ] 38.2 Implement database query filtering
    - Add guild_id filter to all queries
    - Create query builder helpers that enforce filtering
    - _Requirements: 16.2_

  - [ ] 38.3 Implement cross-guild access prevention
    - Validate guild ownership in all API endpoints
    - Validate guild context in all bot commands
    - _Requirements: 16.3, 16.4, 16.5_

  - [ ] 38.4 Write property test for guild data isolation
    - **Property 3: Guild Data Isolation**
    - **Validates: Requirements 1.9, 16.4**

  - [ ] 38.5 Implement shard-aware architecture
    - Distribute guilds across shards
    - Use shared Redis for cross-shard state
    - Use shared PostgreSQL with connection pooling
    - _Requirements: 16.6, 16.7, 16.8, 16.9_

  - [ ] 38.6 Implement Redis pub/sub for cross-shard communication
    - Create pub/sub channels for config updates, premium updates
    - Subscribe all shards to relevant channels
    - Invalidate caches on updates
    - _Requirements: 16.6_

  - [ ] 38.7 Implement security event logging
    - Log attempted cross-guild data access
    - Log failed permission checks
    - Alert on suspicious activity
    - _Requirements: 16.11, 19.10_

  - [ ] 38.8 Implement AI data isolation
    - Isolate RAG embeddings per guild in pgvector
    - Prevent cross-guild information leakage
    - _Requirements: 16.12_

  - [ ] 38.9 Write unit tests for data isolation
    - Test cross-guild access prevention
    - Test Redis key namespacing
    - Test database query filtering
    - _Requirements: 22.14_

- [ ] 39. Checkpoint - Verify logging, workers, and isolation
  - Ensure all tests pass, ask the user if questions arise.

### Phase 10: Error Handling, Performance, and Security

**📚 Reference Documents:**
- PROJECT_MASTER_LOCK.md: Section 13 (Performance Rules), Section 14 (Security Rules), Section 15 (Regression Protection)
- PROJECT_STRUCTURE.md: All packages - error handling patterns

**⚠️ CRITICAL**: This phase ensures production-grade reliability and security.

- [ ] 40. Implement comprehensive error handling
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 15 (Regression Protection)
  - **Structure Reference**: PROJECT_STRUCTURE.md - packages/*/src/utils/error-handler.ts
  - [ ] 40.1 Implement graceful Redis failure handling
    - Catch Redis connection errors
    - Continue operation with degraded functionality (skip caching)
    - Log errors with context
    - Don't crash on Redis unavailability
    - _Requirements: 21.1_

  - [ ] 40.2 Write property test for graceful Redis failure handling
    - **Property 33: Graceful Redis Failure Handling**
    - **Validates: Requirements 21.1**

  - [ ] 40.3 Implement graceful PostgreSQL failure handling
    - Catch database connection errors
    - Queue operations for retry
    - Return cached data if available
    - Log errors with stack traces
    - _Requirements: 21.2, 21.8_

  - [ ] 40.4 Implement external API failure handling
    - Catch API call failures (Discord, AI, streaming platforms)
    - Return user-friendly error messages
    - Log errors with request details
    - _Requirements: 21.3, 21.5_

  - [ ] 40.5 Implement Discord API rate limit handling
    - Respect rate limit headers
    - Retry after specified delay
    - Queue requests during rate limits
    - _Requirements: 21.6_

  - [ ] 40.6 Implement circuit breakers for external services
    - Track failure rates for AI service, streaming APIs
    - Open circuit after 5 consecutive failures
    - Close circuit after 60-second timeout
    - _Requirements: 21.7_

  - [ ] 40.7 Implement critical error alerting
    - Send alerts to configured monitoring channels
    - Include error context and stack traces
    - _Requirements: 21.9_

  - [ ] 40.8 Implement timeout guards for async operations
    - Set 30-second default timeout
    - Handle timeout errors gracefully
    - _Requirements: 21.12_

  - [ ] 40.9 Write unit tests for error handling
    - Test Redis failure scenarios
    - Test database failure scenarios
    - Test external API failures
    - Test circuit breaker behavior
    - _Requirements: 22.9, 22.10, 22.12_

- [ ] 41. Implement performance optimizations
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 13 (Performance Rules) - ALL rules apply
  - **Structure Reference**: PROJECT_STRUCTURE.md - Caching and connection pooling patterns
  - [ ] 41.1 Implement connection pooling
    - Configure PostgreSQL pool (min 10, max 50)
    - Configure Redis connection pooling
    - Monitor connection usage
    - _Requirements: 18.7_

  - [ ] 41.2 Implement Redis caching strategy
    - Cache guild configs with 5-minute TTL
    - Cache premium status with 5-minute TTL
    - Cache XP data with periodic sync
    - Implement cache invalidation on updates
    - _Requirements: 18.4, 18.6_

  - [ ] 41.3 Implement XP batch updates
    - Batch XP updates to PostgreSQL every 5 minutes
    - Reduce database write load
    - _Requirements: 18.5_

  - [ ] 41.4 Implement Redis TTL for temporary data
    - Set TTL for cooldowns (60 seconds)
    - Set TTL for rate limits (variable)
    - Set TTL for giveaway claim timers (300 seconds)
    - Prevent memory bloat
    - _Requirements: 18.8_

  - [ ] 41.5 Implement non-blocking worker execution
    - Offload heavy operations to worker queue
    - Never block bot event loop
    - _Requirements: 18.9_

  - [ ] 41.6 Implement performance monitoring
    - Track command response times
    - Track database query times
    - Track API endpoint response times
    - Log performance metrics
    - _Requirements: 18.12_

  - [ ] 41.7 Write property test for concurrent command handling
    - **Property 30: Concurrent Command Handling**
    - **Validates: Requirements 18.1**

  - [ ] 41.8 Write property test for command response time
    - **Property 31: Command Response Time**
    - **Validates: Requirements 18.3**

- [ ] 42. Implement security controls
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 14 (Security Rules) - ALL rules apply
  - **Structure Reference**: PROJECT_STRUCTURE.md - Security middleware and validation
  - [ ] 42.1 Implement input sanitization
    - Sanitize user input before database storage
    - Use parameterized queries to prevent SQL injection
    - Sanitize input before displaying in embeds
    - _Requirements: 19.12, 19.13_

  - [ ] 42.2 Implement webhook signature validation
    - Validate Twitch EventSub signatures
    - Validate YouTube WebSub signatures
    - Reject requests with invalid signatures
    - _Requirements: 19.11_

  - [ ] 42.3 Implement HTTPS enforcement
    - Enforce HTTPS for all dashboard communications
    - Redirect HTTP to HTTPS
    - _Requirements: 19.14_

  - [ ] 42.4 Implement giveaway fraud prevention
    - Validate winner hasn't left guild
    - Revalidate role requirements before awarding
    - _Requirements: 19.15_

  - [ ] 42.5 Write unit tests for security controls
    - Test input sanitization
    - Test webhook signature validation
    - Test role hierarchy enforcement
    - _Requirements: 22.6_

- [ ] 43. Checkpoint - Verify error handling, performance, and security
  - Ensure all tests pass, ask the user if questions arise.

### Phase 11: Testing, Documentation, and Deployment

**📚 Reference Documents:**
- PROJECT_MASTER_LOCK.md: Section 3 (Testing Enforcement), Section 4 (Mock Data Standard), Section 11 (Documentation Layer)
- PROJECT_STRUCTURE.md: Testing Structure, Documentation Structure, Docker & Deployment Structure

**⚠️ CRITICAL**: This phase validates the entire system meets all requirements.

- [ ] 44. Implement comprehensive test suite
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 3 (Testing Enforcement) - 90%+ coverage required
  - **Structure Reference**: PROJECT_STRUCTURE.md - Testing Structure section
  - [ ] 44.1 Set up Jest testing framework
    - Configure Jest with TypeScript support
    - Set up coverage reporting
    - Configure test environment
    - _Requirements: 22.1, 22.2, 22.3, 22.4_

  - [ ] 44.2 Create mock data standards
    - Create realistic mock guild, user, role data
    - Use structured identifiers
    - Create mock data generators
    - _Requirements: 22.17_

  - [ ] 44.3 Write happy path tests for all features
    - Test normal operation with valid inputs
    - Cover all major features
    - _Requirements: 22.5_

  - [ ] 44.4 Write permission denied tests
    - Test operations without required permissions
    - Test role hierarchy violations
    - _Requirements: 22.6_

  - [ ] 44.5 Write invalid input tests
    - Test malformed inputs
    - Test missing required fields
    - Test out-of-range values
    - _Requirements: 22.7_

  - [ ] 44.6 Write rate limit tests
    - Test exceeding configured rate limits
    - Test rate limit reset
    - _Requirements: 22.8_

  - [ ] 44.7 Write concurrency tests
    - Test simultaneous operations on same resources
    - Test race conditions
    - _Requirements: 22.15_

  - [ ] 44.8 Write duplicate execution tests
    - Test idempotency of worker jobs
    - Test duplicate prevention mechanisms
    - _Requirements: 22.16_

  - [ ] 44.9 Verify test coverage meets requirements
    - Ensure 90%+ line coverage
    - Ensure 90%+ branch coverage
    - Ensure 90%+ function coverage
    - Ensure 90%+ statement coverage
    - _Requirements: 22.1, 22.2, 22.3, 22.4_

- [ ] 45. Create deployment configuration
  - **Compliance Check**: PROJECT_MASTER_LOCK.md - Production-grade deployment requirements
  - **Structure Reference**: PROJECT_STRUCTURE.md - Docker & Deployment Structure
  - [ ] 45.1 Create Docker images
    - Create Dockerfile for bot service
    - Create Dockerfile for API service
    - Create Dockerfile for worker service
    - Create Dockerfile for dashboard service
    - Optimize images for production
    - _Requirements: 18.11_

  - [ ] 45.2 Create Docker Compose configuration
    - Configure all services (bot, api, worker, dashboard, redis, postgres)
    - Set up service dependencies
    - Configure environment variables
    - Set up volumes for data persistence
    - _Requirements: 18.11_

  - [ ] 45.3 Create environment variable documentation
    - Document all required environment variables
    - Provide example .env file
    - Document configuration options
    - _Requirements: 18.11_

  - [ ] 45.4 Create database migration scripts
    - Create migration runner
    - Document migration process
    - Create rollback procedures
    - _Requirements: 20.1, 20.2_

  - [ ] 45.5 Create deployment documentation
    - Document deployment process
    - Document scaling procedures
    - Document monitoring setup
    - Document backup procedures
    - _Requirements: 18.11_

- [ ] 46. Create system documentation
  - **Compliance Check**: PROJECT_MASTER_LOCK.md Section 11 (Documentation Layer)
  - **Structure Reference**: PROJECT_STRUCTURE.md - Documentation Structure
  - [ ] 46.1 Create API documentation
    - Document all API endpoints
    - Include request/response examples
    - Document authentication flow
    - Document error codes
    - _Requirements: Documentation Layer_

  - [ ] 46.2 Create bot command documentation
    - Document all slash commands
    - Include usage examples
    - Document required permissions
    - _Requirements: Documentation Layer_

  - [ ] 46.3 Create architecture documentation
    - Document system architecture
    - Document data flow
    - Document sharding strategy
    - Document caching strategy
    - _Requirements: Documentation Layer_

  - [ ] 46.4 Create troubleshooting guide
    - Document common issues and solutions
    - Document error messages
    - Document debugging procedures
    - _Requirements: Documentation Layer_

  - [ ] 46.5 Create user guide for dashboard
    - Document dashboard features
    - Include screenshots
    - Document configuration options
    - _Requirements: Documentation Layer_

- [ ] 47. Final checkpoint - Complete system verification
  - **Compliance Check**: PROJECT_MASTER_LOCK.md - FINAL COMPLETION CHECKLIST (all 15 items)
  - **Structure Reference**: PROJECT_STRUCTURE.md - Complete system walkthrough
  - Run full test suite and verify 90%+ coverage
  - Verify all 11 architectural layers are implemented
  - Verify all requirements are addressed
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples, edge cases, and error conditions
- The system must achieve 90%+ test coverage across all metrics (lines, branches, functions, statements)
- All async tasks must be idempotent with retry policies
- Redis keys must follow format: bot:{guildId}:{feature}:{key}
- All endpoints must validate JWT, guild ownership, permissions, and premium status
- No blocking operations in event loop - use worker queue for heavy tasks
- Multi-guild isolation must be enforced at all layers
- Shard-aware architecture from day one
- **CRITICAL**: Dashboard UI components are wired immediately when backend services are created, not deferred to later phases

## Implementation Strategy

The tasks are organized into 11 phases that build incrementally with full-stack vertical slices:

1. **Phase 1**: Foundation (database, Redis, project structure)
2. **Phase 2**: Bot foundation (sharding, permissions, commands)
3. **Phase 3**: AutoMod and moderation
4. **Phase 4**: Giveaway system (Bot → API → Database → Dashboard → Tests)
5. **Phase 5**: XP and role management (Bot → API → Database → Dashboard → Tests)
6. **Phase 6**: Automation and community features (Bot → API → Database → Dashboard → Tests)
7. **Phase 7**: Streaming and AI (Bot → API → Database → Dashboard → Tests)
8. **Phase 8**: Dashboard foundation, API core, premium, tickets (full-stack)
9. **Phase 9**: Logging, workers, data isolation
10. **Phase 10**: Error handling, performance, security
11. **Phase 11**: Testing, documentation, deployment

Each phase includes a checkpoint to verify progress before moving forward. Phases 4-8 implement features as complete full-stack vertical slices, ensuring dashboard UI is wired immediately when the backend is created. This ensures the system is built on a solid foundation with continuous validation and nothing is missed from the dashboard.

