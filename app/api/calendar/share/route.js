/**
 * Calendar Share API Routes
 *
 * POST - Create a new shareable calendar link
 * GET - List all calendar shares for a workspace
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * POST /api/calendar/share
 * Create a new shareable calendar link
 */
export async function POST(request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      workspaceId,
      title,
      description,
      startDate,
      endDate,
      socialAccountIds,
      platforms,
      contentTypes,
      permissionLevel = 'view',
      allowDownload = true,
      showAnalytics = false,
      brandColor = '#8B5CF6',
      logoUrl,
      companyName,
      password,
      expiresInDays,
      maxViews,
    } = body;

    // Validate required fields
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    // Verify user has editor+ role in workspace
    const { data: workspaceUser, error: workspaceError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (workspaceError || !workspaceUser) {
      return NextResponse.json(
        { error: 'Access denied to workspace' },
        { status: 403 }
      );
    }

    // Check if user has sufficient permissions (member, admin, or owner)
    if (!['member', 'editor', 'admin', 'owner'].includes(workspaceUser.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Member role or higher required' },
        { status: 403 }
      );
    }

    // Validate permission level
    if (!['view', 'comment', 'approve'].includes(permissionLevel)) {
      return NextResponse.json(
        { error: 'Invalid permission level. Must be: view, comment, or approve' },
        { status: 400 }
      );
    }

    // Validate date range
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Generate unique share token
    let shareToken;
    let tokenExists = true;

    // Ensure token is unique
    while (tokenExists) {
      shareToken = crypto.randomBytes(32).toString('hex');

      const { data: existingShare } = await supabase
        .from('calendar_shares')
        .select('id')
        .eq('share_token', shareToken)
        .single();

      tokenExists = !!existingShare;
    }

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Calculate expiry date if expiresInDays is provided
    let expiresAt = null;
    if (expiresInDays) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiresInDays);
      expiresAt = expiryDate.toISOString();
    }

    // Prepare insert data
    const insertData = {
      workspace_id: workspaceId,
      created_by: user.id,
      title,
      description: description || null,
      share_token: shareToken,
      password_hash: passwordHash,
      start_date: startDate || null,
      end_date: endDate || null,
      social_account_ids: socialAccountIds || null,
      platforms: platforms || null,
      content_types: contentTypes || null,
      permission_level: permissionLevel,
      allow_download: allowDownload,
      show_analytics: showAnalytics,
      brand_color: brandColor,
      logo_url: logoUrl || null,
      company_name: companyName || null,
      expires_at: expiresAt,
      max_views: maxViews || null,
      is_active: true,
    };

    // Insert calendar share
    const { data: calendarShare, error: insertError } = await supabase
      .from('calendar_shares')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating calendar share:', insertError);
      throw insertError;
    }

    // Get base URL from environment or request
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                    `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`;

    // Build full share URL
    const shareUrl = `${baseUrl}/share/${shareToken}`;

    return NextResponse.json({
      message: 'Calendar share created successfully',
      share: calendarShare,
      shareUrl,
      shareToken,
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/calendar/share:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar share' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/calendar/share
 * List all calendar shares for a workspace
 */
export async function GET(request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get workspace ID from query params
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    // Verify user has access to workspace
    const { data: workspaceUser, error: workspaceError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (workspaceError || !workspaceUser) {
      return NextResponse.json(
        { error: 'Access denied to workspace' },
        { status: 403 }
      );
    }

    // Query calendar shares for the workspace
    const { data: shares, error: sharesError } = await supabase
      .from('calendar_shares')
      .select(`
        *,
        created_by_user:auth.users!calendar_shares_created_by_fkey(
          id,
          email
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (sharesError) {
      console.error('Error fetching calendar shares:', sharesError);
      throw sharesError;
    }

    // Get base URL for building share URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                    `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`;

    // Enhance shares with additional info
    const enhancedShares = shares.map(share => ({
      ...share,
      shareUrl: `${baseUrl}/share/${share.share_token}`,
      hasPassword: !!share.password_hash,
      isExpired: share.expires_at ? new Date(share.expires_at) < new Date() : false,
      isViewLimitReached: share.max_views ? share.view_count >= share.max_views : false,
      // Don't expose password hash to client
      password_hash: undefined,
    }));

    return NextResponse.json({
      shares: enhancedShares,
      total: enhancedShares.length,
    });

  } catch (error) {
    console.error('Error in GET /api/calendar/share:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar shares' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/calendar/share
 * Update an existing calendar share
 */
export async function PATCH(request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { shareId, ...updates } = body;

    if (!shareId) {
      return NextResponse.json(
        { error: 'shareId is required' },
        { status: 400 }
      );
    }

    // Get existing share to verify permissions
    const { data: existingShare, error: fetchError } = await supabase
      .from('calendar_shares')
      .select('workspace_id')
      .eq('id', shareId)
      .single();

    if (fetchError || !existingShare) {
      return NextResponse.json(
        { error: 'Calendar share not found' },
        { status: 404 }
      );
    }

    // Verify user has access to workspace
    const { data: workspaceUser, error: workspaceError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', existingShare.workspace_id)
      .eq('user_id', user.id)
      .single();

    if (workspaceError || !workspaceUser) {
      return NextResponse.json(
        { error: 'Access denied to workspace' },
        { status: 403 }
      );
    }

    // Check if user has sufficient permissions
    if (!['member', 'editor', 'admin', 'owner'].includes(workspaceUser.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData = {};

    // Only include fields that are allowed to be updated
    const allowedFields = [
      'title',
      'description',
      'start_date',
      'end_date',
      'social_account_ids',
      'platforms',
      'content_types',
      'permission_level',
      'allow_download',
      'show_analytics',
      'brand_color',
      'logo_url',
      'company_name',
      'is_active',
      'max_views',
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    // Handle password update
    if (updates.password !== undefined) {
      if (updates.password === null || updates.password === '') {
        updateData.password_hash = null;
      } else {
        updateData.password_hash = await bcrypt.hash(updates.password, 10);
      }
    }

    // Handle expiry update
    if (updates.expiresInDays !== undefined) {
      if (updates.expiresInDays === null) {
        updateData.expires_at = null;
      } else {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + updates.expiresInDays);
        updateData.expires_at = expiryDate.toISOString();
      }
    }

    // Update calendar share
    const { data: updatedShare, error: updateError } = await supabase
      .from('calendar_shares')
      .update(updateData)
      .eq('id', shareId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating calendar share:', updateError);
      throw updateError;
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                    `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`;

    return NextResponse.json({
      message: 'Calendar share updated successfully',
      share: {
        ...updatedShare,
        shareUrl: `${baseUrl}/share/${updatedShare.share_token}`,
        hasPassword: !!updatedShare.password_hash,
        password_hash: undefined,
      },
    });

  } catch (error) {
    console.error('Error in PATCH /api/calendar/share:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar share' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calendar/share
 * Delete a calendar share
 */
export async function DELETE(request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get share ID from query params
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('share_id');

    if (!shareId) {
      return NextResponse.json(
        { error: 'share_id is required' },
        { status: 400 }
      );
    }

    // Get existing share to verify permissions
    const { data: existingShare, error: fetchError } = await supabase
      .from('calendar_shares')
      .select('workspace_id')
      .eq('id', shareId)
      .single();

    if (fetchError || !existingShare) {
      return NextResponse.json(
        { error: 'Calendar share not found' },
        { status: 404 }
      );
    }

    // Verify user has access to workspace
    const { data: workspaceUser, error: workspaceError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', existingShare.workspace_id)
      .eq('user_id', user.id)
      .single();

    if (workspaceError || !workspaceUser) {
      return NextResponse.json(
        { error: 'Access denied to workspace' },
        { status: 403 }
      );
    }

    // Check if user has sufficient permissions
    if (!['member', 'editor', 'admin', 'owner'].includes(workspaceUser.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Delete calendar share (cascade will delete related records)
    const { error: deleteError } = await supabase
      .from('calendar_shares')
      .delete()
      .eq('id', shareId);

    if (deleteError) {
      console.error('Error deleting calendar share:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({
      message: 'Calendar share deleted successfully',
    });

  } catch (error) {
    console.error('Error in DELETE /api/calendar/share:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar share' },
      { status: 500 }
    );
  }
}
