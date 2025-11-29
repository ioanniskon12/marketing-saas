/**
 * API Route: Save Instagram Feed Order
 *
 * POST /api/posts/feed-order
 * Saves the feed position for posts in a specific Instagram account
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { account_id, posts } = body;

    if (!account_id || !posts || !Array.isArray(posts)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Update feed_position for each post
    const updatePromises = posts.map(async (post) => {
      const { error } = await supabase
        .from('posts')
        .update({
          feed_position: post.feed_position,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id)
        .eq('created_by', user.id); // Ensure user owns the post

      if (error) {
        console.error(`Error updating post ${post.id}:`, error);
        throw error;
      }

      return post;
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Feed order saved successfully',
      updated_count: posts.length,
    });

  } catch (error) {
    console.error('Error saving feed order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save feed order' },
      { status: 500 }
    );
  }
}
