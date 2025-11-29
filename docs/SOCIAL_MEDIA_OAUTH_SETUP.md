# Social Media OAuth Setup Guide

This guide will walk you through setting up OAuth authentication for each supported social media platform.

## Overview

To connect social media accounts, you need to create developer apps on each platform and obtain OAuth credentials (Client ID, Client Secret, etc.).

## Prerequisites

- Your application must be running on HTTPS (required for OAuth)
- Note your application's domain/URL
- Have admin access to create apps on each social media platform

---

## Facebook & Instagram

Facebook and Instagram both use Meta's developer platform.

### Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" or "Business" type
4. Fill in app details:
   - App Name: Your App Name
   - App Contact Email: your@email.com
5. Click "Create App"

### Step 2: Configure Facebook Login

1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" as the platform
4. Enter your Site URL: `https://yourdomain.com`
5. Go to Facebook Login → Settings
6. Add OAuth Redirect URIs:
   ```
   https://yourdomain.com/api/auth/facebook/callback
   ```
7. Save changes

### Step 3: Get Your Credentials

1. Go to Settings → Basic
2. Copy your **App ID** and **App Secret**
3. Add to your `.env.local`:
   ```
   FACEBOOK_APP_ID=your_app_id_here
   FACEBOOK_APP_SECRET=your_app_secret_here
   ```

### Step 4: For Instagram

1. In the same app, click "Add Product"
2. Find "Instagram Basic Display" or "Instagram Graph API"
3. Follow the setup wizard
4. Add the same redirect URI:
   ```
   https://yourdomain.com/api/auth/instagram/callback
   ```

### Step 5: App Review & Permissions

For production use, you need to:
1. Complete App Review
2. Request permissions:
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `instagram_basic`
   - `instagram_content_publish`

---

## LinkedIn

### Step 1: Create a LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click "Create App"
3. Fill in required information:
   - App Name
   - LinkedIn Page (you must have a LinkedIn Company Page)
   - App Logo
   - Privacy Policy URL
   - Terms of Service URL

### Step 2: Configure OAuth

1. Go to "Auth" tab
2. Add Redirect URLs:
   ```
   https://yourdomain.com/api/auth/linkedin/callback
   ```
3. Note: LinkedIn validates that your redirect URL matches exactly

### Step 3: Request Products

1. Go to "Products" tab
2. Request "Sign In with LinkedIn" (auto-approved)
3. Request "Share on LinkedIn" (may require review)

### Step 4: Get Your Credentials

1. Go to "Auth" tab
2. Copy your **Client ID** and **Client Secret**
3. Add to your `.env.local`:
   ```
   LINKEDIN_CLIENT_ID=your_client_id_here
   LINKEDIN_CLIENT_SECRET=your_client_secret_here
   ```

---

## Twitter / X

### Step 1: Create a Twitter App

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Sign up for a developer account (if needed)
3. Create a new Project
4. Create a new App under that project

### Step 2: Configure OAuth 2.0

1. Go to your app settings
2. Click "Set up" under User authentication settings
3. Choose "OAuth 2.0"
4. App Permissions: Select "Read and Write"
5. Type of App: "Web App"
6. Add Callback URI:
   ```
   https://yourdomain.com/api/auth/twitter/callback
   ```
7. Add Website URL: `https://yourdomain.com`

### Step 3: Get Your Credentials

1. Go to "Keys and tokens" tab
2. Copy your **API Key** (Client ID) and **API Key Secret** (Client Secret)
3. Add to your `.env.local`:
   ```
   TWITTER_CLIENT_ID=your_api_key_here
   TWITTER_CLIENT_SECRET=your_api_key_secret_here
   ```

### Step 4: Elevated Access (Optional)

For full posting capabilities, you may need:
1. Apply for Elevated Access
2. Explain your use case
3. Wait for approval (usually 1-2 days)

---

## Environment Variables Summary

After setting up all platforms, your `.env.local` should include:

```bash
# Facebook & Instagram
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Twitter / X
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Your app URL (for OAuth callbacks)
NEXTAUTH_URL=https://yourdomain.com
```

---

## Testing OAuth Flow

### Development Environment

For local development:
1. Use ngrok or similar to get an HTTPS URL:
   ```bash
   ngrok http 3000
   ```
2. Use the ngrok URL in your OAuth app settings
3. Update `NEXTAUTH_URL` in `.env.local` to match

### Production Environment

1. Ensure your production domain is HTTPS
2. Update all OAuth redirect URIs to use your production domain
3. Never commit `.env.local` or expose your secrets

---

## Common Issues & Solutions

### "Redirect URI mismatch" error
- Ensure the redirect URI in your OAuth app settings **exactly** matches what your app is sending
- Check for trailing slashes, http vs https, etc.

### "App not approved" error
- Some platforms require app review before you can post
- Submit your app for review through the developer console
- This can take several days to weeks

### Tokens expiring
- Access tokens expire after a certain time
- Implement token refresh logic (already handled in the app)
- Some platforms (LinkedIn) have short-lived tokens (60 days)

### Rate Limiting
- Each platform has different rate limits
- Implement retry logic with exponential backoff
- Cache tokens appropriately

---

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all secrets
3. **Encrypt tokens** in the database (implement encryption layer)
4. **Rotate secrets** periodically
5. **Implement PKCE** for additional security (OAuth 2.1)
6. **Validate state parameter** to prevent CSRF attacks
7. **Use HTTPS** everywhere
8. **Implement token refresh** before expiration

---

## Next Steps

After setting up OAuth credentials:

1. Run the database migration:
   ```sql
   -- Run 009_social_accounts.sql in Supabase SQL Editor
   ```

2. Test the OAuth flow:
   - Visit `/dashboard/accounts`
   - Click "Connect" on a platform
   - Complete the OAuth authorization
   - Verify the account appears as connected

3. Implement posting functionality:
   - Create API routes for posting to each platform
   - Add scheduling logic
   - Implement retry mechanisms

---

## Platform-Specific Notes

### Facebook/Instagram
- Instagram requires a Business account
- Facebook Pages are needed for posting
- Some features require app review

### LinkedIn
- Requires a Company Page
- Limited to posting as the company, not personal
- Token lifetime: 60 days

### Twitter
- Free tier has limited API access
- Elevated access needed for full features
- Rate limits are strict

---

## Support

For platform-specific issues:
- Facebook/Instagram: https://developers.facebook.com/support
- LinkedIn: https://www.linkedin.com/help/linkedin/
- Twitter: https://developer.twitter.com/en/support

For app-specific issues, check the logs in `/var/log` or your hosting provider's dashboard.
