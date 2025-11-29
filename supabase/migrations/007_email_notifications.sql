/**
 * Email Notifications System Migration
 *
 * Creates tables and policies for email notification preferences
 */

-- ====================
-- NOTIFICATION PREFERENCES TABLE
-- ====================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Email notification types
  email_welcome BOOLEAN DEFAULT true,
  email_digest_daily BOOLEAN DEFAULT true,
  email_digest_weekly BOOLEAN DEFAULT true,
  email_post_published BOOLEAN DEFAULT true,
  email_post_failed BOOLEAN DEFAULT true,
  email_analytics_summary BOOLEAN DEFAULT true,
  email_new_mention BOOLEAN DEFAULT true,
  email_approval_request BOOLEAN DEFAULT true,
  email_approval_decision BOOLEAN DEFAULT true,
  email_competitor_alert BOOLEAN DEFAULT false,

  -- Digest preferences
  digest_frequency VARCHAR(20) DEFAULT 'weekly', -- daily, weekly, monthly
  digest_day INTEGER DEFAULT 1, -- Day of week (0=Sunday, 6=Saturday) or day of month
  digest_time TIME DEFAULT '09:00:00', -- Time to send digest

  -- Alert thresholds
  alert_engagement_drop BOOLEAN DEFAULT true,
  engagement_drop_threshold INTEGER DEFAULT 20, -- Percentage drop
  alert_mention_sentiment BOOLEAN DEFAULT true,
  mention_sentiment_threshold VARCHAR(20) DEFAULT 'negative', -- negative, all

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, workspace_id)
);

-- ====================
-- EMAIL LOGS TABLE
-- ====================

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,

  email_type VARCHAR(50) NOT NULL, -- welcome, digest, alert, etc.
  recipient_email VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,

  status VARCHAR(20) DEFAULT 'sent', -- sent, failed, bounced
  resend_id VARCHAR(255), -- Resend email ID
  error_message TEXT,

  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- DIGEST QUEUE TABLE
-- ====================

CREATE TABLE IF NOT EXISTS digest_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  digest_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,

  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, workspace_id, digest_type, scheduled_for)
);

-- ====================
-- INDEXES
-- ====================

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_workspace
  ON notification_preferences(user_id, workspace_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_user
  ON email_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_workspace
  ON email_logs(workspace_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_type
  ON email_logs(email_type);

CREATE INDEX IF NOT EXISTS idx_email_logs_status
  ON email_logs(status);

CREATE INDEX IF NOT EXISTS idx_digest_queue_scheduled
  ON digest_queue(scheduled_for, status);

CREATE INDEX IF NOT EXISTS idx_digest_queue_user_workspace
  ON digest_queue(user_id, workspace_id);

-- ====================
-- ROW LEVEL SECURITY
-- ====================

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_queue ENABLE ROW LEVEL SECURITY;

-- Notification Preferences Policies
CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences FOR SELECT
  USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id FROM workspace_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Email Logs Policies
CREATE POLICY "Users can view their own email logs"
  ON email_logs FOR SELECT
  USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id FROM workspace_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Digest Queue Policies (system managed)
CREATE POLICY "System can manage digest queue"
  ON digest_queue FOR ALL
  USING (true);

-- ====================
-- FUNCTIONS
-- ====================

-- Function to create default notification preferences
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id, workspace_id)
  VALUES (NEW.user_id, NEW.workspace_id)
  ON CONFLICT (user_id, workspace_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default preferences when user joins workspace
CREATE TRIGGER create_default_notification_preferences_trigger
  AFTER INSERT ON workspace_users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_preferences_updated_at_trigger
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- ====================
-- SEED DEFAULT PREFERENCES FOR EXISTING USERS
-- ====================

-- Create default preferences for all existing workspace users
INSERT INTO notification_preferences (user_id, workspace_id)
SELECT DISTINCT wu.user_id, wu.workspace_id
FROM workspace_users wu
ON CONFLICT (user_id, workspace_id) DO NOTHING;
