/**
 * Publish API Endpoint
 *
 * Handles publishing content to multiple social media platforms
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { publishToMultiplePlatforms } from '@/lib/publishing';
import { validateMultiplePlatforms } from '@/lib/validation/platform-validation';

export async function POST(request) {
  try {
    const supabase = createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      workspaceId,
      content,
      platforms = [],
      media = [],
      scheduledFor = null,
      metadata = {},
    } = body;

    // Validate required fields
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    if (!content && media.length === 0) {
      return NextResponse.json(
        { error: 'Content or media is required' },
        { status: 400 }
      );
    }

    if (platforms.length === 0) {
      return NextResponse.json(
        { error: 'At least one platform is required' },
        { status: 400 }
      );
    }

    // Verify workspace membership
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Access denied to this workspace' },
        { status: 403 }
      );
    }

    // Validate content for all platforms
    const validation = validateMultiplePlatforms(platforms, content, media);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Content validation failed',
          validationErrors: validation.allErrors,
        },
        { status: 400 }
      );
    }

    // If scheduled for future, save to database and return
    if (scheduledFor && new Date(scheduledFor) > new Date()) {
      const { data: scheduledPost, error: scheduleError } = await supabase
        .from('scheduled_posts')
        .insert({
          workspace_id: workspaceId,
          content,
          platforms,
          media,
          scheduled_for: scheduledFor,
          status: 'scheduled',
          created_by: user.id,
          metadata,
        })
        .select()
        .single();

      if (scheduleError) {
        console.error('Error scheduling post:', scheduleError);
        return NextResponse.json(
          { error: 'Failed to schedule post' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        scheduled: true,
        scheduledPost,
        message: 'Post scheduled successfully',
      });
    }

    // Get connected accounts for selected platforms
    const { data: accounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .in('platform', platforms);

    if (accountsError) {
      console.error('Error fetching accounts:', accountsError);
      return NextResponse.json(
        { error: 'Failed to fetch connected accounts' },
        { status: 500 }
      );
    }

    // Check if all requested platforms have connected accounts
    const missingPlatforms = platforms.filter(
      (platform) => !accounts.some((acc) => acc.platform === platform)
    );

    if (missingPlatforms.length > 0) {
      return NextResponse.json(
        {
          error: 'Some platforms are not connected',
          missingPlatforms,
        },
        { status: 400 }
      );
    }

    // Publish to all platforms
    const results = await publishToMultiplePlatforms(
      platforms,
      accounts,
      content,
      media,
      metadata
    );

    // Store publish results in database
    const publishRecords = results.map((result) => ({
      workspace_id: workspaceId,
      platform: result.platform,
      content,
      media,
      status: result.success ? 'published' : 'failed',
      platform_post_id: result.platformPostId || null,
      error_message: result.error || null,
      published_at: result.success ? result.publishedAt : null,
      published_by: user.id,
      metadata: result.metadata || metadata,
    }));

    const { error: insertError } = await supabase
      .from('posts')
      .insert(publishRecords);

    if (insertError) {
      console.error('Error storing publish records:', insertError);
      // Don't fail the request, as publishing was successful
    }

    // Count successes and failures
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: failureCount === 0,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
      },
    });
  } catch (error) {
    console.error('Publish API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get publishing status
 */
export async function GET(request) {
  try {
    const supabase = createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');
    const postId = searchParams.get('post_id');

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    // Verify workspace membership
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Access denied to this workspace' },
        { status: 403 }
      );
    }

    let query = supabase
      .from('posts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('published_at', { ascending: false });

    if (postId) {
      query = query.eq('id', postId);
    }

    const { data: posts, error: postsError } = await query;

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Get publish status error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
