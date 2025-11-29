/**
 * Mark Thread as Read API
 *
 * POST /api/inbox/threads/[id]/mark-read - Mark all messages in thread as read
 */

import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    // Use admin client to bypass RLS for server-side operations
    const supabase = createAdminClient();
    const { id } = params;

    // Update thread unread count
    const { error: threadError } = await supabase
      .from('inbox_threads')
      .update({ unread_count: 0 })
      .eq('id', id);

    if (threadError) {
      return NextResponse.json(
        { error: threadError.message },
        { status: 500 }
      );
    }

    // Mark all incoming messages as read
    const { error: messagesError } = await supabase
      .from('inbox_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('thread_id', id)
      .eq('direction', 'in')
      .eq('is_read', false);

    if (messagesError) {
      console.error('Error marking messages as read:', messagesError);
    }

    return NextResponse.json({
      success: true,
      message: 'Thread marked as read',
    });

  } catch (error) {
    console.error('Error marking thread as read:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
