# Facebook Webhook Setup Guide

## Current Status

✅ Webhook endpoint created: `https://jonna-spirantal-cleansingly.ngrok-free.dev/api/webhooks/facebook`
✅ Verify token configured: `my_secure_verify_token_12345`
✅ ngrok tunnel is running
✅ Facebook Page connected: **Owlmarketing** (ID: `876037742260317`)
✅ Messages are being synced via Graph API
❌ **Webhook not receiving real-time events**

## The Problem

Your webhook URL is configured, but the **Page is not subscribed to webhook events**. In Facebook's system, there are two separate steps:

1. **Configure the webhook** (✅ Done) - Set the callback URL and verify token
2. **Subscribe the Page to the webhook** (❌ Missing) - Tell Facebook to send events from this specific Page to your webhook

## Step-by-Step Fix

### Step 1: Access Facebook Developer Console

1. Go to: https://developers.facebook.com/apps/
2. Click on your app: **App ID `1401657458149402`**

### Step 2: Navigate to Messenger Settings

1. In the left sidebar, find and click **"Messenger"**
2. You should see **"Messenger API Settings"** section

### Step 3: Subscribe the Page to Webhooks

1. Scroll down to the **"Webhooks"** section
2. You should see your configured webhook:
   - Callback URL: `https://jonna-spirantal-cleansingly.ngrok-free.dev/api/webhooks/facebook`
   - Verify Token: `my_secure_verify_token_12345`

3. **Look for a section that says "Subscribe to pages"** or similar
4. You should see your page **"Owlmarketing"** listed
5. Click the **"Subscribe"** button next to your page
6. Make sure these events are checked:
   - ✅ messages
   - ✅ messaging_postbacks
   - ✅ message_deliveries
   - ✅ message_reads

### Step 4: Test the Webhook

**Option A: Use Facebook's Test Button**
1. In the Webhooks section, look for a **"Test"** button
2. Click it to send a test event
3. You should see a big message in your server logs starting with "🎉 WEBHOOK RECEIVED FROM FACEBOOK!"

**Option B: Send a Real Message**
1. Go to your Facebook Page: https://www.facebook.com/Owlmarketing
2. Send a message to the page
3. Check the server logs for the webhook event

### Step 5: Verify It's Working

Watch your server logs. When a message comes in, you should see:

```
================================================================================
🎉 WEBHOOK RECEIVED FROM FACEBOOK!
================================================================================
Full webhook payload: { ... }
================================================================================
```

## Troubleshooting

### Problem: "Subscribe" button is grayed out

**Solution:** Your app might need certain permissions approved. Check:
1. Go to **App Review** in the left sidebar
2. Look for required permissions:
   - `pages_messaging`
   - `pages_read_engagement`
   - `pages_manage_metadata`
3. If they're pending, you might need to submit for review (or use Test Users in Development Mode)

### Problem: Webhook receives event but doesn't save messages

**Solution:** Check that the Page ID in the webhook payload matches the Page ID in your database.

- Expected Page ID: `876037742260317`
- Page Name: `Owlmarketing`

### Problem: App is in Development Mode

If your app is in **Development Mode** (check top of the Developer Console):

- Webhooks will ONLY work for:
  - Users who are added as Testers/Developers/Admins
  - Pages managed by those users

**Solutions:**
1. Add your Facebook account as a Test User or Admin
2. OR switch the app to Live Mode (requires App Review for most permissions)

## Quick Links

- **Facebook Developer Console:** https://developers.facebook.com/apps/1401657458149402/
- **Messenger Settings:** https://developers.facebook.com/apps/1401657458149402/messenger/
- **Your ngrok Dashboard:** http://localhost:4040
- **Diagnostic endpoint:** http://localhost:3000/api/webhooks/facebook/test

## Testing Checklist

- [ ] Webhook URL is verified (should show green checkmark in Facebook)
- [ ] Page "Owlmarketing" is subscribed to webhook
- [ ] Message events are checked
- [ ] Test button sends event successfully
- [ ] Real messages appear in server logs
- [ ] Messages appear in your inbox UI

## Need Help?

If you're still not receiving webhooks after following this guide:

1. Check Facebook's webhook logs:
   - Go to Messenger > Webhooks
   - Look for error messages or delivery failures

2. Verify ngrok is still running:
   ```bash
   curl http://localhost:4040/api/tunnels
   ```

3. Test the webhook endpoint directly:
   ```bash
   curl "https://jonna-spirantal-cleansingly.ngrok-free.dev/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=my_secure_verify_token_12345&hub.challenge=test123"
   ```
   Should return: `test123`

4. Check server logs for any errors
