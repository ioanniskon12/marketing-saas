/**
 * Social Listening Mentions Collection Cron Job
 *
 * Collects mentions, hashtags, and keywords from social platforms.
 * Runs periodically via Vercel Cron.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getInstagramToken } from '@/lib/integrations/instagram';
import { getFacebookToken } from '@/lib/integrations/facebook';

/**
 * POST /api/cron/collect-mentions
 * Collect social listening mentions for all active keywords
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

    // Get all active keywords
    const { data: keywords, error: keywordsError } = await supabase
      .from('listening_keywords')
      .select('*')
      .eq('is_active', true);

    if (keywordsError) throw keywordsError;

    if (!keywords || keywords.length === 0) {
      return NextResponse.json({
        message: 'No active keywords to track',
        collected: 0,
      });
    }

    const results = [];
    let totalCollected = 0;

    // Process each keyword
    for (const keyword of keywords) {
      try {
        const platforms = keyword.platforms || [];

        for (const platform of platforms) {
          try {
            let mentions = [];

            switch (platform) {
              case 'instagram':
                mentions = await collectInstagramMentions(keyword, supabase);
                break;

              case 'facebook':
                mentions = await collectFacebookMentions(keyword, supabase);
                break;

              case 'linkedin':
                mentions = await collectLinkedInMentions(keyword, supabase);
                break;

              case 'twitter':
                // Twitter API v2 requires separate implementation
                console.log('Twitter mentions collection not yet implemented');
                break;

              default:
                console.warn(`Platform ${platform} not supported for listening`);
                continue;
            }

            // Save mentions
            for (const mention of mentions) {
              try {
                // Check if mention already exists
                const { data: existing } = await supabase
                  .from('listening_mentions')
                  .select('id')
                  .eq('platform', platform)
                  .eq('platform_post_id', mention.platform_post_id)
                  .single();

                if (existing) {
                  continue; // Skip duplicates
                }

                // Calculate basic sentiment
                const sentiment = calculateSentiment(mention.content);

                // Insert mention
                await supabase
                  .from('listening_mentions')
                  .insert({
                    workspace_id: keyword.workspace_id,
                    keyword_id: keyword.id,
                    platform,
                    platform_post_id: mention.platform_post_id,
                    post_url: mention.post_url,
                    author_username: mention.author_username,
                    author_display_name: mention.author_display_name,
                    author_avatar_url: mention.author_avatar_url,
                    author_followers_count: mention.author_followers_count,
                    content: mention.content,
                    media_urls: mention.media_urls || [],
                    likes_count: mention.likes_count || 0,
                    comments_count: mention.comments_count || 0,
                    shares_count: mention.shares_count || 0,
                    engagement_rate: mention.engagement_rate || 0,
                    sentiment,
                    published_at: mention.published_at,
                  });

                totalCollected++;
              } catch (error) {
                console.error('Error saving mention:', error);
              }
            }

            results.push({
              keywordId: keyword.id,
              keyword: keyword.keyword,
              platform,
              collected: mentions.length,
              status: 'success',
            });
          } catch (error) {
            console.error(`Error collecting mentions for ${keyword.keyword} on ${platform}:`, error);
            results.push({
              keywordId: keyword.id,
              keyword: keyword.keyword,
              platform,
              status: 'failed',
              error: error.message,
            });
          }
        }
      } catch (error) {
        console.error(`Error processing keyword ${keyword.keyword}:`, error);
      }
    }

    return NextResponse.json({
      message: 'Mentions collection completed',
      summary: {
        keywordsProcessed: keywords.length,
        totalCollected,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
      },
      results,
    });
  } catch (error) {
    console.error('Error in collect mentions cron:', error);
    return NextResponse.json(
      { error: 'Failed to collect mentions' },
      { status: 500 }
    );
  }
}

/**
 * Collect Instagram mentions
 */
