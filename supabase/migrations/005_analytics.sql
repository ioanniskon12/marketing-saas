/**
 * Analytics Migration
 *
 * Creates tables for storing social media analytics data.
 * Run this in Supabase SQL Editor.
 */

-- Analytics Snapshots Table
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,

  -- Date of snapshot
  snapshot_date DATE NOT NULL,

  -- Follower metrics
  followers_count INTEGER DEFAULT 0,
  followers_change INTEGER DEFAULT 0,

  -- Engagement metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,

  -- Reach and impressions
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,

  -- Engagement rate (calculated)
  engagement_rate DECIMAL(5,2) DEFAULT 0,

  -- Platform-specific data
  platform_data JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Unique constraint: one snapshot per account per day
  UNIQUE(social_account_id, snapshot_date)
);

-- Post Analytics Table
CREATE TABLE IF NOT EXISTS post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,

  -- Platform post ID
  platform_post_id VARCHAR(255),

  -- Engagement metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,

  -- Reach and impressions
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,

  -- Click metrics
  link_clicks INTEGER DEFAULT 0,
  profile_visits INTEGER DEFAULT 0,

  -- Engagement rate
  engagement_rate DECIMAL(5,2) DEFAULT 0,

  -- Platform-specific metrics
  platform_data JSONB DEFAULT '{}',

  -- Last collected
  collected_at TIMESTAMPTZ DEFAULT now(),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_workspace ON analytics_snapshots(workspace_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_account ON analytics_snapshots(social_account_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_date ON analytics_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_post_analytics_post ON post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_workspace ON post_analytics(workspace_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_account ON post_analytics(social_account_id);

-- Updated at trigger for post_analytics
CREATE OR REPLACE FUNCTION update_post_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_analytics_updated_at ON post_analytics;
CREATE TRIGGER post_analytics_updated_at
  BEFORE UPDATE ON post_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_post_analytics_updated_at();

-- Row Level Security
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- Users can view analytics in their workspaces
CREATE POLICY "Users can view analytics snapshots in their workspaces"
  ON analytics_snapshots
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id
      FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view post analytics in their workspaces"
  ON post_analytics
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id
      FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- System can insert analytics (for cron jobs)
CREATE POLICY "System can insert analytics snapshots"
  ON analytics_snapshots
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update analytics snapshots"
  ON analytics_snapshots
  FOR UPDATE
  USING (true);

CREATE POLICY "System can insert post analytics"
  ON post_analytics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update post analytics"
  ON post_analytics
  FOR UPDATE
  USING (true);
