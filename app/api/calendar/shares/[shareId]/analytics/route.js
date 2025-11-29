/**
 * Calendar Share Analytics API
 *
 * GET /api/calendar/shares/[shareId]/analytics
 * Retrieve detailed analytics for a calendar share
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Parse user agent to detect device type
 */
function detectDeviceType(userAgent) {
  if (!userAgent || userAgent === 'unknown') return 'unknown';

  const ua = userAgent.toLowerCase();

  // Check for mobile devices
  if (/(android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini)/i.test(ua)) {
    // Distinguish between tablet and mobile
    if (/(ipad|tablet|kindle|playbook|nexus 7|nexus 10)/i.test(ua)) {
      return 'tablet';
    }
    return 'mobile';
  }

  // Default to desktop
  return 'desktop';
}

/**
 * GET /api/calendar/shares/[shareId]/analytics
 * Get analytics for a calendar share
 */
export async function GET(request, { params }) {
  try {
    const { shareId } = params;

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the calendar share and verify access
    const { data: calendarShare, error: shareError } = await supabase
      .from('calendar_shares')
      .select(`
        id,
        workspace_id,
        title,
        created_at,
        workspaces!inner (
          id,
          name,
          workspace_members!inner (
            user_id,
            role
          )
        )
      `)
      .eq('id', shareId)
      .single();

    if (shareError || !calendarShare) {
      return NextResponse.json(
        { error: 'Calendar share not found' },
        { status: 404 }
      );
    }

    // Verify user is a member of the workspace
    const isMember = calendarShare.workspaces.workspace_members.some(
      member => member.user_id === user.id
    );

    if (!isMember) {
      return NextResponse.json(
        { error: 'You do not have access to this calendar share' },
        { status: 403 }
      );
    }

    // Get all activity for this share
    const { data: activities, error: activitiesError } = await supabase
      .from('calendar_share_activity')
      .select('*')
      .eq('calendar_share_id', shareId)
      .order('created_at', { ascending: true });

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      throw activitiesError;
    }

    // Get comment count
    const { count: commentCount, error: commentsError } = await supabase
      .from('calendar_share_comments')
      .select('*', { count: 'exact', head: true })
      .eq('calendar_share_id', shareId);

    if (commentsError) {
      console.error('Error fetching comment count:', commentsError);
    }

    // Get approval count
    const { count: approvalCount, error: approvalsError } = await supabase
      .from('calendar_share_approvals')
      .select('*', { count: 'exact', head: true })
      .eq('calendar_share_id', shareId);

    if (approvalsError) {
      console.error('Error fetching approval count:', approvalsError);
    }

    // Process activities
    const activityList = activities || [];

    // Calculate summary metrics
    const totalViews = activityList.filter(a => a.activity_type === 'view').length;
    const totalDownloads = activityList.filter(a => a.activity_type === 'download').length;
    const totalComments = commentCount || 0;
    const totalApprovals = approvalCount || 0;

    // Count unique visitors (by IP)
    const uniqueIPs = new Set(activityList.map(a => a.visitor_ip).filter(ip => ip && ip !== 'unknown'));
    const uniqueVisitors = uniqueIPs.size;

    // Build timeline data (group by date)
    const timelineMap = {};

    activityList.forEach(activity => {
      const date = new Date(activity.created_at).toISOString().split('T')[0];

      if (!timelineMap[date]) {
        timelineMap[date] = { date, views: 0, downloads: 0, comments: 0, approvals: 0 };
      }

      if (activity.activity_type === 'view') {
        timelineMap[date].views += 1;
      } else if (activity.activity_type === 'download') {
        timelineMap[date].downloads += 1;
      } else if (activity.activity_type === 'comment') {
        timelineMap[date].comments += 1;
      } else if (activity.activity_type === 'approval') {
        timelineMap[date].approvals += 1;
      }
    });

    // Convert timeline map to sorted array
    const timeline = Object.values(timelineMap).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    // Extract countries and count occurrences
    const countryMap = {};

    activityList.forEach(activity => {
      if (activity.visitor_country && activity.visitor_country !== 'unknown') {
        countryMap[activity.visitor_country] = (countryMap[activity.visitor_country] || 0) + 1;
      }
    });

    // Convert to array and sort by count, take top 5
    const countries = Object.entries(countryMap)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Detect device types
    const devices = {
      mobile: 0,
      desktop: 0,
      tablet: 0,
      unknown: 0,
    };

    activityList.forEach(activity => {
      const deviceType = detectDeviceType(activity.visitor_device);
      devices[deviceType] = (devices[deviceType] || 0) + 1;
    });

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivities = activityList.filter(a =>
      new Date(a.created_at) >= sevenDaysAgo
    );

    const recentViews = recentActivities.filter(a => a.activity_type === 'view').length;
    const recentDownloads = recentActivities.filter(a => a.activity_type === 'download').length;

    // Calculate activity by hour of day (for engagement insights)
    const hourlyActivity = Array(24).fill(0);

    activityList.forEach(activity => {
      const hour = new Date(activity.created_at).getHours();
      hourlyActivity[hour] += 1;
    });

    // Find peak activity hour
    const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));

    // Build response
    return NextResponse.json({
      share: {
        id: calendarShare.id,
        title: calendarShare.title,
        created_at: calendarShare.created_at,
      },
      summary: {
        totalViews,
        totalDownloads,
        totalComments,
        totalApprovals,
        uniqueVisitors,
        recentViews,
        recentDownloads,
        peakActivityHour: peakHour,
      },
      timeline,
      countries,
      devices,
      hourlyActivity,
      recentActivity: recentActivities.slice(-10).reverse().map(activity => ({
        type: activity.activity_type,
        country: activity.visitor_country || 'Unknown',
        device: detectDeviceType(activity.visitor_device),
        timestamp: activity.created_at,
      })),
    });

  } catch (error) {
    console.error('Error in GET /api/calendar/shares/[shareId]/analytics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve calendar share analytics' },
      { status: 500 }
    );
  }
}
