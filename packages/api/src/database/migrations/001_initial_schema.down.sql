-- Rollback Initial Schema Migration
-- Compliance: PROJECT_MASTER_LOCK.md Section 5 (Database Rules)

-- Drop triggers
DROP TRIGGER IF EXISTS update_guild_configs_updated_at ON guild_configs;
DROP TRIGGER IF EXISTS update_guilds_updated_at ON guilds;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_guild_configs_guild_id;
DROP INDEX IF EXISTS idx_guilds_premium_expires;
DROP INDEX IF EXISTS idx_guilds_is_active;
DROP INDEX IF EXISTS idx_guilds_premium_tier;

-- Drop tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS guild_configs;
DROP TABLE IF EXISTS guilds;
DROP TABLE IF EXISTS schema_migrations;

-- Note: We don't drop the uuid-ossp extension as it might be used by other schemas
