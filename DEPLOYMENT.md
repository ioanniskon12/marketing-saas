# 🚀 Deployment Guide - Social Media SaaS

This guide will help you deploy your app to production with real data.

---

## 📋 **Prerequisites**

**Before deploying to production:**
- [ ] Test authentication locally (see [AUTH-TESTING.md](./AUTH-TESTING.md))
- [ ] GitHub account
- [ ] Vercel account (free)
- [ ] Supabase project (production)
- [ ] Social media API keys (Facebook, Instagram, Twitter, etc.)

---

## 🔐 **Part 1: Configure Supabase Authentication**

### **1.1 Enable Email Authentication**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Enable **Email**
5. Configure email settings:
   - ✅ Enable email confirmations (recommended)
   - ✅ Enable email change confirmations
   - ✅ Set minimum password length to 8

### **1.2 Configure Email Templates**

Go to **Authentication** → **Email Templates** and customize:

#### **Confirm Signup**
```html
<h2>Welcome to Social Media SaaS!</h2>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

#### **Reset Password**
```html
<h2>Reset your password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>
<p>This link expires in 24 hours.</p>
```

### **1.3 Configure Redirect URLs**

1. Go to **Authentication** → **URL Configuration**
2. Add your production URL:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs:
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/dashboard`
     - `https://your-app.vercel.app/reset-password`

---

## 🌐 **Part 2: Deploy to Vercel**

### **2.1 Connect GitHub Repository**

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit: Social Media SaaS with auth"
git branch -M main
git remote add origin https://github.com/yourusername/social-media-saas.git
git push -u origin main
```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### **2.2 Configure Environment Variables**

In Vercel project settings → **Environment Variables**, add:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Database (optional, for direct access)
DATABASE_URL=your-supabase-database-url

# Social Media APIs
# Facebook/Instagram
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Twitter
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_BEARER_TOKEN=your-twitter-bearer-token

# TikTok
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret

# YouTube
YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-client-secret
YOUTUBE_API_KEY=your-youtube-api-key

# LinkedIn
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# App Settings
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

### **2.3 Deploy**

1. Click **"Deploy"**
2. Wait for build to complete
3. Visit your deployed app at `https://your-app.vercel.app`

---

## 🔑 **Part 3: Get Social Media API Keys**

### **Facebook/Instagram**

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add **Facebook Login** and **Instagram Basic Display** products
4. Get your **App ID** and **App Secret**
5. Configure OAuth redirect URI: `https://your-app.vercel.app/api/auth/callback/facebook`
6. Request permissions:
   - `pages_manage_posts`
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`

### **Twitter (X)**

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app
3. Get **API Key**, **API Secret**, and **Bearer Token**
4. Configure OAuth 2.0 redirect URI: `https://your-app.vercel.app/api/auth/callback/twitter`
5. Request permissions: Read and Write

### **TikTok**

1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a new app
3. Get **Client Key** and **Client Secret**
4. Configure redirect URI: `https://your-app.vercel.app/api/auth/callback/tiktok`

### **YouTube**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **YouTube Data API v3**
4. Create OAuth 2.0 credentials
5. Get **Client ID**, **Client Secret**, and **API Key**
6. Configure redirect URI: `https://your-app.vercel.app/api/auth/callback/youtube`

### **LinkedIn**

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Get **Client ID** and **Client Secret**
4. Configure redirect URI: `https://your-app.vercel.app/api/auth/callback/linkedin`
5. Request permissions: `w_member_social`, `r_liteprofile`

---

## 🗄️ **Part 4: Database Setup**

### **4.1 Run Migrations (if needed)**

If you have migration files in `supabase/migrations/`:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### **4.2 Verify Database Tables**

Check that these tables exist in Supabase:
- ✅ `workspaces`
- ✅ `workspace_members`
- ✅ `posts`
- ✅ `calendar_shares`
- ✅ `calendar_share_comments`
- ✅ `calendar_share_approvals`
- ✅ `calendar_share_activity`

