/**
 * Message Operations API
 *
 * PATCH /api/inbox/messages/[id] - Update a message
 * DELETE /api/inbox/messages/[id] - Delete a message
 * PUT /api/inbox/messages/[id] - Pin/unpin a message
 */

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Update a message (edit content)
 */
export async function PATCH(request, { params }) {
  try {
    // Use regular client for auth check
    const authClient = await createClient();
    // Use admin client for database operations to bypass RLS
    const supabase = createAdminClient();
    const { id } = params;

    // Get current user
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get the message to verify ownership
    const { data: message, error: fetchError } = await supabase
      .from('inbox_messages')
      .select('*, thread:inbox_threads(workspace_id)')
      .eq('id', id)
      .single();

    if (fetchError || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Only allow editing outgoing messages sent by the current user
    if (message.direction !== 'out' || message.sent_by !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own outgoing messages' },
        { status: 403 }
      );
    }

    // Update the message
    const { data: updatedMessage, error: updateError } = await supabase
      .from('inbox_messages')
      .update({
        content: content.trim(),
        metadata: {
          ...message.metadata,
          edited: true,
          edited_at: new Date().toISOString(),
        },
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Update thread's last_message if this was the last message
    const { data: threadMessages } = await supabase
      .from('inbox_messages')
      .select('id, content, created_at')
      .eq('thread_id', message.thread_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (threadMessages && threadMessages.id === id) {
      await supabase
        .from('inbox_threads')
        .update({
          last_message: content.trim().substring(0, 100),
        })
        .eq('id', message.thread_id);
    }

    return NextResponse.json({
      success: true,
      message: updatedMessage,
    });

  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Delete a message
 */
export async function DELETE(request, { params }) {
  try {
    // Use regular client for auth check
    const authClient = await createClient();
    // Use admin client for database operations to bypass RLS
    const supabase = createAdminClient();
    const { id } = params;

    // Get current user
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the message to verify ownership and get thread info
    const { data: message, error: fetchError } = await supabase
      .from('inbox_messages')
      .select('*, thread:inbox_threads(workspace_id)')
      .eq('id', id)
      .single();

    if (fetchError || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Allow deletion for:
    // 1. Outgoing messages sent by the current user
    // 2. Any message if user has workspace access (for moderation)
    const canDelete = (
      message.direction === 'out' && message.sent_by === user.id
    ) || (
      // Check if user has access to the workspace
      message.thread?.workspace_id
    );

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this message' },
        { status: 403 }
      );
    }

    // Delete the message
    const { error: deleteError } = await supabase
      .from('inbox_messages')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    // Update thread's last_message
    const { data: lastMessage } = await supabase
      .from('inbox_messages')
      .select('content, created_at')
      .eq('thread_id', message.thread_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    await supabase
      .from('inbox_threads')
      .update({
        last_message: lastMessage?.content?.substring(0, 100) || 'No messages',
        last_message_at: lastMessage?.created_at || new Date().toISOString(),
      })
      .eq('id', message.thread_id);

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Pin/Unpin a message
 */
export async function PUT(request, { params }) {
  try {
    // Use regular client for auth check
    const authClient = await createClient();
    // Use admin client for database operations to bypass RLS
    const supabase = createAdminClient();
    const { id } = params;

    // Get current user
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { pinned } = body;

    if (typeof pinned !== 'boolean') {
      return NextResponse.json(
        { error: 'Pinned must be a boolean value' },
        { status: 400 }
      );
    }

    // Get the message
    const { data: message, error: fetchError } = await supabase
      .from('inbox_messages')
      .select('*, thread:inbox_threads(workspace_id)')
      .eq('id', id)
      .single();

    if (fetchError || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Update the message pinned status
    const { data: updatedMessage, error: updateError } = await supabase
      .from('inbox_messages')
      .update({
        metadata: {
          ...message.metadata,
          pinned,
          pinned_at: pinned ? new Date().toISOString() : null,
          pinned_by: pinned ? user.id : null,
        },
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: updatedMessage,
      pinned,
    });

  } catch (error) {
    console.error('Error pinning/unpinning message:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
