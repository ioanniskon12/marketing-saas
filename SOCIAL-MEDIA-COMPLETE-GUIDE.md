# 🚀 Complete Social Media Integration Guide

**Everything you need to connect Facebook, Instagram, LinkedIn, Twitter and post real content.**

**Time to first real post: ~1 hour**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup (ngrok)](#local-development-setup)
3. [Facebook & Instagram Setup](#facebook--instagram-setup)
4. [LinkedIn Setup](#linkedin-setup)
5. [Twitter/X Setup](#twitterx-setup)
6. [TikTok Setup](#tiktok-setup)
7. [Environment Variables](#environment-variables)
8. [Connect Your First Account](#connect-your-first-account)
9. [Create Your First Real Post](#create-your-first-real-post)
10. [Test All Features](#test-all-features)
11. [Deploy to Production](#deploy-to-production)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start:

- [x] Your app is running locally: `npm run dev`
- [x] Supabase project configured with credentials in `.env.local`
- [x] User authentication working (can register/login)
- [ ] ngrok installed (we'll do this next)
- [ ] Developer accounts on social platforms

**Don't have these yet?**
- Run `npm run dev` to start the development server
- Check `AUTH-TESTING.md` if authentication isn't working

---

## Local Development Setup

Social media OAuth requires HTTPS. We'll use **ngrok** to create a secure tunnel.

### Step 1: Install ngrok

**Mac:**
```bash
brew install ngrok
```

**Windows:**
1. Download from [ngrok.com/download](https://ngrok.com/download)
2. Extract to a folder
3. Add to PATH or run from that folder

**Linux:**
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

### Step 2: Start ngrok

**Important:** Keep your dev server running in one terminal, then open a **new terminal** and run:

```bash
ngrok http 3000
```

You'll see:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

**✅ Copy this HTTPS URL** - you'll use it throughout this guide.

**💡 Pro Tip:** Create a free ngrok account at [ngrok.com](https://ngrok.com) to get:
- A custom subdomain (same URL every time)
- Longer session times

With custom subdomain:
```bash
ngrok http 3000 --subdomain=my-social-app
# Now your URL is always: https://my-social-app.ngrok.io
```

---

## Facebook & Instagram Setup

Facebook and Instagram both use Meta's platform. One app covers both!

### Step 1: Create Facebook App (10 min)

1. **Go to Meta for Developers**
   - Visit: [developers.facebook.com](https://developers.facebook.com/)
   - Click **My Apps** (top right)
   - Click **Create App**

2. **Choose App Type**
   - Select **"Business"** or **"Consumer"**
   - Click **Next**

3. **Fill in App Details**
   ```
   App Name: Social Media SaaS
   App Contact Email: your@email.com
   ```
   - Click **Create App**

4. **Complete Security Check**
   - Enter captcha or security code

### Step 2: Add Facebook Login (5 min)

1. **In your app dashboard:**
   - Find **"Add Product"** section
   - Locate **"Facebook Login"**
   - Click **Set Up**

2. **Choose Platform**
   - Select **"Web"**
   - Enter Site URL: `https://your-ngrok-url.ngrok.io`
   - Click **Save** → **Continue**

3. **Configure Settings**
   - Left sidebar: **Facebook Login** → **Settings**
   - Find **"Valid OAuth Redirect URIs"**
   - Add this EXACTLY:
     ```
     https://your-ngrok-url.ngrok.io/api/auth/facebook/callback
     ```
   - Click **Save Changes**

### Step 3: Get Facebook Credentials (2 min)

1. **Navigate to Settings**
   - Left sidebar: **Settings** → **Basic**

2. **Copy Your Credentials**
   - **App ID:** Copy this number
   - **App Secret:** Click **Show** → Copy it

3. **Save These!** You'll add them to `.env.local` soon.

### Step 4: Add Yourself as Test User (3 min)

Your app is in "Development Mode" - only you and test users can use it.

**Option A: Add Your Facebook Account**
1. Left sidebar: **Roles** → **Administrators**
2. Click **Add Administrators**
3. Enter your Facebook email or ID
4. Confirm

**Option B: Create Test Users**
1. Left sidebar: **Roles** → **Test Users**
2. Click **Add**
3. Create 1-2 test users
4. Click **Login** next to a test user to get logged in

### Step 5: Add Instagram (5 min)

Same Facebook app - just add the Instagram product!

1. **Add Instagram Product**
   - Dashboard: **Add Product**
   - Find **"Instagram Graph API"** or **"Instagram Basic Display"**
   - Click **Set Up**

2. **Configure Instagram**
   - Follow setup wizard
   - Add redirect URI:
     ```
     https://your-ngrok-url.ngrok.io/api/auth/instagram/callback
     ```

3. **Requirements for Instagram:**
   - ✅ Instagram account must be a **Business Account**
   - ✅ Instagram must be linked to a Facebook Page

   **To convert to Business Account:**
   - Open Instagram app
   - Settings → Account → Switch to Professional Account
   - Choose **Business**
   - Link to your Facebook Page

### Step 6: Request Permissions (Important!)

1. **Left sidebar:** **App Review** → **Permissions and Features**

2. **Request these permissions:**
   - ✅ `pages_manage_posts` - Post to Facebook Pages
   - ✅ `pages_read_engagement` - Read Page data
   - ✅ `instagram_basic` - Access Instagram data
   - ✅ `instagram_content_publish` - Post to Instagram

   **For Development/Testing:**
   - These work immediately without approval
   - Only you and test users can use them

   **For Production:**
   - Submit for App Review
   - Takes 3-7 days
   - Required for public users

---

## LinkedIn Setup

### Step 1: Create LinkedIn App (10 min)

1. **Go to LinkedIn Developers**
   - Visit: [linkedin.com/developers](https://www.linkedin.com/developers/)
   - Click **Create App**

2. **Fill in Required Information**
   ```
   App Name: Social Media SaaS
   LinkedIn Page: [Select your company page]
   Privacy Policy URL: https://your-ngrok-url.ngrok.io/privacy
   App Logo: Upload a 300x300 image
   Legal Agreement: Check the box
   ```

   **Don't have a LinkedIn Company Page?**
   - Create one at [linkedin.com/company/setup/new](https://www.linkedin.com/company/setup/new/)
   - Free and takes 2 minutes

3. **Click Create App**

### Step 2: Configure OAuth (5 min)

1. **Go to Auth Tab**
   - Click **"Auth"** in app settings

2. **Add Redirect URLs**
   ```
   https://your-ngrok-url.ngrok.io/api/auth/linkedin/callback
   ```
   - Click **Update**

3. **Get Your Credentials**
   - **Client ID:** Copy this
   - **Client Secret:** Copy this

### Step 3: Request Products (2 min)

1. **Go to Products Tab**
   - Click **"Products"**

2. **Request Access:**
   - ✅ **Sign In with LinkedIn** (auto-approved)
   - ✅ **Share on LinkedIn** (may require review)

   Click **Request Access** for each

---

## Twitter/X Setup

### Step 1: Create Twitter Developer Account (5 min)

1. **Apply for Developer Account**
   - Visit: [developer.twitter.com](https://developer.twitter.com/)
   - Click **Sign up** or **Apply**

2. **Fill Out Application**
   - Purpose: **Building a social media management tool**
   - How will you use the API: **Schedule posts, manage accounts**
   - Will you display tweets: **Yes**

3. **Wait for Approval**
   - Usually instant or within a few hours
   - Check your email

### Step 2: Create App (10 min)

1. **Create a Project**
   - Go to [Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Click **+ Create Project**
   - Name: **Social Media SaaS**
   - Use case: **Making a bot** or **Exploring the API**
   - Description: **Social media management platform**

2. **Create App Under Project**
   - App name: **Social Media SaaS**
   - Click **Next**

3. **Save Your Keys**
   - **API Key** (Client ID)
   - **API Secret** (Client Secret)
   - **Bearer Token**
   - Save these securely!

### Step 3: Configure OAuth 2.0 (5 min)

1. **Set Up User Authentication**
   - App Settings → **Set up** (under User authentication settings)

2. **OAuth 2.0 Settings**
   ```
   App permissions: Read and Write
   Type of App: Web App
   Callback URI: https://your-ngrok-url.ngrok.io/api/auth/twitter/callback
   Website URL: https://your-ngrok-url.ngrok.io
   ```

3. **Save**

### Step 4: Get Elevated Access (Optional)

For full API access:
1. App Settings → **Apply for Elevated**
2. Fill out use case
3. Wait 1-2 days for approval

---

## TikTok Setup

### Step 1: Create TikTok Developer Account (10 min)

1. **Go to TikTok for Developers**
   - Visit: [developers.tiktok.com](https://developers.tiktok.com/)
   - Click **Register**

2. **Create Account**
   - Use your TikTok account or create new one
   - Complete verification

### Step 2: Create App (5 min)

1. **Create New App**
   - Dashboard → **+ Add an app**
   - App name: **Social Media SaaS**
   - Category: **Social & Communication**

2. **Configure App**
   ```
   Redirect URI: https://your-ngrok-url.ngrok.io/api/auth/tiktok/callback
   ```

3. **Get Credentials**
   - **Client Key**
   - **Client Secret**

### Step 3: Request Permissions

1. **Request these scopes:**
   - ✅ `user.info.basic`
   - ✅ `video.upload`
   - ✅ `video.publish`

---

## Environment Variables

Now that you have all credentials, add them to your `.env.local` file.

### Open `.env.local` in your project root:

```bash
# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Your ngrok URL (IMPORTANT!)
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok.io

# Facebook & Instagram (same credentials)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Twitter / X
TWITTER_CLIENT_ID=your_twitter_api_key
TWITTER_CLIENT_SECRET=your_twitter_api_secret
TWITTER_BEARER_TOKEN=your_bearer_token

# TikTok
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# YouTube (optional)
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_API_KEY=your_youtube_api_key
```

### ⚠️ CRITICAL: Restart Your Dev Server

After adding environment variables:

```bash
# Stop the server (Ctrl+C in the terminal running npm run dev)
# Then restart:
npm run dev
```

**Environment variables only load on server start!**

---

## Connect Your First Account

Now the fun part - connect a real social media account!

### Step 1: Access Your App Via ngrok URL

**Open your browser and go to:**
```
https://your-ngrok-url.ngrok.io
```

**NOT** `localhost:3000` - OAuth won't work there!

### Step 2: Register or Login

1. **Register a new account:**
   - Go to: `https://your-ngrok-url.ngrok.io/register`
   - Fill in your details
   - Create account

2. **Or login:**
   - Go to: `https://your-ngrok-url.ngrok.io/login`
   - Use your credentials

### Step 3: Navigate to Settings

```
https://your-ngrok-url.ngrok.io/dashboard/settings/accounts
```

You'll see all available platforms:
- 📱 Instagram
- 👤 Facebook
- 💼 LinkedIn
- 🐦 Twitter/X
- 🎵 TikTok
- 📺 YouTube

### Step 4: Connect Facebook (Easiest First)

1. **Click "Connect Facebook"**

2. **Facebook Login Page Opens**
   - Login with your Facebook account
   - Or use a test user account

3. **Authorize the App**
   - Review permissions:
     - ✅ Manage your pages
     - ✅ Publish content to your pages
     - ✅ Read page insights
   - Click **Continue**

4. **Select Pages**
   - Choose which Facebook Pages to connect
   - At least one page is required for posting
   - Click **Done**

5. **Redirected Back to Your App**
   - You should see a success message
   - Facebook account shows **✅ Connected**
   - Displays your page name/username

### Step 5: Connect Instagram (Optional)

**Requirements first:**
- Instagram Business account
- Linked to a Facebook Page

**Then:**
1. Click **"Connect Instagram"**
2. Follow OAuth flow
3. Select Instagram Business account
4. Authorize permissions
5. Done!

### Step 6: Connect Other Platforms

Same process for each:
1. Click **"Connect [Platform]"**
2. Login to that platform
3. Authorize permissions
4. Redirected back to app
5. See ✅ Connected status

---

## Create Your First Real Post

Time to publish actual content to a real social media platform!

### Step 1: Go to Create Post

```
https://your-ngrok-url.ngrok.io/dashboard/create-post
```

### Step 2: Fill in Post Details

1. **Select Platform**
   - Check the box for **Facebook** (or any connected platform)
   - You'll see your account name appear

2. **Write Your Content**
   ```
   🚀 Testing my new social media management platform!

   Just posted this from my own app. Pretty cool!

   #SocialMedia #Testing #Developer
   ```

3. **Add Media (Optional)**

   **For Photos:**
   - Click **"Add Image"**
   - Upload from your computer
   - Or paste image URL

   **For Videos:**
   - Click **"Add Video"**
   - Upload video file (MP4, MOV)
   - Max size: Facebook 4GB, Instagram 100MB

4. **Choose When to Post**

   **Post Now:**
   - Select **"Publish immediately"**
   - Best for first test

   **Schedule for Later:**
   - Pick date and time
   - Post will publish automatically

### Step 3: Create Post

Click **"Create Post"** or **"Publish Now"**

You should see:
- ✅ Loading spinner
- ✅ Success message
- ✅ Post appears in your dashboard

### Step 4: Verify on Real Platform

**Check Facebook:**
1. Go to [facebook.com](https://facebook.com)
2. Navigate to your Page
3. **Your post should be there!** 🎉

**Check Instagram:**
1. Open Instagram app
2. Go to your profile
3. Your post appears!

---

## Test All Features

### Test Text Post

```
Just a simple text post to test the system! 📝
```

**Platforms:** Facebook, LinkedIn, Twitter

### Test Photo Post

**Content:**
```
Check out this amazing photo! 📸

#Photography #Creative
```

**Add Image:**
- Use free stock from [unsplash.com](https://unsplash.com)
- Or your own photo

**Platforms:** Facebook, Instagram, LinkedIn, Twitter

### Test Video Post

**Content:**
```
Watch this quick video! 🎥

#Video #Content
```

**Add Video:**
- Short clip (30 seconds - 2 minutes)
- MP4 format recommended
- Free stock videos: [pexels.com/videos](https://pexels.com/videos)

**Platforms:** Facebook, Instagram, TikTok, YouTube

### Test Multiple Platforms at Once

**The Power Move:**
1. Create one post
2. Select **ALL** connected platforms:
   - ✅ Facebook
   - ✅ Instagram
   - ✅ LinkedIn
   - ✅ Twitter
3. Click **Publish**
4. **One click = Posts to all platforms!** 🚀

### Test Scheduled Post

1. Create a post
2. Select **"Schedule for later"**
3. Pick a time **5 minutes from now**
4. Click **Create Post**
5. Wait 5 minutes
6. Check platform - post should appear!

### Test Analytics

After posts are published:

1. **Go to Analytics:**
   ```
   https://your-ngrok-url.ngrok.io/dashboard/analytics
   ```

2. **View Metrics:**
   - Total posts published
   - Engagement rate
   - Reach and impressions
   - Best performing posts

3. **Filter by Platform:**
   - See Facebook-only stats
   - Instagram insights
   - Compare platforms

---

## Deploy to Production

Once everything works locally, deploy for real!

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Social media integration complete"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/social-media-saas.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
   - Sign in with GitHub

2. **Import Project**
   - Click **"Add New Project"**
   - Select your GitHub repo
   - Click **Import**

3. **Configure Project**
   - Framework Preset: **Next.js** ✅ (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables**

   Click **"Environment Variables"**

   Add each one:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   TWITTER_CLIENT_ID=your_twitter_client_id
   TWITTER_CLIENT_SECRET=your_twitter_client_secret
   TIKTOK_CLIENT_KEY=your_tiktok_client_key
   TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
   ```

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Get your production URL: `https://your-app.vercel.app`

### Step 3: Update OAuth Redirect URIs

**For each platform, add production redirect URIs:**

**Facebook:**
```
https://your-app.vercel.app/api/auth/facebook/callback
```

**Instagram:**
```
https://your-app.vercel.app/api/auth/instagram/callback
```

**LinkedIn:**
```
https://your-app.vercel.app/api/auth/linkedin/callback
```

**Twitter:**
```
https://your-app.vercel.app/api/auth/twitter/callback
```

**TikTok:**
```
https://your-app.vercel.app/api/auth/tiktok/callback
```

### Step 4: Update Supabase URLs

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**

2. **Add Redirect URLs:**
   ```
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/reset-password
   ```

3. **Update Site URL:**
   ```
   https://your-app.vercel.app
   ```

### Step 5: Test Production

1. Visit `https://your-app.vercel.app`
2. Register/Login
3. Connect accounts
4. Create posts
5. Everything should work exactly like local!

### Step 6: Custom Domain (Optional)

1. **Buy a domain** (Namecheap, GoDaddy, etc.)

2. **In Vercel:**
   - Project Settings → **Domains**
   - Add your domain
   - Follow DNS instructions

3. **Update all OAuth redirects** to use your domain

---

## Troubleshooting

### "Redirect URI mismatch" Error

**Problem:** OAuth fails with redirect URI error

**Solution:**
- ✅ Ensure redirect URI in platform settings EXACTLY matches your ngrok URL
- ✅ Check for trailing slashes
- ✅ Verify HTTPS (not HTTP)
- ✅ If ngrok URL changed, update all platform settings
- ✅ Clear browser cookies and try again

### "Invalid OAuth State" Error

**Problem:** Error after OAuth redirect

**Solution:**
- ✅ Clear browser cookies
- ✅ Verify `NEXT_PUBLIC_APP_URL` in `.env.local` matches ngrok URL exactly
- ✅ Try incognito/private browsing
- ✅ Restart dev server after changing environment variables

### Post Not Appearing on Platform

**Problem:** Post created successfully but doesn't show on Facebook/Instagram

**Solution:**
- ✅ Check database - is post created with status "published"?
- ✅ Verify access token is valid (check token expiration)
- ✅ Check Facebook app has correct permissions
- ✅ Look in Facebook Page's "Posts" tab (might be filtered from main feed)
- ✅ Check API error logs in browser console

### "This app is in development mode"

**Problem:** Only you can connect accounts

**Solution:**
- **For testing:** Add users as Administrators or Test Users in Facebook app settings
- **For production:** Submit app for App Review
  - Facebook: Roles → App Review
  - Request permissions
  - Wait 3-7 days

### Access Token Expired

**Problem:** Can't post, "token expired" error

**Solution:**
- ✅ Reconnect the account (click "Reconnect" on accounts page)
- ✅ App has automatic token refresh, but manual reconnect works too
- ✅ For Facebook/Instagram: tokens expire after 60 days
- ✅ For LinkedIn: tokens expire after 60 days

### ngrok URL Keeps Changing

**Problem:** Free ngrok URL changes every restart

**Solution:**
- **Option 1:** Sign up for free ngrok account at [ngrok.com](https://ngrok.com)
  - Get a static subdomain
  - Use: `ngrok http 3000 --subdomain=my-app`
  - URL stays the same: `https://my-app.ngrok.io`

- **Option 2:** Deploy to Vercel for permanent HTTPS URL

### Video Upload Fails

**Problem:** Video doesn't upload to platform

**Solution:**
- ✅ Check video format (MP4 recommended)
- ✅ Check file size:
  - Facebook: Max 4GB
  - Instagram: Max 100MB
  - TikTok: Max 287MB
- ✅ Check duration:
  - Instagram Feed: 3-60 seconds
  - Instagram Reels: 15-90 seconds
  - Facebook: 1 second - 240 minutes
- ✅ Ensure video is publicly accessible (if using URL)

### Instagram: "Business Account Required"

**Problem:** Can't connect Instagram

**Solution:**
1. Open Instagram app
2. Settings → Account → Switch to Professional Account
3. Choose **Business**
4. Connect to a Facebook Page
5. Try connecting again

### LinkedIn: "No Company Page" Error

**Problem:** Can't create LinkedIn app

**Solution:**
1. Create a LinkedIn Company Page
2. Visit: [linkedin.com/company/setup/new](https://www.linkedin.com/company/setup/new/)
3. Fill in basic info
4. Create page (free)
5. Return to app creation

### Can't See Posts in Dashboard

**Problem:** Created posts don't show in app

**Solution:**
- ✅ Check you're viewing the right workspace
- ✅ Refresh the page
- ✅ Check database: Look in `posts` table in Supabase
- ✅ Check browser console for errors

### Permission Denied Errors

**Problem:** "Permission denied" when trying to post

**Solution:**
- ✅ Request correct permissions in platform developer console
- ✅ For Facebook: pages_manage_posts, pages_read_engagement
- ✅ For Instagram: instagram_basic, instagram_content_publish
- ✅ Reconnect account after requesting permissions

---

## 🎉 You're All Set!

You now have:
- ✅ Complete social media integration
- ✅ Real Facebook, Instagram, LinkedIn, Twitter connections
- ✅ Ability to post text, photos, videos
- ✅ Multi-platform posting
- ✅ Scheduling
- ✅ Analytics
- ✅ Production deployment ready

### Next Steps:

1. **Customize Your App**
   - Add your branding
   - Customize post templates
   - Add AI-powered caption suggestions

2. **Invite Team Members**
   - Share with your team
   - Collaborate on content

3. **Scale to Production**
   - Submit apps for review
   - Get public access approval
   - Launch to customers

4. **Add More Features**
   - Hashtag suggestions
   - Best time to post
   - Content calendar
   - A/B testing

---

## 📚 Quick Reference

### Important URLs

**Development (ngrok):**
- App: `https://your-ngrok-url.ngrok.io`
- Accounts: `https://your-ngrok-url.ngrok.io/dashboard/settings/accounts`
- Create Post: `https://your-ngrok-url.ngrok.io/dashboard/create-post`
- Analytics: `https://your-ngrok-url.ngrok.io/dashboard/analytics`

**Production:**
- App: `https://your-app.vercel.app`
- Accounts: `https://your-app.vercel.app/dashboard/settings/accounts`

### Developer Consoles

- Facebook/Instagram: [developers.facebook.com](https://developers.facebook.com/)
- LinkedIn: [linkedin.com/developers](https://www.linkedin.com/developers/)
- Twitter: [developer.twitter.com](https://developer.twitter.com/)
- TikTok: [developers.tiktok.com](https://developers.tiktok.com/)
- Supabase: [supabase.com/dashboard](https://supabase.com/dashboard)
- Vercel: [vercel.com/dashboard](https://vercel.com/dashboard)

### Support Resources

- Facebook API Docs: [developers.facebook.com/docs](https://developers.facebook.com/docs/graph-api/)
- Instagram API Docs: [developers.facebook.com/docs/instagram-api](https://developers.facebook.com/docs/instagram-api/)
- LinkedIn API Docs: [docs.microsoft.com/linkedin](https://docs.microsoft.com/en-us/linkedin/)
- Twitter API Docs: [developer.twitter.com/docs](https://developer.twitter.com/en/docs)

---

**Congratulations! You've built a complete social media management platform!** 🚀

**Time from start to first real post:** ~1 hour ⏱️

**Questions? Check the Troubleshooting section or review the platform-specific docs.**