---

## 📧 **Part 5: Configure Email Sending**

### **Option A: Use Supabase Auth Emails (Default)**

Supabase handles auth emails automatically. No extra configuration needed!

### **Option B: Use Custom SMTP (Advanced)**

1. In Supabase Dashboard → **Project Settings** → **Auth**
2. Enable **Custom SMTP**
3. Configure your SMTP settings (Gmail, SendGrid, etc.)

---

## ✅ **Part 6: Post-Deployment Checklist**

### **Test Authentication**

1. Visit `https://your-app.vercel.app/register`
2. Create a new account
3. Check email for confirmation link
4. Confirm email and login
5. Test forgot password flow

### **Test Features**

- [ ] Login works
- [ ] Register works
- [ ] Email confirmation works
- [ ] Password reset works
- [ ] Dashboard loads
- [ ] Can create posts
- [ ] Can share plans
- [ ] Emoji reactions work
- [ ] Auto-save works
- [ ] Notifications can be enabled

### **Configure Domain (Optional)**

1. In Vercel → **Settings** → **Domains**
2. Add your custom domain (e.g., `app.yourdomain.com`)
3. Update Supabase redirect URLs to use custom domain
4. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## 🔒 **Part 7: Security Best Practices**

### **Environment Variables**

- ✅ Never commit `.env.local` to Git
- ✅ Use different Supabase projects for dev/prod
- ✅ Rotate API keys regularly
- ✅ Enable Row Level Security (RLS) in Supabase

### **Supabase RLS Policies**

Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_share_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_share_approvals ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only see their own workspaces
CREATE POLICY "Users can view their own workspaces"
ON workspaces FOR SELECT
USING (auth.uid() IN (
  SELECT user_id FROM workspace_members
  WHERE workspace_id = workspaces.id
));

-- Add more policies as needed
```

---

## 📊 **Part 8: Monitoring & Analytics**

### **Vercel Analytics**

1. In Vercel project → **Analytics**
2. Enable **Web Analytics**
3. Monitor page views, performance

### **Supabase Monitoring**

1. Supabase Dashboard → **Database** → **Logs**
2. Monitor:
   - API requests
   - Auth events
   - Database queries
   - Error logs

---

## 🐛 **Part 9: Troubleshooting**

### **Build Fails**

```bash
# Check build logs in Vercel
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Missing dependencies

# Fix locally:
npm run build
```

### **Authentication Not Working**

- ✅ Check redirect URLs match exactly
- ✅ Verify environment variables are set
- ✅ Check Supabase project is not paused
- ✅ Clear browser cache and cookies

### **Database Connection Issues**

- ✅ Check `DATABASE_URL` is correct
- ✅ Verify Supabase project is active
- ✅ Check RLS policies aren't blocking access

---

## 🎉 **You're Live!**

Your app is now deployed with:
- ✅ Full authentication (login, register, forgot password)
- ✅ Real database with Supabase
- ✅ Production-ready hosting on Vercel
- ✅ Email notifications
- ✅ All your features working with real data!

### **Next Steps:**

1. Share your app: `https://your-app.vercel.app`
2. Invite users to register
3. Monitor usage in Vercel Analytics
4. Set up social media API connections
5. Configure custom domain (optional)

---

## 📚 **Resources**

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Meta for Developers](https://developers.facebook.com/)
- [Twitter Developer Portal](https://developer.twitter.com/)

---

## 🆘 **Need Help?**

Common issues and solutions:

**"Invalid redirect URI"**
- Make sure redirect URIs in social media platforms match exactly

**"Email not sending"**
- Check Supabase email templates are configured
- Verify SMTP settings if using custom email

**"Can't login after deployment"**
- Clear cookies and try again
- Check environment variables are set in Vercel
- Verify Supabase URLs are correct

---

**Happy Deploying! 🚀**
