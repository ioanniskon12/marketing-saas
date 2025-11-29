/**
 * Advanced Features Migration
 *
 * Creates tables for:
 * - Competitor tracking
 * - Content approval workflow
 * - Link in bio builder
 * - Social listening
 */

-- Competitors Table
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Competitor details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'facebook', 'linkedin', 'twitter', 'tiktok')),
  platform_username VARCHAR(255) NOT NULL,
  platform_user_id VARCHAR(255),
  profile_url TEXT,
  avatar_url TEXT,

  -- Tracking status
  is_active BOOLEAN DEFAULT true,
  last_fetched_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(workspace_id, platform, platform_username)
);

-- Competitor Snapshots Table
CREATE TABLE IF NOT EXISTS competitor_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Date of snapshot
  snapshot_date DATE NOT NULL,

  -- Metrics
  followers_count INTEGER DEFAULT 0,
  followers_change INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  posts_change INTEGER DEFAULT 0,
  avg_engagement_rate DECIMAL(5,2) DEFAULT 0,
  avg_likes INTEGER DEFAULT 0,
  avg_comments INTEGER DEFAULT 0,
  avg_shares INTEGER DEFAULT 0,

  -- Platform-specific data
  platform_data JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(competitor_id, snapshot_date)
);

-- Approval Workflows Table
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Workflow details
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Workflow steps (JSON array of step definitions)
  steps JSONB NOT NULL DEFAULT '[]',

  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Post Approvals Table
CREATE TABLE IF NOT EXISTS post_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES approval_workflows(id) ON DELETE SET NULL,

  -- Approval status
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_review')),
  current_step INTEGER DEFAULT 0,

  -- Approvers
  approvers JSONB DEFAULT '[]', -- Array of approval records

  -- Comments
  comments TEXT,

  -- Metadata
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Link in Bio Pages Table
CREATE TABLE IF NOT EXISTS bio_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Page details
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Branding
  avatar_url TEXT,
  background_color VARCHAR(20) DEFAULT '#ffffff',
  text_color VARCHAR(20) DEFAULT '#000000',
  button_color VARCHAR(20) DEFAULT '#000000',
  button_text_color VARCHAR(20) DEFAULT '#ffffff',
  custom_css TEXT,

  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,

  -- Settings
  is_published BOOLEAN DEFAULT false,
  show_branding BOOLEAN DEFAULT true,

  -- Analytics
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bio Links Table
CREATE TABLE IF NOT EXISTS bio_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_page_id UUID NOT NULL REFERENCES bio_pages(id) ON DELETE CASCADE,

  -- Link details
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  icon VARCHAR(50),

  -- Appearance
  thumbnail_url TEXT,

  -- Settings
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,

  -- Analytics
  clicks_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social Listening Keywords Table
CREATE TABLE IF NOT EXISTS listening_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Keyword details
  keyword VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('keyword', 'hashtag', 'mention', 'brand')),

  -- Tracking settings
  platforms JSONB DEFAULT '[]', -- Array of platforms to monitor
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(workspace_id, keyword, type)
);

-- Listening Mentions Table
CREATE TABLE IF NOT EXISTS listening_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES listening_keywords(id) ON DELETE CASCADE,

  -- Source details
  platform VARCHAR(50) NOT NULL,
  platform_post_id VARCHAR(255) NOT NULL,
  post_url TEXT,

  -- Author
  author_username VARCHAR(255),
  author_display_name VARCHAR(255),
  author_avatar_url TEXT,
  author_followers_count INTEGER,

  -- Content
  content TEXT,
  media_urls JSONB DEFAULT '[]',

  -- Metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,

  -- Sentiment (optional)
  sentiment VARCHAR(50) CHECK (sentiment IN ('positive', 'negative', 'neutral')),

  -- Status
  is_read BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,

  -- Timestamps
  published_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ DEFAULT now(),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(platform, platform_post_id)
);

