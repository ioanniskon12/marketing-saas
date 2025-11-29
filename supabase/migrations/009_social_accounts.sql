/**
 * Social Accounts Table
 *
 * Stores connected social media accounts (Facebook, Instagram, LinkedIn, Twitter)
 * with OAuth tokens and account metadata.
 */

-- Create social_accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Platform information
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'twitter')),
  platform_account_id TEXT NOT NULL, -- The account ID from the platform
  platform_username TEXT,
  platform_display_name TEXT,
  platform_profile_picture TEXT,

  -- OAuth tokens (encrypted in production)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Account metadata
  scopes TEXT[], -- OAuth scopes granted
  account_type TEXT, -- e.g., 'personal', 'business', 'page'
  is_active BOOLEAN DEFAULT true,

  -- Permissions and limits
  can_post BOOLEAN DEFAULT true,
  can_schedule BOOLEAN DEFAULT true,
  daily_post_limit INTEGER,

  -- Timestamps
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate accounts
  UNIQUE(workspace_id, platform, platform_account_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_social_accounts_workspace ON social_accounts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_active ON social_accounts(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view social accounts in their workspaces"
  ON social_accounts
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id
      FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert social accounts in their workspaces"
  ON social_accounts
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id
      FROM workspace_members
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update social accounts in their workspaces"
  ON social_accounts
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id
      FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete social accounts in their workspaces"
  ON social_accounts
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id
      FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_social_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER social_accounts_updated_at
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_social_accounts_updated_at();

-- Comments
COMMENT ON TABLE social_accounts IS 'Stores connected social media accounts with OAuth tokens';
COMMENT ON COLUMN social_accounts.platform IS 'Social media platform: facebook, instagram, linkedin, twitter';
COMMENT ON COLUMN social_accounts.access_token IS 'OAuth access token (should be encrypted in production)';
COMMENT ON COLUMN social_accounts.token_expires_at IS 'When the access token expires';
COMMENT ON COLUMN social_accounts.is_active IS 'Whether this account is currently active and usable';
