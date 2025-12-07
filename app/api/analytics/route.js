/**
 * Analytics API Routes
 *
 * Fetch analytics data for dashboards.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';

/**
 * GET /api/analytics
 * Get analytics data for workspace
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const accountId = searchParams.get('account_id');

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
      'analytics:read'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get date range (default: last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Build query for analytics snapshots
    let snapshotsQuery = supabase
      .from('analytics_snapshots')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('snapshot_date', start.toISOString().split('T')[0])
      .lte('snapshot_date', end.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true });

    if (accountId) {
      snapshotsQuery = snapshotsQuery.eq('social_account_id', accountId);
    }

    const { data: snapshots, error: snapshotsError } = await snapshotsQuery;

    if (snapshotsError) throw snapshotsError;

    // Get social accounts for the workspace (for platform lookup)
    const { data: socialAccounts } = await supabase
      .from('social_accounts')
      .select('id, platform, platform_display_name')
      .eq('workspace_id', workspaceId);

    const accountMap = (socialAccounts || []).reduce((map, acc) => {
      map[acc.id] = acc;
      return map;
    }, {});

    // Get post analytics with media
    let postAnalyticsQuery = supabase
      .from('post_analytics')
      .select(`
        *,
        posts (
          id,
          content,
          published_at,
          platforms,
          post_media (
            id,
            file_url,
            media_type,
            thumbnail_url,
            display_order
          )
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('engagement_rate', { ascending: false })
      .limit(10);

    if (accountId) {
      postAnalyticsQuery = postAnalyticsQuery.eq('social_account_id', accountId);
    }

    const { data: postAnalytics, error: postAnalyticsError } = await postAnalyticsQuery;

    if (postAnalyticsError) throw postAnalyticsError;

    // Calculate summary metrics
    const latestSnapshot = snapshots[snapshots.length - 1];
    const previousSnapshot = snapshots[snapshots.length - 2];

    const totalLikes = snapshots.reduce((sum, s) => sum + (s.likes_count || 0), 0);
    const totalComments = snapshots.reduce((sum, s) => sum + (s.comments_count || 0), 0);
    const totalShares = snapshots.reduce((sum, s) => sum + (s.shares_count || 0), 0);
    const totalEngagement = totalLikes + totalComments + totalShares;

    const avgEngagementRate = snapshots.length > 0
      ? snapshots.reduce((sum, s) => sum + parseFloat(s.engagement_rate || 0), 0) / snapshots.length
      : 0;

    const totalReach = snapshots.reduce((sum, s) => sum + (s.reach || 0), 0);
    const totalImpressions = snapshots.reduce((sum, s) => sum + (s.impressions || 0), 0);

    // Calculate growth
    const followersGrowth = latestSnapshot && previousSnapshot
      ? ((latestSnapshot.followers_count - previousSnapshot.followers_count) / previousSnapshot.followers_count) * 100
      : 0;

    // Summary metrics
    const summary = {
      followers: latestSnapshot?.followers_count || 0,
      followersChange: latestSnapshot?.followers_change || 0,
      followersGrowth: parseFloat(followersGrowth.toFixed(2)),
      totalEngagement,
      totalLikes,
      totalComments,
      totalShares,
      avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2)),
      totalReach,
      totalImpressions,
      postsPublished: postAnalytics.length,
    };

    // Format timeline data for charts
    const timeline = snapshots.map(snapshot => ({
      date: snapshot.snapshot_date,
      followers: snapshot.followers_count,
      engagement: snapshot.likes_count + snapshot.comments_count + snapshot.shares_count,
      reach: snapshot.reach || 0,
      impressions: snapshot.impressions || 0,
      engagementRate: parseFloat(snapshot.engagement_rate || 0),
    }));

    // Top performing posts with media
    const topPosts = postAnalytics.map(pa => {
      // Get media sorted by display_order
      const media = (pa.posts?.post_media || [])
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map(m => ({
          id: m.id,
          url: m.file_url,
          type: m.media_type,
          thumbnail: m.thumbnail_url,
        }));

      // Get platform from accountMap using social_account_id
      const account = accountMap[pa.social_account_id];
      const platform = account?.platform || null;
      const platformDisplayName = account?.platform_display_name || null;

      return {
        postId: pa.post_id,
        content: pa.posts?.content?.substring(0, 150) + (pa.posts?.content?.length > 150 ? '...' : ''),
        fullContent: pa.posts?.content,
        publishedAt: pa.posts?.published_at,
        platform,
        platformDisplayName,
        media,
        likes: pa.likes_count,
        comments: pa.comments_count,
        shares: pa.shares_count,
        reach: pa.reach,
        impressions: pa.impressions,
        engagementRate: parseFloat(pa.engagement_rate || 0),
        totalEngagement: pa.likes_count + pa.comments_count + pa.shares_count,
      };
    });

    return NextResponse.json({
      summary,
      timeline,
      topPosts,
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        days: snapshots.length,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
