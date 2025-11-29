-- =====================================================
-- Content Plans Feature
-- Allows creating content plans with multiple posts
-- and sharing them with clients for approval
-- =====================================================

-- Add plan status enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE plan_status AS ENUM (
    'draft',
    'pending_review',
    'approved',
    'partially_approved',
    'rejected',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add share access type enum
DO $$ BEGIN
  CREATE TYPE share_access_type AS ENUM (
    'view_only',
    'can_comment',
    'can_approve'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- CONTENT PLANS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS content_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Plan details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status plan_status NOT NULL DEFAULT 'draft',

  -- Scheduling
  target_date DATE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_plans_workspace ON content_plans(workspace_id);
CREATE INDEX IF NOT EXISTS idx_content_plans_status ON content_plans(status);
CREATE INDEX IF NOT EXISTS idx_content_plans_created_by ON content_plans(created_by);
CREATE INDEX IF NOT EXISTS idx_content_plans_created_at ON content_plans(created_at DESC);

-- =====================================================
-- PLAN POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS plan_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES content_plans(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Post content
  caption TEXT NOT NULL,
  platforms TEXT[] NOT NULL,

  -- Platform-specific data
  platform_data JSONB DEFAULT '{}'::jsonb,

  -- Media
  media_urls TEXT[],
  video_thumbnail_url TEXT,

  -- Scheduling
  scheduled_date TIMESTAMP WITH TIME ZONE,
  scheduled_time TIME,

  -- Approval
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,

  -- Order in plan
  position INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plan_posts_plan_id ON plan_posts(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_posts_workspace_id ON plan_posts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_plan_posts_approval_status ON plan_posts(approval_status);
CREATE INDEX IF NOT EXISTS idx_plan_posts_position ON plan_posts(plan_id, position);

-- =====================================================
-- PLAN SHARES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS plan_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES content_plans(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Share details
  share_token VARCHAR(64) UNIQUE NOT NULL,
  access_type share_access_type NOT NULL DEFAULT 'can_approve',

  -- Client info
  client_name VARCHAR(255),
  client_email VARCHAR(255),

  -- Access control
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,

  -- Email tracking
  email_sent_at TIMESTAMP WITH TIME ZONE,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_plan_shares_plan_id ON plan_shares(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_shares_share_token ON plan_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_plan_shares_workspace_id ON plan_shares(workspace_id);
CREATE INDEX IF NOT EXISTS idx_plan_shares_is_active ON plan_shares(is_active);

-- =====================================================
-- PLAN COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS plan_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_post_id UUID NOT NULL REFERENCES plan_posts(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES content_plans(id) ON DELETE CASCADE,

  -- Comment details
  comment TEXT NOT NULL,

  -- Author
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  author_user_id UUID REFERENCES auth.users(id),

  -- Reply threading
  parent_comment_id UUID REFERENCES plan_comments(id) ON DELETE CASCADE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_plan_comments_plan_post_id ON plan_comments(plan_post_id);
CREATE INDEX IF NOT EXISTS idx_plan_comments_plan_id ON plan_comments(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_comments_parent_comment_id ON plan_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_plan_comments_created_at ON plan_comments(created_at DESC);

-- =====================================================
-- PLAN ACTIVITY LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS plan_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES content_plans(id) ON DELETE CASCADE,
  plan_post_id UUID REFERENCES plan_posts(id) ON DELETE CASCADE,

  -- Activity details
  action VARCHAR(50) NOT NULL,
  actor_name VARCHAR(255) NOT NULL,
  actor_email VARCHAR(255),
  actor_user_id UUID REFERENCES auth.users(id),

  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plan_activity_log_plan_id ON plan_activity_log(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_activity_log_created_at ON plan_activity_log(created_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
DROP FUNCTION IF EXISTS update_plan_updated_at() CASCADE;
CREATE FUNCTION update_plan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_content_plans_updated_at ON content_plans;
CREATE TRIGGER update_content_plans_updated_at
  BEFORE UPDATE ON content_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_updated_at();

DROP TRIGGER IF EXISTS update_plan_posts_updated_at ON plan_posts;
CREATE TRIGGER update_plan_posts_updated_at
  BEFORE UPDATE ON plan_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_updated_at();

DROP TRIGGER IF EXISTS update_plan_comments_updated_at ON plan_comments;
CREATE TRIGGER update_plan_comments_updated_at
  BEFORE UPDATE ON plan_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_updated_at();

-- Function to update plan status based on post approvals
DROP FUNCTION IF EXISTS update_plan_status_on_post_approval() CASCADE;
CREATE FUNCTION update_plan_status_on_post_approval()
RETURNS TRIGGER AS $$
DECLARE
  total_posts INTEGER;
  approved_posts INTEGER;
  rejected_posts INTEGER;
BEGIN
  -- Count posts in the plan
  SELECT COUNT(*) INTO total_posts
  FROM plan_posts
  WHERE plan_id = NEW.plan_id;

  -- Count approved posts
  SELECT COUNT(*) INTO approved_posts
  FROM plan_posts
  WHERE plan_id = NEW.plan_id
  AND approval_status = 'approved';

  -- Count rejected posts
  SELECT COUNT(*) INTO rejected_posts
  FROM plan_posts
  WHERE plan_id = NEW.plan_id
  AND approval_status = 'rejected';

  -- Update plan status
  IF approved_posts = total_posts THEN
    UPDATE content_plans
    SET status = 'approved'
    WHERE id = NEW.plan_id;
  ELSIF rejected_posts = total_posts THEN
    UPDATE content_plans
    SET status = 'rejected'
    WHERE id = NEW.plan_id;
  ELSIF approved_posts > 0 OR rejected_posts > 0 THEN
    UPDATE content_plans
    SET status = 'partially_approved'
    WHERE id = NEW.plan_id;
  ELSE
    UPDATE content_plans
    SET status = 'pending_review'
    WHERE id = NEW.plan_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update plan status
DROP TRIGGER IF EXISTS update_plan_status_trigger ON plan_posts;
CREATE TRIGGER update_plan_status_trigger
  AFTER UPDATE OF approval_status ON plan_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_status_on_post_approval();

-- Function to generate unique share token
DROP FUNCTION IF EXISTS generate_share_token() CASCADE;
CREATE FUNCTION generate_share_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_token IS NULL OR NEW.share_token = '' THEN
    NEW.share_token = encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate share token
DROP TRIGGER IF EXISTS generate_share_token_trigger ON plan_shares;
CREATE TRIGGER generate_share_token_trigger
  BEFORE INSERT ON plan_shares
  FOR EACH ROW
  EXECUTE FUNCTION generate_share_token();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE content_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view plans in their workspace" ON content_plans;
DROP POLICY IF EXISTS "Users can create plans in their workspace" ON content_plans;
DROP POLICY IF EXISTS "Users can update plans in their workspace" ON content_plans;
DROP POLICY IF EXISTS "Users can delete plans in their workspace" ON content_plans;

DROP POLICY IF EXISTS "Users can view plan posts in their workspace" ON plan_posts;
DROP POLICY IF EXISTS "Users can create plan posts in their workspace" ON plan_posts;
DROP POLICY IF EXISTS "Users can update plan posts in their workspace" ON plan_posts;
DROP POLICY IF EXISTS "Users can delete plan posts in their workspace" ON plan_posts;

DROP POLICY IF EXISTS "Users can view shares in their workspace" ON plan_shares;
DROP POLICY IF EXISTS "Users can create shares in their workspace" ON plan_shares;
DROP POLICY IF EXISTS "Users can update shares in their workspace" ON plan_shares;
DROP POLICY IF EXISTS "Users can delete shares in their workspace" ON plan_shares;

DROP POLICY IF EXISTS "Users can view comments in their workspace" ON plan_comments;
DROP POLICY IF EXISTS "Anyone can view comments on shared plans" ON plan_comments;
DROP POLICY IF EXISTS "Users and clients can create comments" ON plan_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON plan_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON plan_comments;

DROP POLICY IF EXISTS "Users can view activity in their workspace" ON plan_activity_log;
DROP POLICY IF EXISTS "System can insert activity logs" ON plan_activity_log;

-- Content Plans Policies
CREATE POLICY "Users can view plans in their workspace"
  ON content_plans FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create plans in their workspace"
  ON content_plans FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Users can update plans in their workspace"
  ON content_plans FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Users can delete plans in their workspace"
  ON content_plans FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Plan Posts Policies
CREATE POLICY "Users can view plan posts in their workspace"
  ON plan_posts FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create plan posts in their workspace"
  ON plan_posts FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Users can update plan posts in their workspace"
  ON plan_posts FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Users can delete plan posts in their workspace"
  ON plan_posts FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Plan Shares Policies
CREATE POLICY "Users can view shares in their workspace"
  ON plan_shares FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create shares in their workspace"
  ON plan_shares FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Users can update shares in their workspace"
  ON plan_shares FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Users can delete shares in their workspace"
  ON plan_shares FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Plan Comments Policies
CREATE POLICY "Users can view comments in their workspace"
  ON plan_comments FOR SELECT
  USING (
    plan_id IN (
      SELECT id FROM content_plans
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Anyone can view comments on shared plans"
  ON plan_comments FOR SELECT
  USING (
    plan_id IN (
      SELECT plan_id FROM plan_shares
      WHERE is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

CREATE POLICY "Users and clients can create comments"
  ON plan_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
  ON plan_comments FOR UPDATE
  USING (author_user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON plan_comments FOR DELETE
  USING (author_user_id = auth.uid());

-- Plan Activity Log Policies
CREATE POLICY "Users can view activity in their workspace"
  ON plan_activity_log FOR SELECT
  USING (
    plan_id IN (
      SELECT id FROM content_plans
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert activity logs"
  ON plan_activity_log FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- GRANTS
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON content_plans TO authenticated;
GRANT ALL ON plan_posts TO authenticated;
GRANT ALL ON plan_shares TO authenticated;
GRANT ALL ON plan_comments TO authenticated, anon;
GRANT ALL ON plan_activity_log TO authenticated;
