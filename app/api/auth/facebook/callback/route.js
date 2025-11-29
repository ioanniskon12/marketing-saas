/**
 * Facebook OAuth Callback
 *
 * Handles the OAuth callback from Facebook.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
const FACEBOOK_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/api/auth/facebook/callback';

/**
 * GET /api/auth/facebook/callback
 * Handles Facebook OAuth callback
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle user denial
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=user_denied`
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=invalid_callback`
      );
    }

    // Verify state and get stored data
    const { data: oauthState, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('platform', 'facebook')
      .single();

    if (stateError || !oauthState) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=invalid_state`
      );
    }

    // Check if state is expired
    if (new Date(oauthState.expires_at) < new Date()) {
      await supabase.from('oauth_states').delete().eq('id', oauthState.id);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=state_expired`
      );
    }

    // Exchange code for access token
    const tokenParams = new URLSearchParams({
      client_id: FACEBOOK_CLIENT_ID,
      client_secret: FACEBOOK_CLIENT_SECRET,
      redirect_uri: FACEBOOK_REDIRECT_URI,
      code,
    });

    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${tokenParams.toString()}`
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Facebook token exchange error:', errorData);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, expires_in } = tokenData;

    // Exchange short-lived token for long-lived token (60 days)
    const longLivedParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: FACEBOOK_CLIENT_ID,
      client_secret: FACEBOOK_CLIENT_SECRET,
      fb_exchange_token: access_token,
    });

    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${longLivedParams.toString()}`
    );

    if (!longLivedResponse.ok) {
      throw new Error('Failed to get long-lived token');
    }

    const longLivedData = await longLivedResponse.json();
    const { access_token: longLivedToken, expires_in: longLivedExpiresIn } = longLivedData;

    // Get user profile
    const profileResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,picture&access_token=${longLivedToken}`
    );

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profileData = await profileResponse.json();

    // Get user's pages with their page access tokens
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,picture&access_token=${longLivedToken}`
    );

    const pagesData = await pagesResponse.json();
    console.log('Pages data:', JSON.stringify(pagesData, null, 2));

    const pages = pagesData.data || [];

    if (pages.length === 0) {
      console.error('No pages found for this user');
      throw new Error('No Facebook pages found. Please make sure you have a Facebook Page to connect.');
    }

    // Use the first page (you can later add UI to let users select which page)
    const page = pages[0];
    const pageAccessToken = page.access_token; // This is the PAGE token with page permissions!
    const pageId = page.id;
    const pageName = page.name;
    const pageProfilePicture = page.picture?.data?.url;

    console.log('Using page:', { pageId, pageName });

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + (longLivedExpiresIn || 5184000) * 1000); // Default 60 days

    // Store or update social account
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('workspace_id', oauthState.workspace_id)
      .eq('platform', 'facebook')
      .eq('platform_account_id', pageId)
      .single();

    if (existingAccount) {
      // Update existing account
      await supabase
        .from('social_accounts')
        .update({
          access_token: pageAccessToken, // Changed from longLivedToken to pageAccessToken
          token_expires_at: expiresAt.toISOString(),
          platform_display_name: pageName, // Changed to page name
          platform_profile_picture: pageProfilePicture, // Changed to page picture
          is_active: true,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', existingAccount.id);
    } else {
      // Create new account
      await supabase.from('social_accounts').insert({
        workspace_id: oauthState.workspace_id,
        user_id: oauthState.user_id,
        platform: 'facebook',
        platform_account_id: pageId, // Changed to page ID
        platform_display_name: pageName, // Changed to page name
        platform_profile_picture: pageProfilePicture, // Changed to page picture
        access_token: pageAccessToken, // Changed from longLivedToken to pageAccessToken
        token_expires_at: expiresAt.toISOString(),
        scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'],
        account_type: 'page', // Changed from 'personal' to 'page'
        is_active: true,
        connected_at: new Date().toISOString(),
      });
    }

    // Delete used state
    await supabase.from('oauth_states').delete().eq('id', oauthState.id);

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?success=facebook_connected`
    );
  } catch (error) {
    console.error('Facebook OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=connection_failed`
    );
  }
}
