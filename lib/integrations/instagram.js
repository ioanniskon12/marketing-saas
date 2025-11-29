/**
 * Instagram API Wrapper
 *
 * Handles interactions with the Instagram API including token refresh.
 * Docs: https://developers.facebook.com/docs/instagram-api/
 */

import { createClient } from '@/lib/supabase/server';

const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;

/**
 * Refresh Instagram access token
 *
 * Instagram long-lived tokens expire after 60 days.
 * This refreshes the token before expiration.
 *
 * @param {string} accountId - Social account ID
 * @returns {Promise<string>} New access token
 */
export async function refreshInstagramToken(accountId) {
  const supabase = await createClient();

  // Get account
  const { data: account, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('id', accountId)
    .eq('platform', 'instagram')
    .single();

  if (error || !account) {
    throw new Error('Instagram account not found');
  }

  // Refresh token
  const response = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${account.access_token}`
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Instagram token refresh error:', errorData);
    throw new Error('Failed to refresh Instagram token');
  }

  const data = await response.json();
  const { access_token, expires_in } = data;

  // Calculate new expiration
  const expiresAt = new Date(Date.now() + expires_in * 1000);

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
 * Get valid Instagram access token
 *
 * Checks if token is expired and refreshes if needed.
 *
 * @param {string} accountId - Social account ID
 * @returns {Promise<string>} Valid access token
 */
export async function getInstagramToken(accountId) {
  const supabase = await createClient();

  const { data: account } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('id', accountId)
    .eq('platform', 'instagram')
    .single();

  if (!account) {
    throw new Error('Instagram account not found');
  }

  // Check if token is expired or will expire in next 7 days
  const expiresAt = new Date(account.expires_at);
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (expiresAt < sevenDaysFromNow) {
    // Refresh token
    return await refreshInstagramToken(accountId);
  }

  return account.access_token;
}

/**
 * Get Instagram user profile
 *
 * @param {string} accountId - Social account ID
 * @returns {Promise<Object>} User profile data
 */
export async function getInstagramProfile(accountId) {
  const accessToken = await getInstagramToken(accountId);

  const response = await fetch(
    `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Instagram profile');
  }

  return await response.json();
}

/**
 * Get Instagram media
 *
 * @param {string} accountId - Social account ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Media data
 */
export async function getInstagramMedia(accountId, options = {}) {
  const accessToken = await getInstagramToken(accountId);
  const { limit = 25, after } = options;

  let url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`;

  if (after) {
    url += `&after=${after}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch Instagram media');
  }

  return await response.json();
}

/**
 * Publish Instagram media
 *
 * @param {string} accountId - Social account ID
 * @param {Object} media - Media data
 * @returns {Promise<Object>} Published media data
 */
export async function publishInstagramMedia(accountId, media) {
  const accessToken = await getInstagramToken(accountId);
  const { imageUrl, caption, mediaType = 'IMAGE' } = media;

  // Step 1: Create media container
  const containerParams = new URLSearchParams({
    image_url: imageUrl,
    caption: caption || '',
    access_token: accessToken,
  });

  const containerResponse = await fetch(
    `https://graph.instagram.com/me/media?${containerParams.toString()}`,
    { method: 'POST' }
  );

  if (!containerResponse.ok) {
    const errorData = await containerResponse.json();
    console.error('Instagram container creation error:', errorData);
    throw new Error('Failed to create Instagram media container');
  }

  const containerData = await containerResponse.json();
  const creationId = containerData.id;

  // Step 2: Publish the container
  const publishParams = new URLSearchParams({
    creation_id: creationId,
    access_token: accessToken,
  });

  const publishResponse = await fetch(
    `https://graph.instagram.com/me/media_publish?${publishParams.toString()}`,
    { method: 'POST' }
  );

  if (!publishResponse.ok) {
    const errorData = await publishResponse.json();
    console.error('Instagram publish error:', errorData);
    throw new Error('Failed to publish Instagram media');
  }

  return await publishResponse.json();
}

/**
 * Get Instagram insights
 *
 * @param {string} accountId - Social account ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Insights data
 */
export async function getInstagramInsights(accountId, options = {}) {
  const accessToken = await getInstagramToken(accountId);
  const { metric = 'impressions,reach,profile_views', period = 'day' } = options;

  const response = await fetch(
    `https://graph.instagram.com/me/insights?metric=${metric}&period=${period}&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Instagram insights');
  }

  return await response.json();
}

/**
 * Instagram API client class
 */
export class InstagramClient {
  constructor(accountId) {
    this.accountId = accountId;
  }

  async getProfile() {
    return await getInstagramProfile(this.accountId);
  }

  async getMedia(options) {
    return await getInstagramMedia(this.accountId, options);
  }

  async publishMedia(media) {
    return await publishInstagramMedia(this.accountId, media);
  }

  async getInsights(options) {
    return await getInstagramInsights(this.accountId, options);
  }

  async refreshToken() {
    return await refreshInstagramToken(this.accountId);
  }
}
