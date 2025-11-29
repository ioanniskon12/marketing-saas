/**
 * Facebook API Wrapper
 *
 * Handles interactions with the Facebook Graph API including token refresh.
 * Docs: https://developers.facebook.com/docs/graph-api/
 */

import { createClient } from '@/lib/supabase/server';

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;

/**
 * Refresh Facebook access token
 *
 * Facebook long-lived tokens expire after 60 days.
 * This exchanges the current token for a new one.
 *
 * @param {string} accountId - Social account ID
 * @returns {Promise<string>} New access token
 */
export async function refreshFacebookToken(accountId) {
  const supabase = await createClient();

  // Get account
  const { data: account, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('id', accountId)
    .eq('platform', 'facebook')
    .single();

  if (error || !account) {
    throw new Error('Facebook account not found');
  }

  // Exchange for new long-lived token
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: FACEBOOK_CLIENT_ID,
    client_secret: FACEBOOK_CLIENT_SECRET,
    fb_exchange_token: account.access_token,
  });

  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Facebook token refresh error:', errorData);
    throw new Error('Failed to refresh Facebook token');
  }

  const data = await response.json();
  const { access_token, expires_in } = data;

  // Calculate new expiration (default 60 days if not provided)
  const expiresAt = new Date(Date.now() + (expires_in || 5184000) * 1000);

  // Update account with new token
  await supabase
    .from('social_accounts')
    .update({
      access_token,
      expires_at: expiresAt.toISOString(),
      last_sync_at: new Date().toISOString(),
    })
    .eq('id', accountId);

  return access_token;
}

/**
 * Get valid Facebook access token
 *
 * Checks if token is expired and refreshes if needed.
 *
 * @param {string} accountId - Social account ID
 * @returns {Promise<string>} Valid access token
 */
export async function getFacebookToken(accountId) {
  const supabase = await createClient();

  const { data: account } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('id', accountId)
    .eq('platform', 'facebook')
    .single();

  if (!account) {
    throw new Error('Facebook account not found');
  }

  // Check if token is expired or will expire in next 7 days
  const expiresAt = new Date(account.expires_at);
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (expiresAt < sevenDaysFromNow) {
    // Refresh token
    return await refreshFacebookToken(accountId);
  }

  return account.access_token;
}

/**
 * Get Facebook user profile
 *
 * @param {string} accountId - Social account ID
 * @returns {Promise<Object>} User profile data
 */
export async function getFacebookProfile(accountId) {
  const accessToken = await getFacebookToken(accountId);

  const response = await fetch(
    `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Facebook profile');
  }

  return await response.json();
}

/**
 * Get Facebook pages
 *
 * @param {string} accountId - Social account ID
 * @returns {Promise<Array>} List of pages
 */
export async function getFacebookPages(accountId) {
  const accessToken = await getFacebookToken(accountId);

  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Facebook pages');
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Publish to Facebook page
 *
 * @param {string} accountId - Social account ID
 * @param {string} pageId - Facebook page ID
 * @param {Object} post - Post data
 * @returns {Promise<Object>} Published post data
 */
export async function publishFacebookPost(accountId, pageId, post) {
  const supabase = await createClient();
  const { message, link, imageUrl } = post;

  // Get account to access page token
  const { data: account } = await supabase
    .from('social_accounts')
    .select('platform_data')
    .eq('id', accountId)
    .single();

  if (!account) {
    throw new Error('Facebook account not found');
  }

  // Find page access token
  const page = account.platform_data?.pages?.find(p => p.id === pageId);
  if (!page || !page.access_token) {
    throw new Error('Page not found or missing access token');
  }

  let endpoint = `https://graph.facebook.com/v18.0/${pageId}/feed`;
  const params = {
    message,
    access_token: page.access_token,
  };

  if (link) {
    params.link = link;
  }

  // If image URL provided, use photos endpoint
  if (imageUrl) {
    endpoint = `https://graph.facebook.com/v18.0/${pageId}/photos`;
    params.url = imageUrl;
    params.caption = message;
    delete params.message;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Facebook post error:', errorData);
    throw new Error('Failed to publish Facebook post');
  }

  return await response.json();
}

/**
 * Get Facebook page posts
 *
 * @param {string} accountId - Social account ID
 * @param {string} pageId - Facebook page ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Posts data
 */
export async function getFacebookPosts(accountId, pageId, options = {}) {
  const supabase = await createClient();
  const { limit = 25 } = options;

  // Get account to access page token
  const { data: account } = await supabase
    .from('social_accounts')
    .select('platform_data')
    .eq('id', accountId)
    .single();

  if (!account) {
    throw new Error('Facebook account not found');
  }

  // Find page access token
  const page = account.platform_data?.pages?.find(p => p.id === pageId);
  if (!page || !page.access_token) {
    throw new Error('Page not found or missing access token');
  }

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,created_time,full_picture,permalink_url,likes.summary(true),comments.summary(true)&limit=${limit}&access_token=${page.access_token}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Facebook posts');
  }

  return await response.json();
}

/**
 * Get Facebook page insights
 *
 * @param {string} accountId - Social account ID
 * @param {string} pageId - Facebook page ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Insights data
 */
export async function getFacebookInsights(accountId, pageId, options = {}) {
  const supabase = await createClient();
  const { metric = 'page_impressions,page_engaged_users,page_post_engagements', period = 'day' } = options;

  // Get account to access page token
  const { data: account } = await supabase
    .from('social_accounts')
    .select('platform_data')
    .eq('id', accountId)
    .single();

  if (!account) {
    throw new Error('Facebook account not found');
  }

  // Find page access token
  const page = account.platform_data?.pages?.find(p => p.id === pageId);
  if (!page || !page.access_token) {
    throw new Error('Page not found or missing access token');
  }

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}/insights?metric=${metric}&period=${period}&access_token=${page.access_token}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Facebook insights');
  }

  return await response.json();
}

/**
 * Facebook API client class
 */
export class FacebookClient {
  constructor(accountId) {
    this.accountId = accountId;
  }

  async getProfile() {
    return await getFacebookProfile(this.accountId);
  }

  async getPages() {
    return await getFacebookPages(this.accountId);
  }

  async publishPost(pageId, post) {
    return await publishFacebookPost(this.accountId, pageId, post);
  }

  async getPosts(pageId, options) {
    return await getFacebookPosts(this.accountId, pageId, options);
  }

  async getInsights(pageId, options) {
    return await getFacebookInsights(this.accountId, pageId, options);
  }

  async refreshToken() {
    return await refreshFacebookToken(this.accountId);
  }
}
