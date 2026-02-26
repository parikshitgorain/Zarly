-- Moderation Tables Migration
-- Creates moderation_cases table for tracking moderation actions
-- Compliance: PROJECT_MASTER_LOCK.md Section 5 (Database Rules)

-- Moderation cases table
CREATE TABLE moderation_cases (
    id SERIAL PRIMARY KEY,
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    case_id INTEGER NOT NULL, -- Per-guild case ID
    
    -- Target and moderator
    user_id VARCHAR(20) NOT NULL,
    moderator_id VARCHAR(20) NOT NULL,
    
    -- Action details
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('warn', 'timeout', 'kick', 'ban', 'unban')),
    reason TEXT,
    duration_seconds INTEGER, -- For timeout actions
    
    -- Expiration (for warnings)
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique case_id per guild
    UNIQUE(guild_id, case_id)
);

-- Indexes for performance
CREATE INDEX idx_moderation_cases_guild_id ON moderation_cases(guild_id);
CREATE INDEX idx_moderation_cases_user_id ON moderation_cases(user_id);
CREATE INDEX idx_moderation_cases_guild_user ON moderation_cases(guild_id, user_id);
CREATE INDEX idx_moderation_cases_expires_at ON moderation_cases(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_moderation_cases_is_active ON moderation_cases(is_active) WHERE is_active = true;
CREATE INDEX idx_moderation_cases_action_type ON moderation_cases(action_type);

-- Trigger for updated_at
CREATE TRIGGER update_moderation_cases_updated_at BEFORE UPDATE ON moderation_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get next case ID for a guild
CREATE OR REPLACE FUNCTION get_next_case_id(p_guild_id VARCHAR(20))
RETURNS INTEGER AS $$
DECLARE
    next_id INTEGER;
BEGIN
    SELECT COALESCE(MAX(case_id), 0) + 1 INTO next_id
    FROM moderation_cases
    WHERE guild_id = p_guild_id;
    
    RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- Insert migration record
INSERT INTO schema_migrations (version, description) 
VALUES ('002', 'Moderation tables - moderation_cases');
