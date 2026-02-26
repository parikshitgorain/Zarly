-- Initial Schema Migration
-- Creates guilds, guild_configs, and schema_migrations tables
-- Compliance: PROJECT_MASTER_LOCK.md Section 5 (Database Rules)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema migrations tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Guilds table - stores guild information and premium status
CREATE TABLE guilds (
    guild_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon_url TEXT,
    owner_id VARCHAR(20) NOT NULL,
    
    -- Premium fields
    premium_tier VARCHAR(20) DEFAULT 'free' CHECK (premium_tier IN ('free', 'basic', 'premium', 'enterprise')),
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    premium_activated_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Guild configurations table - stores all guild settings
CREATE TABLE guild_configs (
    id SERIAL PRIMARY KEY,
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    
    -- Feature toggles
    automod_enabled BOOLEAN DEFAULT false,
    xp_enabled BOOLEAN DEFAULT false,
    leveling_enabled BOOLEAN DEFAULT false,
    giveaways_enabled BOOLEAN DEFAULT false,
    tickets_enabled BOOLEAN DEFAULT false,
    automation_enabled BOOLEAN DEFAULT false,
    ai_enabled BOOLEAN DEFAULT false,
    streaming_enabled BOOLEAN DEFAULT false,
    
    -- Channel configurations
    log_channel_id VARCHAR(20),
    mod_log_channel_id VARCHAR(20),
    welcome_channel_id VARCHAR(20),
    level_up_channel_id VARCHAR(20),
    suggestion_channel_id VARCHAR(20),
    starboard_channel_id VARCHAR(20),
    
    -- Role configurations
    mod_role_id VARCHAR(20),
    admin_role_id VARCHAR(20),
    muted_role_id VARCHAR(20),
    
    -- AutoMod settings
    automod_spam_threshold INTEGER DEFAULT 5,
    automod_caps_threshold DECIMAL(3,2) DEFAULT 0.70,
    automod_mention_threshold INTEGER DEFAULT 5,
    automod_link_filter BOOLEAN DEFAULT false,
    automod_invite_filter BOOLEAN DEFAULT false,
    automod_bad_words TEXT[], -- Array of bad word patterns
    
    -- XP settings
    xp_text_min INTEGER DEFAULT 15,
    xp_text_max INTEGER DEFAULT 25,
    xp_voice_per_minute INTEGER DEFAULT 10,
    xp_cooldown_seconds INTEGER DEFAULT 60,
    xp_multiplier DECIMAL(3,2) DEFAULT 1.00,
    
    -- Moderation settings
    warning_decay_days INTEGER DEFAULT 30,
    escalation_thresholds JSONB DEFAULT '{"3": "timeout", "5": "kick", "7": "ban"}',
    
    -- Starboard settings
    starboard_threshold INTEGER DEFAULT 5,
    starboard_emoji VARCHAR(50) DEFAULT '⭐',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(guild_id)
);

-- Indexes for performance
CREATE INDEX idx_guilds_premium_tier ON guilds(premium_tier);
CREATE INDEX idx_guilds_is_active ON guilds(is_active);
CREATE INDEX idx_guilds_premium_expires ON guilds(premium_expires_at) WHERE premium_expires_at IS NOT NULL;
CREATE INDEX idx_guild_configs_guild_id ON guild_configs(guild_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_guilds_updated_at BEFORE UPDATE ON guilds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guild_configs_updated_at BEFORE UPDATE ON guild_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert migration record
INSERT INTO schema_migrations (version, description) 
VALUES ('001', 'Initial schema - guilds and guild_configs tables');
