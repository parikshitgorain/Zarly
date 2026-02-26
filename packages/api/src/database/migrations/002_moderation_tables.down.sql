-- Rollback Moderation Tables Migration
-- Compliance: PROJECT_MASTER_LOCK.md Section 5 (Database Rules)

-- Drop function
DROP FUNCTION IF EXISTS get_next_case_id(VARCHAR);

-- Drop trigger
DROP TRIGGER IF EXISTS update_moderation_cases_updated_at ON moderation_cases;

-- Drop indexes
DROP INDEX IF EXISTS idx_moderation_cases_action_type;
DROP INDEX IF EXISTS idx_moderation_cases_is_active;
DROP INDEX IF EXISTS idx_moderation_cases_expires_at;
DROP INDEX IF EXISTS idx_moderation_cases_guild_user;
DROP INDEX IF EXISTS idx_moderation_cases_user_id;
DROP INDEX IF EXISTS idx_moderation_cases_guild_id;

-- Drop table
DROP TABLE IF EXISTS moderation_cases;

-- Remove migration record
DELETE FROM schema_migrations WHERE version = '002';
