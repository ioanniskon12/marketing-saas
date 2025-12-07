/**
 * TikTok OAuth Callback
 *
 * Handles the OAuth callback from TikTok.
 * Uses TikTok Login Kit v2 API
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;

/**
 * GET /api/auth/tiktok/callback
 * Handles TikTok OAuth callback
 */
export async function GET(request) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // TikTok URL verification - return 200 OK when no OAuth params
    if (!code && !state && !error) {
      return new NextResponse('OK', { status: 200 });
    }

    // Handle user denial or errors
    if (error) {
      console.error('TikTok OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        `${APP_URL}/dashboard/settings/accounts?error=user_denied&message=${encodeURIComponent(errorDescription || error)}`
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        `${APP_URL}/dashboard/settings/accounts?error=invalid_callback`
      );
    }

    // Verify state and get stored data
    const { data: oauthState, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('platform', 'tiktok')
      .single();

    if (stateError || !oauthState) {
      console.error('OAuth state error:', stateError);
      return NextResponse.redirect(
        `${APP_URL}/dashboard/settings/accounts?error=invalid_state`
      );
    }

    // Check if state is expired
    if (new Date(oauthState.expires_at) < new Date()) {
      await supabase.from('oauth_states').delete().eq('id', oauthState.id);
      return NextResponse.redirect(
        `${APP_URL}/dashboard/settings/accounts?error=state_expired`
      );
    }

    const TIKTOK_REDIRECT_URI = oauthState.redirect_uri;

    // Exchange code for access token (TikTok v2 API)
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: TIKTOK_REDIRECT_URI,
        code_verifier: oauthState.code_verifier,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenResponse.ok) {
      console.error('TikTok token exchange error:', tokenData);
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange code for token');
    }

    const {
      access_token,
      refresh_token,
      expires_in,
      refresh_expires_in,
      open_id,
      scope,
    } = tokenData;

    // Get user info using v2 API
    const userInfoResponse = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const userInfoData = await userInfoResponse.json();

    if (userInfoData.error?.code || !userInfoResponse.ok) {
      console.error('TikTok user info error:', userInfoData);
      throw new Error(userInfoData.error?.message || 'Failed to fetch user info');
    }

    const userData = userInfoData.data?.user || {};
    const displayName = userData.display_name || userData.username || 'TikTok User';
    const avatarUrl = userData.avatar_url || null;
    const username = userData.username || null;

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + expires_in * 1000);
    const refreshExpiresAt = refresh_expires_in
      ? new Date(Date.now() + refresh_expires_in * 1000)
      : null;

    // Store or update social account
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('workspace_id', oauthState.workspace_id)
      .eq('platform', 'tiktok')
      .eq('platform_account_id', open_id)
      .single();

    const accountData = {
      access_token,
      refresh_token,
      token_expires_at: expiresAt.toISOString(),
      refresh_token_expires_at: refreshExpiresAt?.toISOString() || null,
      platform_display_name: displayName,
      platform_username: username,
      platform_profile_picture: avatarUrl,
      scopes: scope ? scope.split(',') : ['user.info.basic', 'video.publish', 'video.upload'],
      is_active: true,
      last_used_at: new Date().toISOString(),
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
        workspace_id: oauthState.workspace_id,
        user_id: oauthState.user_id,
        platform: 'tiktok',
        platform_account_id: open_id,
        account_type: 'personal',
        connected_at: new Date().toISOString(),
        ...accountData,
      });
    }

    // Delete used state
    await supabase.from('oauth_states').delete().eq('id', oauthState.id);

    // Redirect to success page
    return NextResponse.redirect(
      `${APP_URL}/dashboard/create-post?success=account_connected&platform=tiktok`
    );
  } catch (error) {
    console.error('TikTok OAuth callback error:', error);
    return NextResponse.redirect(
      `${APP_URL}/dashboard/settings/accounts?error=connection_failed&message=${encodeURIComponent(error.message)}`
    );
  }
}
