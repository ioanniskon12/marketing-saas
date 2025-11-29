# Inbox & DM Management

## Overview

The inbox allows you to receive and reply to messages from Facebook Messenger and Instagram DMs in one unified interface.

## Features

- Real-time message reception via webhooks
- Conversation list with read/unread status
- Send replies directly from the app
- Sync existing conversations
- Profile pictures and contact info
- Filter by platform and status

## Access

URL: http://localhost:3000/dashboard/inbox

## Database Tables

### inbox_contacts
Stores information about users who message you.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspace_id | UUID | Workspace reference |
| platform | VARCHAR | facebook, instagram, tiktok |
| external_id | VARCHAR | Platform user ID (PSID) |
| name | VARCHAR | Contact name |
| profile_picture_url | TEXT | Avatar URL |

### inbox_threads
Stores conversation threads.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| contact_id | UUID | Contact reference |
| platform | VARCHAR | Platform name |
| status | VARCHAR | open, resolved, snoozed |
| last_message | TEXT | Preview text |
| unread_count | INTEGER | Unread message count |

### inbox_messages
Stores individual messages.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| thread_id | UUID | Thread reference |
| direction | VARCHAR | 'in' or 'out' |
| content | TEXT | Message text |
| attachments | JSONB | Media attachments |
| created_at | TIMESTAMP | When sent/received |

## API Endpoints

### List Threads

```
GET /api/inbox/threads?workspace_id=xxx
```

Response:
```json
{
  "success": true,
  "threads": [
    {
      "id": "uuid",
      "platform": "facebook",
      "status": "open",
      "unreadCount": 2,
      "lastMessage": "Hello!",
      "lastMessageAt": "2024-11-19T10:00:00Z",
      "contact": {
        "name": "John Doe",
        "avatar": "https://..."
      }
    }
  ]
}
```

### Get Thread Messages

```
GET /api/inbox/threads/{id}
```

Response:
```json
{
  "success": true,
  "thread": {
    "id": "uuid",
    "platform": "instagram",
    "contact": { ... },
    "messages": [
      {
        "id": "uuid",
        "direction": "in",
        "content": "Hi there!",
        "createdAt": "2024-11-19T10:00:00Z"
      }
    ]
  }
}
```

### Send Reply

```
POST /api/inbox/threads/{id}/reply
Content-Type: application/json

{
  "message": "Thanks for reaching out!"
}
```

Response:
```json
{
  "success": true,
  "message": { ... },
  "externalMessageId": "m_xxx"
}
```

### Mark as Read

```
POST /api/inbox/threads/{id}/mark-read
```

### Sync Conversations

```
POST /api/inbox/sync?workspace_id=xxx
```

This imports existing conversations from connected platforms.

## Webhook Handler

**Endpoint:** `POST /api/webhooks/meta`

Receives incoming messages from Meta platforms and:
1. Creates/updates contact
2. Creates/updates thread
3. Saves message to database
4. Increments unread count

### Webhook Verification

```
GET /api/webhooks/meta?hub.mode=subscribe&hub.verify_token=xxx&hub.challenge=xxx
```

### Configure in Meta Developer Console

1. Go to your app → Webhooks
2. Click "Add Callback URL"
3. Enter:
   - Callback URL: `https://your-domain.com/api/webhooks/meta`
   - Verify Token: `social-media-saas-webhook`
4. Subscribe to:
   - `messages`
   - `messaging_postbacks`
   - `message_deliveries`
   - `message_reads`

## UI Components

### Conversation List (Sidebar)
- Search bar for filtering
- Status tabs: All, Open, Resolved
- Conversation cards with:
  - Avatar with platform badge
  - Contact name
  - Last message preview
  - Timestamp
  - Unread badge

### Message Thread (Main Area)
- Header with contact info
- Message bubbles (incoming/outgoing)
- Timestamps
- Read receipts (checkmarks)
- Auto-scroll to latest

### Message Input
- Text input with Enter to send
- Attachment buttons (image, file)
- Send button

## Real-time Updates

The UI polls for new messages every 3 seconds:

```javascript
useEffect(() => {
  const interval = setInterval(loadThreads, 3000);
  return () => clearInterval(interval);
}, []);
```

For true real-time, consider implementing:
- WebSocket connection
- Server-Sent Events (SSE)
- Supabase Realtime subscriptions

## Permissions Required

To use inbox features, your Meta app needs:

### Basic (Development)
- `pages_messaging` - Send/receive Page messages

### Advanced (App Review Required)
- `instagram_manage_messages` - Instagram DMs
- `pages_messaging` with "Standard Access" for production

## Troubleshooting

### Messages not appearing

1. Check webhook is configured correctly
2. Verify webhook URL is accessible (use ngrok for local)
3. Check webhook logs in Meta Developer Console
4. Verify `social_accounts` has correct `platform_account_id`

### Can't send replies

1. Check Page access token is valid
2. Verify `pages_messaging` permission
3. Check 24-hour messaging window (Meta policy)

### Sync not working

1. Check access token has `pages_messaging` permission
2. Verify you have conversations to sync
3. Check API response for errors

## Message Window Policy

Meta enforces a 24-hour messaging window:

- You can reply to user messages within 24 hours
- After 24 hours, need to use message tags
- Or send a new message when user initiates

For automated messages, you need to use approved message tags.
