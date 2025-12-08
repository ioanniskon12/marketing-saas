-- =====================================================
-- Post Plan Shares Feature
-- Allows sharing collections of posts with clients
-- =====================================================

-- Post Plan Shares Table
CREATE TABLE IF NOT EXISTS post_plan_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Share token for URL
  share_token VARCHAR(64) UNIQUE NOT NULL,

  -- Plan details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  client_name VARCHAR(255),

  -- Settings
  permission VARCHAR(20) NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'comment', 'approve')),
  show_analytics BOOLEAN DEFAULT false,
  password_hash TEXT,

  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Tracking
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for share -> posts relationship
CREATE TABLE IF NOT EXISTS post_plan_share_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_id UUID NOT NULL REFERENCES post_plan_shares(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,

  -- Post snapshot (in case post is edited after sharing)
  content_snapshot TEXT,
  media_snapshot JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(share_id, post_id)
);

-- Feedback/reactions on shared plans
CREATE TABLE IF NOT EXISTS post_plan_share_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_id UUID NOT NULL REFERENCES post_plan_shares(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,

  -- Feedback details
  feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('reaction', 'comment', 'approval')),
  reaction VARCHAR(20), -- emoji reaction like 'thumbs_up', 'heart', etc.
  comment TEXT,
  approved BOOLEAN,

  -- Author info (for external clients)
  author_name VARCHAR(255),
  author_email VARCHAR(255),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_plan_shares_workspace ON post_plan_shares(workspace_id);
CREATE INDEX IF NOT EXISTS idx_post_plan_shares_token ON post_plan_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_post_plan_shares_active ON post_plan_shares(is_active);
CREATE INDEX IF NOT EXISTS idx_post_plan_share_items_share ON post_plan_share_items(share_id);
CREATE INDEX IF NOT EXISTS idx_post_plan_share_items_post ON post_plan_share_items(post_id);
CREATE INDEX IF NOT EXISTS idx_post_plan_share_feedback_share ON post_plan_share_feedback(share_id);

-- RLS
ALTER TABLE post_plan_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_plan_share_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_plan_share_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for post_plan_shares
DROP POLICY IF EXISTS "Users can view their workspace shares" ON post_plan_shares;
CREATE POLICY "Users can view their workspace shares"
  ON post_plan_shares FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Public can view active shares by token" ON post_plan_shares;
CREATE POLICY "Public can view active shares by token"
  ON post_plan_shares FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Users can create shares in their workspace" ON post_plan_shares;
CREATE POLICY "Users can create shares in their workspace"
  ON post_plan_shares FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update shares in their workspace" ON post_plan_shares;
CREATE POLICY "Users can update shares in their workspace"
  ON post_plan_shares FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete shares in their workspace" ON post_plan_shares;
CREATE POLICY "Users can delete shares in their workspace"
  ON post_plan_shares FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Policies for post_plan_share_items
DROP POLICY IF EXISTS "Users can view share items" ON post_plan_share_items;
CREATE POLICY "Users can view share items"
  ON post_plan_share_items FOR SELECT
  USING (
    share_id IN (
      SELECT id FROM post_plan_shares
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
    OR
    share_id IN (
      SELECT id FROM post_plan_shares
      WHERE is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can create share items" ON post_plan_share_items;
CREATE POLICY "Users can create share items"
  ON post_plan_share_items FOR INSERT
  WITH CHECK (
    share_id IN (
      SELECT id FROM post_plan_shares
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete share items" ON post_plan_share_items;
CREATE POLICY "Users can delete share items"
  ON post_plan_share_items FOR DELETE
  USING (
    share_id IN (
      SELECT id FROM post_plan_shares
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policies for post_plan_share_feedback (public can insert feedback)
DROP POLICY IF EXISTS "Anyone can view feedback" ON post_plan_share_feedback;
CREATE POLICY "Anyone can view feedback"
  ON post_plan_share_feedback FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can add feedback" ON post_plan_share_feedback;
CREATE POLICY "Anyone can add feedback"
  ON post_plan_share_feedback FOR INSERT
  WITH CHECK (true);

-- Grants
GRANT ALL ON post_plan_shares TO authenticated;
GRANT SELECT ON post_plan_shares TO anon;
GRANT ALL ON post_plan_share_items TO authenticated;
GRANT SELECT ON post_plan_share_items TO anon;
GRANT ALL ON post_plan_share_feedback TO authenticated, anon;
