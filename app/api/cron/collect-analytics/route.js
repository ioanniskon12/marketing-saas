/**
 * Analytics Collection Cron Job
 *
 * Collects daily analytics snapshots for all connected social accounts.
 * This endpoint should be called daily by a cron service (e.g., Vercel Cron, GitHub Actions).
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getInstagramToken } from '@/lib/integrations/instagram';
import { getFacebookToken } from '@/lib/integrations/facebook';

/**
 * POST /api/cron/collect-analytics
 * Collect analytics for all active social accounts
 */
export async function POST(request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get all active social accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('is_active', true);

    if (accountsError) throw accountsError;

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        message: 'No active accounts to collect analytics for',
        collected: 0,
      });
    }

    const results = [];
    const today = new Date().toISOString().split('T')[0];

    // Collect analytics for each account
    for (const account of accounts) {
      try {
        let metrics = null;

        // Fetch metrics based on platform
        switch (account.platform) {
          case 'instagram':
            metrics = await collectInstagramMetrics(account);
            break;
          case 'facebook':
            metrics = await collectFacebookMetrics(account);
            break;
          case 'linkedin':
            metrics = await collectLinkedInMetrics(account);
            break;
          default:
            console.warn(`Platform ${account.platform} not supported for analytics collection`);
            continue;
        }

        if (!metrics) {
          results.push({
            accountId: account.id,
            platform: account.platform,
            status: 'skipped',
            reason: 'No metrics returned',
          });
          continue;
        }

        // Calculate engagement rate
        const totalEngagement = metrics.likes + metrics.comments + metrics.shares;
        const engagementRate = metrics.followers > 0
          ? (totalEngagement / metrics.followers) * 100
          : 0;

        // Check if snapshot already exists for today
        const { data: existingSnapshot } = await supabase
          .from('analytics_snapshots')
          .select('id, followers_count')
          .eq('social_account_id', account.id)
          .eq('snapshot_date', today)
          .single();

        const snapshotData = {
          workspace_id: account.workspace_id,
          social_account_id: account.id,
          snapshot_date: today,
          followers_count: metrics.followers,
          followers_change: existingSnapshot
            ? metrics.followers - existingSnapshot.followers_count
            : 0,
          likes_count: metrics.likes,
          comments_count: metrics.comments,
          shares_count: metrics.shares,
          saves_count: metrics.saves || 0,
          reach: metrics.reach || 0,
          impressions: metrics.impressions || 0,
          engagement_rate: parseFloat(engagementRate.toFixed(2)),
          platform_data: metrics.platformData || {},
        };

        if (existingSnapshot) {
          // Update existing snapshot
          const { error: updateError } = await supabase
            .from('analytics_snapshots')
            .update(snapshotData)
            .eq('id', existingSnapshot.id);

          if (updateError) throw updateError;

          results.push({
            accountId: account.id,
            platform: account.platform,
            status: 'updated',
          });
        } else {
          // Insert new snapshot
          const { error: insertError } = await supabase
            .from('analytics_snapshots')
            .insert(snapshotData);

          if (insertError) throw insertError;

          results.push({
            accountId: account.id,
            platform: account.platform,
            status: 'created',
          });
        }
      } catch (error) {
        console.error(`Error collecting analytics for account ${account.id}:`, error);
        results.push({
          accountId: account.id,
          platform: account.platform,
          status: 'failed',
          error: error.message,
        });
      }
    }

    // Summary
    const summary = {
      total: accounts.length,
      created: results.filter(r => r.status === 'created').length,
      updated: results.filter(r => r.status === 'updated').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
    };

    return NextResponse.json({
      message: 'Analytics collection completed',
      summary,
      results,
    });
  } catch (error) {
    console.error('Error in analytics collection cron:', error);
    return NextResponse.json(
      { error: 'Failed to collect analytics' },
      { status: 500 }
    );
  }
}

/**
 * Collect Instagram metrics
 */
