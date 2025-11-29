/**
 * Inbox Threads API
 *
 * GET /api/inbox/threads - List all conversation threads
 */

import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Use admin client to bypass RLS for server-side operations
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');
    const status = searchParams.get('status'); // open, resolved, all
    const platform = searchParams.get('platform'); // facebook, instagram, etc.

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('inbox_threads')
      .select(`
        *,
        contact:inbox_contacts(*),
        social_account:social_accounts(id, platform, platform_username)
      `)
      .eq('workspace_id', workspaceId)
      .order('last_message_at', { ascending: false });

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Filter by platform
    if (platform && platform !== 'all') {
      query = query.eq('platform', platform);
    }

    const { data: threads, error } = await query;

    if (error) {
      console.error('Error fetching threads:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Transform threads for frontend
    const transformedThreads = threads.map(thread => ({
      id: thread.id,
      platform: thread.platform,
      status: thread.status,
      unreadCount: thread.unread_count,
      isAutomated: thread.is_automated,
      lastMessage: thread.last_message,
      lastMessageAt: thread.last_message_at,
      lastMessageType: thread.last_message_type,
      contact: thread.contact ? {
        id: thread.contact.id,
        name: thread.contact.name || 'Unknown',
        username: thread.contact.username,
        avatar: thread.contact.profile_picture_url || generateAvatar(thread.contact.name),
        externalId: thread.contact.external_id,
      } : null,
      socialAccount: thread.social_account,
      createdAt: thread.created_at,
      updatedAt: thread.updated_at,
    }));

    return NextResponse.json({
      success: true,
      threads: transformedThreads,
    });

  } catch (error) {
    console.error('Error in inbox threads API:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Generate avatar URL from name
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