-- Indexes
CREATE INDEX idx_competitors_workspace ON competitors(workspace_id);
CREATE INDEX idx_competitors_platform ON competitors(platform);
CREATE INDEX idx_competitor_snapshots_competitor ON competitor_snapshots(competitor_id);
CREATE INDEX idx_competitor_snapshots_date ON competitor_snapshots(snapshot_date);

CREATE INDEX idx_approval_workflows_workspace ON approval_workflows(workspace_id);
CREATE INDEX idx_post_approvals_post ON post_approvals(post_id);
CREATE INDEX idx_post_approvals_workspace ON post_approvals(workspace_id);
CREATE INDEX idx_post_approvals_status ON post_approvals(status);

CREATE INDEX idx_bio_pages_workspace ON bio_pages(workspace_id);
CREATE INDEX idx_bio_pages_slug ON bio_pages(slug);
CREATE INDEX idx_bio_links_page ON bio_links(bio_page_id);
CREATE INDEX idx_bio_links_order ON bio_links(order_index);

CREATE INDEX idx_listening_keywords_workspace ON listening_keywords(workspace_id);
CREATE INDEX idx_listening_mentions_workspace ON listening_mentions(workspace_id);
CREATE INDEX idx_listening_mentions_keyword ON listening_mentions(keyword_id);
CREATE INDEX idx_listening_mentions_platform ON listening_mentions(platform);
CREATE INDEX idx_listening_mentions_published ON listening_mentions(published_at);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_competitors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER competitors_updated_at
  BEFORE UPDATE ON competitors
  FOR EACH ROW
  EXECUTE FUNCTION update_competitors_updated_at();

CREATE TRIGGER approval_workflows_updated_at
  BEFORE UPDATE ON approval_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_competitors_updated_at();

CREATE TRIGGER post_approvals_updated_at
  BEFORE UPDATE ON post_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_competitors_updated_at();

CREATE TRIGGER bio_pages_updated_at
  BEFORE UPDATE ON bio_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_competitors_updated_at();

CREATE TRIGGER bio_links_updated_at
  BEFORE UPDATE ON bio_links
  FOR EACH ROW
  EXECUTE FUNCTION update_competitors_updated_at();

CREATE TRIGGER listening_keywords_updated_at
  BEFORE UPDATE ON listening_keywords
  FOR EACH ROW
  EXECUTE FUNCTION update_competitors_updated_at();

-- Row Level Security
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_mentions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can access data in their workspaces
CREATE POLICY "Users can view competitors in their workspaces"
  ON competitors FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage competitors in their workspaces"
  ON competitors FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view competitor snapshots in their workspaces"
  ON competitor_snapshots FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view workflows in their workspaces"
  ON approval_workflows FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage workflows in their workspaces"
  ON approval_workflows FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view approvals in their workspaces"
  ON post_approvals FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage approvals in their workspaces"
  ON post_approvals FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view bio pages in their workspaces"
  ON bio_pages FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage bio pages in their workspaces"
  ON bio_pages FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view published bio pages"
  ON bio_pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can view bio links for their pages"
  ON bio_links FOR SELECT
  USING (
    bio_page_id IN (
      SELECT id FROM bio_pages WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage bio links for their pages"
  ON bio_links FOR ALL
  USING (
    bio_page_id IN (
      SELECT id FROM bio_pages WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Anyone can view links for published bio pages"
  ON bio_links FOR SELECT
  USING (
    bio_page_id IN (SELECT id FROM bio_pages WHERE is_published = true)
  );

CREATE POLICY "Users can view listening keywords in their workspaces"
  ON listening_keywords FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage listening keywords in their workspaces"
  ON listening_keywords FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view mentions in their workspaces"
  ON listening_mentions FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- System can insert/update for automated collection
CREATE POLICY "System can insert competitor snapshots"
  ON competitor_snapshots FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can insert mentions"
  ON listening_mentions FOR INSERT
  WITH CHECK (true);
