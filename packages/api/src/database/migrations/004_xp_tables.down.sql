-- Rollback XP and Leveling Tables Migration

DROP FUNCTION IF EXISTS xp_for_level(INTEGER);
DROP FUNCTION IF EXISTS calculate_level(BIGINT);

DROP TRIGGER IF EXISTS update_user_xp_updated_at ON user_xp;

DROP INDEX IF EXISTS idx_user_xp_level;
DROP INDEX IF EXISTS idx_user_xp_leaderboard;
DROP INDEX IF EXISTS idx_user_xp_user_id;
DROP INDEX IF EXISTS idx_user_xp_guild_id;

DROP TABLE IF EXISTS user_xp;

DELETE FROM schema_migrations WHERE version = '004';
