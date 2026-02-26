-- Rollback Feature Tables Migration

-- Drop triggers
DROP TRIGGER IF EXISTS update_starboard_entries_updated_at ON starboard_entries;
DROP TRIGGER IF EXISTS update_ai_knowledge_base_updated_at ON ai_knowledge_base;
DROP TRIGGER IF EXISTS update_streamers_updated_at ON streamers;
DROP TRIGGER IF EXISTS update_triggers_updated_at ON triggers;
DROP TRIGGER IF EXISTS update_scheduled_messages_updated_at ON scheduled_messages;

-- Drop indexes
DROP INDEX IF EXISTS idx_starboard_entries_message_id;
DROP INDEX IF EXISTS idx_starboard_entries_guild_id;
DROP INDEX IF EXISTS idx_suggestions_status;
DROP INDEX IF EXISTS idx_suggestions_guild_id;
DROP INDEX IF EXISTS idx_event_logs_user_id;
DROP INDEX IF EXISTS idx_event_logs_created_at;
DROP INDEX IF EXISTS idx_event_logs_event_type;
DROP INDEX IF EXISTS idx_event_logs_guild_id;
DROP INDEX IF EXISTS idx_ai_knowledge_base_guild_id;
DROP INDEX IF EXISTS idx_streamers_is_live;
DROP INDEX IF EXISTS idx_streamers_platform;
DROP INDEX IF EXISTS idx_streamers_guild_id;
DROP INDEX IF EXISTS idx_triggers_is_active;
DROP INDEX IF EXISTS idx_triggers_guild_id;
DROP INDEX IF EXISTS idx_reminders_remind_at;
DROP INDEX IF EXISTS idx_reminders_user_id;
DROP INDEX IF EXISTS idx_reminders_guild_id;
DROP INDEX IF EXISTS idx_scheduled_messages_next_execution;
DROP INDEX IF EXISTS idx_scheduled_messages_guild_id;
DROP INDEX IF EXISTS idx_ticket_transcripts_ticket_id;
DROP INDEX IF EXISTS idx_tickets_status;
DROP INDEX IF EXISTS idx_tickets_user_id;
DROP INDEX IF EXISTS idx_tickets_guild_id;

-- Drop tables
DROP TABLE IF EXISTS starboard_entries;
DROP TABLE IF EXISTS suggestions;
DROP TABLE IF EXISTS event_logs;
DROP TABLE IF EXISTS ai_knowledge_base;
DROP TABLE IF EXISTS streamers;
DROP TABLE IF EXISTS triggers;
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS scheduled_messages;
DROP TABLE IF EXISTS ticket_transcripts;
DROP TABLE IF EXISTS tickets;

DELETE FROM schema_migrations WHERE version = '005';