async function collectInstagramMentions(keyword, supabase) {
  // Get workspace's connected Instagram accounts
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('workspace_id', keyword.workspace_id)
    .eq('platform', 'instagram')
    .eq('is_active', true);

  if (!accounts || accounts.length === 0) {
    return [];
  }

  const mentions = [];

  for (const account of accounts) {
    try {
      const accessToken = await getInstagramToken(account.id);
      const igUserId = account.platform_user_id;

      let endpoint = '';
      let searchTerm = keyword.keyword;

      // Determine search type
      if (keyword.type === 'hashtag') {
        // Search for hashtag
        searchTerm = searchTerm.replace(/^#/, '');
        const hashtagResponse = await fetch(
          `https://graph.instagram.com/v18.0/ig_hashtag_search?user_id=${igUserId}&q=${encodeURIComponent(searchTerm)}&access_token=${accessToken}`
        );

        const hashtagData = await hashtagResponse.json();

        if (hashtagData.data && hashtagData.data.length > 0) {
          const hashtagId = hashtagData.data[0].id;

          // Get recent media for hashtag
          const mediaResponse = await fetch(
            `https://graph.instagram.com/v18.0/${hashtagId}/recent_media?user_id=${igUserId}&fields=id,caption,media_url,permalink,timestamp,like_count,comments_count,media_type,username&limit=10&access_token=${accessToken}`
          );

          const mediaData = await mediaResponse.json();

          if (mediaData.data) {
            for (const post of mediaData.data) {
              mentions.push({
                platform_post_id: post.id,
                post_url: post.permalink,
                author_username: post.username,
                author_display_name: post.username,
                content: post.caption || '',
                media_urls: post.media_url ? [post.media_url] : [],
                likes_count: post.like_count || 0,
                comments_count: post.comments_count || 0,
                shares_count: 0,
                published_at: post.timestamp,
              });
            }
          }
        }
      } else if (keyword.type === 'mention') {
        // Get mentions of the account
        const mentionsResponse = await fetch(
          `https://graph.instagram.com/v18.0/${igUserId}?fields=mentioned_media.limit(10){id,caption,media_url,permalink,timestamp,like_count,comments_count,username}&access_token=${accessToken}`
        );

        const mentionsData = await mentionsResponse.json();

        if (mentionsData.mentioned_media?.data) {
          for (const post of mentionsData.mentioned_media.data) {
            if (post.caption && post.caption.toLowerCase().includes(keyword.keyword.toLowerCase())) {
              mentions.push({
                platform_post_id: post.id,
                post_url: post.permalink,
                author_username: post.username,
                author_display_name: post.username,
                content: post.caption || '',
                media_urls: post.media_url ? [post.media_url] : [],
                likes_count: post.like_count || 0,
                comments_count: post.comments_count || 0,
                shares_count: 0,
                published_at: post.timestamp,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error collecting Instagram mentions:', error);
    }
  }

  return mentions;
}

/**
 * Collect Facebook mentions
 */
async function collectFacebookMentions(keyword, supabase) {
  // Get workspace's connected Facebook pages
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('workspace_id', keyword.workspace_id)
    .eq('platform', 'facebook')
    .eq('is_active', true);

  if (!accounts || accounts.length === 0) {
    return [];
  }

  const mentions = [];

  for (const account of accounts) {
    try {
      const accessToken = await getFacebookToken(account.id);
      const pageId = account.platform_user_id;

      if (keyword.type === 'mention') {
        // Get posts that mention the page
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${pageId}/tagged?fields=id,message,from,created_time,permalink_url,likes.summary(true),comments.summary(true),shares&limit=10&access_token=${accessToken}`
        );

        const data = await response.json();

        if (data.data) {
          for (const post of data.data) {
            mentions.push({
              platform_post_id: post.id,
              post_url: post.permalink_url,
              author_username: post.from?.id,
              author_display_name: post.from?.name,
              content: post.message || '',
              likes_count: post.likes?.summary?.total_count || 0,
              comments_count: post.comments?.summary?.total_count || 0,
              shares_count: post.shares?.count || 0,
              published_at: post.created_time,
            });
          }
        }
      } else {
        // Search for keyword in posts (limited by Facebook API)
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${pageId}/feed?fields=id,message,from,created_time,permalink_url,likes.summary(true),comments.summary(true),shares&limit=25&access_token=${accessToken}`
        );

        const data = await response.json();

        if (data.data) {
          for (const post of data.data) {
            if (post.message && post.message.toLowerCase().includes(keyword.keyword.toLowerCase())) {
              mentions.push({
                platform_post_id: post.id,
                post_url: post.permalink_url,
                author_username: post.from?.id,
                author_display_name: post.from?.name,
                content: post.message || '',
                likes_count: post.likes?.summary?.total_count || 0,
                comments_count: post.comments?.summary?.total_count || 0,
                shares_count: post.shares?.count || 0,
                published_at: post.created_time,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error collecting Facebook mentions:', error);
    }
  }

  return mentions;
}

/**
 * Collect LinkedIn mentions
 */
async function collectLinkedInMentions(keyword, supabase) {
  // Get workspace's connected LinkedIn accounts
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('workspace_id', keyword.workspace_id)
    .eq('platform', 'linkedin')
    .eq('is_active', true);

  if (!accounts || accounts.length === 0) {
    return [];
  }

  const mentions = [];

  // Note: LinkedIn's search API is limited
  // This is a simplified implementation
  for (const account of accounts) {
    try {
      const accessToken = account.access_token;

      // Get recent posts (limited search capability)
      const response = await fetch(
        `https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:person:${account.platform_user_id}&count=10`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      const data = await response.json();

      if (data.elements) {
        for (const share of data.elements) {
          const text = share.text?.text || '';

          if (text.toLowerCase().includes(keyword.keyword.toLowerCase())) {
            mentions.push({
              platform_post_id: share.id,
              post_url: `https://www.linkedin.com/feed/update/${share.id}`,
              author_username: account.platform_username,
              author_display_name: account.display_name,
              content: text,
              likes_count: 0, // Would need additional API call
              comments_count: 0,
              shares_count: 0,
              published_at: new Date(share.created?.time).toISOString(),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error collecting LinkedIn mentions:', error);
    }
  }

  return mentions;
}

/**
 * Calculate basic sentiment from text
 */
function calculateSentiment(text) {
  if (!text) return 'neutral';

  const lowerText = text.toLowerCase();

  // Positive keywords
  const positiveKeywords = [
    'love', 'great', 'amazing', 'awesome', 'excellent', 'fantastic',
    'wonderful', 'good', 'best', 'happy', 'thank', 'thanks', 'beautiful',
    'perfect', 'nice', 'appreciate', 'glad', 'excited', 'impressed',
  ];

  // Negative keywords
  const negativeKeywords = [
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'angry',
    'disappointed', 'poor', 'sucks', 'useless', 'annoying', 'frustrated',
    'disappointing', 'sad', 'unhappy', 'problem', 'issue', 'broken',
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) positiveCount++;
  });

  negativeKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) negativeCount++;
  });

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * GET endpoint for manual testing
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return POST(request);
}
