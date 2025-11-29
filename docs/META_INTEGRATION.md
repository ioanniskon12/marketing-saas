# Meta Integration (Facebook & Instagram)

## Overview

This app uses Meta's Graph API to connect Facebook Pages and Instagram Business accounts.

## Requirements

### Facebook App Setup

1. Go to [Meta Developer Console](https://developers.facebook.com/)
2. Create or select your app
3. Add these products:
   - Facebook Login
   - Messenger
   - Instagram Basic Display (optional)

### Environment Variables

```env
FACEBOOK_APP_ID=1401657458149402
FACEBOOK_APP_SECRET=your-secret-here
```

## OAuth Flow

### Facebook Pages

1. User clicks "Connect" on Facebook
2. Redirects to Facebook OAuth with scopes:
   - `public_profile`
   - `pages_show_list`
   - `pages_read_engagement`
3. User grants permissions
4. Callback exchanges code for token
5. Fetches user's Pages via `/me/accounts`
6. Stores **Page access token** (not user token)

### Instagram Business

1. User clicks "Connect" on Instagram
2. Uses same Facebook OAuth (Instagram Business API requires it)
3. Fetches Pages via `/me/accounts` with `instagram_business_account` field
4. Finds Page with linked Instagram Business account
5. Stores Page access token for Instagram API calls

## Key Files

| File | Purpose |
|------|---------|
| `lib/oauth/config.js` | OAuth configuration and token exchange |
| `app/api/auth/connect/[platform]/route.js` | Initiates OAuth flow |
| `app/api/auth/callback/[platform]/route.js` | Handles OAuth callback |
| `app/api/auth/facebook/route.js` | Facebook-specific OAuth |
| `app/api/auth/instagram/route.js` | Instagram-specific OAuth |

## OAuth Scopes

### Basic Scopes (No App Review Required)

```javascript
// Facebook
'public_profile,pages_show_list,pages_read_engagement'

// Instagram (uses Facebook OAuth)
'public_profile,pages_show_list,pages_read_engagement,instagram_basic'
```

### Advanced Scopes (Require App Review)

For posting and messaging, you need to submit for App Review:

```javascript
// Publishing
'pages_manage_posts'
'instagram_content_publish'

// Messaging
'pages_messaging'
'instagram_manage_messages'

// Comments
'pages_manage_engagement'
'instagram_manage_comments'
```

## Connecting Instagram Business Account

### Step 1: Convert to Business Account

1. Open Instagram app
2. Go to Settings → Account
3. Tap "Switch to Professional Account"
4. Choose "Business"
5. Select a category
6. Complete setup

### Step 2: Link to Facebook Page

1. On Facebook (desktop), go to your Page
2. Click Settings (gear icon)
3. Go to "Linked Accounts" in left menu
4. Click "Instagram"
5. Click "Connect Account"
6. Log into your Instagram account
7. Authorize the connection

### Step 3: Connect in App

1. Go to http://localhost:3000/dashboard/accounts
2. Click "Connect" on Instagram
3. Log in with Facebook (same account that owns the Page)
4. Grant permissions
5. Instagram Business account will be connected

## Troubleshooting

### "No Facebook Pages found"

**Cause:** User hasn't created a Facebook Page or isn't admin

**Solution:**
- Create a Facebook Page at facebook.com/pages/create
- Make sure you're the Page admin

### "No Instagram Business account found"

**Cause:** Instagram not linked to Facebook Page

**Solution:**
1. Make sure Instagram is a Business/Creator account
2. Link it to your Facebook Page (see Step 2 above)

### "Invalid Scopes" Error

**Cause:** Requesting scopes that require App Review

**Solution:**
- Use only basic scopes for development
- Submit app for review to get advanced permissions

### Token Expiration

**Issue:** Page access tokens can expire

**Solution:**
- Exchange for long-lived token (60 days)
- Implement token refresh logic
- Re-authenticate if token is invalid

## API Reference

### Get Facebook Pages

```javascript
GET https://graph.facebook.com/v18.0/me/accounts
  ?fields=id,name,access_token,category,picture
  &access_token=USER_TOKEN
```

### Get Instagram Business Account

```javascript
GET https://graph.facebook.com/v18.0/me/accounts
  ?fields=id,name,access_token,instagram_business_account{id,username,profile_picture_url}
  &access_token=USER_TOKEN
```

### Send Messenger Message

```javascript
POST https://graph.facebook.com/v18.0/me/messages
  ?access_token=PAGE_TOKEN

{
  "recipient": { "id": "USER_PSID" },
  "message": { "text": "Hello!" },
  "messaging_type": "RESPONSE"
}
```

## Webhook Setup

To receive real-time messages, configure webhooks in Meta Developer Console:

1. Go to your app → Webhooks
2. Add webhook for Messenger:
   - Callback URL: `https://your-domain.com/api/webhooks/meta`
   - Verify Token: `social-media-saas-webhook`
3. Subscribe to events:
   - `messages`
   - `messaging_postbacks`
   - `message_deliveries`
   - `message_reads`

## Testing

### Test User Access

In Meta Developer Console → Roles → Test Users:
- Create test users
- Grant them page admin access
- Use them for development testing

### Local Development

Use ngrok for webhook testing:

```bash
ngrok http 3000
```

Update webhook URL in Meta console to ngrok URL.
