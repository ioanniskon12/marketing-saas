/**
 * Facebook OAuth Routes
 *
 * Handles Facebook OAuth 2.0 flow for connecting accounts.
 * Docs: https://developers.facebook.com/docs/facebook-login/
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

// Facebook permissions for posting to pages
// Note: pages_manage_posts requires App Review approval for production apps
const FACEBOOK_SCOPES = [
  'public_profile',            // Basic profile info
  'pages_show_list',           // See list of pages
  'pages_read_engagement',     // Read page engagement
  'pages_manage_posts',        // Post to pages
].join(',');

/**
 * GET /api/auth/facebook
 * Initiates Facebook OAuth flow
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');

    // Get APP_URL dynamically on each request
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
    const FACEBOOK_REDIRECT_URI = APP_URL + '/api/auth/facebook/callback';

    console.log('DEBUG - APP_URL:', APP_URL);
    console.log('DEBUG - FACEBOOK_REDIRECT_URI:', FACEBOOK_REDIRECT_URI);

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
      platform: 'facebook',
      redirect_uri: FACEBOOK_REDIRECT_URI,
    });

    // Build Facebook OAuth URL with full permissions
    const params = new URLSearchParams({
      client_id: FACEBOOK_APP_ID,
      redirect_uri: FACEBOOK_REDIRECT_URI,
      scope: FACEBOOK_SCOPES,
      response_type: 'code',
      state,
    });

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Facebook OAuth initiation error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=oauth_failed`
    );
  }
}
