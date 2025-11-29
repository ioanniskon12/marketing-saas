# Facebook Posting Setup Guide

## Current Issue
You're getting a permission error when trying to post to Facebook:
```
The permission(s) pages_manage_posts are not available
```

This happens because Facebook requires App Review for most permissions in production.

---

## Quick Setup: Test Mode (Recommended for Development)

This is the fastest way to test Facebook posting functionality.

### Step 1: Access Graph API Explorer

1. Go to: https://developers.facebook.com/tools/explorer/
2. Select your app **"1401657458149402"** from the dropdown (top left)

### Step 2: Generate Page Access Token

1. Click **"Generate Access Token"** button
2. In the permissions dialog, select these permissions:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `pages_manage_metadata`
3. Click **"Generate Access Token"**
4. Log in with your Facebook account if prompted
5. You'll see a list of pages you manage
6. **Select the page** you want to post to
7. Click **"Next"** and then **"Done"**

### Step 3: Copy Your Tokens

After generating the token, you'll see:
- **Access Token**: This is your Page Access Token - copy it!
- **Page ID**: You can find this by clicking on "Get Page Info" or from your page's About section

### Step 4: Test the Connection

Update the `test-facebook-post-with-token.js` file:

```javascript
const PAGE_TOKEN = "YOUR_ACTUAL_PAGE_TOKEN_HERE";
const PAGE_ID = "YOUR_ACTUAL_PAGE_ID_HERE";
```

Then run:
```bash
node test-facebook-post-with-token.js
```

If successful, you should see:
```
✅ Successfully posted to Facebook!
Post ID: 123456789_987654321
Post URL: https://www.facebook.com/123456789_987654321
```

---

## Using Test Pages (Alternative Method)

If you want a dedicated test environment:

### Step 1: Create a Test Page

1. Go to: https://developers.facebook.com/apps/1401657458149402/roles/test-pages/
2. Click **"Add"** to create a new test page
3. Give it a name (e.g., "My Test Social Media Page")
4. Click **"Create Test Page"**

### Step 2: Get Test Page Token

1. Go to Graph API Explorer: https://developers.facebook.com/tools/explorer/
2. Follow the same steps as above
3. Select your **test page** from the list
4. Copy the token

Test pages have all permissions enabled by default, so you won't need App Review!

---

## Production Setup: App Review

For a production app that posts to real pages, you need Facebook App Review.

### Required Steps:

1. **Complete App Information**
   - Go to: https://developers.facebook.com/apps/1401657458149402/settings/basic/
   - Fill in all required fields:
     - App Icon (1024x1024px)
     - Privacy Policy URL
     - Terms of Service URL
     - Category
     - Business Use Case

2. **Submit for Review**
   - Go to: https://developers.facebook.com/apps/1401657458149402/app-review/permissions/
   - Find `pages_manage_posts` permission
   - Click **"Request"**
   - Provide:
     - Detailed description of how you use this permission
     - Screen recording showing the feature
     - Step-by-step instructions for reviewers

3. **Review Timeline**
   - Usually takes 3-7 business days
   - May require additional information
   - You'll receive email notifications

---

## Important Notes

### Token Types

1. **User Access Token**
   - Short-lived (1-2 hours)
   - Can be extended to 60 days
   - Not suitable for automated posting

2. **Page Access Token** ← This is what you need!
   - Tied to a specific page
   - Can be long-lived (never expires)
   - Perfect for automated posting

3. **App Access Token**
   - For server-to-server calls
   - Not suitable for posting

### Making Tokens Long-Lived

Short-lived tokens expire quickly. To get a long-lived token:

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=1401657458149402&\
client_secret=7fbf1231b855fb9c3312fba825c8b0d6&\
fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

This returns a long-lived token (60 days for user, never expires for page).

### Testing with Your Current Setup

Your app is already configured with:
- **App ID**: 1401657458149402
- **App Secret**: (configured in .env.local)
- **Webhook**: Set up for receiving messages

The only missing piece is the posting permission, which you can get through Test Mode immediately!

---

## Quick Start Checklist

- [ ] Go to Graph API Explorer
- [ ] Select your app (1401657458149402)
- [ ] Generate Access Token with `pages_manage_posts` permission
- [ ] Select your page
- [ ] Copy Page Access Token
- [ ] Copy Page ID
- [ ] Update `test-facebook-post-with-token.js`
- [ ] Run the test script
- [ ] Verify post appears on your Facebook page

---

## Troubleshooting

### Error: "Invalid OAuth access token"
- Your token expired - generate a new one
- Make sure you're using a Page Access Token, not User Access Token

### Error: "Permissions error"
- The user who generated the token doesn't have admin access to the page
- Generate the token while logged in as a page admin

### Error: "App not set up"
- Your app is in Development Mode
- For testing, use Graph API Explorer tokens
- For production, submit for App Review

### Post appears but with wrong author
- Make sure you're using the Page Access Token, not your personal token
- The token should be tied to the page you want to post as

---

## Next Steps

Once posting works with the test script:

1. **Store the Page Token Securely**
   - Add it to your Supabase `social_accounts` table
   - Encrypt if storing in database

2. **Integrate with Your App**
   - Your publishing code is already in `lib/publishing/facebook.js`
   - It should work once you have a valid page token

3. **Handle Token Refresh**
   - Page tokens can expire
   - Implement token refresh logic
   - Handle errors gracefully

4. **Plan for Production**
   - Submit for App Review if posting to real pages
   - Set up proper error handling
   - Add retry logic for failed posts

---

## Resources

- **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
- **Your App Dashboard**: https://developers.facebook.com/apps/1401657458149402/
- **Facebook Graph API Docs**: https://developers.facebook.com/docs/graph-api/
- **Pages API Docs**: https://developers.facebook.com/docs/pages-api/
- **App Review Guide**: https://developers.facebook.com/docs/app-review/

---

**Need Help?** Check the Facebook for Developers Community or review the official documentation.