async function collectInstagramMetrics(account) {
  try {
    const accessToken = await getInstagramToken(account.id);

    // Get user insights
    const insightsResponse = await fetch(
      `https://graph.instagram.com/${account.platform_user_id}/insights?metric=follower_count,impressions,reach,profile_views&period=day&access_token=${accessToken}`
    );

    if (!insightsResponse.ok) {
      throw new Error('Failed to fetch Instagram insights');
    }

    const insightsData = await insightsResponse.json();

    // Get media insights (recent posts)
    const mediaResponse = await fetch(
      `https://graph.instagram.com/${account.platform_user_id}/media?fields=like_count,comments_count,timestamp&limit=10&access_token=${accessToken}`
    );

    if (!mediaResponse.ok) {
      throw new Error('Failed to fetch Instagram media');
    }

    const mediaData = await mediaResponse.json();

    // Calculate totals from recent posts
    const recentPosts = mediaData.data || [];
    const totalLikes = recentPosts.reduce((sum, post) => sum + (post.like_count || 0), 0);
    const totalComments = recentPosts.reduce((sum, post) => sum + (post.comments_count || 0), 0);

    // Extract insights
    const insights = insightsData.data || [];
    const followerCount = insights.find(i => i.name === 'follower_count')?.values[0]?.value || 0;
    const impressions = insights.find(i => i.name === 'impressions')?.values[0]?.value || 0;
    const reach = insights.find(i => i.name === 'reach')?.values[0]?.value || 0;

    return {
      followers: followerCount,
      likes: totalLikes,
      comments: totalComments,
      shares: 0, // Instagram API doesn't provide share count
      impressions,
      reach,
      platformData: {
        profile_views: insights.find(i => i.name === 'profile_views')?.values[0]?.value || 0,
      },
    };
  } catch (error) {
    console.error('Error collecting Instagram metrics:', error);
    return null;
  }
}

/**
 * Collect Facebook metrics
 */
async function collectFacebookMetrics(account) {
  try {
    const accessToken = await getFacebookToken(account.id);

    // Get page insights
    const insightsResponse = await fetch(
      `https://graph.facebook.com/v18.0/${account.platform_user_id}/insights?metric=page_fans,page_impressions,page_post_engagements&period=day&access_token=${accessToken}`
    );

    if (!insightsResponse.ok) {
      throw new Error('Failed to fetch Facebook insights');
    }

    const insightsData = await insightsResponse.json();

    // Get recent posts
    const postsResponse = await fetch(
      `https://graph.facebook.com/v18.0/${account.platform_user_id}/posts?fields=likes.summary(true),comments.summary(true),shares&limit=10&access_token=${accessToken}`
    );

    if (!postsResponse.ok) {
      throw new Error('Failed to fetch Facebook posts');
    }

    const postsData = await postsResponse.json();

    // Calculate totals from recent posts
    const recentPosts = postsData.data || [];
    const totalLikes = recentPosts.reduce((sum, post) => sum + (post.likes?.summary?.total_count || 0), 0);
    const totalComments = recentPosts.reduce((sum, post) => sum + (post.comments?.summary?.total_count || 0), 0);
    const totalShares = recentPosts.reduce((sum, post) => sum + (post.shares?.count || 0), 0);

    // Extract insights
    const insights = insightsData.data || [];
    const followers = insights.find(i => i.name === 'page_fans')?.values[0]?.value || 0;
    const impressions = insights.find(i => i.name === 'page_impressions')?.values[0]?.value || 0;
    const engagement = insights.find(i => i.name === 'page_post_engagements')?.values[0]?.value || 0;

    return {
      followers,
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      impressions,
      reach: 0, // Facebook doesn't provide reach in page insights
      platformData: {
        page_engagement: engagement,
      },
    };
  } catch (error) {
    console.error('Error collecting Facebook metrics:', error);
    return null;
  }
}

/**
 * Collect LinkedIn metrics
 */
async function collectLinkedInMetrics(account) {
  try {
    // LinkedIn API requires organization URN and has stricter rate limits
    // This is a simplified implementation

    const organizationUrn = `urn:li:organization:${account.platform_user_id}`;

    const followersResponse = await fetch(
      `https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=${encodeURIComponent(organizationUrn)}`,
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (!followersResponse.ok) {
      throw new Error('Failed to fetch LinkedIn followers');
    }

    const followersData = await followersResponse.json();

    // Get share statistics (posts)
    const sharesResponse = await fetch(
      `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${encodeURIComponent(organizationUrn)}`,
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalImpressions = 0;

    if (sharesResponse.ok) {
      const sharesData = await sharesResponse.json();
      const stats = sharesData.elements || [];

      totalLikes = stats.reduce((sum, stat) => sum + (stat.totalShareStatistics?.likeCount || 0), 0);
      totalComments = stats.reduce((sum, stat) => sum + (stat.totalShareStatistics?.commentCount || 0), 0);
      totalShares = stats.reduce((sum, stat) => sum + (stat.totalShareStatistics?.shareCount || 0), 0);
      totalImpressions = stats.reduce((sum, stat) => sum + (stat.totalShareStatistics?.impressionCount || 0), 0);
    }

    const followers = followersData.elements?.[0]?.followerCounts?.organicFollowerCount || 0;

    return {
      followers,
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      impressions: totalImpressions,
      reach: 0, // LinkedIn doesn't provide reach metric
      platformData: {},
    };
  } catch (error) {
    console.error('Error collecting LinkedIn metrics:', error);
    return null;
  }
}

/**
 * GET endpoint for manual testing
 * Remove in production or secure properly
 */
export async function GET(request) {
  // Allow manual trigger with secret
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Forward to POST handler
  return POST(request);
}
