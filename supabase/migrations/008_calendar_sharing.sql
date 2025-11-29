/**
 * Calendar Sharing Feature Migration
 *
 * Enables sharing calendars with external stakeholders, clients, and team members
 * with granular permissions, branding, and activity tracking.
 */

-- ====================
-- CALENDAR SHARES TABLE
-- ====================

CREATE TABLE IF NOT EXISTS calendar_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Share details
  title TEXT NOT NULL,
  description TEXT,

  -- Access control
  share_token TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- Optional bcrypt hash for password protection
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiry date
  is_active BOOLEAN DEFAULT true,
  max_views INTEGER, -- Optional view limit

  -- Filtering options
  start_date DATE, -- Filter posts from this date
  end_date DATE, -- Filter posts until this date
  social_account_ids UUID[], -- Filter specific social accounts
  platforms TEXT[], -- Filter by platform (instagram, facebook, etc.)
  content_types TEXT[], -- Filter by content type (image, video, text, etc.)

  -- Permission settings
  permission_level TEXT NOT NULL DEFAULT 'view', -- view, comment, approve
  allow_download BOOLEAN DEFAULT true, -- Allow downloading content
  show_analytics BOOLEAN DEFAULT false, -- Show post analytics

  -- Branding
  brand_color TEXT DEFAULT '#8B5CF6', -- Primary brand color
  logo_url TEXT, -- Company logo URL
  company_name TEXT, -- Company name to display

  -- Analytics
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_permission_level CHECK (permission_level IN ('view', 'comment', 'approve')),
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  CONSTRAINT positive_max_views CHECK (max_views IS NULL OR max_views > 0)
);

-- ====================
-- CALENDAR SHARE ACTIVITY TABLE
-- ====================

CREATE TABLE IF NOT EXISTS calendar_share_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_share_id UUID NOT NULL REFERENCES calendar_shares(id) ON DELETE CASCADE,

  -- Activity details
  activity_type TEXT NOT NULL, -- view, download, comment, approve, login_attempt
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL, -- Optional post reference

  -- Visitor information
  visitor_ip TEXT,
  visitor_country TEXT,
  visitor_device TEXT, -- User agent or device type
  visitor_email TEXT, -- If user provides email (for comments/approvals)

  -- Additional data
  metadata JSONB DEFAULT '{}', -- Flexible storage for additional info

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_activity_type CHECK (
    activity_type IN ('view', 'download', 'comment', 'approve', 'login_attempt', 'export')
  )
);

-- ====================
-- CALENDAR SHARE COMMENTS TABLE
-- ====================

CREATE TABLE IF NOT EXISTS calendar_share_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_share_id UUID NOT NULL REFERENCES calendar_shares(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

  -- Comment details
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  comment TEXT NOT NULL,

  -- Resolution tracking
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_email CHECK (author_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT comment_not_empty CHECK (length(trim(comment)) > 0)
);

-- ====================
-- CALENDAR SHARE APPROVALS TABLE
-- ====================

CREATE TABLE IF NOT EXISTS calendar_share_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_share_id UUID NOT NULL REFERENCES calendar_shares(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

  -- Approval details
  approved BOOLEAN NOT NULL,
  approver_name TEXT NOT NULL,
  approver_email TEXT NOT NULL,
  feedback TEXT, -- Optional feedback/notes

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_email CHECK (approver_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT unique_approval_per_post UNIQUE (calendar_share_id, post_id, approver_email)
);

-- ====================
-- INDEXES
-- ====================

-- Calendar shares indexes
CREATE INDEX IF NOT EXISTS idx_calendar_shares_share_token
  ON calendar_shares(share_token);

CREATE INDEX IF NOT EXISTS idx_calendar_shares_workspace_id
  ON calendar_shares(workspace_id);

CREATE INDEX IF NOT EXISTS idx_calendar_shares_created_by
  ON calendar_shares(created_by);

CREATE INDEX IF NOT EXISTS idx_calendar_shares_is_active
  ON calendar_shares(is_active);

CREATE INDEX IF NOT EXISTS idx_calendar_shares_expires_at
  ON calendar_shares(expires_at)
  WHERE expires_at IS NOT NULL;

-- Calendar share activity indexes
CREATE INDEX IF NOT EXISTS idx_calendar_share_activity_calendar_share_id
  ON calendar_share_activity(calendar_share_id);

CREATE INDEX IF NOT EXISTS idx_calendar_share_activity_created_at
  ON calendar_share_activity(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_calendar_share_activity_type
  ON calendar_share_activity(activity_type);

CREATE INDEX IF NOT EXISTS idx_calendar_share_activity_post_id
  ON calendar_share_activity(post_id)
  WHERE post_id IS NOT NULL;

-- Calendar share comments indexes
CREATE INDEX IF NOT EXISTS idx_calendar_share_comments_calendar_share_id
  ON calendar_share_comments(calendar_share_id);

CREATE INDEX IF NOT EXISTS idx_calendar_share_comments_post_id
  ON calendar_share_comments(post_id);

CREATE INDEX IF NOT EXISTS idx_calendar_share_comments_is_resolved
  ON calendar_share_comments(is_resolved);

CREATE INDEX IF NOT EXISTS idx_calendar_share_comments_created_at
  ON calendar_share_comments(created_at DESC);

-- Calendar share approvals indexes
CREATE INDEX IF NOT EXISTS idx_calendar_share_approvals_calendar_share_id
  ON calendar_share_approvals(calendar_share_id);

CREATE INDEX IF NOT EXISTS idx_calendar_share_approvals_post_id
  ON calendar_share_approvals(post_id);

CREATE INDEX IF NOT EXISTS idx_calendar_share_approvals_created_at
  ON calendar_share_approvals(created_at DESC);

-- ====================
-- ROW LEVEL SECURITY
-- ====================

-- Enable RLS
ALTER TABLE calendar_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_share_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_share_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_share_approvals ENABLE ROW LEVEL SECURITY;

-- ===== Calendar Shares Policies =====

-- Public: View active, non-expired shares by token
CREATE POLICY "Public can view active calendar shares by token"
  ON calendar_shares FOR SELECT
  USING (
    is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_views IS NULL OR view_count < max_views)
  );

-- Workspace members: View all shares in their workspace
CREATE POLICY "Workspace members can view their calendar shares"
  ON calendar_shares FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_users
      WHERE user_id = auth.uid()
    )
  );

