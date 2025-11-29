/**
 * Public Calendar Share Viewing API
 *
 * POST /api/calendar/share/[token]
 * View a shared calendar (public, no authentication required)
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

/**
 * POST /api/calendar/share/[token]
 * View a shared calendar with optional password verification
 */
export async function POST(request, { params }) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: 'Share token is required' },
        { status: 400 }
      );
    }

    // Parse request body for optional password
    let password = null;
    try {
      const body = await request.json();
      password = body.password;
    } catch (e) {
      // Body is optional, continue without password
    }

    const supabase = await createClient();

    // Query calendar share by token with workspace data
    const { data: calendarShare, error: shareError } = await supabase
      .from('calendar_shares')
      .select(`
        *,
        workspaces (
          name,
          logo_url,
          logo_size
        )
      `)
      .eq('share_token', token)
      .eq('is_active', true)
      .single();

    if (shareError || !calendarShare) {
      return NextResponse.json(
        { error: 'Calendar share not found or has been deactivated' },
        { status: 404 }
      );
    }

    // Check if share has expired
    if (calendarShare.expires_at) {
      const expiryDate = new Date(calendarShare.expires_at);
      const now = new Date();

      if (expiryDate < now) {
        return NextResponse.json(
          { error: 'This calendar share has expired' },
          { status: 410 }
        );
      }
    }

    // Check if view limit has been reached
    if (calendarShare.max_views !== null && calendarShare.view_count >= calendarShare.max_views) {
      return NextResponse.json(
        { error: 'This calendar share has reached its view limit' },
        { status: 403 }
      );
    }

    // Check password if required
    if (calendarShare.password_hash) {
      if (!password) {
        return NextResponse.json(
          {
            requiresPassword: true,
            message: 'This calendar share is password protected',
          },
          { status: 401 }
        );
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, calendarShare.password_hash);

      if (!passwordMatch) {
        // Log failed login attempt
        const visitorIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                          request.headers.get('x-real-ip') ||
                          'unknown';
        const visitorDevice = request.headers.get('user-agent') || 'unknown';

        await supabase
          .from('calendar_share_activity')
          .insert({
            calendar_share_id: calendarShare.id,
            activity_type: 'login_attempt',
            visitor_ip: visitorIp,
            visitor_device: visitorDevice,
            metadata: { success: false },
          });

        return NextResponse.json(
          {
            requiresPassword: true,
            error: 'Incorrect password',
          },
          { status: 401 }
        );
      }
    }

    // Build posts query with filters
    let postsQuery = supabase
      .from('posts')
      .select(`
        *,
        post_media (
          id,
          file_url,
          mime_type,
          thumbnail_url
        )
      `)
      .eq('workspace_id', calendarShare.workspace_id)
      .in('status', ['scheduled', 'published']);

    // Apply date range filters
    if (calendarShare.start_date) {
      postsQuery = postsQuery.gte('scheduled_for', calendarShare.start_date);
    }

    if (calendarShare.end_date) {
      // Add one day to include posts on the end date
      const endDate = new Date(calendarShare.end_date);
      endDate.setDate(endDate.getDate() + 1);
      postsQuery = postsQuery.lt('scheduled_for', endDate.toISOString().split('T')[0]);
    }

    // Execute query
    const { data: posts, error: postsError } = await postsQuery.order('scheduled_for', { ascending: true });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      throw postsError;
    }

    // Apply additional filters in JavaScript (more complex filters)
    let filteredPosts = posts || [];

    // Filter by social account IDs if specified
    if (calendarShare.social_account_ids && calendarShare.social_account_ids.length > 0) {
      filteredPosts = filteredPosts.filter(post => {
        // Check if post's social account is in the allowed list
        const postAccountIds = post.platforms || [];
        return postAccountIds.some(accountId =>
          calendarShare.social_account_ids.includes(accountId)
        );
      });
    }

    // Filter by platforms if specified
    if (calendarShare.platforms && calendarShare.platforms.length > 0) {
      filteredPosts = filteredPosts.filter(post => {
        // Check if any of the post's platforms match the allowed platforms
        if (!post.platforms || !Array.isArray(post.platforms)) return false;
        return post.platforms.some(platform =>
          calendarShare.platforms.includes(platform)
        );
      });
    }

    // Filter by content types if specified
    if (calendarShare.content_types && calendarShare.content_types.length > 0) {
      filteredPosts = filteredPosts.filter(post => {
        // Determine content type from post media
        if (!post.post_media || post.post_media.length === 0) {
          return calendarShare.content_types.includes('text');
        }

        const hasImage = post.post_media.some(media => media.mime_type?.startsWith('image/'));
        const hasVideo = post.post_media.some(media => media.mime_type?.startsWith('video/'));

        if (hasVideo && calendarShare.content_types.includes('video')) return true;
        if (hasImage && calendarShare.content_types.includes('image')) return true;

        return false;
      });
    }

    // Get visitor information
    const visitorIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const visitorDevice = request.headers.get('user-agent') || 'unknown';

    // Get country from headers (if using Vercel or Cloudflare)
    const visitorCountry = request.headers.get('x-vercel-ip-country') ||
                          request.headers.get('cf-ipcountry') ||
                          null;

    // Increment view count and update last viewed
    await supabase
      .from('calendar_shares')
      .update({
        view_count: calendarShare.view_count + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', calendarShare.id);

    // Log view activity
    await supabase
      .from('calendar_share_activity')
      .insert({
        calendar_share_id: calendarShare.id,
        activity_type: 'view',
        visitor_ip: visitorIp,
        visitor_device: visitorDevice,
        visitor_country: visitorCountry,
        metadata: {
          posts_count: filteredPosts.length,
          has_password: !!calendarShare.password_hash,
        },
      });

    // Fetch comments if permission allows
    let comments = [];
    if (['comment', 'approve'].includes(calendarShare.permission_level)) {
      const { data: commentsData } = await supabase
        .from('calendar_share_comments')
        .select('*')
        .eq('calendar_share_id', calendarShare.id)
        .order('created_at', { ascending: false });

      comments = commentsData || [];
    }

    // Fetch approvals if permission allows
    let approvals = [];
    if (calendarShare.permission_level === 'approve') {
      const { data: approvalsData } = await supabase
        .from('calendar_share_approvals')
        .select('*')
        .eq('calendar_share_id', calendarShare.id)
        .order('created_at', { ascending: false });

      approvals = approvalsData || [];
    }

    // Get analytics for posts if show_analytics is enabled
    let analytics = {};
    if (calendarShare.show_analytics) {
      const postIds = filteredPosts.map(post => post.id);

      if (postIds.length > 0) {
        const { data: analyticsData } = await supabase
          .from('post_analytics')
          .select('post_id, likes_count, comments_count, shares_count, reach, impressions, engagement_rate')
          .in('post_id', postIds);

        if (analyticsData) {
          analytics = analyticsData.reduce((acc, item) => {
            acc[item.post_id] = item;
            return acc;
          }, {});
        }
      }
    }

    // Prepare response - remove sensitive data
    const sanitizedShare = {
      id: calendarShare.id,
      title: calendarShare.title,
      description: calendarShare.description,
      permission_level: calendarShare.permission_level,
      allow_download: calendarShare.allow_download,
      show_analytics: calendarShare.show_analytics,
      brand_color: calendarShare.brand_color,
      logo_url: calendarShare.logo_url || calendarShare.workspaces?.logo_url,
      logo_size: calendarShare.workspaces?.logo_size || 'medium',
      company_name: calendarShare.company_name || calendarShare.workspaces?.name || 'SocialHub',
      start_date: calendarShare.start_date,
      end_date: calendarShare.end_date,
      created_at: calendarShare.created_at,
      // Don't expose: share_token, password_hash, workspace_id, created_by, max_views, view_count
    };

    // Prepare posts - add analytics if enabled
    const postsWithAnalytics = filteredPosts.map(post => ({
      ...post,
      analytics: calendarShare.show_analytics ? analytics[post.id] || null : undefined,
    }));

    return NextResponse.json({
      share: sanitizedShare,
      posts: postsWithAnalytics,
      comments,
      approvals,
      meta: {
        total_posts: filteredPosts.length,
        date_range: {
          start: calendarShare.start_date,
          end: calendarShare.end_date,
        },
        filters_applied: {
          platforms: calendarShare.platforms || [],
          content_types: calendarShare.content_types || [],
          social_accounts: calendarShare.social_account_ids?.length || 0,
        },
      },
    });

  } catch (error) {
    console.error('Error in POST /api/calendar/share/[token]:', error);
    return NextResponse.json(
      { error: 'Failed to load calendar share' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/calendar/share/[token]
 * Get basic calendar share info without password (for initial load)
 */
export async function GET(request, { params }) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: 'Share token is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Query calendar share by token
    const { data: calendarShare, error: shareError } = await supabase
      .from('calendar_shares')
      .select('id, title, description, brand_color, logo_url, company_name, expires_at, is_active, password_hash')
      .eq('share_token', token)
      .eq('is_active', true)
      .single();

    if (shareError || !calendarShare) {
      return NextResponse.json(
        { error: 'Calendar share not found or has been deactivated' },
        { status: 404 }
      );
    }

    // Check if share has expired
    if (calendarShare.expires_at) {
      const expiryDate = new Date(calendarShare.expires_at);
      const now = new Date();

      if (expiryDate < now) {
        return NextResponse.json(
          { error: 'This calendar share has expired' },
          { status: 410 }
        );
      }
    }

    // Return basic info
    return NextResponse.json({
      share: {
        id: calendarShare.id,
        title: calendarShare.title,
        description: calendarShare.description,
        brand_color: calendarShare.brand_color,
        logo_url: calendarShare.logo_url,
        company_name: calendarShare.company_name,
        requires_password: !!calendarShare.password_hash,
        is_active: calendarShare.is_active,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/calendar/share/[token]:', error);
    return NextResponse.json(
      { error: 'Failed to load calendar share info' },
      { status: 500 }
    );
  }
}
