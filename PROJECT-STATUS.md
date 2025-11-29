# Social Media SaaS Platform - Project Status & Roadmap

**Last Updated:** November 26, 2025
**Project:** Social Media Scheduling & Management Platform
**Tech Stack:** Next.js 14, React, Supabase, Styled Components

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Current Status](#current-status)
3. [Features Implemented](#features-implemented)
4. [Known Issues](#known-issues)
5. [Technical Architecture](#technical-architecture)
6. [Next Steps Roadmap](#next-steps-roadmap)
7. [Social Media Integration Guide](#social-media-integration-guide)
8. [Testing Strategy](#testing-strategy)

---

## 🎯 Project Overview

A comprehensive social media management platform that allows users to:
- Schedule posts across multiple platforms (Instagram, Facebook, YouTube, LinkedIn, Twitter)
- Manage content calendar
- Create and edit posts with rich media
- Team collaboration with workspace management
- Analytics and insights (planned)

---

## ✅ Current Status

### **What's Working:**
- ✅ User authentication (Supabase Auth)
- ✅ Workspace management
- ✅ Post creation UI (multiple platforms)
- ✅ Content calendar (Week/Month/Day views)
- ✅ Media upload interface
- ✅ Hashtag management with chips
- ✅ Database structure for posts
- ✅ OAuth connections for social accounts
- ✅ Modern design theme (purple accent)

### **What's Partially Working:**
- ⚠️ Post creation has 400 errors (data format mismatch)
- ⚠️ Posts not appearing in calendar (due to creation errors)
- ⚠️ Social media publishing not implemented yet

### **What's Not Started:**
- ❌ Real social media API integration (Meta, YouTube, etc.)
- ❌ Post publishing to platforms
- ❌ Analytics dashboard
- ❌ AI content generation
- ❌ Team collaboration features
- ❌ Bulk scheduling

---

## 🏗️ Features Implemented

### **1. Authentication System**
**Location:** `/app/(auth)/`
- Login page
- Signup page (needs implementation)
- Password reset
- Session management with Supabase

**Files:**
- `/app/(auth)/login/page.jsx`
- `/lib/supabase/client.js`
- `/lib/supabase/server.js`

---

### **2. Post Creation Interface**
**Location:** `/app/dashboard/create-post/page.jsx`

**Features:**
- ✅ Multi-platform support (Instagram, Facebook, YouTube, LinkedIn, Twitter)
- ✅ Platform-specific composers
- ✅ Caption editor with character limits
- ✅ Media upload (images/videos)
- ✅ Media library
- ✅ Hashtag chips (Space/Enter to create)
- ✅ Schedule options (Now, Schedule, Draft)
- ✅ Date/time picker
- ✅ Modern theme only

**Platform Composers:**
- `/components/posts/composers/InstagramComposer.jsx` - Instagram posts
- `/components/posts/composers/FacebookComposer.jsx` - Facebook posts (with feelings, backgrounds)
- `/components/posts/composers/YouTubeComposer.jsx` - YouTube videos
- `/components/posts/composers/LinkedInComposer.jsx` - LinkedIn posts
- `/components/posts/composers/TwitterComposer.jsx` - Twitter/X posts
- `/components/posts/composers/BaseComposerLayout.jsx` - Shared layout

**Recent Updates:**
- Removed Classic and Compact themes (Modern only)
- Fixed hashtag chip creation with Space/Enter
- Added purple glass-morphism design
- Redesigned Post Type and Feeling sections

**Known Issues:**
- ❌ 400 errors when submitting posts
- ❌ Data format mismatch with API expectations

---

### **3. Content Calendar**
**Location:** `/app/dashboard/calendar/page.jsx`
**Component:** `/components/calendar/ContentCalendar.jsx`

**Features:**
- ✅ Three view modes (Week, Month, Day)
- ✅ Drag-and-drop post rescheduling
- ✅ Time slots (configurable: 15min, 30min, 1hr)
- ✅ Current time indicator (red horizontal line)
- ✅ Today column highlighting (purple borders)
- ✅ Post pills with platform icons
- ✅ Quick add buttons in time slots
- ✅ Timezone support (Europe/Rome default)
- ✅ Best times modal
- ✅ Upcoming posts sidebar
- ✅ Settings modal (time format, weekends, etc.)

**Calendar Settings:**
- Time format: 12h/24h
- Show/hide weekends
- Week start day: Sunday/Monday
- Time slot duration: 15min/30min/1hr
- Color coding: by platform/status/account

**Recent Fixes:**
- Fixed day border alignment in week view
- Standardized border widths (1px)
- Added box-sizing: border-box

**Known Issues:**
- ⚠️ Posts not appearing (due to creation errors)
- ⚠️ Vertical "now" indicator attempted but reverted (had React hooks errors)

---

### **4. Media Management**
**Location:** `/components/posts/media/`

**Features:**
- ✅ Inline media panel
- ✅ Drag and drop upload
- ✅ Image preview
- ✅ Video preview
- ✅ Media library modal
- ✅ Multiple file selection
- ✅ File type validation
- ✅ Size limits

**Files:**
- `/components/posts/media/InlineMediaPanel.jsx`
- `/components/posts/media/MediaLibrary.jsx`
- `/components/posts/media/MediaUploader.jsx`

---

### **5. Social Account Management**
**Location:** `/app/dashboard/accounts/page.jsx`

**Features:**
- ✅ Connect social accounts via OAuth
- ✅ View connected accounts
- ✅ Disconnect accounts
- ✅ Platform-specific settings

**API Routes:**
- `/app/api/social-accounts/route.js` - CRUD operations
- `/app/api/auth/[platform]/callback/route.js` - OAuth callbacks

**Supported Platforms:**
- Instagram (via Meta)
- Facebook (via Meta)
- YouTube (Google OAuth)
- LinkedIn
- Twitter/X

---

### **6. Database Structure**
**Location:** Supabase (PostgreSQL)

**Tables:**

**`posts` table:**
```sql
- id (uuid)
- workspace_id (uuid)
- content (text)
- content_type (text: feed, story, reel, video)
- platforms (text[])
- scheduled_for (timestamp)
- published_at (timestamp)
- status (text: draft, scheduled, publishing, published, failed)
- platform_data (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

**`post_media` table:**
```sql
- id (uuid)
- post_id (uuid)
- url (text)
- type (text: image, video)
- platform (text)
- order_index (int)
```

**`social_accounts` table:**
```sql
- id (uuid)
- workspace_id (uuid)
- platform (text)
- platform_user_id (text)
- username (text)
- access_token (text)
- refresh_token (text)
- expires_at (timestamp)
- is_active (boolean)
```

**`workspaces` table:**
```sql
- id (uuid)
- name (text)
- owner_id (uuid)
- created_at (timestamp)
```

**`workspace_members` table:**
```sql
- workspace_id (uuid)
- user_id (uuid)
- role (text: owner, admin, member)
- invited_at (timestamp)
```

---

### **7. API Routes**

**Posts API:** `/app/api/posts/route.js`
- `GET /api/posts?workspace_id=X` - Fetch posts
- `POST /api/posts` - Create post
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

**Social Accounts API:** `/app/api/social-accounts/route.js`
- `GET /api/social-accounts?workspace_id=X` - Fetch connected accounts
- `POST /api/social-accounts` - Add account
- `DELETE /api/social-accounts/:id` - Remove account

**OAuth Callbacks:** `/app/api/auth/[platform]/callback/route.js`
- Handles OAuth flow for social platforms

---

## 🐛 Known Issues

### **Critical (Blocks Core Functionality):**

1. **Post Creation 400 Errors**
   - **Issue:** POST /api/posts returns 400
   - **Cause:** Data format mismatch between frontend and API
   - **Frontend sends:** `{ caption, schedule_type, scheduled_date, account_id, platform (single) }`
   - **API expects:** `{ content, scheduled_for, platforms (array), workspace_id, post_now }`
   - **Status:** Fix attempted but needs testing
   - **Priority:** 🔴 HIGH

2. **Posts Not Appearing in Calendar**
   - **Issue:** Calendar shows no posts
   - **Cause:** Posts aren't being created due to #1
   - **Status:** Will be fixed when #1 is resolved
   - **Priority:** 🔴 HIGH

### **Medium Priority:**

3. **Hashtag String Formatting**
   - **Issue:** Hashtags saved as string vs array inconsistency
   - **Status:** Working but format varies
   - **Priority:** 🟡 MEDIUM

4. **Media Upload Storage**
   - **Issue:** Media uploaded but storage location unclear
   - **Status:** Needs Supabase Storage configuration
   - **Priority:** 🟡 MEDIUM

### **Low Priority:**

5. **Theme Switching Removed**
   - **Note:** Intentionally removed, keeping only Modern theme
   - **Status:** Complete

6. **Calendar "Now" Indicator Refactoring**
   - **Note:** Attempted vertical line refactoring but had React hooks errors
   - **Status:** Reverted to working state (purple column borders)
   - **Priority:** 🟢 LOW (enhancement)

---

## 🏛️ Technical Architecture

### **Frontend**
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Styled Components (CSS-in-JS)
- **State Management:** React Context + Hooks
- **Forms:** React Hook Form (in some components)
- **Date Handling:** date-fns
- **Icons:** Lucide React

### **Backend**
- **Framework:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage (configured but not fully used)
- **API Pattern:** RESTful

### **Deployment**
- **Platform:** Not deployed yet (running locally)
- **Recommended:** Vercel (for Next.js)
- **Database:** Supabase Cloud (already using)

### **File Structure**
```
social-media-saas/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── dashboard/
│   │   ├── calendar/
│   │   ├── create-post/
│   │   ├── accounts/
│   │   └── plans/
│   └── api/
│       ├── posts/
│       ├── social-accounts/
│       └── auth/
├── components/
│   ├── posts/
│   │   ├── composers/
│   │   └── media/
│   ├── calendar/
│   └── ui/
├── lib/
│   ├── supabase/
│   ├── permissions/
│   └── utils/
└── public/
```

---

## 🗺️ Next Steps Roadmap

### **Phase 1: Fix Core Functionality** (Week 1-2)

#### **Priority 1.1: Fix Post Creation** 🔴
**Tasks:**
- [ ] Debug 400 error in POST /api/posts
- [ ] Fix data format in create-post/page.jsx handleSubmit
- [ ] Test post creation with console logs
- [ ] Verify posts save to database
- [ ] Confirm posts appear in calendar

**Files to modify:**
- `/app/dashboard/create-post/page.jsx` (lines 180-250)
- `/app/api/posts/route.js` (validation logic)

**Expected format:**
```javascript
const postData = {
  workspace_id: currentWorkspace.id,
  content: caption,
  platforms: [platform], // Array!
  media: media,
  hashtags: hashtags,
  scheduled_for: scheduledDate?.toISOString(),
  status: isDraft ? 'draft' : 'scheduled',
  post_now: scheduleType === 'now',
  platform_data: {
    [platform]: {
      account_id: selectedAccount.id,
      ...platformSpecificData
    }
  }
};
```

#### **Priority 1.2: Test Calendar Display** 🟡
**Tasks:**
- [ ] Create test posts manually in database
- [ ] Verify calendar fetches and displays posts
- [ ] Test drag-and-drop rescheduling
- [ ] Test date filtering
- [ ] Test all three view modes (Day/Week/Month)

#### **Priority 1.3: Configure Media Storage** 🟡
**Tasks:**
- [ ] Set up Supabase Storage bucket
- [ ] Configure public/private access
- [ ] Update MediaUploader to use Supabase Storage
- [ ] Test image/video uploads
- [ ] Generate and store thumbnails

---

### **Phase 2: Social Media Integration** (Week 3-6)

#### **Step 2.1: Choose Starting Platform**
**Recommendation:** Start with Instagram/Facebook (Meta Graph API)

**Why Meta First:**
- Single API for both platforms
- Best documentation
- Easiest OAuth flow
- Most popular use case

#### **Step 2.2: Set Up Meta Developer Account**
**Tasks:**
- [ ] Create Meta Developer account
- [ ] Create Meta App
- [ ] Enable Instagram Basic Display API
- [ ] Enable Facebook Pages API
- [ ] Add test users
- [ ] Get App ID and App Secret
- [ ] Configure OAuth redirect URLs

**Required URLs:**
```
Development: http://localhost:3000/api/auth/instagram/callback
Production: https://yourdomain.com/api/auth/instagram/callback
```

#### **Step 2.3: Implement Meta OAuth**
**Tasks:**
- [ ] Create OAuth initiation endpoint
- [ ] Handle OAuth callback
- [ ] Exchange code for access token
- [ ] Store tokens in database
- [ ] Implement token refresh logic
- [ ] Handle token expiration

**Files to create/modify:**
- `/app/api/auth/instagram/route.js` - Initiate OAuth
- `/app/api/auth/instagram/callback/route.js` - Handle callback
- `/lib/integrations/meta.js` - Meta API client

#### **Step 2.4: Implement Post Publishing**
**Tasks:**
- [ ] Create Instagram publish function
- [ ] Create Facebook publish function
- [ ] Handle media upload to Meta
- [ ] Handle post scheduling via Meta
- [ ] Implement error handling
- [ ] Add retry logic
- [ ] Update post status after publishing

**Files to create:**
- `/lib/integrations/instagram.js`
- `/lib/integrations/facebook.js`
- `/lib/publisher/index.js` - Main publisher service

**Example Instagram Publish:**
```javascript
async function publishInstagram(post, account) {
  // 1. Upload media to Instagram
  const mediaId = await uploadMediaToInstagram(
    account.access_token,
    post.media[0].url,
    post.content
  );

  // 2. Publish media container
  const result = await publishMediaContainer(
    account.access_token,
    account.platform_user_id,
    mediaId
  );

  // 3. Update post status in database
  await updatePostStatus(post.id, 'published', result.id);

  return result;
}
```

#### **Step 2.5: Implement Post Scheduler**
**Tasks:**
- [ ] Create cron job for scheduled posts
- [ ] Check posts scheduled in next 5 minutes
- [ ] Publish posts at scheduled time
- [ ] Handle failures and retries
- [ ] Send notifications on success/failure

**Files to create:**
- `/app/api/cron/publish-scheduled-posts/route.js`
- `/lib/scheduler/index.js`

**Deployment:**
- Use Vercel Cron Jobs (free tier: 1 per day)
- Or use external cron service (cron-job.org)
- Or use Supabase Edge Functions

---

### **Phase 3: Additional Platforms** (Week 7-10)

#### **Step 3.1: YouTube Integration**
**Tasks:**
- [ ] Set up Google Cloud Console project
- [ ] Enable YouTube Data API v3
- [ ] Configure OAuth consent screen
- [ ] Implement OAuth flow
- [ ] Upload video to YouTube
- [ ] Set video metadata (title, description, tags)
- [ ] Handle video processing status
- [ ] Schedule video publication

**Complexity:** Medium
**API Docs:** https://developers.google.com/youtube/v3

#### **Step 3.2: LinkedIn Integration**
**Tasks:**
- [ ] Create LinkedIn App
- [ ] Request API access
- [ ] Implement OAuth flow
- [ ] Publish text posts
- [ ] Upload media (images/videos)
- [ ] Handle article posts

**Complexity:** Medium
**API Docs:** https://learn.microsoft.com/en-us/linkedin/

#### **Step 3.3: Twitter/X Integration**
**Tasks:**
- [ ] Apply for Twitter Developer account
- [ ] Get Elevated Access (required for posting)
- [ ] Pay for API access ($100/month minimum)
- [ ] Implement OAuth 2.0 flow
- [ ] Post tweets
- [ ] Upload media
- [ ] Handle threads

**Complexity:** Hard
**Cost:** $100-$5000/month
**API Docs:** https://developer.twitter.com/

#### **Step 3.4: TikTok Integration**
**Tasks:**
- [ ] Create TikTok Developer account
- [ ] Create TikTok App
- [ ] Apply for Content Posting API access (requires review)
- [ ] Implement Login Kit (OAuth 2.0)
- [ ] Implement video upload endpoint
- [ ] Handle video processing and publish
- [ ] Add hashtags and mentions
- [ ] Handle privacy settings (Public/Friends/Private)
- [ ] Implement video editing features (trim, effects)

**Complexity:** Medium-Hard
**API Access:** Requires app review (1-2 weeks)
**Cost:** Free for approved developers
**API Docs:** https://developers.tiktok.com/

**TikTok Requirements:**
- Business or Creator account
- Must have active posting history
- App review for Content Posting API
- Supports videos only (no images)
- Video requirements: 3sec - 10min, max 4GB
- Supports vertical (9:16) and square (1:1) formats

**Implementation Example:**
```javascript
async function publishTikTok(post, account) {
  const { access_token } = account;
  const { content, media, hashtags } = post;

  try {
    // Step 1: Initialize video upload
    const initResponse = await fetch(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          post_info: {
            title: content,
            privacy_level: 'SELF_ONLY', // or PUBLIC_TO_EVERYONE
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
            video_cover_timestamp_ms: 1000
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: media[0].size,
            chunk_size: 10485760, // 10MB chunks
            total_chunk_count: Math.ceil(media[0].size / 10485760)
          }
        })
      }
    );

    const { data } = await initResponse.json();
    const { publish_id, upload_url } = data;

    // Step 2: Upload video file
    const videoFile = await fetch(media[0].url).then(r => r.blob());
    await fetch(upload_url, {
      method: 'PUT',
      body: videoFile,
      headers: {
        'Content-Type': 'video/mp4'
      }
    });

    // Step 3: Complete upload
    const completeResponse = await fetch(
      'https://open.tiktokapis.com/v2/post/publish/status/fetch/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          publish_id: publish_id
        })
      }
    );

    const result = await completeResponse.json();

    return {
      success: true,
      post_id: result.data.video_id,
      share_url: result.data.share_url,
      published_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('TikTok publish error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

**OAuth Flow:**
```javascript
// 1. Redirect user to TikTok authorization
const authUrl = `https://www.tiktok.com/v2/auth/authorize/?` +
  `client_key=${TIKTOK_CLIENT_KEY}` +
  `&scope=user.info.basic,video.upload,video.publish` +
  `&response_type=code` +
  `&redirect_uri=${TIKTOK_REDIRECT_URI}` +
  `&state=${STATE}`;

// 2. Handle callback and exchange code for token
const tokenResponse = await fetch(
  'https://open.tiktokapis.com/v2/oauth/token/',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: TIKTOK_REDIRECT_URI
    })
  }
);

const { access_token, refresh_token, expires_in } = await tokenResponse.json();
```

**Environment Variables:**
```env
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_REDIRECT_URI=http://localhost:3000/api/auth/tiktok/callback
```

---

### **Phase 4: Analytics & Insights** (Week 11-14)

#### **Step 4.1: Database Schema for Analytics**
**Tasks:**
- [ ] Create `post_analytics` table
- [ ] Create `post_insights` table
- [ ] Store engagement metrics (likes, comments, shares, views)
- [ ] Create aggregation queries

**Schema:**
```sql
CREATE TABLE post_analytics (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  platform TEXT,
  reach INT,
  impressions INT,
  engagement INT,
  likes INT,
  comments INT,
  shares INT,
  saves INT,
  clicks INT,
  recorded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Step 4.2: Fetch Analytics from Platforms**
**Tasks:**
- [ ] Implement Instagram Insights API
- [ ] Implement Facebook Insights API
- [ ] Implement YouTube Analytics API
- [ ] Implement LinkedIn Analytics API
- [ ] Schedule daily analytics sync
- [ ] Store historical data

#### **Step 4.3: Analytics Dashboard**
**Tasks:**
- [ ] Create analytics page UI
- [ ] Show overview metrics (total reach, engagement rate)
- [ ] Create charts (line, bar, pie)
- [ ] Filter by date range
- [ ] Filter by platform
- [ ] Compare posts
- [ ] Best performing content

**Libraries:**
- Chart.js or Recharts for graphs
- date-fns for date handling

---

### **Phase 5: Advanced Features** (Week 15+)

#### **Feature 5.1: AI Content Generation**
**Tasks:**
- [ ] Integrate OpenAI API
- [ ] Create caption generation endpoint
- [ ] Add "Generate Caption" button
- [ ] Add hashtag suggestions
- [ ] Add image description generation
- [ ] Add content improvement suggestions

**Cost:** $0.002-0.03 per request (GPT-3.5/4)

#### **Feature 5.2: Team Collaboration**
**Tasks:**
- [ ] Implement role-based permissions
- [ ] Add team member invitations
- [ ] Create approval workflows
- [ ] Add comments on posts
- [ ] Activity log

#### **Feature 5.3: Bulk Scheduling**
**Tasks:**
- [ ] CSV upload for bulk posts
- [ ] Drag multiple posts to calendar
- [ ] Auto-schedule based on best times
- [ ] Content recycling

#### **Feature 5.4: Content Library**
**Tasks:**
- [ ] Organize media by folders/tags
- [ ] Search and filter media
- [ ] Saved captions/templates
- [ ] Brand kit (colors, fonts, logos)

---

## 🔗 Social Media Integration Guide

### **Meta (Instagram/Facebook) Setup**

#### **Step 1: Create Meta App**
1. Go to https://developers.facebook.com/
2. Click "My Apps" → "Create App"
3. Choose "Business" as app type
4. Fill in app name: "YourApp Social Scheduler"
5. Add app email

#### **Step 2: Configure App**
1. Go to Settings → Basic
2. Add App Domain: `localhost` (for development)
3. Add Privacy Policy URL (required for review)
4. Add Terms of Service URL (required for review)

#### **Step 3: Add Products**
1. Click "+ Add Product"
2. Add "Instagram Basic Display"
3. Add "Facebook Login"

#### **Step 4: Instagram Basic Display Settings**
1. Go to Instagram Basic Display → Settings
2. Add redirect URI: `http://localhost:3000/api/auth/instagram/callback`
3. Add deauthorize callback: `http://localhost:3000/api/auth/instagram/deauthorize`
4. Add data deletion request: `http://localhost:3000/api/auth/instagram/delete`
5. Save changes

#### **Step 5: Get Credentials**
1. Go to Settings → Basic
2. Copy App ID
3. Copy App Secret
4. Add to `.env.local`:
```env
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback
```

#### **Step 6: Add Test Users**
1. Go to Roles → Test Users
2. Add your Instagram account as test user
3. Accept invitation on Instagram

#### **Step 7: Get Instagram Business Account**
1. Convert your Instagram to Business Account
2. Link to Facebook Page
3. Get Instagram Business Account ID

**Important Notes:**
- Test users can access app without review
- App review required for production (1-2 weeks)
- Need Business Instagram account (not Creator)
- Access tokens expire in 60 days (need refresh)

---

### **Publishing Implementation Example**

**File:** `/lib/integrations/instagram.js`
```javascript
export async function publishInstagramPost(post, account) {
  const { access_token, platform_user_id } = account;
  const { content, media } = post;

  try {
    // Step 1: Upload media to Instagram
    const uploadResponse = await fetch(
      `https://graph.facebook.com/v18.0/${platform_user_id}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: media[0].url,
          caption: content,
          access_token: access_token
        })
      }
    );

    const { id: creation_id } = await uploadResponse.json();

    // Step 2: Publish the media container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${platform_user_id}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: creation_id,
          access_token: access_token
        })
      }
    );

    const result = await publishResponse.json();

    return {
      success: true,
      post_id: result.id,
      published_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('Instagram publish error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

**File:** `/app/api/posts/publish/route.js`
```javascript
import { publishInstagramPost } from '@/lib/integrations/instagram';
import { publishFacebookPost } from '@/lib/integrations/facebook';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  const supabase = await createClient();
  const { post_id } = await request.json();

  // Get post and account details
  const { data: post } = await supabase
    .from('posts')
    .select('*, social_accounts(*)')
    .eq('id', post_id)
    .single();

  const account = post.social_accounts;
  let result;

  // Publish based on platform
  switch (account.platform) {
    case 'instagram':
      result = await publishInstagramPost(post, account);
      break;
    case 'facebook':
      result = await publishFacebookPost(post, account);
      break;
    // Add more platforms...
  }

  // Update post status
  if (result.success) {
    await supabase
      .from('posts')
      .update({
        status: 'published',
        published_at: result.published_at,
        platform_post_id: result.post_id
      })
      .eq('id', post_id);
  } else {
    await supabase
      .from('posts')
      .update({
        status: 'failed',
        error_message: result.error
      })
      .eq('id', post_id);
  }

  return Response.json(result);
}
```

---

## 🧪 Testing Strategy

### **Unit Testing**
**Framework:** Jest + React Testing Library

**Test Files to Create:**
```
__tests__/
├── components/
│   ├── calendar/
│   │   └── ContentCalendar.test.js
│   └── posts/
│       └── composers/
│           └── InstagramComposer.test.js
├── lib/
│   └── integrations/
│       └── instagram.test.js
└── api/
    └── posts/
        └── route.test.js
```

**Example Test:**
```javascript
import { render, screen } from '@testing-library/react';
import ContentCalendar from '@/components/calendar/ContentCalendar';

describe('ContentCalendar', () => {
  it('renders week view by default', () => {
    render(<ContentCalendar posts={[]} />);
    expect(screen.getByText('Week')).toBeInTheDocument();
  });

  it('displays posts in calendar', () => {
    const posts = [{
      id: '1',
      content: 'Test post',
      scheduled_for: new Date().toISOString()
    }];

    render(<ContentCalendar posts={posts} />);
    expect(screen.getByText('Test post')).toBeInTheDocument();
  });
});
```

### **Integration Testing**
**Framework:** Playwright or Cypress

**Test Scenarios:**
- [ ] User can create a post
- [ ] User can schedule a post
- [ ] Post appears in calendar
- [ ] User can drag post to reschedule
- [ ] User can connect Instagram account
- [ ] User can publish post to Instagram

### **Manual Testing Checklist**

**Post Creation Flow:**
- [ ] Open create-post page
- [ ] Select Instagram platform
- [ ] Enter caption text
- [ ] Add hashtags
- [ ] Upload image
- [ ] Set schedule time
- [ ] Click "Schedule Post"
- [ ] Verify post appears in calendar

**Calendar Navigation:**
- [ ] Switch between Day/Week/Month views
- [ ] Navigate to previous/next period
- [ ] Drag post to new time slot
- [ ] Click post to view details
- [ ] Filter by platform

**Social Account Connection:**
- [ ] Click "Connect Instagram"
- [ ] Complete OAuth flow
- [ ] Verify account appears in list
- [ ] Disconnect account
- [ ] Reconnect account

---

## 📝 Environment Variables

**File:** `.env.local`
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Meta (Facebook/Instagram)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_REDIRECT_URI=http://localhost:3000/api/auth/meta/callback

# Google (YouTube)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback

# Twitter/X
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Deployment Checklist

### **Pre-Deployment:**
- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Test data removed
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] SEO meta tags added
- [ ] Analytics configured

### **Vercel Deployment:**
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy
5. Configure custom domain
6. Update OAuth redirect URLs to production domain

### **Post-Deployment:**
- [ ] Update Meta App redirect URLs
- [ ] Update Google OAuth redirect URLs
- [ ] Test OAuth flows in production
- [ ] Test post creation in production
- [ ] Monitor error logs
- [ ] Set up alerts

---

## 📚 Resources

### **Documentation:**
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Meta Graph API](https://developers.facebook.com/docs/graph-api)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [LinkedIn API](https://learn.microsoft.com/en-us/linkedin/)

### **Tools:**
- [Postman](https://www.postman.com/) - API testing
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/) - Test Meta APIs
- [Supabase Studio](https://app.supabase.com/) - Database management

---

## 📞 Support & Collaboration

**GitHub Repository:** (Add your repo URL)
**Project Lead:** (Your name)
**Last Updated:** November 26, 2025

---

## ✅ Quick Start Summary

### **To Continue Development:**

1. **Fix Post Creation (URGENT):**
   ```bash
   # Test post creation
   # Check console for errors
   # Verify data format matches API
   ```

2. **Set Up Meta Developer Account:**
   - Create app at developers.facebook.com
   - Get App ID and Secret
   - Add to .env.local

3. **Test Local Flow:**
   - Create post → Save → View in calendar

4. **Implement Instagram Publishing:**
   - Follow Meta integration guide above
   - Test with test account
   - Deploy and go live!

---

*This documentation will be updated as the project progresses.*
