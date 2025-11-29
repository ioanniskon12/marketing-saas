/**
 * LinkedIn API Wrapper
 *
 * Handles interactions with the LinkedIn API.
 * Docs: https://docs.microsoft.com/en-us/linkedin/shared/integrations/
 *
 * Note: LinkedIn tokens expire after 60 days and cannot be refreshed programmatically.
 * Users must re-authenticate when their token expires.
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Get valid LinkedIn access token
 *
 * LinkedIn tokens cannot be refreshed automatically.
 * Users must re-authenticate if the token is expired.
 *
 * @param {string} accountId - Social account ID
 * @returns {Promise<string>} Valid access token
 */
export async function getLinkedInToken(accountId) {
  const supabase = await createClient();

  const { data: account } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('id', accountId)
    .eq('platform', 'linkedin')
    .single();

  if (!account) {
    throw new Error('LinkedIn account not found');
  }

  // Check if token is expired
  const expiresAt = new Date(account.expires_at);
  const now = new Date();

  if (expiresAt < now) {
    // Mark account as inactive
    await supabase
      .from('social_accounts')
      .update({ is_active: false })
      .eq('id', accountId);

    throw new Error('LinkedIn token expired. Please re-authenticate.');
  }

  return account.access_token;
}

/**
 * Get LinkedIn user profile
 *
 * @param {string} accountId - Social account ID
 * @returns {Promise<Object>} User profile data
 */
export async function getLinkedInProfile(accountId) {
  const accessToken = await getLinkedInToken(accountId);

  const response = await fetch(
    'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch LinkedIn profile');
  }

  return await response.json();
}

/**
 * Share content on LinkedIn
 *
 * @param {string} accountId - Social account ID
 * @param {Object} post - Post data
 * @returns {Promise<Object>} Published post data
 */
export async function shareOnLinkedIn(accountId, post) {
  const supabase = await createClient();
  const accessToken = await getLinkedInToken(accountId);

  // Get account to get user ID
  const { data: account } = await supabase
    .from('social_accounts')
    .select('platform_user_id')
    .eq('id', accountId)
    .single();

  if (!account) {
    throw new Error('LinkedIn account not found');
  }

  const { text, link, imageUrl } = post;

  // Build share payload
  const sharePayload = {
    author: `urn:li:person:${account.platform_user_id}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: text || '',
        },
        shareMediaCategory: imageUrl ? 'IMAGE' : link ? 'ARTICLE' : 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  // Add media if provided
  if (link) {
    sharePayload.specificContent['com.linkedin.ugc.ShareContent'].media = [
      {
        status: 'READY',
        originalUrl: link,
      },
    ];
  }

  // If image URL provided, we need to upload it first
  if (imageUrl) {
    // Note: Image upload requires additional steps
    // This is a simplified version
    sharePayload.specificContent['com.linkedin.ugc.ShareContent'].media = [
      {
        status: 'READY',
        description: {
          text: text || '',
        },
        media: imageUrl,
        title: {
          text: 'Image Post',
        },
      },
    ];
  }

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(sharePayload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('LinkedIn share error:', errorData);
    throw new Error('Failed to share on LinkedIn');
  }

  return await response.json();
}

/**
 * Get LinkedIn shares (posts)
 *
 * @param {string} accountId - Social account ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Shares data
 */
export async function getLinkedInShares(accountId, options = {}) {
  const supabase = await createClient();
  const accessToken = await getLinkedInToken(accountId);
  const { count = 25, start = 0 } = options;

  // Get account to get user ID
  const { data: account } = await supabase
    .from('social_accounts')
    .select('platform_user_id')
    .eq('id', accountId)
    .single();

  if (!account) {
    throw new Error('LinkedIn account not found');
  }

  const response = await fetch(
    `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn:li:person:${account.platform_user_id})&count=${count}&start=${start}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch LinkedIn shares');
  }

  return await response.json();
}

/**
 * Get LinkedIn organization shares (company page posts)
 *
 * @param {string} accountId - Social account ID
 * @param {string} organizationId - LinkedIn organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Shares data
 */
export async function getLinkedInOrganizationShares(accountId, organizationId, options = {}) {
  const accessToken = await getLinkedInToken(accountId);
  const { count = 25, start = 0 } = options;

  const response = await fetch(
    `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn:li:organization:${organizationId})&count=${count}&start=${start}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch LinkedIn organization shares');
  }

  return await response.json();
}

/**
 * Get LinkedIn share statistics
 *
 * @param {string} accountId - Social account ID
 * @param {string} shareId - Share URN
 * @returns {Promise<Object>} Share statistics
 */
export async function getLinkedInShareStatistics(accountId, shareId) {
  const accessToken = await getLinkedInToken(accountId);

  const response = await fetch(
    `https://api.linkedin.com/v2/socialActions/${shareId}?projection=(likesSummary,commentsSummary)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch LinkedIn share statistics');
  }

  return await response.json();
}

/**
 * Check if LinkedIn token is valid
 *
 * @param {string} accountId - Social account ID
 * @returns {Promise<boolean>} True if token is valid
 */
export async function isLinkedInTokenValid(accountId) {
  try {
    await getLinkedInToken(accountId);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * LinkedIn API client class
 */
export class LinkedInClient {
  constructor(accountId) {
    this.accountId = accountId;
  }

  async getProfile() {
    return await getLinkedInProfile(this.accountId);
  }

  async share(post) {
    return await shareOnLinkedIn(this.accountId, post);
  }

  async getShares(options) {
    return await getLinkedInShares(this.accountId, options);
  }

  async getOrganizationShares(organizationId, options) {
    return await getLinkedInOrganizationShares(this.accountId, organizationId, options);
  }

  async getShareStatistics(shareId) {
    return await getLinkedInShareStatistics(this.accountId, shareId);
  }

  async isTokenValid() {
    return await isLinkedInTokenValid(this.accountId);
  }
}
