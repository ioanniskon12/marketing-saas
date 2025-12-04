/**
 * OAuth Configuration for Social Media Platforms
 *
 * Centralized OAuth configuration and helper functions for connecting
 * to various social media platforms
 */

export const OAUTH_CONFIG = {
  instagram: {
    // Instagram Business API uses Facebook OAuth
    authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    // Instagram Business uses Page tokens, so we need Page permissions
    // pages_manage_posts is required for publishing to Instagram via connected Page
    scope: 'public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic',
    clientId: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI,
  },
  facebook: {
    authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    // Basic permissions that work without App Review
    // Advanced permissions (pages_manage_posts, etc.) require App Review approval
    scope: 'public_profile,pages_show_list,pages_read_engagement,pages_messaging,pages_manage_posts,business_management',
    clientId: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    redirectUri: process.env.FACEBOOK_REDIRECT_URI,
  },
  linkedin: {
    authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scope: 'r_liteprofile,w_member_social',
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI,
  },
  twitter: {
    authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scope: 'tweet.read,tweet.write,users.read,offline.access',
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    redirectUri: process.env.TWITTER_REDIRECT_URI,
  },
  tiktok: {
    authorizationUrl: 'https://www.tiktok.com/auth/authorize/',
    tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
    scope: 'user.info.basic,video.list,video.upload',
    clientId: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    redirectUri: process.env.TIKTOK_REDIRECT_URI,
  },
  youtube: {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube',
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri: process.env.YOUTUBE_REDIRECT_URI,
  },
};

/**
 * Generate OAuth authorization URL for a platform
 */
export function getAuthorizationUrl(platform, state) {
  const config = OAUTH_CONFIG[platform];
  if (!config) {
    throw new Error(`OAuth config not found for platform: ${platform}`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: 'code',
    state,
  });

  // Platform-specific parameters
  if (platform === 'twitter') {
    // Generate proper PKCE code_verifier (random string)
    const codeVerifier = generateCodeVerifier();

    // For Twitter, we'll use 'plain' method which means code_challenge = code_verifier
    // This is simpler and still secure for Twitter OAuth 2.0
    params.append('code_challenge', codeVerifier);
    params.append('code_challenge_method', 'plain');

    // Store code_verifier in the state so we can retrieve it later
    // Decode state, add verifier, re-encode
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
    stateData.codeVerifier = codeVerifier;
    const newState = Buffer.from(JSON.stringify(stateData)).toString('base64');
    params.set('state', newState);
  }

  return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * Generate a random code verifier for PKCE
 */
function generateCodeVerifier() {
  const length = 128;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const randomValues = new Uint8Array(length);

  // Use crypto for random values
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomValues);
  } else {
    // Node.js environment
    const crypto = require('crypto');
    crypto.randomFillSync(randomValues);
  }

  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }

  return result;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(platform, code, codeVerifier = null) {
  const config = OAUTH_CONFIG[platform];
  if (!config) {
    throw new Error(`OAuth config not found for platform: ${platform}`);
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  });

  // Add code_verifier for PKCE (Twitter)
  if (platform === 'twitter' && codeVerifier) {
    body.append('code_verifier', codeVerifier);
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return await response.json();
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(platform, refreshToken) {
  const config = OAUTH_CONFIG[platform];
  if (!config) {
    throw new Error(`OAuth config not found for platform: ${platform}`);
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  return await response.json();
}

/**
 * Get user profile information from platform
 */
export async function getUserProfile(platform, accessToken) {
  // For Facebook and Instagram, we need to get Pages/Business accounts
  if (platform === 'facebook') {
    return await getFacebookPages(accessToken);
  }

  if (platform === 'instagram') {
    return await getInstagramBusinessAccount(accessToken);
  }

  const profileUrls = {
    linkedin: 'https://api.linkedin.com/v2/me',
    twitter: 'https://api.twitter.com/2/users/me',
    tiktok: 'https://open-api.tiktok.com/user/info/',
    youtube: 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
  };

  const url = profileUrls[platform];
  if (!url) {
    throw new Error(`Profile URL not found for platform: ${platform}`);
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch user profile: ${error}`);
  }

  return await response.json();
}

/**
 * Get Facebook Pages the user manages
 */
async function getFacebookPages(accessToken) {
  // First try /me/accounts
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,category,picture&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Facebook Pages: ${error}`);
  }

  const data = await response.json();

  // Debug logging
  console.log('Facebook /me/accounts response:', JSON.stringify(data, null, 2));

  // If /me/accounts returns data, use it
  if (data.data && data.data.length > 0) {
    const page = data.data[0];
    return {
      id: page.id,
      name: page.name,
      access_token: page.access_token,
      category: page.category,
      picture: page.picture?.data?.url,
      isPage: true,
    };
  }

  // If /me/accounts is empty, try getting Pages through Business Manager
  console.log('No pages from /me/accounts, trying Business Manager...');

  const businessResponse = await fetch(
    `https://graph.facebook.com/v18.0/me/businesses?fields=id,name,owned_pages{id,name,access_token,category,picture}&access_token=${accessToken}`
  );

  if (businessResponse.ok) {
    const businessData = await businessResponse.json();
    console.log('Business Manager response:', JSON.stringify(businessData, null, 2));

    // Find first business with owned pages
    for (const business of businessData.data || []) {
      if (business.owned_pages?.data?.length > 0) {
        const page = business.owned_pages.data[0];
        return {
          id: page.id,
          name: page.name,
          access_token: page.access_token,
          category: page.category,
          picture: page.picture?.data?.url,
          isPage: true,
        };
      }
    }
  }

  throw new Error(`Connection failed - Please follow these steps:

1. Go to Facebook Settings > Business Integrations and remove this app
2. Try connecting again
3. When Facebook shows "Choose Pages" - select your Facebook Page (e.g., "Owlmarketing")
4. When Facebook shows "Choose Businesses" - select the BUSINESS that owns your Page (e.g., "Jandro.co.uk"), NOT your app name

Common mistake: Don't select your App name in Businesses - select the Business that owns your Facebook Page.

If you're unsure which Business owns your Page, go to business.facebook.com > Settings > Pages to see which Business contains your Page.`);
}

/**
 * Get Instagram Business Account connected to a Facebook Page
 */
async function getInstagramBusinessAccount(accessToken) {
  // First get the user's Facebook Pages
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,profile_picture_url,name}&access_token=${accessToken}`
  );

  if (!pagesResponse.ok) {
    const error = await pagesResponse.text();
    throw new Error(`Failed to fetch Facebook Pages: ${error}`);
  }

  const pagesData = await pagesResponse.json();

  if (!pagesData.data || pagesData.data.length === 0) {
    throw new Error('No Facebook Pages found. Please create a Facebook Page first.');
  }

  // Find a page with an Instagram Business account connected
  const pageWithInstagram = pagesData.data.find(page => page.instagram_business_account);

  if (!pageWithInstagram) {
    throw new Error(
      'No Instagram Business account found. Please connect your Instagram Business or Creator account to your Facebook Page. ' +
      'Go to your Facebook Page Settings > Linked Accounts > Instagram to connect it.'
    );
  }

  const igAccount = pageWithInstagram.instagram_business_account;

  return {
    id: igAccount.id,
    username: igAccount.username || igAccount.name,
    profile_picture_url: igAccount.profile_picture_url,
    page_id: pageWithInstagram.id,
    page_name: pageWithInstagram.name,
    page_access_token: pageWithInstagram.access_token, // Use page token for Instagram API
    isBusinessAccount: true,
  };
}
