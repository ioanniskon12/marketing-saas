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

    // Get user profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profileData = await profileResponse.json();

    // Get profile picture
    const pictureResponse = await fetch(
      'https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    let profilePictureUrl = null;
    if (pictureResponse.ok) {
      const pictureData = await pictureResponse.json();
      const elements = pictureData.profilePicture?.['displayImage~']?.elements;
      if (elements && elements.length > 0) {
        // Get the largest image
        const largest = elements[elements.length - 1];
        profilePictureUrl = largest.identifiers?.[0]?.identifier;
      }
    }

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Format display name
    const firstName = profileData.localizedFirstName || '';
    const lastName = profileData.localizedLastName || '';
    const displayName = `${firstName} ${lastName}`.trim();

    // Store or update social account
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('workspace_id', oauthState.workspace_id)
      .eq('platform', 'linkedin')
      .eq('platform_user_id', profileData.id)
      .single();

    if (existingAccount) {
      // Update existing account
      await supabase
        .from('social_accounts')
        .update({
          access_token,
          expires_at: expiresAt.toISOString(),
          display_name: displayName,
          profile_picture_url: profilePictureUrl,
          is_active: true,
          last_sync_at: new Date().toISOString(),
        })
        .eq('id', existingAccount.id);
    } else {
      // Create new account
      await supabase.from('social_accounts').insert({
        workspace_id: oauthState.workspace_id,
        user_id: oauthState.user_id,
        platform: 'linkedin',
        platform_user_id: profileData.id,
        display_name: displayName,
        profile_picture_url: profilePictureUrl,
        access_token,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        last_sync_at: new Date().toISOString(),
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
