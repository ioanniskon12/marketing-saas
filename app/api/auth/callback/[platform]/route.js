/**
 * OAuth Callback Handler
 *
 * Handles OAuth callbacks from all social media platforms
 * URL: /api/auth/callback/[platform]
 */

import { NextResponse } from 'next/server';
import { exchangeCodeForToken, getUserProfile } from '@/lib/oauth/config';
import { createClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
  try {
    const { platform } = params;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=${error}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=missing_parameters`
      );
    }

    // Decode state parameter
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { workspaceId, userId } = stateData;

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(platform, code);

    // Get user profile from platform
    const profile = await getUserProfile(platform, tokenData.access_token);

    // Store account in database
    const supabase = await createClient();

    // For Facebook and Instagram, use the page access token instead of user token
    // This is required for posting to Pages/Business accounts
    let accessToken = tokenData.access_token;
    if (platform === 'facebook' && profile.access_token) {
      accessToken = profile.access_token; // Page access token
    } else if (platform === 'instagram' && profile.page_access_token) {
      accessToken = profile.page_access_token; // Page access token for IG API
    }

    // Extract platform-specific data
    const accountData = {
      workspace_id: workspaceId,
      user_id: userId,
      platform,
      platform_account_id: getPlatformUserId(platform, profile),
      platform_username: getPlatformUsername(platform, profile),
      access_token: accessToken,
      refresh_token: tokenData.refresh_token,
      token_expires_at: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      is_active: true,
    };

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('platform', platform)
      .eq('platform_account_id', accountData.platform_account_id)
      .single();

    if (existingAccount) {
      // Update existing account
      const { error: updateError } = await supabase
        .from('social_accounts')
        .update(accountData)
        .eq('id', existingAccount.id);

      if (updateError) throw updateError;
    } else {
      // Insert new account
      const { error: insertError } = await supabase
        .from('social_accounts')
        .insert(accountData);

      if (insertError) throw insertError;
    }

    // Redirect back to accounts page with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?success=account_connected&platform=${platform}`
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=connection_failed&details=${encodeURIComponent(error.message)}`
    );
  }
}

// Helper functions to extract platform-specific user data
function getPlatformUserId(platform, profile) {
  switch (platform) {
    case 'instagram':
      // Instagram Business account ID
      return profile.id;
    case 'facebook':
      // Facebook Page ID
      return profile.id;
    case 'linkedin':
      return profile.id;
    case 'twitter':
      return profile.data?.id || profile.id;
    case 'tiktok':
      return profile.data?.user?.union_id || profile.open_id;
    case 'youtube':
      return profile.items?.[0]?.id || profile.id;
    default:
      return profile.id;
  }
}

function getPlatformUsername(platform, profile) {
  switch (platform) {
    case 'instagram':
      // Instagram Business username
      return profile.username;
    case 'facebook':
      // Facebook Page name
      return profile.name;
    case 'linkedin':
      return profile.localizedFirstName + ' ' + profile.localizedLastName;
    case 'twitter':
      return profile.data?.username || profile.username;
    case 'tiktok':
      return profile.data?.user?.display_name;
    case 'youtube':
      return profile.items?.[0]?.snippet?.title;
    default:
      return profile.name || profile.username;
  }
}
