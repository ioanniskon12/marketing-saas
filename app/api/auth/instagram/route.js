/**
 * Instagram OAuth Routes
 *
 * Handles Instagram OAuth 2.0 flow for connecting Business/Creator accounts.
 * Uses Facebook Graph API for full Instagram functionality.
 * Docs: https://developers.facebook.com/docs/instagram-api/
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';

// Instagram Business API uses Facebook OAuth
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
const INSTAGRAM_REDIRECT_URI = APP_URL + '/api/auth/instagram/callback';

// Basic Instagram permissions that work without App Review
// Advanced permissions require App Review approval
const INSTAGRAM_SCOPES = [
  'public_profile',               // Basic profile info
  'pages_show_list',              // Required for Instagram Business
  'pages_read_engagement',        // Read engagement metrics
  'instagram_basic',              // Basic Instagram account info
].join(',');

/**
 * GET /api/auth/instagram
 * Initiates Instagram OAuth flow
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=unauthorized`
      );
    }

    // Validate workspace
    if (!workspaceId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=missing_workspace`
      );
    }

    // Check permission
    const hasPermission = await checkPermission(
      supabase,
      user.id,
      workspaceId,
      'workspace:settings'
    );

    if (!hasPermission) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=insufficient_permissions`
      );
    }

    // Generate state for CSRF protection
    const state = crypto.randomUUID();

    // Store state in database
    await supabase.from('oauth_states').insert({
      state,
      user_id: user.id,
      workspace_id: workspaceId,
      platform: 'instagram',
      redirect_uri: INSTAGRAM_REDIRECT_URI,
    });

    // Build Instagram OAuth URL (uses Facebook OAuth for Business accounts)
    const params = new URLSearchParams({
      client_id: FACEBOOK_APP_ID,
      redirect_uri: INSTAGRAM_REDIRECT_URI,
      scope: INSTAGRAM_SCOPES,
      response_type: 'code',
      state,
    });

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Instagram OAuth initiation error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=oauth_failed`
    );
  }
}
