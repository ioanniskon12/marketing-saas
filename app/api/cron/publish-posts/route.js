/**
 * Auto-Publish Scheduled Posts Cron Job
 *
 * Automatically publishes posts that are scheduled for the current time.
 * Runs every 5 minutes via Vercel Cron.
 */

import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getInstagramToken } from '@/lib/integrations/instagram';

/**
 * POST /api/cron/publish-posts
 * Publish all scheduled posts that are due
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

    const supabase = createAdminClient();

    // Get current time with 5-minute buffer
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Get all posts scheduled between 5 minutes ago and now
    const { data: scheduledPosts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        post_media (
          id,
          file_url,
          media_type,
          display_order
        )
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', now.toISOString())
      .gte('scheduled_for', fiveMinutesAgo.toISOString());

    if (postsError) throw postsError;

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return NextResponse.json({
        message: 'No posts to publish',
        published: 0,
      });
    }

    const results = [];

    // Publish each post
    for (const post of scheduledPosts) {
      try {
        // Update status to publishing
        await supabase
          .from('posts')
          .update({ status: 'publishing' })
          .eq('id', post.id);

        // Get social accounts for this post
        const { data: accounts, error: accountsError } = await supabase
          .from('social_accounts')
          .select('*')
          .in('id', post.platforms || [])
          .eq('is_active', true);

        if (accountsError) throw accountsError;

        if (!accounts || accounts.length === 0) {
          throw new Error('No active social accounts found');
        }

        const publishResults = [];

        // Publish to each platform
        for (const account of accounts) {
          try {
            let platformPostId = null;

            switch (account.platform) {
              case 'instagram':
                platformPostId = await publishToInstagram(post, account);
                break;

              case 'facebook':
                platformPostId = await publishToFacebook(post, account);
                break;

              case 'linkedin':
                platformPostId = await publishToLinkedIn(post, account);
                break;

              default:
                console.warn(`Platform ${account.platform} not supported for publishing`);
                continue;
            }

            publishResults.push({
              platform: account.platform,
              accountId: account.id,
              platformPostId,
              status: 'success',
            });

            // Create post analytics record
            await supabase
              .from('post_analytics')
              .insert({
                post_id: post.id,
                workspace_id: post.workspace_id,
                social_account_id: account.id,
                platform_post_id: platformPostId,
                likes_count: 0,
                comments_count: 0,
                shares_count: 0,
              });
          } catch (error) {
            console.error(`Error publishing to ${account.platform}:`, error);
            publishResults.push({
              platform: account.platform,
              accountId: account.id,
              status: 'failed',
              error: error.message,
            });
          }
        }

        // Check if any platform succeeded
        const anySuccess = publishResults.some(r => r.status === 'success');

        // Update post status
        const finalStatus = anySuccess ? 'published' : 'failed';
        await supabase
          .from('posts')
          .update({
            status: finalStatus,
            published_at: anySuccess ? new Date().toISOString() : null,
          })
          .eq('id', post.id);

        results.push({
          postId: post.id,
          status: finalStatus,
          platforms: publishResults,
        });
      } catch (error) {
        console.error(`Error publishing post ${post.id}:`, error);

        // Update status to failed
        await supabase
          .from('posts')
          .update({ status: 'failed' })
          .eq('id', post.id);

        results.push({
          postId: post.id,
          status: 'failed',
          error: error.message,
        });
      }
    }

    // Summary
    const summary = {
      total: scheduledPosts.length,
      published: results.filter(r => r.status === 'published').length,
      failed: results.filter(r => r.status === 'failed').length,
    };

    return NextResponse.json({
      message: 'Publishing completed',
      summary,
      results,
    });
  } catch (error) {
    console.error('Error in publish posts cron:', error);
    return NextResponse.json(
      { error: 'Failed to publish posts' },
      { status: 500 }
    );
  }
}

/**
 * Publish post to Instagram
 */
async function publishToInstagram(post, account) {
  const accessToken = await getInstagramToken(account.id);

  // Sort media by order
  const media = post.post_media?.sort((a, b) => a.display_order - b.display_order) || [];

  if (media.length === 0) {
    // Text-only posts not supported on Instagram
    throw new Error('Instagram requires at least one media file');
  }

  const igUserId = account.platform_user_id;

  if (media.length === 1) {
    // Single media post
    const mediaItem = media[0];

    // Create container
    const containerResponse = await fetch(
      `https://graph.instagram.com/v18.0/${igUserId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: mediaItem.media_type === 'image' ? mediaItem.file_url : undefined,
          video_url: mediaItem.media_type === 'video' ? mediaItem.file_url : undefined,
          caption: post.content,
          access_token: accessToken,
        }),
      }
    );

    const containerData = await containerResponse.json();

    if (!containerResponse.ok) {
      throw new Error(containerData.error?.message || 'Failed to create Instagram container');
    }

    // Publish container
    const publishResponse = await fetch(
      `https://graph.instagram.com/v18.0/${igUserId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: accessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (!publishResponse.ok) {
      throw new Error(publishData.error?.message || 'Failed to publish Instagram post');
    }

    return publishData.id;
  } else {
    // Carousel post (multiple media)
    const containerIds = [];

    // Create container for each media item
    for (const mediaItem of media) {
      const containerResponse = await fetch(
        `https://graph.instagram.com/v18.0/${igUserId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: mediaItem.media_type === 'image' ? mediaItem.file_url : undefined,
            video_url: mediaItem.media_type === 'video' ? mediaItem.file_url : undefined,
            is_carousel_item: true,
            access_token: accessToken,
          }),
        }
      );

      const containerData = await containerResponse.json();

      if (!containerResponse.ok) {
        throw new Error(containerData.error?.message || 'Failed to create carousel item');
      }

      containerIds.push(containerData.id);
    }

    // Create carousel container
    const carouselResponse = await fetch(
      `https://graph.instagram.com/v18.0/${igUserId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'CAROUSEL',
          children: containerIds,
          caption: post.content,
          access_token: accessToken,
        }),
      }
    );

    const carouselData = await carouselResponse.json();

    if (!carouselResponse.ok) {
      throw new Error(carouselData.error?.message || 'Failed to create carousel');
    }

    // Publish carousel
    const publishResponse = await fetch(
      `https://graph.instagram.com/v18.0/${igUserId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: carouselData.id,
          access_token: accessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (!publishResponse.ok) {
      throw new Error(publishData.error?.message || 'Failed to publish carousel');
    }

    return publishData.id;
  }
}

/**
 * Publish post to Facebook
 */
async function publishToFacebook(post, account) {
  const accessToken = account.access_token;
  const pageId = account.platform_user_id;

  const media = post.post_media?.sort((a, b) => a.display_order - b.display_order) || [];

  if (media.length === 0) {
    // Text-only post
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: post.content,
          access_token: accessToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to publish Facebook post');
    }

    return data.id;
  } else if (media.length === 1) {
    // Single media post
    const mediaItem = media[0];
    const endpoint = mediaItem.media_type === 'video' ? 'videos' : 'photos';

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/${endpoint}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: mediaItem.file_url,
          caption: post.content,
          access_token: accessToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to publish Facebook media post');
    }

    return data.id || data.post_id;
  } else {
    // Multiple media - create album or batch upload
    const photoIds = [];

    for (const mediaItem of media.filter(m => m.media_type === 'image')) {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/photos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: mediaItem.file_url,
            published: false,
            access_token: accessToken,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.id) {
        photoIds.push(data.id);
      }
    }

    // Publish all photos with caption
    const batch = photoIds.map((id, index) => ({
      method: 'POST',
      relative_url: `${pageId}/feed`,
      body: `message=${encodeURIComponent(post.content)}&attached_media[${index}]={\"media_fbid\":\"${id}\"}`,
    }));

    const batchResponse = await fetch(
      `https://graph.facebook.com/v18.0/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch: JSON.stringify(batch),
          access_token: accessToken,
        }),
      }
    );

    const batchData = await batchResponse.json();

    if (!batchResponse.ok) {
      throw new Error('Failed to publish Facebook batch post');
    }

    return batchData[0]?.body ? JSON.parse(batchData[0].body).id : null;
  }
}

/**
 * Publish post to LinkedIn
 */
async function publishToLinkedIn(post, account) {
  const accessToken = account.access_token;
  const personUrn = `urn:li:person:${account.platform_user_id}`;

  const media = post.post_media?.sort((a, b) => a.order_index - b.order_index) || [];

  // LinkedIn post payload
  const payload = {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: post.content,
        },
        shareMediaCategory: media.length > 0 ? 'IMAGE' : 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  // Add media if present
  if (media.length > 0) {
    payload.specificContent['com.linkedin.ugc.ShareContent'].media = media
      .filter(m => m.media_type === 'image')
      .map(m => ({
        status: 'READY',
        originalUrl: m.file_url,
      }));
  }

  const response = await fetch(
    'https://api.linkedin.com/v2/ugcPosts',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to publish LinkedIn post');
  }

  return data.id;
}

/**
 * GET endpoint for manual testing
 * Remove in production or secure properly
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

  // Forward to POST handler
  return POST(request);
}
