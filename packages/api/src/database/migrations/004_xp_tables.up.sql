-- XP and Leveling Tables Migration
-- Creates user_xp table for tracking experience points
-- Compliance: PROJECT_MASTER_LOCK.md Section 5 (Database Rules)

-- User XP table
CREATE TABLE user_xp (
    id SERIAL PRIMARY KEY,
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    user_id VARCHAR(20) NOT NULL,
    
    -- XP tracking
    text_xp BIGINT DEFAULT 0 CHECK (text_xp >= 0),
    voice_xp BIGINT DEFAULT 0 CHECK (voice_xp >= 0),
    total_xp BIGINT GENERATED ALWAYS AS (text_xp + voice_xp) STORED,
    
    -- Level calculation (computed from total_xp)
    level INTEGER DEFAULT 0 CHECK (level >= 0),
    
    -- Timestamps
    last_text_xp_at TIMESTAMP WITH TIME ZONE,
    last_voice_xp_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique user per guild
    UNIQUE(guild_id, user_id)
);

-- Indexes for performance (especially for leaderboard queries)
CREATE INDEX idx_user_xp_guild_id ON user_xp(guild_id);
CREATE INDEX idx_user_xp_user_id ON user_xp(user_id);
CREATE INDEX idx_user_xp_leaderboard ON user_xp(guild_id, total_xp DESC);
CREATE INDEX idx_user_xp_level ON user_xp(guild_id, level DESC);

-- Trigger for updated_at
CREATE TRIGGER update_user_xp_updated_at BEFORE UPDATE ON user_xp
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate level from XP
-- Formula: level = floor(sqrt(total_xp / 100))
CREATE OR REPLACE FUNCTION calculate_level(xp BIGINT)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(SQRT(xp::NUMERIC / 100))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate XP required for a level
CREATE OR REPLACE FUNCTION xp_for_level(lvl INTEGER)
RETURNS BIGINT AS $$
BEGIN
    RETURN (lvl * lvl * 100)::BIGINT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Insert migration record
INSERT INTO schema_migrations (version, description) 
VALUES ('004', 'XP and leveling tables - user_xp');
