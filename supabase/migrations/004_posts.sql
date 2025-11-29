/**
 * Posts Migration
 *
 * Creates tables for storing scheduled posts and their media.
 * Run this in Supabase SQL Editor.
 */

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL,

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed')),

  -- Platforms
  platforms JSONB NOT NULL DEFAULT '[]', -- Array of platform IDs to publish to

  -- Platform-specific data (URLs, IDs after publishing)
  platform_posts JSONB DEFAULT '{}',

  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Post Media Table
CREATE TABLE IF NOT EXISTS post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Media details
  media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('image', 'video')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- For videos (in seconds)

  -- Order in post
  display_order INTEGER DEFAULT 0,

  -- Alt text for accessibility
  alt_text TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_posts_workspace ON posts(workspace_id);
CREATE INDEX idx_posts_created_by ON posts(created_by);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_for ON posts(scheduled_for);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_post_media_post ON post_media(post_id);
CREATE INDEX idx_post_media_workspace ON post_media(workspace_id);

-- Updated at trigger for posts
CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_posts_updated_at();

-- Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;

-- Users can view posts in their workspaces
CREATE POLICY "Users can view posts in their workspaces"
  ON posts
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id
      FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can create posts in their workspaces (contributor+)
CREATE POLICY "Users can create posts in their workspaces"
  ON posts
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT wm.workspace_id
      FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
      AND wm.role IN ('contributor', 'editor', 'admin', 'owner')
    )
  );

-- Users can update own posts OR have editor+ role
CREATE POLICY "Users can update posts in their workspaces"
  ON posts
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id
      FROM workspace_members
      WHERE user_id = auth.uid()
    )
    AND (
      created_by = auth.uid()
      OR workspace_id IN (
        SELECT wm.workspace_id
        FROM workspace_members wm
        WHERE wm.user_id = auth.uid()
        AND wm.role IN ('editor', 'admin', 'owner')
      )
    )
  );

-- Users can delete own posts OR have editor+ role
CREATE POLICY "Users can delete posts in their workspaces"
  ON posts
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id
      FROM workspace_members
      WHERE user_id = auth.uid()
    )
    AND (
      created_by = auth.uid()
      OR workspace_id IN (
        SELECT wm.workspace_id
        FROM workspace_members wm
        WHERE wm.user_id = auth.uid()
        AND wm.role IN ('editor', 'admin', 'owner')
      )
    )
  );

-- Post Media RLS Policies
CREATE POLICY "Users can view media in their workspaces"
  ON post_media
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id
      FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert media in their workspaces"
  ON post_media
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT wm.workspace_id
      FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
      AND wm.role IN ('contributor', 'editor', 'admin', 'owner')
    )
  );

CREATE POLICY "Users can delete media in their workspaces"
  ON post_media
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id
      FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );
