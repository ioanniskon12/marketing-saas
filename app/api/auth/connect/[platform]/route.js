/**
 * OAuth Connection Initiation Endpoint
 *
 * Initiates OAuth flow for connecting social media accounts
 * URL: /api/auth/connect/[platform]
 */

import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/oauth/config';
import { createClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
  try {
    const { platform } = params;
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this workspace
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check workspace membership
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate state parameter for CSRF protection
    const state = Buffer.from(
      JSON.stringify({
        platform,
        workspaceId,
        userId: user.id,
        timestamp: Date.now(),
      })
    ).toString('base64');

    // Get authorization URL for the platform
    const authUrl = getAuthorizationUrl(platform, state);

    // Redirect to platform's authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow', details: error.message },
      { status: 500 }
    );
  }
}
