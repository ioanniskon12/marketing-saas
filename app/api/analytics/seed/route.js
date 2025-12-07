/**
 * Analytics Seed API
 *
 * POST /api/analytics/seed - Generate sample analytics data for demo/testing
 */

import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Verify workspace exists and get owner
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id, owner_id')
      .eq('id', workspaceId)
      .single();

    if (workspaceError || !workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    const createdBy = workspace.owner_id;

    // Get social accounts for this workspace
    const { data: accounts } = await supabase
      .from('social_accounts')
      .select('id, platform')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true);

    if (!accounts || accounts.length === 0) {
      return NextResponse.json(
        { error: 'No social accounts found. Please connect at least one social account first.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const sampleContents = [
      "Check out our latest product update! 🚀",
      "Happy Monday! Here's some motivation for the week ahead 💪",
      "Behind the scenes look at our team working hard 👨‍💻",
      "Customer success story: How we helped Company X grow by 300% 📈",
      "New blog post: 10 Tips for Social Media Marketing",
      "Join us for our upcoming webinar! Register now 🎯",
      "Product feature spotlight: Discover what's new ✨",
      "Thank you for 10k followers! 🎉",
    ];

    // 1. Generate sample posts
    const samplePosts = [];
    for (let i = 0; i < 30; i++) {
      const postDate = new Date(now);
      postDate.setDate(postDate.getDate() - i);

      const postsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < postsPerDay; j++) {
        const account = accounts[Math.floor(Math.random() * accounts.length)];
        const content = sampleContents[Math.floor(Math.random() * sampleContents.length)];

        samplePosts.push({
          workspace_id: workspaceId,
          created_by: createdBy,
          content: content,
          platforms: [account.platform],
          status: 'published',
          scheduled_for: postDate.toISOString(),
          published_at: postDate.toISOString(),
        });
      }
    }

    // Insert sample posts
    const { data: insertedPosts, error: postsError } = await supabase
      .from('posts')
      .insert(samplePosts)
      .select();

    if (postsError) {
      console.error('Error inserting sample posts:', postsError);
      return NextResponse.json(
        { error: 'Failed to create sample posts: ' + postsError.message },
        { status: 500 }
      );
    }

    // 2. Generate analytics_snapshots for each day (this is what the analytics page reads)
    const analyticsSnapshots = [];
    let currentFollowers = Math.floor(Math.random() * 5000) + 1000;

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dailyGrowth = Math.floor(Math.random() * 250) - 50;
      currentFollowers = Math.max(500, currentFollowers + dailyGrowth);

      for (const account of accounts) {
        const likes = Math.floor(Math.random() * 500) + 50;
        const comments = Math.floor(Math.random() * 50) + 5;
        const shares = Math.floor(Math.random() * 30) + 2;
        const reach = Math.floor(likes * (Math.random() * 5 + 2));
        const impressions = Math.floor(reach * (Math.random() * 1.5 + 1));
        const accountFollowers = Math.floor(currentFollowers / accounts.length);

        analyticsSnapshots.push({
          workspace_id: workspaceId,
          social_account_id: account.id,
          snapshot_date: dateStr,
          followers_count: accountFollowers,
          followers_change: dailyGrowth,
          likes_count: likes,
          comments_count: comments,
          shares_count: shares,
          reach: reach,
          impressions: impressions,
          engagement_rate: ((likes + comments + shares) / Math.max(accountFollowers, 1) * 100).toFixed(2),
        });
      }
    }

    // Insert analytics snapshots (use upsert to handle duplicate dates)
    const { error: snapshotsError } = await supabase
      .from('analytics_snapshots')
      .upsert(analyticsSnapshots, {
        onConflict: 'social_account_id,snapshot_date',
        ignoreDuplicates: false
      });

    if (snapshotsError) {
      console.error('Error inserting analytics snapshots:', snapshotsError);
      // Continue anyway - might be duplicate dates
    }

    // 3. Generate post_analytics for each post
    const postAnalytics = [];
    for (const post of insertedPosts || []) {
      const account = accounts.find(a => post.platforms?.includes(a.platform)) || accounts[0];
      const likes = Math.floor(Math.random() * 500) + 50;
      const comments = Math.floor(Math.random() * 50) + 5;
      const shares = Math.floor(Math.random() * 30) + 2;
      const reach = Math.floor(likes * (Math.random() * 5 + 2));
      const impressions = Math.floor(reach * (Math.random() * 1.5 + 1));

      postAnalytics.push({
        workspace_id: workspaceId,
        post_id: post.id,
        social_account_id: account.id,
        likes_count: likes,
        comments_count: comments,
        shares_count: shares,
        saves_count: Math.floor(Math.random() * 20),
        reach: reach,
        impressions: impressions,
        engagement_rate: ((likes + comments + shares) / Math.max(reach, 1) * 100).toFixed(2),
      });
    }

    // Insert post analytics
    const { error: postAnalyticsError } = await supabase
      .from('post_analytics')
      .insert(postAnalytics);

    if (postAnalyticsError) {
      console.error('Error inserting post analytics:', postAnalyticsError);
      // Continue anyway
    }

    return NextResponse.json({
      success: true,
      message: 'Sample analytics data generated successfully',
      data: {
        postsCreated: insertedPosts?.length || 0,
        snapshotsCreated: analyticsSnapshots.length,
        postAnalyticsCreated: postAnalytics.length,
        dateRange: {
          from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0],
        },
      },
    });

  } catch (error) {
    console.error('Error generating sample data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate sample data' },
      { status: 500 }
    );
  }
}