-- Workspace admins/owners: Create shares
CREATE POLICY "Workspace admins can create calendar shares"
  ON calendar_shares FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_users
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Workspace admins/owners: Update their shares
CREATE POLICY "Workspace admins can update their calendar shares"
  ON calendar_shares FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_users
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Workspace admins/owners: Delete their shares
CREATE POLICY "Workspace admins can delete their calendar shares"
  ON calendar_shares FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_users
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- ===== Calendar Share Activity Policies =====

-- Public: Insert activity (for tracking views, downloads, etc.)
CREATE POLICY "Public can log calendar share activity"
  ON calendar_share_activity FOR INSERT
  WITH CHECK (
    calendar_share_id IN (
      SELECT id FROM calendar_shares
      WHERE is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- Workspace members: View activity for their shares
CREATE POLICY "Workspace members can view calendar share activity"
  ON calendar_share_activity FOR SELECT
  USING (
    calendar_share_id IN (
      SELECT id FROM calendar_shares
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- ===== Calendar Share Comments Policies =====

-- Public: View comments for active shares
CREATE POLICY "Public can view comments on calendar shares"
  ON calendar_share_comments FOR SELECT
  USING (
    calendar_share_id IN (
      SELECT id FROM calendar_shares
      WHERE is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- Public: Create comments if permission level allows
CREATE POLICY "Public can create comments if allowed"
  ON calendar_share_comments FOR INSERT
  WITH CHECK (
    calendar_share_id IN (
      SELECT id FROM calendar_shares
      WHERE is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
      AND permission_level IN ('comment', 'approve')
    )
  );

-- Workspace members: Update comments (for resolution)
CREATE POLICY "Workspace members can update comments"
  ON calendar_share_comments FOR UPDATE
  USING (
    calendar_share_id IN (
      SELECT id FROM calendar_shares
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- Workspace members: Delete comments
CREATE POLICY "Workspace members can delete comments"
  ON calendar_share_comments FOR DELETE
  USING (
    calendar_share_id IN (
      SELECT id FROM calendar_shares
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- ===== Calendar Share Approvals Policies =====

-- Public: View approvals for active shares
CREATE POLICY "Public can view approvals on calendar shares"
  ON calendar_share_approvals FOR SELECT
  USING (
    calendar_share_id IN (
      SELECT id FROM calendar_shares
      WHERE is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- Public: Create approvals if permission level allows
CREATE POLICY "Public can create approvals if allowed"
  ON calendar_share_approvals FOR INSERT
  WITH CHECK (
    calendar_share_id IN (
      SELECT id FROM calendar_shares
      WHERE is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
      AND permission_level = 'approve'
    )
  );

-- Workspace members: View all approvals
CREATE POLICY "Workspace members can view approvals"
  ON calendar_share_approvals FOR SELECT
  USING (
    calendar_share_id IN (
      SELECT id FROM calendar_shares
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- ====================
-- FUNCTIONS
-- ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_calendar_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_calendar_shares_updated_at_trigger
  BEFORE UPDATE ON calendar_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_shares_updated_at();

-- Function to generate unique share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  token_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 32-character token
    token := encode(gen_random_bytes(24), 'base64');
    token := replace(token, '/', '_');
    token := replace(token, '+', '-');
    token := substring(token, 1, 32);

    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM calendar_shares WHERE share_token = token) INTO token_exists;

    -- Exit loop if token is unique
    EXIT WHEN NOT token_exists;
  END LOOP;

  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_calendar_share_view()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment for 'view' activity type
  IF NEW.activity_type = 'view' THEN
    UPDATE calendar_shares
    SET
      view_count = view_count + 1,
      last_viewed_at = NOW()
    WHERE id = NEW.calendar_share_id;
  END IF;

  -- Increment download count
  IF NEW.activity_type = 'download' THEN
    UPDATE calendar_shares
    SET download_count = download_count + 1
    WHERE id = NEW.calendar_share_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment view count
CREATE TRIGGER increment_calendar_share_view_trigger
  AFTER INSERT ON calendar_share_activity
  FOR EACH ROW
  EXECUTE FUNCTION increment_calendar_share_view();

-- Function to auto-resolve comments when post is approved
CREATE OR REPLACE FUNCTION auto_resolve_comments_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- If post is approved, auto-resolve related comments
  IF NEW.approved = true THEN
    UPDATE calendar_share_comments
    SET
      is_resolved = true,
      resolved_at = NOW()
    WHERE
      calendar_share_id = NEW.calendar_share_id
      AND post_id = NEW.post_id
      AND is_resolved = false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-resolve comments
CREATE TRIGGER auto_resolve_comments_on_approval_trigger
  AFTER INSERT ON calendar_share_approvals
  FOR EACH ROW
  EXECUTE FUNCTION auto_resolve_comments_on_approval();

-- ====================
-- HELPER VIEWS
-- ====================

-- View for calendar share statistics
CREATE OR REPLACE VIEW calendar_share_stats AS
SELECT
  cs.id,
  cs.workspace_id,
  cs.title,
  cs.share_token,
  cs.view_count,
  cs.download_count,
  cs.last_viewed_at,
  COUNT(DISTINCT csc.id) AS comment_count,
  COUNT(DISTINCT csa.id) AS approval_count,
  COUNT(DISTINCT CASE WHEN csa.approved = true THEN csa.id END) AS approved_count,
  COUNT(DISTINCT CASE WHEN csa.approved = false THEN csa.id END) AS rejected_count,
  cs.created_at,
  cs.expires_at,
  cs.is_active
FROM calendar_shares cs
LEFT JOIN calendar_share_comments csc ON cs.id = csc.calendar_share_id
LEFT JOIN calendar_share_approvals csa ON cs.id = csa.calendar_share_id
GROUP BY cs.id;

-- ====================
-- COMMENTS
-- ====================

COMMENT ON TABLE calendar_shares IS 'Shareable calendar links with customizable permissions and branding';
COMMENT ON TABLE calendar_share_activity IS 'Activity log for calendar share interactions';
COMMENT ON TABLE calendar_share_comments IS 'Comments left by viewers on shared calendar posts';
COMMENT ON TABLE calendar_share_approvals IS 'Approvals/rejections from external reviewers';

COMMENT ON COLUMN calendar_shares.share_token IS 'Unique token for accessing the shared calendar';
COMMENT ON COLUMN calendar_shares.password_hash IS 'Optional bcrypt hash for password protection';
COMMENT ON COLUMN calendar_shares.permission_level IS 'Access level: view (read-only), comment (can leave feedback), approve (can approve/reject)';
COMMENT ON COLUMN calendar_shares.max_views IS 'Optional maximum number of views before share becomes inactive';
COMMENT ON COLUMN calendar_shares.social_account_ids IS 'Filter to show only posts from specific social accounts';
COMMENT ON COLUMN calendar_shares.platforms IS 'Filter to show only posts for specific platforms';
COMMENT ON COLUMN calendar_shares.content_types IS 'Filter to show only specific content types (image, video, text)';
