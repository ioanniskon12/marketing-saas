# Social Media SaaS - Project Documentation

## Quick Start

```bash
npm run dev
```

Access at: http://localhost:3000

## Documentation Index

- [Meta Integration (Facebook/Instagram)](./META_INTEGRATION.md) - OAuth setup and configuration
- [Inbox & Messaging](./INBOX.md) - DM automation and conversations
- [API Reference](./API_REFERENCE.md) - All API endpoints
- [Database Schema](./DATABASE.md) - Tables and relationships

## Environment Variables

Create `.env.local` with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Meta/Facebook
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
META_WEBHOOK_VERIFY_TOKEN=social-media-saas-webhook

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Key Features

### 1. Social Account Management
- Connect Facebook Pages and Instagram Business accounts
- OAuth 2.0 flow with token storage
- Page access tokens for posting

### 2. Content Calendar
- Schedule posts across platforms
- Drag-and-drop rescheduling
- View by day/week/month

### 3. Inbox / DM Management
- Real-time message reception via webhooks
- Send replies to Facebook Messenger & Instagram DMs
- Conversation sync from platforms
- Read/unread tracking

### 4. Analytics
- Post performance metrics
- Best times to post
- Engagement tracking

## Project Structure

```
social-media-saas/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/               # OAuth endpoints
│   │   ├── inbox/              # Inbox/messaging
│   │   ├── posts/              # Post management
│   │   ├── social-accounts/    # Account management
│   │   └── webhooks/           # Webhook handlers
│   └── dashboard/              # Dashboard pages
├── components/                 # React components
├── contexts/                   # React contexts
├── lib/                        # Utilities & configs
│   ├── oauth/                  # OAuth configuration
│   └── supabase/               # Supabase client
├── docs/                       # Documentation
└── supabase/migrations/        # Database migrations
```

## Current Status

- [x] Facebook Page connection
- [x] Instagram Business account connection
- [x] Inbox UI with conversations
- [x] Webhook for receiving messages
- [x] Send replies via API
- [ ] TikTok integration
- [ ] Auto-reply automation
- [ ] AI-powered responses

## Common Tasks

### Connect a New Platform
1. Go to `/dashboard/accounts`
2. Click "Connect" on the platform
3. Complete OAuth flow
4. Account appears in list

### Sync Conversations
```bash
POST /api/inbox/sync?workspace_id=YOUR_WORKSPACE_ID
```

### Send a Message
```bash
POST /api/inbox/threads/THREAD_ID/reply
Content-Type: application/json

{"message": "Your reply here"}
```

## Troubleshooting

### "No Facebook Pages found"
- Create a Facebook Page first
- Make sure you're admin of the Page

### "No Instagram Business account found"
- Convert Instagram to Business/Creator account
- Link it to your Facebook Page in Page Settings

### OAuth errors
- Check FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in .env.local
- Verify redirect URIs in Meta Developer Console
