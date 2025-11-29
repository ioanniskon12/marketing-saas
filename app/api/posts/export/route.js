/**
 * Post Export API Route
 *
 * Export posts to Excel file.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';
import { postsToWorkbook } from '@/lib/excel/parser';
import * as XLSX from 'xlsx';

/**
 * GET /api/posts/export
 * Export posts to Excel file
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');
    const status = searchParams.get('status'); // Optional filter
    const startDate = searchParams.get('start_date'); // Optional filter
    const endDate = searchParams.get('end_date'); // Optional filter

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate workspace
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(
      supabase,
      user.id,
      workspaceId,
      'posts:read'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Build query
    let query = supabase
      .from('posts')
      .select(`
        *,
        post_media (
          id,
          file_url,
          file_type,
          order_index
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('scheduled_for', startDate);
    }

    if (endDate) {
      query = query.lte('scheduled_for', endDate);
    }

    const { data: posts, error: postsError } = await query;

    if (postsError) throw postsError;

    if (!posts || posts.length === 0) {
      return NextResponse.json(
        { error: 'No posts to export' },
        { status: 404 }
      );
    }

    // Sort media by order_index
    posts.forEach(post => {
      if (post.post_media && Array.isArray(post.post_media)) {
        post.post_media.sort((a, b) => a.order_index - b.order_index);
      }
    });

    // Convert posts to Excel workbook
    const workbook = postsToWorkbook(posts);

    // Convert to buffer
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `posts-export-${timestamp}.xlsx`;

    // Return as file download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error exporting posts:', error);
    return NextResponse.json(
      { error: 'Failed to export posts' },
      { status: 500 }
    );
  }
}
