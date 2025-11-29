# 🚀 Real Data Testing Guide

Complete guide to connect real social media accounts and test with actual posts, videos, and data.

---

## 📋 Prerequisites

Before starting:
- [x] Authentication system working locally
- [x] Supabase project configured
- [x] Development server running (`npm run dev`)

---

## 🎯 Recommended Testing Order

Start with **Facebook** (easiest) → **Instagram** → **LinkedIn** → **Twitter**

---

## Step 1: Install ngrok for Local OAuth

OAuth requires HTTPS, so use ngrok to expose your local server:

### Install ngrok:

**Mac:**
```bash
brew install ngrok
```

**Windows/Linux:**
Download from [ngrok.com](https://ngrok.com/download)

### Start ngrok:

```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

**Copy the HTTPS URL** (`https://abc123.ngrok.io`) - you'll need this for OAuth setup.

**IMPORTANT:** Keep this terminal window open while testing!

---

## Step 2: Set Up Facebook (Recommended First Platform)

Facebook is the easiest to test with and includes Instagram access.

### 2.1 Create Facebook App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose **"Business"** type
4. Fill in:
   - **App Name:** Social Media SaaS Test
   - **Contact Email:** your@email.com
5. Click **Create App**

### 2.2 Add Facebook Login Product

1. In app dashboard, click **Add Product**
2. Find **Facebook Login** → Click **Set Up**
3. Choose **Web**
4. Enter your ngrok URL: `https://abc123.ngrok.io`

### 2.3 Configure OAuth Redirect URI

1. Go to **Facebook Login** → **Settings** (left sidebar)
2. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://abc123.ngrok.io/api/auth/facebook/callback
   ```
3. Click **Save Changes**

### 2.4 Get Your Credentials

1. Go to **Settings** → **Basic** (left sidebar)
2. Copy **App ID** and **App Secret**
3. Add to `.env.local`:
   ```bash
   FACEBOOK_APP_ID=your_app_id_here
   FACEBOOK_APP_SECRET=your_app_secret_here
   NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
   ```

### 2.5 Add Test Users (For Development Mode)

1. Go to **Roles** → **Test Users**
2. Click **Add**
3. Create 1-2 test users
4. OR add your own Facebook account as a test user:
   - Go to **Roles** → **Roles**
   - Under **Administrators**, add your Facebook account

### 2.6 Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

**IMPORTANT:** Make sure to restart AFTER adding environment variables!

---

## Step 3: Connect Your First Facebook Account

### 3.1 Access Via ngrok URL

Visit: `https://abc123.ngrok.io/dashboard/settings/accounts`

(Replace with your ngrok URL)

### 3.2 Login to Your App

If not logged in:
1. Visit: `https://abc123.ngrok.io/register`
2. Create account with your email
3. Or login at: `https://abc123.ngrok.io/login`

### 3.3 Connect Facebook

1. On the **Connected Accounts** page, find **Facebook**
2. Click **Connect Facebook**
3. You'll be redirected to Facebook
4. Login and authorize the app
5. Grant permissions:
   - ✅ Manage your pages
   - ✅ Read page content
   - ✅ Publish to your pages
6. Select which Facebook Pages to connect
7. Click **Done**

### 3.4 Verify Connection

You should be redirected back to the accounts page with:
- ✅ Green "Connected" status
- Your Facebook username/page name displayed
- Token expiration date showing

---

## Step 4: Create and Publish Your First Real Post

### 4.1 Go to Create Post Page

Visit: `https://abc123.ngrok.io/dashboard/create-post`

### 4.2 Create a Test Post

1. **Select Platform:** Facebook (should show your connected account)
2. **Write Content:** "This is my first test post from Social Media SaaS! 🚀"
3. **Add Media (Optional):**
   - Upload an image
   - Or paste an image URL
4. **Schedule:**
   - Choose "Post Now" for immediate testing
   - Or schedule for 1-2 minutes from now

5. Click **Create Post**

### 4.3 Verify Post Published

**Check in App:**
- Go to `/dashboard/plans-hub`
- Look for your post in the "Scheduled" or "Published" tab
- Status should show "✅ Published"

**Check on Facebook:**
1. Go to [facebook.com](https://facebook.com)
2. Navigate to your Page
3. Your post should appear!

---

## Step 5: Add Instagram (Same Facebook App)

Instagram uses the same Facebook App!

### 5.1 Add Instagram Product

1. In your Facebook App dashboard
2. Click **Add Product**
3. Find **Instagram Basic Display** or **Instagram Graph API**
4. Click **Set Up**

### 5.2 Configure Instagram

1. Follow the setup wizard
2. Add redirect URI:
   ```
   https://abc123.ngrok.io/api/auth/instagram/callback
   ```
3. Your Facebook App ID and Secret work for Instagram too!

### 5.3 Requirements

- Instagram account must be a **Business Account**
- Instagram must be connected to a Facebook Page
- Use Facebook's Graph API to post to Instagram

### 5.4 Connect Instagram

1. Go to `/dashboard/settings/accounts`
2. Click **Connect Instagram**
3. Follow OAuth flow
4. Select your Instagram Business account

---

## Step 6: Test Real Video Upload

### 6.1 Prepare Test Video

**Requirements:**
- Format: MP4, MOV
- Max size:
  - Facebook: 4GB
  - Instagram: 100MB
  - Duration: 3 seconds - 60 minutes

### 6.2 Upload Video Post

1. Go to **Create Post**
2. Select platform: **Facebook**
3. Click **Add Media** → **Upload Video**
4. Write caption
5. Click **Post Now** or **Schedule**

### 6.3 Monitor Upload Progress

Video uploads may take time:
- Check browser console for upload progress
- Check Network tab in DevTools
- Post status will update when complete

---

## Step 7: Test Analytics & Insights

### 7.1 Fetch Facebook Insights

Once you have posts published:

1. Go to `/dashboard/analytics`
2. Select your Facebook account
3. View:
   - Post performance
   - Engagement metrics
   - Reach and impressions
   - Follower growth

### 7.2 API Testing

You can also test via API:

**Get Facebook Posts:**
```bash
curl https://abc123.ngrok.io/api/social-accounts/YOUR_ACCOUNT_ID/posts
```

**Get Insights:**
```bash
curl https://abc123.ngrok.io/api/analytics?platform=facebook&account_id=YOUR_ACCOUNT_ID
```

---

## Step 8: Testing Checklist

### Facebook
- [ ] App created on Meta for Developers
- [ ] OAuth redirect URI configured
- [ ] Environment variables added
- [ ] Account connected via UI
- [ ] Text post published successfully
- [ ] Photo post published
- [ ] Video post published (optional)
- [ ] Post appears on real Facebook page
- [ ] Analytics data fetched

### Instagram
- [ ] Instagram Graph API enabled
- [ ] Business account connected
- [ ] Image post published
- [ ] Post appears on real Instagram profile
- [ ] Stories tested (optional)

### LinkedIn
- [ ] LinkedIn app created
- [ ] Company page selected
- [ ] Account connected
- [ ] Post published to LinkedIn
- [ ] Post visible on LinkedIn profile

### Twitter/X
- [ ] Twitter app created
- [ ] Elevated access obtained (if needed)
- [ ] Account connected
- [ ] Tweet published
- [ ] Tweet visible on Twitter profile

---

## Step 9: Common Issues & Solutions

### Issue: "Redirect URI mismatch"

**Solution:**
- Ensure ngrok URL matches **exactly** in Facebook app settings
- Check for trailing slashes
- Verify HTTPS (not HTTP)
- Restart ngrok if URL changed

### Issue: "Invalid OAuth State"

**Solution:**
- Clear browser cookies
- Make sure `NEXTAUTH_URL` in `.env.local` matches ngrok URL
- Try incognito/private browsing mode

### Issue: "This app is in development mode"

**Solution:**
- Add your Facebook account as an Administrator or Tester
- Go to **Roles** in Facebook app settings
- For production, submit app for review

### Issue: Post not appearing on Facebook

**Solution:**
- Check post was created in database
- Verify Facebook access token is valid
- Check Facebook app has necessary permissions
- Look in Facebook Page's "Posts" tab (may be hidden from main feed)

### Issue: "Token expired"

**Solution:**
- Reconnect the account
- Click "Reconnect" on accounts page
- App should auto-refresh tokens, but manual reconnect also works

### Issue: ngrok URL keeps changing

**Solution:**
- Free ngrok URLs change on restart
- For testing, get a free account at ngrok.com for a static subdomain:
  ```bash
  ngrok http 3000 --subdomain=your-app-name
  ```
- Or deploy to Vercel for permanent HTTPS URL

---

## Step 10: Move to Production

Once everything works locally:

### 10.1 Deploy to Vercel

See `DEPLOYMENT.md` for full guide.

```bash
# Connect to GitHub
git add .
git commit -m "Add social media integrations"
git push

# Deploy on Vercel
vercel --prod
```

### 10.2 Update OAuth Redirect URIs

For each platform, add production redirect URIs:

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

### 10.3 Update Environment Variables

In Vercel:
```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
# ... etc
```

### 10.4 Submit for App Review

For public access:
1. Facebook: Submit for App Review
2. Request permissions: `pages_manage_posts`, `pages_read_engagement`, etc.
3. Wait 1-2 weeks for approval

---

## 🎯 Quick Start Script

Save as `start-testing.sh`:

```bash
#!/bin/bash

echo "🚀 Starting Real Data Testing..."

# Start dev server in background
echo "Starting Next.js dev server..."
npm run dev &

# Wait for server to start
sleep 5

# Start ngrok
echo "Starting ngrok..."
ngrok http 3000
```

Make executable:
```bash
chmod +x start-testing.sh
./start-testing.sh
```

---

## 📊 Test Data Examples

### Sample Post Content:

**Text Post:**
```
Excited to announce our new feature! 🎉

Check it out at our website.

#SocialMedia #Innovation #Tech
```

**Photo Post:**
```
Behind the scenes at our office today! ☕💻

Working hard to bring you the best experience.

#TeamWork #OfficeLife #Productivity
```

**Video Post:**
```
Watch our latest product demo! 🎥

See how easy it is to schedule posts across all platforms.

#ProductDemo #Tutorial #SocialMediaManagement
```

### Sample Media:

**Free Stock Photos:**
- [Unsplash](https://unsplash.com)
- [Pexels](https://pexels.com)

**Free Stock Videos:**
- [Pexels Videos](https://pexels.com/videos)
- [Pixabay Videos](https://pixabay.com/videos)

---

## ✅ You're Ready to Test Real Data!

**Workflow:**

1. **Local Setup** (30 min)
   - Install ngrok
   - Create Facebook app
   - Add environment variables
   - Restart dev server

2. **First Connection** (10 min)
   - Open ngrok URL
   - Register/login
   - Connect Facebook account
   - Verify connection

3. **First Real Post** (5 min)
   - Create test post
   - Click "Post Now"
   - Verify on Facebook

4. **Iterate & Improve** (ongoing)
   - Test different content types
   - Add more platforms
   - Test scheduling
   - Monitor analytics

5. **Production Deploy** (1-2 hours)
   - Deploy to Vercel
   - Update redirect URIs
   - Submit for app review
   - Go live!

**You're all set!** 🎉

Follow this guide step-by-step and you'll be posting real content to social media platforms within an hour.
