-- Rollback Giveaway Tables Migration

DROP TRIGGER IF EXISTS update_giveaways_updated_at ON giveaways;

DROP INDEX IF EXISTS idx_giveaway_entries_guild_id;
DROP INDEX IF EXISTS idx_giveaway_entries_user_id;
DROP INDEX IF EXISTS idx_giveaway_entries_giveaway_id;
DROP INDEX IF EXISTS idx_giveaways_guild_status;
DROP INDEX IF EXISTS idx_giveaways_ends_at;
DROP INDEX IF EXISTS idx_giveaways_status;
DROP INDEX IF EXISTS idx_giveaways_guild_id;

DROP TABLE IF EXISTS giveaway_entries;
DROP TABLE IF EXISTS giveaways;

DELETE FROM schema_migrations WHERE version = '003';
