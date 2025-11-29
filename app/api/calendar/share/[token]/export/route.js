/**
 * Calendar Share Excel Export API
 *
 * GET /api/calendar/share/[token]/export
 * Export shared calendar as Excel file (public, no authentication required)
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

/**
 * GET /api/calendar/share/[token]/export
 * Export calendar share as Excel file
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
      .select('*')
      .eq('share_token', token)
      .eq('is_active', true)
      .single();

    if (shareError || !calendarShare) {
      return NextResponse.json(
        { error: 'Calendar share not found or has been deactivated' },
        { status: 404 }
      );
    }

    // Check if downloads are allowed
    if (!calendarShare.allow_download) {
      return NextResponse.json(
        { error: 'Downloads are not allowed for this calendar share' },
        { status: 403 }
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

    // Build posts query with filters (same as view endpoint)
    let postsQuery = supabase
      .from('posts')
      .select(`
        *,
        post_media (
          id,
          file_url,
          file_type,
          thumbnail_url,
          order_index
        ),
        social_accounts!inner (
          id,
          platform,
          platform_username,
          display_name,
          avatar_url
        )
      `)
      .eq('workspace_id', calendarShare.workspace_id)
      .in('status', ['scheduled', 'published']);

    // Apply date range filters
    if (calendarShare.start_date) {
      postsQuery = postsQuery.gte('scheduled_for', calendarShare.start_date);
    }

    if (calendarShare.end_date) {
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

    // Apply additional filters
    let filteredPosts = posts || [];

    // Filter by social account IDs if specified
    if (calendarShare.social_account_ids && calendarShare.social_account_ids.length > 0) {
      filteredPosts = filteredPosts.filter(post => {
        const postAccountIds = post.platforms || [];
        return postAccountIds.some(accountId =>
          calendarShare.social_account_ids.includes(accountId)
        );
      });
    }

    // Filter by platforms if specified
    if (calendarShare.platforms && calendarShare.platforms.length > 0) {
      filteredPosts = filteredPosts.filter(post => {
        if (!post.social_accounts) return false;
        const postPlatforms = Array.isArray(post.social_accounts)
          ? post.social_accounts.map(acc => acc.platform)
          : [post.social_accounts.platform];
        return postPlatforms.some(platform =>
          calendarShare.platforms.includes(platform)
        );
      });
    }

    // Filter by content types if specified
    if (calendarShare.content_types && calendarShare.content_types.length > 0) {
      filteredPosts = filteredPosts.filter(post => {
        if (!post.post_media || post.post_media.length === 0) {
          return calendarShare.content_types.includes('text');
        }

        const hasImage = post.post_media.some(media => media.file_type === 'image');
        const hasVideo = post.post_media.some(media => media.file_type === 'video');

        if (hasVideo && calendarShare.content_types.includes('video')) return true;
        if (hasImage && calendarShare.content_types.includes('image')) return true;

        return false;
      });
    }

    // Get analytics if show_analytics is enabled
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

    // Format data for Excel
    const excelData = filteredPosts.map(post => {
      const scheduledDate = new Date(post.scheduled_for);
      const socialAccount = Array.isArray(post.social_accounts)
        ? post.social_accounts[0]
        : post.social_accounts;

      // Determine content type
      let contentType = 'Text';
      if (post.post_media && post.post_media.length > 0) {
        const hasVideo = post.post_media.some(m => m.file_type === 'video');
        const hasImage = post.post_media.some(m => m.file_type === 'image');
        if (hasVideo && hasImage) {
          contentType = 'Video + Image';
        } else if (hasVideo) {
          contentType = 'Video';
        } else if (hasImage) {
          contentType = post.post_media.length > 1 ? 'Carousel' : 'Image';
        }
      }

      // Truncate caption
      const caption = post.content || '';
      const truncatedCaption = caption.length > 100
        ? caption.substring(0, 97) + '...'
        : caption;

      // Extract hashtags
      const hashtagMatch = caption.match(/#\w+/g);
      const hashtags = hashtagMatch ? hashtagMatch.join(' ') : '';

      const row = {
        'Date': scheduledDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        'Time': scheduledDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        'Platform': socialAccount?.platform || 'Unknown',
        'Account': socialAccount?.platform_username || socialAccount?.display_name || 'Unknown',
        'Content Type': contentType,
        'Caption': truncatedCaption,
        'Hashtags': hashtags,
        'Status': post.status.charAt(0).toUpperCase() + post.status.slice(1),
      };

      // Add analytics if enabled
      if (calendarShare.show_analytics && analytics[post.id]) {
        const postAnalytics = analytics[post.id];
        row['Likes'] = postAnalytics.likes_count || 0;
        row['Comments'] = postAnalytics.comments_count || 0;
        row['Shares'] = postAnalytics.shares_count || 0;
        row['Reach'] = postAnalytics.reach || 0;
        row['Engagement Rate'] = postAnalytics.engagement_rate
          ? `${postAnalytics.engagement_rate.toFixed(2)}%`
          : '0%';
      }

      return row;
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Create info sheet
    const infoData = [
      ['Calendar Export Information'],
      [],
      ['Title:', calendarShare.title],
      ['Company:', calendarShare.company_name || 'N/A'],
      ['Description:', calendarShare.description || 'N/A'],
      [],
      ['Date Range:', `${calendarShare.start_date || 'N/A'} to ${calendarShare.end_date || 'N/A'}`],
      ['Total Posts:', filteredPosts.length],
      ['Export Date:', new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })],
      [],
      ['Filters Applied:'],
      ['Platforms:', calendarShare.platforms?.join(', ') || 'All'],
      ['Content Types:', calendarShare.content_types?.join(', ') || 'All'],
    ];

    const infoSheet = XLSX.utils.aoa_to_sheet(infoData);

    // Set column widths for info sheet
    infoSheet['!cols'] = [
      { wch: 20 },
      { wch: 50 },
    ];

    // Add info sheet
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Info');

    // Create data sheet
    const dataSheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for data sheet
    const columnWidths = [
      { wch: 12 }, // Date
      { wch: 10 }, // Time
      { wch: 12 }, // Platform
      { wch: 20 }, // Account
      { wch: 15 }, // Content Type
      { wch: 50 }, // Caption
      { wch: 30 }, // Hashtags
      { wch: 12 }, // Status
    ];

    // Add analytics column widths if included
    if (calendarShare.show_analytics) {
      columnWidths.push(
        { wch: 10 }, // Likes
        { wch: 10 }, // Comments
        { wch: 10 }, // Shares
        { wch: 12 }, // Reach
        { wch: 15 }  // Engagement Rate
      );
    }

    dataSheet['!cols'] = columnWidths;

    // Add data sheet
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Content Calendar');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    // Increment download count
    await supabase
      .from('calendar_shares')
      .update({
        download_count: calendarShare.download_count + 1,
      })
      .eq('id', calendarShare.id);

    // Get visitor information
    const visitorIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const visitorDevice = request.headers.get('user-agent') || 'unknown';
    const visitorCountry = request.headers.get('x-vercel-ip-country') ||
                          request.headers.get('cf-ipcountry') ||
                          null;

    // Log download activity
    await supabase
      .from('calendar_share_activity')
      .insert({
        calendar_share_id: calendarShare.id,
        activity_type: 'download',
        visitor_ip: visitorIp,
        visitor_device: visitorDevice,
        visitor_country: visitorCountry,
        metadata: {
          posts_count: filteredPosts.length,
          format: 'xlsx',
        },
      });

    // Generate filename
    const startDate = calendarShare.start_date
      ? new Date(calendarShare.start_date).toISOString().split('T')[0]
      : 'start';
    const endDate = calendarShare.end_date
      ? new Date(calendarShare.end_date).toISOString().split('T')[0]
      : 'end';
    const filename = `content-calendar-${startDate}-to-${endDate}.xlsx`;

    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/calendar/share/[token]/export:', error);
    return NextResponse.json(
      { error: 'Failed to export calendar share' },
      { status: 500 }
    );
  }
}
