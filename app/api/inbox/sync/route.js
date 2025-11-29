/**
 * Inbox Sync API
 *
 * POST /api/inbox/sync - Manually sync conversations from connected platforms
 */

import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Use admin client to bypass RLS for server-to-server operations
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    // Get all active social accounts for this workspace
    const { data: accounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true);

    console.log('Found accounts:', accounts?.length, accounts?.map(a => ({ platform: a.platform, id: a.id })));

    if (accountsError) {
      console.error('Error fetching accounts:', accountsError);
      return NextResponse.json(
        { error: accountsError.message },
        { status: 500 }
      );
    }

    const syncResults = [];

    // Sync each platform
    for (const account of accounts) {
      try {
        let result;
        if (account.platform === 'facebook') {
          result = await syncFacebookConversations(supabase, account);
        } else if (account.platform === 'instagram') {
          result = await syncInstagramConversations(supabase, account);
        }

        syncResults.push({
          platform: account.platform,
          accountId: account.id,
          ...result,
        });
      } catch (error) {
        console.error(`Error syncing ${account.platform}:`, error);
        syncResults.push({
          platform: account.platform,
          accountId: account.id,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: syncResults,
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Sync Facebook Messenger conversations
 */
async function syncFacebookConversations(supabase, account) {
  const accessToken = account.access_token;
  const pageId = account.platform_account_id;

  console.log('Syncing Facebook conversations for page:', pageId);

  // Fetch conversations from Facebook
  const url = `https://graph.facebook.com/v18.0/${pageId}/conversations?` +
    `fields=id,participants,messages{id,message,from,to,created_time,attachments},updated_time&` +
    `limit=50&access_token=${accessToken}`;

  console.log('Fetching conversations from:', url.replace(accessToken, 'ACCESS_TOKEN'));

  const response = await fetch(url);

  const data = await response.json();

  console.log('Facebook conversations response status:', response.status);
  console.log('Facebook conversations response:', JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch conversations');
  }
  let conversationCount = 0;
  let messageCount = 0;

  for (const conversation of data.data || []) {
    // Find the user (non-page participant)
    const userParticipant = conversation.participants?.data?.find(
      p => p.id !== pageId
    );

    if (!userParticipant) continue;

    // Get or create contact
    let contact = await getOrCreateContact(
      supabase,
      account.workspace_id,
      'facebook',
      userParticipant.id,
      userParticipant.name,
      accessToken
    );

    // Get or create thread
    let thread = await getOrCreateThread(
      supabase,
      account.workspace_id,
      account.id,
      contact.id,
      'facebook'
    );

    conversationCount++;

    // Import messages
    const messages = conversation.messages?.data || [];
    for (const msg of messages.reverse()) {
      const direction = msg.from?.id === pageId ? 'out' : 'in';

      // Check if message already exists
      const { data: existing } = await supabase
        .from('inbox_messages')
        .select('id')
        .eq('external_message_id', msg.id)
        .single();

      if (existing) continue;

      // Insert message
      const { error: msgError } = await supabase
        .from('inbox_messages')
        .insert({
          thread_id: thread.id,
          workspace_id: account.workspace_id,
          contact_id: contact.id,
          direction,
          message_type: msg.attachments?.data?.length > 0 ? 'media' : 'text',
          content: msg.message || '',
          external_message_id: msg.id,
          attachments: msg.attachments?.data?.map(att => ({
            type: att.mime_type?.includes('image') ? 'image' : 'file',
            url: att.image_data?.url || att.file_url,
            name: att.name,
          })) || [],
          created_at: msg.created_time,
        });

      if (!msgError) messageCount++;
    }

    // Update thread with last message
    if (messages.length > 0) {
      const lastMsg = messages[0];
      await supabase
        .from('inbox_threads')
        .update({
          last_message: lastMsg.message || '[Attachment]',
          last_message_at: lastMsg.created_time,
        })
        .eq('id', thread.id);
    }
  }

  return {
    success: true,
    conversationsImported: conversationCount,
    messagesImported: messageCount,
  };
}

/**
 * Sync Instagram DM conversations
 */
async function syncInstagramConversations(supabase, account) {
  const accessToken = account.access_token;
  const igAccountId = account.platform_account_id;

  // Fetch Instagram conversations
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${igAccountId}/conversations?` +
    `fields=id,participants,messages{id,message,from,to,created_time,attachments},updated_time&` +
    `platform=instagram&limit=50&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch Instagram conversations');
  }

  const data = await response.json();
  let conversationCount = 0;
  let messageCount = 0;

  for (const conversation of data.data || []) {
    // Find the user (non-business participant)
    const userParticipant = conversation.participants?.data?.find(
      p => p.id !== igAccountId
    );

    if (!userParticipant) continue;

    // Get or create contact
    let contact = await getOrCreateContact(
      supabase,
      account.workspace_id,
      'instagram',
      userParticipant.id,
      userParticipant.username || userParticipant.name,
      accessToken
    );

    // Get or create thread
    let thread = await getOrCreateThread(
      supabase,
      account.workspace_id,
      account.id,
      contact.id,
      'instagram'
    );

    conversationCount++;

    // Import messages
    const messages = conversation.messages?.data || [];
    for (const msg of messages.reverse()) {
      const direction = msg.from?.id === igAccountId ? 'out' : 'in';

      // Check if message already exists
      const { data: existing } = await supabase
        .from('inbox_messages')
        .select('id')
        .eq('external_message_id', msg.id)
        .single();

      if (existing) continue;

      // Insert message
      const { error: msgError } = await supabase
        .from('inbox_messages')
        .insert({
          thread_id: thread.id,
          workspace_id: account.workspace_id,
          contact_id: contact.id,
          direction,
          message_type: msg.attachments?.data?.length > 0 ? 'media' : 'text',
          content: msg.message || '',
          external_message_id: msg.id,
          attachments: msg.attachments?.data || [],
          created_at: msg.created_time,
        });

      if (!msgError) messageCount++;
    }

    // Update thread with last message
    if (messages.length > 0) {
      const lastMsg = messages[0];
      await supabase
        .from('inbox_threads')
        .update({
          last_message: lastMsg.message || '[Attachment]',
          last_message_at: lastMsg.created_time,
        })
        .eq('id', thread.id);
    }
  }

  return {
    success: true,
    conversationsImported: conversationCount,
    messagesImported: messageCount,
  };
}

/**
 * Get or create a contact
 */
async function getOrCreateContact(supabase, workspaceId, platform, externalId, name, accessToken) {
  // Check if exists
  const { data: existing } = await supabase
    .from('inbox_contacts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('platform', platform)
    .eq('external_id', externalId)
    .single();

  if (existing) return existing;

  // Fetch profile picture
  let profilePicture = null;
  try {
    const profileResponse = await fetch(
      `https://graph.facebook.com/v18.0/${externalId}?fields=profile_pic&access_token=${accessToken}`
    );
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      profilePicture = profile.profile_pic;
    }
  } catch (e) {
    console.error('Error fetching profile:', e);
  }

  // Create contact
  const { data: newContact, error } = await supabase
    .from('inbox_contacts')
    .insert({
      workspace_id: workspaceId,
      platform,
      external_id: externalId,
      name: name || 'Unknown',
      profile_picture_url: profilePicture,
      first_message_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return newContact;
}

/**
 * Get or create a thread
 */
async function getOrCreateThread(supabase, workspaceId, socialAccountId, contactId, platform) {
  // Check if exists
  const { data: existing } = await supabase
    .from('inbox_threads')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('contact_id', contactId)
    .single();

  if (existing) return existing;

  // Create thread
  const { data: newThread, error } = await supabase
    .from('inbox_threads')
    .insert({
      workspace_id: workspaceId,
      social_account_id: socialAccountId,
      contact_id: contactId,
      platform,
      status: 'open',
    })
    .select()
    .single();

  if (error) throw error;
  return newThread;
}
