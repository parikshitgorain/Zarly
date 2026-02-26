-- Giveaway Tables Migration
-- Creates giveaways and giveaway_entries tables
-- Compliance: PROJECT_MASTER_LOCK.md Section 5 (Database Rules)

-- Giveaways table
CREATE TABLE giveaways (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    
    -- Giveaway details
    prize TEXT NOT NULL,
    description TEXT,
    winner_count INTEGER DEFAULT 1 CHECK (winner_count > 0),
    
    -- Channel and message
    channel_id VARCHAR(20) NOT NULL,
    message_id VARCHAR(20),
    
    -- Requirements
    required_role_ids TEXT[], -- Array of role IDs
    min_level INTEGER DEFAULT 0,
    min_account_age_days INTEGER DEFAULT 0,
    blacklisted_user_ids TEXT[], -- Array of user IDs
    
    -- Timing
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    claim_timeout_seconds INTEGER DEFAULT 300,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'completed', 'cancelled')),
    
    -- Winners and reroll tracking
    winner_user_ids TEXT[], -- Array of winner user IDs
    excluded_user_ids TEXT[], -- Users who didn't claim (excluded from rerolls)
    reroll_count INTEGER DEFAULT 0,
    max_rerolls INTEGER DEFAULT 3,
    
    -- Metadata
    created_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Giveaway entries table
CREATE TABLE giveaway_entries (
    id SERIAL PRIMARY KEY,
    giveaway_id UUID NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
    user_id VARCHAR(20) NOT NULL,
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    
    -- Entry metadata
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique entries per giveaway
    UNIQUE(giveaway_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_giveaways_guild_id ON giveaways(guild_id);
CREATE INDEX idx_giveaways_status ON giveaways(status);
CREATE INDEX idx_giveaways_ends_at ON giveaways(ends_at);
CREATE INDEX idx_giveaways_guild_status ON giveaways(guild_id, status);
CREATE INDEX idx_giveaway_entries_giveaway_id ON giveaway_entries(giveaway_id);
CREATE INDEX idx_giveaway_entries_user_id ON giveaway_entries(user_id);
CREATE INDEX idx_giveaway_entries_guild_id ON giveaway_entries(guild_id);

-- Trigger for updated_at
CREATE TRIGGER update_giveaways_updated_at BEFORE UPDATE ON giveaways
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert migration record
INSERT INTO schema_migrations (version, description) 
VALUES ('003', 'Giveaway tables - giveaways and giveaway_entries');
