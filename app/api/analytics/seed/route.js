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

    // Verify workspace exists
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('id', workspaceId)
      .single();

    if (workspaceError || !workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

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

    // Generate sample posts with analytics data
    const samplePosts = [];
    const platforms = ['facebook', 'instagram', 'twitter', 'linkedin'];
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

    // Create posts for the last 30 days
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const postDate = new Date(now);
      postDate.setDate(postDate.getDate() - i);

      // Create 1-3 posts per day
      const postsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < postsPerDay; j++) {
        const account = accounts[Math.floor(Math.random() * accounts.length)];
        const content = sampleContents[Math.floor(Math.random() * sampleContents.length)];

        // Random metrics
        const likes = Math.floor(Math.random() * 500) + 50;
        const comments = Math.floor(Math.random() * 50) + 5;
        const shares = Math.floor(Math.random() * 30) + 2;
        const reach = likes * (Math.random() * 5 + 2); // Reach is typically 2-7x likes
        const impressions = reach * (Math.random() * 1.5 + 1); // Impressions > Reach

        samplePosts.push({
          workspace_id: workspaceId,
          social_account_id: account.id,
          content: content,
          platforms: [account.platform],
          status: 'published',
          scheduled_for: postDate.toISOString(),
          published_at: postDate.toISOString(),
          created_at: postDate.toISOString(),
          updated_at: postDate.toISOString(),
          analytics: {
            likes,
            comments,
            shares,
            reach: Math.floor(reach),
            impressions: Math.floor(impressions),
            engagement_rate: ((likes + comments + shares) / reach * 100).toFixed(2),
            clicks: Math.floor(Math.random() * 20) + 1,
            saves: Math.floor(Math.random() * 15) + 1,
          },
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

    // Generate follower growth data
    const followerGrowth = [];
    let currentFollowers = Math.floor(Math.random() * 5000) + 1000; // Start with 1000-6000 followers

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Random daily growth (-50 to +200)
      const dailyGrowth = Math.floor(Math.random() * 250) - 50;
      currentFollowers += dailyGrowth;

      for (const account of accounts) {
        followerGrowth.push({
          workspace_id: workspaceId,
          social_account_id: account.id,
          platform: account.platform,
          date: date.toISOString().split('T')[0],
          followers: Math.floor(currentFollowers / accounts.length),
          following: Math.floor(Math.random() * 500) + 100,
          posts_count: Math.floor(Math.random() * 200) + 50,
          engagement_rate: (Math.random() * 5 + 2).toFixed(2), // 2-7%
        });
      }
    }

    // Insert follower growth data
    const { error: growthError } = await supabase
      .from('analytics_daily')
      .insert(followerGrowth);

    if (growthError) {
      console.error('Error inserting follower growth:', growthError);
      // Don't fail if analytics table doesn't exist, just log
    }

    return NextResponse.json({
      success: true,
      message: 'Sample analytics data generated successfully',
      data: {
        postsCreated: insertedPosts?.length || 0,
        dateRange: {
          from: new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0],
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
