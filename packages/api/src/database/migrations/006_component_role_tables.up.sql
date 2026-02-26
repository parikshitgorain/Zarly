-- Component Role and Premium Feature Tables Migration
-- Creates tables for interactive role panels, timed roles, and premium features
-- Compliance: PROJECT_MASTER_LOCK.md Section 5 (Database Rules)

-- Component role panels table
CREATE TABLE component_role_panels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    
    -- Panel details
    panel_type VARCHAR(20) NOT NULL CHECK (panel_type IN ('button', 'select_menu')),
    title VARCHAR(255),
    description TEXT,
    
    -- Channel and message
    channel_id VARCHAR(20) NOT NULL,
    message_id VARCHAR(20),
    
    -- Select menu settings
    min_values INTEGER DEFAULT 1,
    max_values INTEGER DEFAULT 1,
    placeholder VARCHAR(150),
    
    -- Metadata
    created_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Component roles table (individual roles in panels)
CREATE TABLE component_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    panel_id UUID NOT NULL REFERENCES component_role_panels(id) ON DELETE CASCADE,
    
    -- Role details
    role_id VARCHAR(20) NOT NULL,
    label VARCHAR(80) NOT NULL,
    description VARCHAR(100),
    emoji VARCHAR(50),
    
    -- Display order
    position INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Timed roles table (Premium feature)
CREATE TABLE timed_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    
    -- Role assignment
    user_id VARCHAR(20) NOT NULL,
    role_id VARCHAR(20) NOT NULL,
    
    -- Timing
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    assigned_by VARCHAR(20) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    removed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(guild_id, user_id, role_id)
);

-- Embed themes table (Premium feature)
CREATE TABLE embed_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    
    -- Theme details
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7), -- Hex color code
    thumbnail_url TEXT,
    footer_text VARCHAR(2048),
    footer_icon_url TEXT,
    
    -- Usage
    is_default BOOLEAN DEFAULT false,
    
    -- Metadata
    created_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Automation workflows table (Premium feature)
CREATE TABLE automation_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id VARCHAR(20) NOT NULL REFERENCES guilds(guild_id) ON DELETE CASCADE,
    
    -- Workflow details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL,
    trigger_config JSONB NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Automation stages table (stages within workflows)
CREATE TABLE automation_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES automation_workflows(id) ON DELETE CASCADE,
    
    -- Stage details
    stage_number INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_config JSONB NOT NULL,
    
    -- Conditions
    conditions JSONB,
    delay_seconds INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(workflow_id, stage_number)
);

-- Indexes for performance
CREATE INDEX idx_component_role_panels_guild_id ON component_role_panels(guild_id);
CREATE INDEX idx_component_role_panels_channel_id ON component_role_panels(channel_id);

CREATE INDEX idx_component_roles_panel_id ON component_roles(panel_id);
CREATE INDEX idx_component_roles_role_id ON component_roles(role_id);
CREATE INDEX idx_component_roles_position ON component_roles(panel_id, position);

CREATE INDEX idx_timed_roles_guild_id ON timed_roles(guild_id);
CREATE INDEX idx_timed_roles_user_id ON timed_roles(user_id);
CREATE INDEX idx_timed_roles_expires_at ON timed_roles(expires_at) WHERE is_active = true;
CREATE INDEX idx_timed_roles_guild_user ON timed_roles(guild_id, user_id);

CREATE INDEX idx_embed_themes_guild_id ON embed_themes(guild_id);
CREATE INDEX idx_embed_themes_is_default ON embed_themes(guild_id, is_default) WHERE is_default = true;

CREATE INDEX idx_automation_workflows_guild_id ON automation_workflows(guild_id);
CREATE INDEX idx_automation_workflows_is_active ON automation_workflows(is_active) WHERE is_active = true;

CREATE INDEX idx_automation_stages_workflow_id ON automation_stages(workflow_id);
CREATE INDEX idx_automation_stages_stage_number ON automation_stages(workflow_id, stage_number);

-- Triggers for updated_at
CREATE TRIGGER update_component_role_panels_updated_at BEFORE UPDATE ON component_role_panels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_embed_themes_updated_at BEFORE UPDATE ON embed_themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_workflows_updated_at BEFORE UPDATE ON automation_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert migration record
INSERT INTO schema_migrations (version, description) 
VALUES ('006', 'Component role and premium feature tables');
