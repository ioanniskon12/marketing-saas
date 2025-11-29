/**
 * Individual Thread API
 *
 * GET /api/inbox/threads/[id] - Get thread with messages
 * PATCH /api/inbox/threads/[id] - Update thread (status, assigned_to, etc.)
 * DELETE /api/inbox/threads/[id] - Delete thread and all its messages
 */

import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    // Use admin client to bypass RLS for server-side operations
    const supabase = createAdminClient();
    const { id } = params;

    // Get thread with contact info
    const { data: thread, error: threadError } = await supabase
      .from('inbox_threads')
      .select(`
        *,
        contact:inbox_contacts(*),
        social_account:social_accounts(id, platform, platform_username, access_token)
      `)
      .eq('id', id)
      .single();

    if (threadError) {
      return NextResponse.json(
        { error: threadError.message },
        { status: 404 }
      );
    }

    // Get messages for this thread
    const { data: messages, error: messagesError } = await supabase
      .from('inbox_messages')
      .select('*')
      .eq('thread_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      return NextResponse.json(
        { error: messagesError.message },
        { status: 500 }
      );
    }

    // Transform messages
    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      direction: msg.direction,
      type: msg.message_type,
      content: msg.content,
      attachments: msg.attachments || [],
      metadata: msg.metadata || {},
      isRead: msg.is_read,
      createdAt: msg.created_at,
      sentBy: msg.direction === 'out' ? {
        id: msg.sent_by,
        name: 'You',
      } : {
        id: thread.contact?.id || 'contact',
        name: thread.contact?.name || 'Customer',
      },
    }));

    // Transform thread
    const transformedThread = {
      id: thread.id,
      platform: thread.platform,
      status: thread.status,
      unreadCount: thread.unread_count,
      isAutomated: thread.is_automated,
      tags: thread.tags || [],
      contact: thread.contact ? {
        id: thread.contact.id,
        name: thread.contact.name || 'Unknown',
        username: thread.contact.username,
        avatar: thread.contact.profile_picture_url || generateAvatar(thread.contact.name),
        externalId: thread.contact.external_id,
        email: thread.contact.email,
        phone: thread.contact.phone,
      } : null,
      socialAccount: thread.social_account ? {
        id: thread.social_account.id,
        platform: thread.social_account.platform,
        username: thread.social_account.platform_username,
      } : null,
      messages: transformedMessages,
      createdAt: thread.created_at,
      updatedAt: thread.updated_at,
    };

    return NextResponse.json({
      success: true,
      thread: transformedThread,
    });

  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const supabase = createAdminClient();
    const { id } = params;
    const body = await request.json();

    const updateData = {};

    // Update allowed fields
    if (body.status) updateData.status = body.status;
    if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to;
    if (body.tags) updateData.tags = body.tags;
    if (body.is_automated !== undefined) updateData.is_automated = body.is_automated;

    const { data: thread, error } = await supabase
      .from('inbox_threads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      thread,
    });

  } catch (error) {
    console.error('Error updating thread:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = createAdminClient();
    const { id } = params;

    // First delete all messages in this thread
    const { error: messagesError } = await supabase
      .from('inbox_messages')
      .delete()
      .eq('thread_id', id);

    if (messagesError) {
      return NextResponse.json(
        { error: messagesError.message },
        { status: 500 }
      );
    }

    // Then delete the thread
    const { error: threadError } = await supabase
      .from('inbox_threads')
      .delete()
      .eq('id', id);

    if (threadError) {
      return NextResponse.json(
        { error: threadError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thread and all messages deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function generateAvatar(name) {
  const displayName = name || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=128`;
}
