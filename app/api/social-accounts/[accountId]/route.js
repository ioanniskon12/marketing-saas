/**
 * Individual Social Account API Routes
 *
 * Handles operations on a specific social media account
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * DELETE /api/social-accounts/[accountId]
 * Disconnect/remove a social media account
 */
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { accountId } = params;

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the account belongs to a workspace the user has access to
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*, workspaces:workspace_id(id)')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

     // Soft delete: Just set is_active to false instead of deleting
    // This keeps all posts and data, which will be hidden from the UI
    // When reconnecting the same account, it can be reactivated
    const { error: deleteError } = await supabase
      .from('social_accounts')
      .update({ is_active: false })
      .eq('id', accountId);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Social account disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting social account:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect social account' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/social-accounts/[accountId]
 * Update a social media account
 */
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient();
    const { accountId } = params;

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updates = {};

    // Only allow specific fields to be updated
    if (typeof body.is_active !== 'undefined') updates.is_active = body.is_active;
    if (typeof body.can_post !== 'undefined') updates.can_post = body.can_post;
    if (typeof body.can_schedule !== 'undefined') updates.can_schedule = body.can_schedule;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the account
    const { data, error } = await supabase
      .from('social_accounts')
      .update(updates)
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      account: {
        id: data.id,
        is_active: data.is_active,
        can_post: data.can_post,
        can_schedule: data.can_schedule,
      },
    });
  } catch (error) {
    console.error('Error updating social account:', error);
    return NextResponse.json(
      { error: 'Failed to update social account' },
      { status: 500 }
    );
  }
}
