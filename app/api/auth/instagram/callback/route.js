/**
 * Instagram Business Account OAuth Callback
 *
 * Handles the OAuth callback from Facebook for Instagram Business accounts.
 * Instagram Business API requires going through Facebook OAuth.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const INSTAGRAM_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/api/auth/instagram/callback';

/**
 * GET /api/auth/instagram/callback
 * Handles Instagram Business OAuth callback (via Facebook)
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
      .eq('platform', 'instagram')
      .single();

    if (stateError || !oauthState) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=invalid_state`
      );
    }

    // Check if state is expired (if expires_at exists)
    if (oauthState.expires_at && new Date(oauthState.expires_at) < new Date()) {
      await supabase.from('oauth_states').delete().eq('id', oauthState.id);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=state_expired`
      );
    }

    // Exchange code for access token using Facebook Graph API
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${FACEBOOK_APP_ID}&` +
      `client_secret=${FACEBOOK_APP_SECRET}&` +
      `redirect_uri=${encodeURIComponent(INSTAGRAM_REDIRECT_URI)}&` +
      `code=${code}`
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Facebook token exchange error:', errorData);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const userAccessToken = tokenData.access_token;

    // Get Facebook Pages with Instagram Business accounts
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,profile_picture_url,name}&access_token=${userAccessToken}`
    );

    if (!pagesResponse.ok) {
      const errorData = await pagesResponse.json();
      console.error('Failed to fetch Facebook Pages:', errorData);
      throw new Error('Failed to fetch Facebook Pages');
    }

    const pagesData = await pagesResponse.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=no_pages_found`
      );
    }

    // Find a page with an Instagram Business account connected
    const pageWithInstagram = pagesData.data.find(page => page.instagram_business_account);

    if (!pageWithInstagram) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=no_instagram_business`
      );
    }

    const igAccount = pageWithInstagram.instagram_business_account;
    const pageAccessToken = pageWithInstagram.access_token;

    // Calculate token expiration (60 days for long-lived page tokens)
    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    // Store or update social account
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('workspace_id', oauthState.workspace_id)
      .eq('platform', 'instagram')
      .eq('platform_account_id', igAccount.id)
      .single();

    const accountData = {
      workspace_id: oauthState.workspace_id,
      user_id: oauthState.user_id,
      platform: 'instagram',
      platform_account_id: igAccount.id,
      platform_username: igAccount.username || igAccount.name,
      access_token: pageAccessToken, // Use page token for Instagram API
      token_expires_at: expiresAt.toISOString(),
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    if (existingAccount) {
      // Update existing account
      await supabase
        .from('social_accounts')
        .update(accountData)
        .eq('id', existingAccount.id);
    } else {
      // Create new account
      await supabase.from('social_accounts').insert({
        ...accountData,
        created_at: new Date().toISOString(),
      });
    }

    // Delete used state
    await supabase.from('oauth_states').delete().eq('id', oauthState.id);

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?success=instagram_connected`
    );
  } catch (error) {
    console.error('Instagram OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=connection_failed&message=${encodeURIComponent(error.message)}`
    );
  }
}
