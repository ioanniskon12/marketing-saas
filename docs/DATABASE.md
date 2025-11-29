# Database Schema

Database: Supabase (PostgreSQL)

## Tables

### workspaces
Stores workspace/brand information.

```sql
id UUID PRIMARY KEY
name VARCHAR
slug VARCHAR UNIQUE
logo_url TEXT
logo_size VARCHAR -- small, medium, large
settings JSONB
created_at TIMESTAMP
updated_at TIMESTAMP
```

### workspace_members
Links users to workspaces with roles.

```sql
id UUID PRIMARY KEY
workspace_id UUID REFERENCES workspaces
user_id UUID
role VARCHAR -- owner, admin, member
created_at TIMESTAMP
```

### social_accounts
Connected social media accounts.

```sql
id UUID PRIMARY KEY
workspace_id UUID REFERENCES workspaces
user_id UUID -- who connected it
platform VARCHAR -- facebook, instagram, etc
platform_account_id VARCHAR -- Page ID, IG account ID
platform_username VARCHAR
access_token TEXT
refresh_token TEXT
token_expires_at TIMESTAMP
is_active BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

### posts
Scheduled and published content.

```sql
id UUID PRIMARY KEY
workspace_id UUID REFERENCES workspaces
user_id UUID -- created by
content TEXT
platforms TEXT[] -- ['facebook', 'instagram']
media JSONB -- array of media objects
scheduled_for TIMESTAMP
published_at TIMESTAMP
status VARCHAR -- draft, scheduled, publishing, published, failed
metadata JSONB
created_at TIMESTAMP
updated_at TIMESTAMP
```

### inbox_contacts
Users who message you.

```sql
id UUID PRIMARY KEY
workspace_id UUID REFERENCES workspaces
platform VARCHAR
external_id VARCHAR -- PSID, IG user ID
name VARCHAR
username VARCHAR
profile_picture_url TEXT
email VARCHAR
phone VARCHAR
metadata JSONB
tags TEXT[]
first_message_at TIMESTAMP
last_message_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP

UNIQUE(workspace_id, platform, external_id)
```

### inbox_threads
Conversation threads.

```sql
id UUID PRIMARY KEY
workspace_id UUID REFERENCES workspaces
social_account_id UUID REFERENCES social_accounts
contact_id UUID REFERENCES inbox_contacts
platform VARCHAR
status VARCHAR -- open, assigned, resolved, snoozed
assigned_to UUID
last_message TEXT
last_message_at TIMESTAMP
last_message_type VARCHAR
unread_count INTEGER
is_automated BOOLEAN
tags TEXT[]
metadata JSONB
created_at TIMESTAMP
updated_at TIMESTAMP
```

### inbox_messages
Individual messages.

```sql
id UUID PRIMARY KEY
thread_id UUID REFERENCES inbox_threads
workspace_id UUID REFERENCES workspaces
contact_id UUID REFERENCES inbox_contacts
direction VARCHAR -- 'in' or 'out'
message_type VARCHAR -- text, image, video, file
content TEXT
external_message_id VARCHAR
attachments JSONB
metadata JSONB
sent_by UUID
is_read BOOLEAN
delivered_at TIMESTAMP
read_at TIMESTAMP
created_at TIMESTAMP
```

---

## Indexes

### inbox_contacts
```sql
idx_inbox_contacts_workspace (workspace_id)
idx_inbox_contacts_platform (workspace_id, platform)
idx_inbox_contacts_external (platform, external_id)
```

### inbox_threads
```sql
idx_inbox_threads_workspace (workspace_id)
idx_inbox_threads_contact (contact_id)
idx_inbox_threads_status (workspace_id, status)
idx_inbox_threads_platform (workspace_id, platform)
idx_inbox_threads_last_message (workspace_id, last_message_at DESC)
```

### inbox_messages
```sql
idx_inbox_messages_thread (thread_id)
idx_inbox_messages_workspace (workspace_id)
idx_inbox_messages_created (thread_id, created_at DESC)
```

---

## Triggers

### update_thread_last_message
Automatically updates thread's last_message fields when a new message is inserted.

```sql
CREATE TRIGGER trigger_update_thread_last_message
  AFTER INSERT ON inbox_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_last_message();
```

---

## Row Level Security (RLS)

All tables have RLS enabled with policies based on workspace membership:

```sql
-- Example policy
CREATE POLICY "Users can view their workspace data" ON table_name
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );
```

---

## Migrations

Migrations are stored in: `/supabase/migrations/`

### Running Migrations

**Option 1: Supabase CLI**
```bash
supabase db push
```

**Option 2: SQL Editor**
Copy SQL from migration file and run in Supabase SQL Editor.

### Current Migrations

| File | Description |
|------|-------------|
| `20241119_inbox_tables.sql` | Inbox tables (contacts, threads, messages) |

---

## Common Queries

### Get all threads for a workspace
```sql
SELECT t.*, c.name, c.profile_picture_url
FROM inbox_threads t
JOIN inbox_contacts c ON t.contact_id = c.id
WHERE t.workspace_id = 'xxx'
ORDER BY t.last_message_at DESC;
```

### Get messages for a thread
```sql
SELECT *
FROM inbox_messages
WHERE thread_id = 'xxx'
ORDER BY created_at ASC;
```

### Get unread count for workspace
```sql
SELECT SUM(unread_count) as total_unread
FROM inbox_threads
WHERE workspace_id = 'xxx';
```

### Get connected accounts
```sql
SELECT *
FROM social_accounts
WHERE workspace_id = 'xxx'
  AND is_active = true;
```
