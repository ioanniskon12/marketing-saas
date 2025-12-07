/**
 * LinkedIn OAuth Callback
 *
 * Handles the OAuth callback from LinkedIn.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/api/auth/linkedin/callback';

/**
 * GET /api/auth/linkedin/callback
 * Handles LinkedIn OAuth callback
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
      .eq('platform', 'linkedin')
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
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        redirect_uri: LINKEDIN_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('LinkedIn token exchange error:', errorData);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, expires_in } = tokenData;

    // Get user profile using new userinfo endpoint (OpenID Connect)
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!profileResponse.ok) {
      const errorData = await profileResponse.json();
      console.error('LinkedIn profile fetch error:', errorData);
      throw new Error('Failed to fetch user profile');
    }

    const profileData = await profileResponse.json();
    console.log('LinkedIn profile data:', profileData);

    // Profile data from userinfo endpoint includes: sub (id), name, given_name, family_name, picture, email
    const profilePictureUrl = profileData.picture || null;

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Format display name
    const displayName = profileData.name || `${profileData.given_name || ''} ${profileData.family_name || ''}`.trim();

    // LinkedIn user ID is in the 'sub' field from OpenID Connect
    const linkedinUserId = profileData.sub;

    // Store or update social account
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('workspace_id', oauthState.workspace_id)
      .eq('platform', 'linkedin')
      .eq('platform_account_id', linkedinUserId)
      .single();

    if (existingAccount) {
      // Update existing account
      await supabase
        .from('social_accounts')
        .update({
          access_token,
          token_expires_at: expiresAt.toISOString(),
          platform_display_name: displayName,
          platform_profile_picture: profilePictureUrl,
          is_active: true,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', existingAccount.id);
    } else {
      // Create new account
      await supabase.from('social_accounts').insert({
        workspace_id: oauthState.workspace_id,
        user_id: oauthState.user_id,
        platform: 'linkedin',
        platform_account_id: linkedinUserId,
        platform_display_name: displayName,
        platform_profile_picture: profilePictureUrl,
        access_token,
        token_expires_at: expiresAt.toISOString(),
        scopes: ['openid', 'profile', 'email', 'w_member_social'],
        account_type: 'personal',
        is_active: true,
        connected_at: new Date().toISOString(),
      });
    }

    // Delete used state
    await supabase.from('oauth_states').delete().eq('id', oauthState.id);

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?success=linkedin_connected`
    );
  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=connection_failed`
    );
  }
}
