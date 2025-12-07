/**
 * TikTok OAuth Routes
 *
 * Handles TikTok OAuth 2.0 flow for connecting accounts.
 * Uses TikTok Login Kit v2 (Content Posting API)
 * Docs: https://developers.tiktok.com/doc/login-kit-web/
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;

// TikTok scopes for content posting
// user.info.basic - Access to user's basic profile info
// video.publish - Publish videos to user's account
// video.upload - Upload videos
const TIKTOK_SCOPES = 'user.info.basic,video.publish,video.upload';

/**
 * GET /api/auth/tiktok
 * Initiates TikTok OAuth flow
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');

    // Get APP_URL dynamically
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const TIKTOK_REDIRECT_URI = APP_URL + '/api/auth/tiktok/callback';

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(
        `${APP_URL}/auth/login?error=unauthorized`
      );
    }

    // Validate workspace
    if (!workspaceId) {
      return NextResponse.redirect(
        `${APP_URL}/dashboard/settings/accounts?error=missing_workspace`
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
        `${APP_URL}/dashboard/settings/accounts?error=insufficient_permissions`
      );
    }

    // Generate state for CSRF protection
    const state = crypto.randomUUID();

    // Generate code verifier for PKCE
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store state in database
    await supabase.from('oauth_states').insert({
      state,
      user_id: user.id,
      workspace_id: workspaceId,
      platform: 'tiktok',
      redirect_uri: TIKTOK_REDIRECT_URI,
      code_verifier: codeVerifier, // Store for callback
    });

    // Build TikTok OAuth URL (using v2 authorization)
    const params = new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      redirect_uri: TIKTOK_REDIRECT_URI,
      scope: TIKTOK_SCOPES,
      response_type: 'code',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('TikTok OAuth initiation error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/accounts?error=oauth_failed`
    );
  }
}

/**
 * Generate a random code verifier for PKCE
 */
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generate code challenge from verifier using SHA-256
 */
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
}

/**
 * Base64 URL encode
 */
function base64URLEncode(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
