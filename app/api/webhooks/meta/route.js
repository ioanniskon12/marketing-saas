/**
 * Meta Webhook Handler
 *
 * Receives incoming messages from Facebook Messenger and Instagram DMs
 *
 * GET - Webhook verification
 * POST - Incoming message events
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Lazy initialize Supabase client
let supabaseInstance = null;

function getSupabase() {
  if (!supabaseInstance && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabaseInstance;
}

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'social-media-saas-webhook';

/**
 * GET - Webhook Verification
 * Facebook/Instagram calls this to verify the webhook
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json(
    { error: 'Verification failed' },
    { status: 403 }
  );
}

/**
 * POST - Incoming Message Events
 */
export async function POST(request) {
  try {
    const body = await request.json();

    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Process each entry
    for (const entry of body.entry || []) {
      // Handle messaging events (Facebook Messenger / Instagram DMs)
      for (const event of entry.messaging || []) {
        await processMessagingEvent(event, entry.id);
      }

      // Handle Instagram-specific events
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          await processInstagramMessage(change.value);
        }
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ status: 'received' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent retries
    return NextResponse.json({ status: 'error', message: error.message });
  }
}

/**
 * Process Facebook Messenger / Instagram DM event
 */
async function processMessagingEvent(event, pageId) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.error('Supabase not configured');
      return;
    }

    // Find the social account by page ID
    const { data: socialAccount, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('platform_account_id', pageId)
      .eq('is_active', true)
      .single();

    if (accountError || !socialAccount) {
      console.log('No matching social account for page:', pageId);
      return;
    }

    const senderId = event.sender?.id;
    const recipientId = event.recipient?.id;
    const timestamp = event.timestamp;

    // Skip if this is our own message (we sent it)
    if (senderId === pageId) {
      return;
    }

    // Handle incoming message
    if (event.message) {
      await handleIncomingMessage(
        socialAccount,
        senderId,
        event.message,
        timestamp
      );
    }

    // Handle message delivery confirmation
    if (event.delivery) {
      console.log('Message delivered:', event.delivery);
    }

    // Handle message read confirmation
    if (event.read) {
      console.log('Message read:', event.read);
    }

  } catch (error) {
    console.error('Error processing messaging event:', error);
  }
}

/**
 * Handle incoming message
 */
async function handleIncomingMessage(socialAccount, senderId, message, timestamp) {
  const workspaceId = socialAccount.workspace_id;
  const platform = socialAccount.platform;

  // Get or create contact
  let contact = await getOrCreateContact(
    workspaceId,
    platform,
    senderId,
    socialAccount.access_token
  );

  // Get or create thread
  let thread = await getOrCreateThread(
    workspaceId,
    socialAccount.id,
    contact.id,
    platform
  );

  // Determine message type
  let messageType = 'text';
  let attachments = [];

  if (message.attachments) {
    attachments = message.attachments.map(att => ({
      type: att.type,
      url: att.payload?.url,
      title: att.payload?.title,
      sticker_id: att.payload?.sticker_id,
    }));
    messageType = message.attachments[0]?.type || 'attachment';
  }

  const supabase = getSupabase();
  if (!supabase) {
    console.error('Supabase not configured');
    return;
  }

  // Save message
  const { error: messageError } = await supabase
    .from('inbox_messages')
    .insert({
      thread_id: thread.id,
      workspace_id: workspaceId,
      contact_id: contact.id,
      direction: 'in',
      message_type: messageType,
      content: message.text || '',
      external_message_id: message.mid,
      attachments: attachments,
      metadata: {
        reply_to: message.reply_to,
        is_echo: message.is_echo,
      },
      created_at: new Date(timestamp).toISOString(),
    });

  if (messageError) {
    console.error('Error saving message:', messageError);
  }

  // Update thread (trigger handles last_message)
  await supabase
    .from('inbox_threads')
    .update({
      last_message: message.text || `[${messageType}]`,
      last_message_at: new Date(timestamp).toISOString(),
      last_message_type: messageType,
      unread_count: thread.unread_count + 1,
    })
    .eq('id', thread.id);

  console.log(`Message saved from ${contact.name || senderId} in thread ${thread.id}`);
}

/**
 * Get or create contact from platform user
 */
async function getOrCreateContact(workspaceId, platform, externalId, accessToken) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  // Check if contact exists
  const { data: existingContact } = await supabase
    .from('inbox_contacts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('platform', platform)
    .eq('external_id', externalId)
    .single();

  if (existingContact) {
    return existingContact;
  }

  // Fetch profile from platform
  let profileData = {
    name: 'Unknown User',
    profile_picture_url: null,
  };

  try {
    const profileResponse = await fetch(
      `https://graph.facebook.com/v18.0/${externalId}?fields=name,first_name,last_name,profile_pic&access_token=${accessToken}`
    );

    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      profileData = {
        name: profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        profile_picture_url: profile.profile_pic,
      };
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
  }

  // Create contact
  const { data: newContact, error } = await supabase
    .from('inbox_contacts')
    .insert({
      workspace_id: workspaceId,
      platform,
      external_id: externalId,
      name: profileData.name,
      profile_picture_url: profileData.profile_picture_url,
      first_message_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating contact:', error);
    throw error;
  }

  return newContact;
}

/**
 * Get or create thread for a contact
 */
async function getOrCreateThread(workspaceId, socialAccountId, contactId, platform) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  // Check if thread exists
  const { data: existingThread } = await supabase
    .from('inbox_threads')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('contact_id', contactId)
    .single();

  if (existingThread) {
    return existingThread;
  }

  // Create thread
  const { data: newThread, error } = await supabase
    .from('inbox_threads')
    .insert({
      workspace_id: workspaceId,
      social_account_id: socialAccountId,
      contact_id: contactId,
      platform,
      status: 'open',
      unread_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating thread:', error);
    throw error;
  }

  return newThread;
}

/**
 * Process Instagram-specific message (from changes array)
 */
async function processInstagramMessage(value) {
  // Instagram messages via changes array
  // Similar processing to Messenger
  console.log('Instagram message via changes:', value);
}
