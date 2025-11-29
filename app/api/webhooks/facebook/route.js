/**
 * Facebook Webhook
 *
 * Receives real-time updates from Facebook Messenger and Instagram DMs
 *
 * GET - Webhook verification
 * POST - Receive message events
 */

import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Webhook verify token (set this in Facebook App settings)
const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'your_verify_token_here';

/**
 * GET - Webhook Verification
 * Facebook will call this to verify the webhook URL
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('Webhook verification request:', { mode, token, challenge });

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log('Webhook verified successfully');
      return new NextResponse(challenge, { status: 200 });
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      console.error('Webhook verification failed');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
}

/**
 * POST - Handle incoming messages
 */
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('='.repeat(80));
    console.log('🎉 WEBHOOK RECEIVED FROM FACEBOOK!');
    console.log('='.repeat(80));
    console.log('Full webhook payload:', JSON.stringify(body, null, 2));
    console.log('='.repeat(80));

    // Make sure this is a page subscription
    if (body.object !== 'page') {
      console.log('❌ Not a page subscription, object type:', body.object);
      return NextResponse.json({ error: 'Not a page subscription' }, { status: 404 });
    }

    const supabase = createAdminClient();

    // Process each entry
    for (const entry of body.entry) {
      const pageId = entry.id;

      // Process messaging events
      if (entry.messaging) {
        for (const event of entry.messaging) {
          await handleMessagingEvent(supabase, pageId, event);
        }
      }

      // Process Instagram messages
      if (entry.changes) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            await handleInstagramMessage(supabase, pageId, change.value);
          }
        }
      }
    }

    // Return a '200 OK' response to all events
    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Handle Facebook Messenger messaging event
 */
async function handleMessagingEvent(supabase, pageId, event) {
  console.log('Processing messaging event:', event);

  // Get sender and recipient
  const senderId = event.sender.id;
  const recipientId = event.recipient.id;

  // Find the social account for this page
  const { data: socialAccount } = await supabase
    .from('social_accounts')
    .select('id, workspace_id, platform, access_token')
    .eq('platform_account_id', pageId)
    .eq('platform', 'facebook')
    .single();

  if (!socialAccount) {
    console.error('Social account not found for page:', pageId);
    return;
  }

  // Skip if this is a message sent BY the page (outgoing message)
  // These are already saved when sent via the reply API
  if (senderId === pageId) {
    console.log('Skipping outgoing message from page');
    return;
  }

  // Get or create contact for incoming messages only
  const contact = await getOrCreateContact(supabase, {
    workspaceId: socialAccount.workspace_id,
    platform: 'facebook',
    externalId: senderId,
    accessToken: socialAccount.access_token,
  });

  // Get or create thread
  const thread = await getOrCreateThread(supabase, {
    workspaceId: socialAccount.workspace_id,
    socialAccountId: socialAccount.id,
    contactId: contact.id,
    platform: 'facebook',
  });

  // Handle message
  if (event.message) {
    const message = event.message;
    const messageText = message.text || '';
    const attachments = message.attachments || [];

    // Save message to database
    const { error } = await supabase
      .from('inbox_messages')
      .insert({
        thread_id: thread.id,
        workspace_id: socialAccount.workspace_id,
        contact_id: contact.id,
        direction: 'in',
        message_type: attachments.length > 0 ? 'media' : 'text',
        content: messageText,
        external_message_id: message.mid,
        attachments: attachments.map(att => ({
          type: att.type,
          url: att.payload?.url,
        })),
        metadata: { event },
      });

    if (error) {
      console.error('Error saving message:', error);
    } else {
      console.log('Message saved successfully');
    }
  }

  // Handle delivery confirmations
  if (event.delivery) {
    console.log('Message delivery event:', event.delivery);
  }

  // Handle read receipts
  if (event.read) {
    console.log('Message read event:', event.read);
  }
}

/**
 * Handle Instagram message
 */
async function handleInstagramMessage(supabase, pageId, value) {
  console.log('Processing Instagram message:', value);

  // Similar logic to Facebook Messenger
  // Instagram DMs use the same structure as Messenger
  // Implementation can be added here
}

/**
 * Get or create contact
 */
async function getOrCreateContact(supabase, { workspaceId, platform, externalId, accessToken }) {
  // Try to find existing contact
  let { data: contact } = await supabase
    .from('inbox_contacts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('platform', platform)
    .eq('external_id', externalId)
    .single();

  // If contact exists but has "Unknown User" name, update it
  if (contact && contact.name === 'Unknown User' && accessToken) {
    try {
      const profileResponse = await fetch(
        `https://graph.facebook.com/v18.0/${externalId}?fields=name,profile_pic&access_token=${accessToken}`
      );

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const userName = profileData.name || 'Unknown User';
        const profilePicture = profileData.profile_pic;

        // Update the contact with real profile data
        const { data: updatedContact } = await supabase
          .from('inbox_contacts')
          .update({
            name: userName,
            profile_picture_url: profilePicture,
          })
          .eq('id', contact.id)
          .select()
          .single();

        if (updatedContact) {
          return updatedContact;
        }
      }
    } catch (error) {
      console.error('Error updating contact profile:', error);
    }
  }

  if (contact) {
    return contact;
  }

  // Fetch user info from Facebook Graph API
  let userName = 'Unknown User';
  let profilePicture = null;

  if (accessToken) {
    try {
      const profileResponse = await fetch(
        `https://graph.facebook.com/v18.0/${externalId}?fields=name,profile_pic&access_token=${accessToken}`
      );

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        userName = profileData.name || 'Unknown User';
        profilePicture = profileData.profile_pic;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }

  // Create contact with fetched profile data
  const { data: newContact, error } = await supabase
    .from('inbox_contacts')
    .insert({
      workspace_id: workspaceId,
      platform,
      external_id: externalId,
      name: userName,
      profile_picture_url: profilePicture,
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
 * Get or create thread
 */
async function getOrCreateThread(supabase, { workspaceId, socialAccountId, contactId, platform }) {
  // Try to find existing thread
  let { data: thread } = await supabase
    .from('inbox_threads')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('contact_id', contactId)
    .eq('platform', platform)
    .single();

  if (thread) {
    return thread;
  }

  // Create new thread
  const { data: newThread, error } = await supabase
    .from('inbox_threads')
    .insert({
      workspace_id: workspaceId,
      social_account_id: socialAccountId,
      contact_id: contactId,
      platform,
      status: 'open',
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating thread:', error);
    throw error;
  }

  return newThread;
}
