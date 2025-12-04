# Social Media Platform OAuth Setup Guide

This guide will help you obtain OAuth credentials for connecting Twitter, LinkedIn, YouTube, and TikTok to your SaaS platform.

## Table of Contents
1. [Twitter/X OAuth Setup](#twitter-x-oauth-setup)
2. [LinkedIn OAuth Setup](#linkedin-oauth-setup)
3. [YouTube OAuth Setup](#youtube-oauth-setup)
4. [TikTok OAuth Setup](#tiktok-oauth-setup)

---

## Twitter/X OAuth Setup

### Step 1: Create a Twitter Developer Account
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign in with your Twitter account
3. Click "Sign up for Free Account" if you don't have developer access
4. Complete the application form

### Step 2: Create a New App
1. Once approved, go to the [Developer Dashboard](https://developer.twitter.com/en/portal/dashboard)
2. Click "+ Create Project" or "Create App"
3. Choose your use case (e.g., "Making a bot" or "Exploring the API")
4. Name your app (e.g., "Social Media SaaS")

### Step 3: Configure OAuth 2.0
1. In your app settings, go to "User authentication settings"
2. Click "Set up" to enable OAuth 2.0
3. Configure the following:
   - **App permissions**: Read and write
   - **Type of App**: Web App
   - **Callback URI**: `http://localhost:3000/api/auth/callback/twitter`
   - **Website URL**: `http://localhost:3000`
4. Save changes

### Step 4: Get Credentials
1. Go to "Keys and tokens" tab
2. Find your **OAuth 2.0 Client ID** and **Client Secret**
3. Copy these values

### Step 5: Add to .env.local
```bash
TWITTER_CLIENT_ID="your_client_id_here"
TWITTER_CLIENT_SECRET="your_client_secret_here"
TWITTER_REDIRECT_URI="http://localhost:3000/api/auth/callback/twitter"
```

---

## LinkedIn OAuth Setup

### Step 1: Create LinkedIn App
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in the required information:
   - **App name**: Social Media SaaS
   - **LinkedIn Page**: Select or create a LinkedIn company page
   - **Privacy policy URL**: Your privacy policy URL
   - **App logo**: Upload a logo (optional but recommended)
4. Click "Create app"

### Step 2: Configure OAuth Settings
1. In your app settings, go to the "Auth" tab
2. Add **Redirect URLs**:
   - `http://localhost:3000/api/auth/callback/linkedin`
3. Request access to the following scopes:
   - `r_liteprofile` (read basic profile)
   - `w_member_social` (write posts)

### Step 3: Get Credentials
1. In the "Auth" tab, find:
   - **Client ID**
   - **Client Secret** (click "Show" to reveal)
2. Copy these values

### Step 4: Add to .env.local
```bash
LINKEDIN_CLIENT_ID="your_client_id_here"
LINKEDIN_CLIENT_SECRET="your_client_secret_here"
LINKEDIN_REDIRECT_URI="http://localhost:3000/api/auth/callback/linkedin"
```

### Step 5: Verify Your App (Important)
- LinkedIn requires app verification before you can use it publicly
- During development, you can add test users in the app settings
- For production, submit your app for LinkedIn review

---

## YouTube OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Name your project (e.g., "Social Media SaaS")

### Step 2: Enable YouTube Data API
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on it and then click "Enable"

### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose **External** user type
3. Fill in the required information:
   - **App name**: Social Media SaaS
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/youtube.upload`
   - `https://www.googleapis.com/auth/youtube`
5. Add test users (your Gmail account for testing)
6. Save and continue

### Step 4: Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" > "OAuth client ID"
3. Choose "Web application"
4. Configure:
   - **Name**: Social Media SaaS Web Client
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/youtube`
5. Click "Create"

### Step 5: Get Credentials
1. Download the JSON credentials or copy:
   - **Client ID**
   - **Client Secret**

### Step 6: Add to .env.local
```bash
YOUTUBE_CLIENT_ID="your_client_id_here"
YOUTUBE_CLIENT_SECRET="your_client_secret_here"
YOUTUBE_REDIRECT_URI="http://localhost:3000/api/auth/callback/youtube"
```

**Note**: YouTube API has a free quota of 10,000 units/day. Each video upload costs approximately 1,600 units.

---

## TikTok OAuth Setup

### Step 1: Register as TikTok Developer
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Click "Register" or "Login"
3. Complete the registration process

### Step 2: Create an App
1. Go to [TikTok Developer Portal](https://developers.tiktok.com/apps/)
2. Click "+ Add an app"
3. Fill in the app details:
   - **App name**: Social Media SaaS
   - **App description**: Social media management platform
   - **Category**: Choose appropriate category

### Step 3: Configure Login Kit
1. In your app dashboard, go to "Login Kit"
2. Click "Enable"
3. Add **Redirect URI**:
   - `http://localhost:3000/api/auth/callback/tiktok`

### Step 4: Request Permissions
1. In the "Permissions" section, request:
   - `user.info.basic` - Basic user information
   - `video.list` - List user's videos
   - `video.upload` - Upload videos

### Step 5: Get Credentials
1. In your app dashboard, find:
   - **Client Key** (similar to Client ID)
   - **Client Secret**
2. Copy these values

### Step 6: Add to .env.local
```bash
TIKTOK_CLIENT_KEY="your_client_key_here"
TIKTOK_CLIENT_SECRET="your_client_secret_here"
TIKTOK_REDIRECT_URI="http://localhost:3000/api/auth/callback/tiktok"
```

**Important Notes**:
- TikTok requires app review before going to production
- During development, only the app creator can test the integration
- Video uploads have size and duration limits (check TikTok API docs)

---

## Testing Your Integrations

After adding all credentials to `.env.local`:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to Accounts page**:
   ```
   http://localhost:3000/dashboard/accounts
   ```

3. **Test each platform**:
   - Click "Connect" for each platform
   - Complete the OAuth flow
   - Verify the account appears as "Connected"

## Production Deployment

When deploying to production:

1. Update all redirect URIs to use your production domain
2. Add production credentials to your hosting environment variables
3. Ensure all apps are verified/reviewed by their respective platforms
4. Update `NEXT_PUBLIC_APP_URL` in your environment variables

---

## Troubleshooting

### Common Issues

**OAuth Error: Redirect URI Mismatch**
- Ensure the redirect URI in your app settings matches exactly what's in `.env.local`
- Include the protocol (`http://` or `https://`)

**Invalid Credentials**
- Double-check you copied the Client ID and Secret correctly
- Some platforms regenerate secrets - make sure you're using the latest

**Permission Denied**
- Ensure you've requested the necessary scopes/permissions
- Some platforms require app review before certain permissions work

**App Not Verified**
- During development, add test users to your app
- For production, submit your app for platform review

---

## Support

For platform-specific issues:
- **Twitter**: [Twitter API Support](https://twittercommunity.com/)
- **LinkedIn**: [LinkedIn Developer Support](https://docs.microsoft.com/en-us/linkedin/)
- **YouTube**: [Google API Support](https://developers.google.com/youtube/v3/getting-started)
- **TikTok**: [TikTok Developer Support](https://developers.tiktok.com/doc)
