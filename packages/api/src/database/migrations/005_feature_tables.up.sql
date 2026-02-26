-- Feature Tables Migration
-- Creates tickets, automation, streaming, AI, and logging tables
-- Compliance: PROJECT_MASTER_LOCK.md Section 5 (Database Rules)

-- Tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    ticket_number INTEGER NOT NULL,
    
    -- Ticket details
    user_id VARCHAR(20) NOT NULL,
    category VARCHAR(100),
    subject TEXT,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    
    -- Channel
    channel_id VARCHAR(20),
    thread_id VARCHAR(20),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(guild_id, ticket_number)
);

-- Ticket transcripts table
CREATE TABLE ticket_transcripts (
    id SERIAL PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    
    -- Message details
    user_id VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    attachments JSONB,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled messages table
CREATE TABLE scheduled_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    
    -- Message details
    channel_id VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    embed JSONB,
    
    -- Schedule (cron expression)
    cron_schedule VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    next_execution_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reminders table
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    
    -- Reminder details
    user_id VARCHAR(20) NOT NULL,
    channel_id VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    
    -- Timing
    remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Triggers table (automation)
CREATE TABLE triggers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    
    -- Trigger configuration
    trigger_type VARCHAR(20) NOT NULL CHECK (trigger_type IN ('keyword', 'regex')),
    pattern TEXT NOT NULL,
    response TEXT NOT NULL,
    
    -- Settings
    is_active BOOLEAN DEFAULT true,
    case_sensitive BOOLEAN DEFAULT false,
    cooldown_seconds INTEGER DEFAULT 0,
    
    -- Metadata
    created_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Streamers table
CREATE TABLE streamers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    
    -- Streamer details
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('twitch', 'youtube', 'kick')),
    streamer_id VARCHAR(100) NOT NULL,
    streamer_name VARCHAR(100) NOT NULL,
    
    -- Notification settings
    notification_channel_id VARCHAR(20) NOT NULL,
    mention_role_id VARCHAR(20),
    custom_message TEXT,
    
    -- Tracking
    is_live BOOLEAN DEFAULT false,
    last_stream_id VARCHAR(100),
    last_notified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(guild_id, platform, streamer_id)
);

-- AI knowledge base table (with pgvector for embeddings)
CREATE TABLE ai_knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    
    -- Document details
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI embedding dimension
    
    -- Metadata
    uploaded_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event logs table (comprehensive logging)
CREATE TABLE event_logs (
    id BIGSERIAL PRIMARY KEY,
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    
    -- Event details
    event_type VARCHAR(50) NOT NULL,
    user_id VARCHAR(20),
    channel_id VARCHAR(20),
    
    -- Event data (flexible JSON storage)
    data JSONB NOT NULL,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Suggestions table
CREATE TABLE suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    
    -- Suggestion details
    user_id VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    message_id VARCHAR(20),
    channel_id VARCHAR(20),
    
    -- Voting
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    reviewed_by VARCHAR(20),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Starboard entries table
CREATE TABLE starboard_entries (
    id SERIAL PRIMARY KEY,
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    
    -- Original message
    message_id VARCHAR(20) NOT NULL,
    channel_id VARCHAR(20) NOT NULL,
    author_id VARCHAR(20) NOT NULL,
    
    -- Starboard message
    starboard_message_id VARCHAR(20),
    star_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(guild_id, message_id)
);

-- Indexes for performance
CREATE INDEX idx_tickets_guild_id ON tickets(guild_id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_ticket_transcripts_ticket_id ON ticket_transcripts(ticket_id);

CREATE INDEX idx_scheduled_messages_guild_id ON scheduled_messages(guild_id);
CREATE INDEX idx_scheduled_messages_next_execution ON scheduled_messages(next_execution_at) WHERE is_active = true;

CREATE INDEX idx_reminders_guild_id ON reminders(guild_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_remind_at ON reminders(remind_at) WHERE is_completed = false;

CREATE INDEX idx_triggers_guild_id ON triggers(guild_id);
CREATE INDEX idx_triggers_is_active ON triggers(is_active) WHERE is_active = true;

CREATE INDEX idx_streamers_guild_id ON streamers(guild_id);
CREATE INDEX idx_streamers_platform ON streamers(platform);
CREATE INDEX idx_streamers_is_live ON streamers(is_live) WHERE is_live = true;

CREATE INDEX idx_ai_knowledge_base_guild_id ON ai_knowledge_base(guild_id);

CREATE INDEX idx_event_logs_guild_id ON event_logs(guild_id);
CREATE INDEX idx_event_logs_event_type ON event_logs(event_type);
CREATE INDEX idx_event_logs_created_at ON event_logs(created_at);
CREATE INDEX idx_event_logs_user_id ON event_logs(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX idx_suggestions_guild_id ON suggestions(guild_id);
CREATE INDEX idx_suggestions_status ON suggestions(status);

CREATE INDEX idx_starboard_entries_guild_id ON starboard_entries(guild_id);
CREATE INDEX idx_starboard_entries_message_id ON starboard_entries(message_id);

-- Triggers for updated_at
CREATE TRIGGER update_scheduled_messages_updated_at BEFORE UPDATE ON scheduled_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_triggers_updated_at BEFORE UPDATE ON triggers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streamers_updated_at BEFORE UPDATE ON streamers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_knowledge_base_updated_at BEFORE UPDATE ON ai_knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_starboard_entries_updated_at BEFORE UPDATE ON starboard_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert migration record
INSERT INTO schema_migrations (version, description) 
VALUES ('005', 'Feature tables - tickets, automation, streaming, AI, logging, community');
