# API Reference

All API routes are under `/api/`.

## Authentication

Most endpoints require authentication via Supabase session.

---

## Social Accounts

### List Accounts
```
GET /api/social-accounts?workspace_id=xxx
```

### Delete Account
```
DELETE /api/social-accounts/{id}
```

---

## OAuth / Auth

### Initiate OAuth
```
GET /api/auth/connect/{platform}?workspace_id=xxx
```

Platforms: `facebook`, `instagram`, `twitter`, `linkedin`, `tiktok`, `youtube`

### OAuth Callback
```
GET /api/auth/callback/{platform}?code=xxx&state=xxx
```

### Platform-specific OAuth
```
GET /api/auth/facebook?workspace_id=xxx
GET /api/auth/instagram?workspace_id=xxx
```

---

## Inbox

### List Threads
```
GET /api/inbox/threads?workspace_id=xxx&status=open&platform=facebook
```

Query params:
- `workspace_id` (required)
- `status`: all, open, resolved
- `platform`: facebook, instagram, tiktok

### Get Thread with Messages
```
GET /api/inbox/threads/{id}
```

### Update Thread
```
PATCH /api/inbox/threads/{id}
Content-Type: application/json

{
  "status": "resolved",
  "assigned_to": "user-uuid",
  "tags": ["vip", "urgent"]
}
```

### Send Reply
```
POST /api/inbox/threads/{id}/reply
Content-Type: application/json

{
  "message": "Your reply text",
  "attachments": [
    {
      "type": "image",
      "url": "https://..."
    }
  ]
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

Imports existing conversations from connected platforms.

---

## Webhooks

### Meta Webhook Verification
```
GET /api/webhooks/meta?hub.mode=subscribe&hub.verify_token=xxx&hub.challenge=xxx
```

### Meta Webhook Events
```
POST /api/webhooks/meta
Content-Type: application/json

{
  "object": "page",
  "entry": [
    {
      "id": "PAGE_ID",
      "messaging": [
        {
          "sender": {"id": "USER_PSID"},
          "recipient": {"id": "PAGE_ID"},
          "timestamp": 1234567890,
          "message": {
            "mid": "msg_id",
            "text": "Hello"
          }
        }
      ]
    }
  ]
}
```

---

## Posts

### List Posts
```
GET /api/posts?workspace_id=xxx&start_date=xxx&end_date=xxx
```

### Get Post
```
GET /api/posts/{id}
```

### Create Post
```
POST /api/posts
Content-Type: application/json

{
  "workspace_id": "uuid",
  "content": "Post text",
  "platforms": ["facebook", "instagram"],
  "scheduled_for": "2024-11-20T10:00:00Z",
  "media": []
}
```

### Update Post
```
PATCH /api/posts/{id}
Content-Type: application/json

{
  "content": "Updated text",
  "scheduled_for": "2024-11-21T10:00:00Z"
}
```

### Delete Post
```
DELETE /api/posts/{id}
```

---

## Analytics

### Get Post Analytics
```
GET /api/analytics/posts?workspace_id=xxx&start_date=xxx&end_date=xxx
```

### Get Account Analytics
```
GET /api/analytics/accounts?workspace_id=xxx
```

---

## Workspaces

### List Workspaces
```
GET /api/workspaces
```

### Get Workspace
```
GET /api/workspaces/{id}
```

### Create Workspace
```
POST /api/workspaces
Content-Type: application/json

{
  "name": "My Brand"
}
```

### Update Workspace
```
PATCH /api/workspaces/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "logo_url": "https://..."
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Rate Limits

API routes use Supabase's built-in rate limiting. For Meta API calls, be aware of:

- **Graph API**: 200 calls/user/hour
- **Messaging API**: Variable limits based on page quality

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Missing required parameters |
| 401 | Unauthorized - Invalid or missing auth |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |
