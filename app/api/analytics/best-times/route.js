/**
 * Best Posting Times Analysis API
 *
 * Analyze historical post performance to determine optimal posting times.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';

/**
 * GET /api/analytics/best-times
 * Analyze best times to post based on historical engagement
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');
    const accountId = searchParams.get('account_id');
    const days = parseInt(searchParams.get('days') || '90');

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

    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build query for posts with analytics
    let postsQuery = supabase
      .from('post_analytics')
      .select(`
        *,
        posts!inner (
          published_at,
          platforms,
          workspace_id
        )
      `)
      .eq('posts.workspace_id', workspaceId)
      .gte('posts.published_at', startDate.toISOString())
      .lte('posts.published_at', endDate.toISOString())
      .not('posts.published_at', 'is', null);

    if (accountId) {
      postsQuery = postsQuery.eq('social_account_id', accountId);
    }

    const { data: postAnalytics, error: analyticsError } = await postsQuery;

    if (analyticsError) throw analyticsError;

    if (!postAnalytics || postAnalytics.length === 0) {
      return NextResponse.json({
        byHour: [],
        byDayOfWeek: [],
        byDayAndHour: {},
        recommendations: [],
        summary: {
          totalPosts: 0,
          analyzedPeriod: days,
        },
      });
    }

    // Analyze by hour of day (0-23)
    const hourlyStats = Array(24).fill(0).map(() => ({
      posts: 0,
      totalEngagement: 0,
      totalReach: 0,
      avgEngagementRate: 0,
    }));

    // Analyze by day of week (0 = Sunday, 6 = Saturday)
    const dailyStats = Array(7).fill(0).map(() => ({
      posts: 0,
      totalEngagement: 0,
      totalReach: 0,
      avgEngagementRate: 0,
    }));

    // Analyze by day and hour combination
    const dayHourStats = {};

    // Process each post
    postAnalytics.forEach(pa => {
      if (!pa.posts?.published_at) return;

      const publishedDate = new Date(pa.posts.published_at);
      const hour = publishedDate.getHours();
      const dayOfWeek = publishedDate.getDay();
      const dayHourKey = `${dayOfWeek}-${hour}`;

      const engagement = (pa.likes_count || 0) + (pa.comments_count || 0) + (pa.shares_count || 0);
      const reach = pa.reach || 0;
      const engagementRate = parseFloat(pa.engagement_rate || 0);

      // Update hourly stats
      hourlyStats[hour].posts++;
      hourlyStats[hour].totalEngagement += engagement;
      hourlyStats[hour].totalReach += reach;
      hourlyStats[hour].avgEngagementRate += engagementRate;

      // Update daily stats
      dailyStats[dayOfWeek].posts++;
      dailyStats[dayOfWeek].totalEngagement += engagement;
      dailyStats[dayOfWeek].totalReach += reach;
      dailyStats[dayOfWeek].avgEngagementRate += engagementRate;

      // Update day-hour combination stats
      if (!dayHourStats[dayHourKey]) {
        dayHourStats[dayHourKey] = {
          posts: 0,
          totalEngagement: 0,
          totalReach: 0,
          avgEngagementRate: 0,
        };
      }
      dayHourStats[dayHourKey].posts++;
      dayHourStats[dayHourKey].totalEngagement += engagement;
      dayHourStats[dayHourKey].totalReach += reach;
      dayHourStats[dayHourKey].avgEngagementRate += engagementRate;
    });

    // Calculate averages
    hourlyStats.forEach(stat => {
      if (stat.posts > 0) {
        stat.avgEngagementRate = stat.avgEngagementRate / stat.posts;
        stat.avgEngagement = stat.totalEngagement / stat.posts;
        stat.avgReach = stat.totalReach / stat.posts;
      }
    });

    dailyStats.forEach(stat => {
      if (stat.posts > 0) {
        stat.avgEngagementRate = stat.avgEngagementRate / stat.posts;
        stat.avgEngagement = stat.totalEngagement / stat.posts;
        stat.avgReach = stat.totalReach / stat.posts;
      }
    });

    Object.keys(dayHourStats).forEach(key => {
      const stat = dayHourStats[key];
      if (stat.posts > 0) {
        stat.avgEngagementRate = stat.avgEngagementRate / stat.posts;
        stat.avgEngagement = stat.totalEngagement / stat.posts;
        stat.avgReach = stat.totalReach / stat.posts;
      }
    });

    // Format results
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const byHour = hourlyStats.map((stat, hour) => ({
      hour,
      label: `${hour.toString().padStart(2, '0')}:00`,
      posts: stat.posts,
      avgEngagement: Math.round(stat.avgEngagement || 0),
      avgReach: Math.round(stat.avgReach || 0),
      avgEngagementRate: parseFloat((stat.avgEngagementRate || 0).toFixed(2)),
    }));

    const byDayOfWeek = dailyStats.map((stat, day) => ({
      day,
      dayName: dayNames[day],
      posts: stat.posts,
      avgEngagement: Math.round(stat.avgEngagement || 0),
      avgReach: Math.round(stat.avgReach || 0),
      avgEngagementRate: parseFloat((stat.avgEngagementRate || 0).toFixed(2)),
    }));

    // Find best times (top 5 day-hour combinations by engagement rate)
    const bestTimes = Object.entries(dayHourStats)
      .map(([key, stat]) => {
        const [day, hour] = key.split('-').map(Number);
        return {
          day,
          hour,
          dayName: dayNames[day],
          timeLabel: `${hour.toString().padStart(2, '0')}:00`,
          posts: stat.posts,
          avgEngagement: Math.round(stat.avgEngagement || 0),
          avgReach: Math.round(stat.avgReach || 0),
          avgEngagementRate: parseFloat((stat.avgEngagementRate || 0).toFixed(2)),
        };
      })
      .filter(t => t.posts >= 3) // Only include times with at least 3 posts
      .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)
      .slice(0, 5);

    // Generate recommendations
    const recommendations = bestTimes.map((time, index) => ({
      rank: index + 1,
      day: time.dayName,
      time: time.timeLabel,
      reason: `${time.avgEngagementRate}% avg engagement rate from ${time.posts} posts`,
      confidence: time.posts >= 10 ? 'high' : time.posts >= 5 ? 'medium' : 'low',
    }));

    return NextResponse.json({
      byHour,
      byDayOfWeek,
      byDayAndHour: dayHourStats,
      recommendations,
      summary: {
        totalPosts: postAnalytics.length,
        analyzedPeriod: days,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        },
      },
    });
  } catch (error) {
    console.error('Error analyzing best times:', error);
    return NextResponse.json(
      { error: 'Failed to analyze best times' },
      { status: 500 }
    );
  }
}
