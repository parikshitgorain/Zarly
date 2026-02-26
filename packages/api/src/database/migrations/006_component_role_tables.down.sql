-- Rollback Component Role and Premium Feature Tables Migration

-- Drop triggers
DROP TRIGGER IF EXISTS update_automation_workflows_updated_at ON automation_workflows;
DROP TRIGGER IF EXISTS update_embed_themes_updated_at ON embed_themes;
DROP TRIGGER IF EXISTS update_component_role_panels_updated_at ON component_role_panels;

-- Drop indexes
DROP INDEX IF EXISTS idx_automation_stages_stage_number;
DROP INDEX IF EXISTS idx_automation_stages_workflow_id;
DROP INDEX IF EXISTS idx_automation_workflows_is_active;
DROP INDEX IF EXISTS idx_automation_workflows_guild_id;
DROP INDEX IF EXISTS idx_embed_themes_is_default;
DROP INDEX IF EXISTS idx_embed_themes_guild_id;
DROP INDEX IF EXISTS idx_timed_roles_guild_user;
DROP INDEX IF EXISTS idx_timed_roles_expires_at;
DROP INDEX IF EXISTS idx_timed_roles_user_id;
DROP INDEX IF EXISTS idx_timed_roles_guild_id;
DROP INDEX IF EXISTS idx_component_roles_position;
DROP INDEX IF EXISTS idx_component_roles_role_id;
DROP INDEX IF EXISTS idx_component_roles_panel_id;
DROP INDEX IF EXISTS idx_component_role_panels_channel_id;
DROP INDEX IF EXISTS idx_component_role_panels_guild_id;

-- Drop tables
DROP TABLE IF EXISTS automation_stages;
DROP TABLE IF EXISTS automation_workflows;
DROP TABLE IF EXISTS embed_themes;
DROP TABLE IF EXISTS timed_roles;
DROP TABLE IF EXISTS component_roles;
DROP TABLE IF EXISTS component_role_panels;

DELETE FROM schema_migrations WHERE version = '006';
