-- Inbox Tables for DM/Messaging functionality
-- Supports Facebook Messenger, Instagram DMs, TikTok, etc.

-- Table: inbox_contacts
-- Stores information about users who message us
CREATE TABLE IF NOT EXISTS inbox_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- facebook, instagram, tiktok, etc.
  external_id VARCHAR(255) NOT NULL, -- Platform-specific user ID (PSID for Facebook)
  name VARCHAR(255),
  username VARCHAR(255),
  profile_picture_url TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),
  locale VARCHAR(10),
  metadata JSONB DEFAULT '{}', -- Additional platform-specific data
  tags TEXT[] DEFAULT '{}',
  first_message_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(workspace_id, platform, external_id)
);

-- Table: inbox_threads
-- Stores conversation threads
CREATE TABLE IF NOT EXISTS inbox_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  social_account_id UUID REFERENCES social_accounts(id) ON DELETE SET NULL,
  contact_id UUID NOT NULL REFERENCES inbox_contacts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'open', -- open, assigned, resolved, snoozed, spam
  assigned_to UUID, -- User ID who is assigned to this thread
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_type VARCHAR(50) DEFAULT 'text', -- text, image, video, audio, file
  unread_count INTEGER DEFAULT 0,
  is_automated BOOLEAN DEFAULT FALSE, -- If handled by automation
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}', -- Platform-specific thread data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: inbox_messages
-- Stores individual messages in threads
CREATE TABLE IF NOT EXISTS inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES inbox_threads(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES inbox_contacts(id) ON DELETE CASCADE,
  direction VARCHAR(10) NOT NULL, -- 'in' for received, 'out' for sent
  message_type VARCHAR(50) DEFAULT 'text', -- text, image, video, audio, file, sticker
  content TEXT, -- Message text content
  external_message_id VARCHAR(255), -- Platform message ID
  attachments JSONB DEFAULT '[]', -- Array of attachment objects
  metadata JSONB DEFAULT '{}', -- Reactions, read receipts, etc.
  sent_by UUID, -- User ID who sent this message (for outgoing)
  is_read BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inbox_contacts_workspace ON inbox_contacts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_inbox_contacts_platform ON inbox_contacts(workspace_id, platform);
CREATE INDEX IF NOT EXISTS idx_inbox_contacts_external ON inbox_contacts(platform, external_id);

CREATE INDEX IF NOT EXISTS idx_inbox_threads_workspace ON inbox_threads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_inbox_threads_contact ON inbox_threads(contact_id);
CREATE INDEX IF NOT EXISTS idx_inbox_threads_status ON inbox_threads(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_inbox_threads_platform ON inbox_threads(workspace_id, platform);
CREATE INDEX IF NOT EXISTS idx_inbox_threads_assigned ON inbox_threads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_inbox_threads_last_message ON inbox_threads(workspace_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_inbox_messages_thread ON inbox_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_workspace ON inbox_messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_contact ON inbox_messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_created ON inbox_messages(thread_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE inbox_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inbox_contacts
CREATE POLICY "Users can view contacts in their workspaces" ON inbox_contacts
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert contacts in their workspaces" ON inbox_contacts
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update contacts in their workspaces" ON inbox_contacts
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for inbox_threads
CREATE POLICY "Users can view threads in their workspaces" ON inbox_threads
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert threads in their workspaces" ON inbox_threads
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update threads in their workspaces" ON inbox_threads
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for inbox_messages
CREATE POLICY "Users can view messages in their workspaces" ON inbox_messages
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their workspaces" ON inbox_messages
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their workspaces" ON inbox_messages
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Function to update thread's last message info
CREATE OR REPLACE FUNCTION update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inbox_threads
  SET
    last_message = NEW.content,
    last_message_at = NEW.created_at,
    last_message_type = NEW.message_type,
    unread_count = CASE
      WHEN NEW.direction = 'in' THEN unread_count + 1
      ELSE 0
    END,
    updated_at = NOW()
  WHERE id = NEW.thread_id;

  -- Update contact's last message timestamp
  UPDATE inbox_contacts
  SET
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.contact_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update thread on new message
DROP TRIGGER IF EXISTS trigger_update_thread_last_message ON inbox_messages;
CREATE TRIGGER trigger_update_thread_last_message
  AFTER INSERT ON inbox_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_last_message();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_inbox_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_inbox_contacts_updated_at ON inbox_contacts;
CREATE TRIGGER trigger_inbox_contacts_updated_at
  BEFORE UPDATE ON inbox_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_inbox_updated_at();

DROP TRIGGER IF EXISTS trigger_inbox_threads_updated_at ON inbox_threads;
CREATE TRIGGER trigger_inbox_threads_updated_at
  BEFORE UPDATE ON inbox_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_inbox_updated_at();
