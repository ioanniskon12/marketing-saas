/**
 * Social Accounts API Routes
 *
 * Handles CRUD operations for connected social media accounts
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/social-accounts
 * Get all connected social accounts for a workspace
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    // Get connected accounts for the workspace
    const { data: accounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .order('connected_at', { ascending: false });

    if (accountsError) throw accountsError;

    // Don't send access tokens to frontend
    const sanitizedAccounts = (accounts || []).map(account => ({
      id: account.id,
      workspace_id: account.workspace_id,
      platform: account.platform,
      platform_account_id: account.platform_account_id,
      platform_username: account.platform_username,
      platform_display_name: account.platform_display_name,
      platform_profile_picture: account.platform_profile_picture,
      account_type: account.account_type,
      scopes: account.scopes,
      is_active: account.is_active,
      connected_at: account.connected_at,
      last_sync_at: account.last_sync_at,
    }));

    return NextResponse.json({
      accounts: sanitizedAccounts,
    });
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social accounts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social-accounts
 * Add a new social account (called after OAuth flow)
 */
export async function POST(request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      workspace_id,
      platform,
      platform_account_id,
      platform_username,
      platform_display_name,
      platform_profile_picture,
      access_token,
      refresh_token,
      token_expires_at,
      account_type,
      scopes,
    } = body;

    // Validate required fields
    if (!workspace_id || !platform || !platform_account_id || !access_token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('workspace_id', workspace_id)
      .eq('platform', platform)
      .eq('platform_account_id', platform_account_id)
      .single();

    let result;

    if (existingAccount) {
      // Update existing account
      const { data, error } = await supabase
        .from('social_accounts')
        .update({
          access_token,
          refresh_token,
          token_expires_at: token_expires_at,
          platform_username,
          platform_display_name,
          platform_profile_picture,
          account_type,
          scopes,
          is_active: true,
        })
        .eq('id', existingAccount.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new account
      const { data, error } = await supabase
        .from('social_accounts')
        .insert({
          workspace_id,
          user_id: user.id,
          platform,
          platform_account_id,
          platform_username,
          platform_display_name,
          platform_profile_picture,
          access_token,
          refresh_token,
          token_expires_at: token_expires_at,
          account_type,
          scopes,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      account: {
        id: result.id,
        platform: result.platform,
        platform_username: result.platform_username,
        platform_display_name: result.platform_display_name,
      },
    });
  } catch (error) {
    console.error('Error adding social account:', error);
    return NextResponse.json(
      { error: 'Failed to add social account' },
      { status: 500 }
    );
  }
}
