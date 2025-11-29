/**
 * Send Reply API
 *
 * POST /api/inbox/threads/[id]/reply - Send a message in a thread
 */

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
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
    const { message, attachments = [] } = body;

    if (!message && attachments.length === 0) {
      return NextResponse.json(
        { error: 'Message or attachments required' },
        { status: 400 }
      );
    }

    // Get thread with social account
    const { data: thread, error: threadError } = await supabase
      .from('inbox_threads')
      .select(`
        *,
        contact:inbox_contacts(*),
        social_account:social_accounts(*)
      `)
      .eq('id', id)
      .single();

    if (threadError || !thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Send message to platform
    let externalMessageId = null;
    let sendError = null;

    try {
      if (thread.platform === 'facebook' || thread.platform === 'instagram') {
        const result = await sendMetaMessage(
          thread.social_account,
          thread.contact.external_id,
          message,
          attachments
        );
        externalMessageId = result.messageId;
      } else if (thread.platform === 'tiktok') {
        // TikTok API integration will go here
        console.log('TikTok messaging not yet implemented');
      }
    } catch (error) {
      console.error('Error sending to platform:', error);
      sendError = error.message;
    }

    // Save message to database
    const { data: savedMessage, error: saveError } = await supabase
      .from('inbox_messages')
      .insert({
        thread_id: id,
        workspace_id: thread.workspace_id,
        contact_id: thread.contact_id,
        direction: 'out',
        message_type: attachments.length > 0 ? 'media' : 'text',
        content: message,
        external_message_id: externalMessageId,
        attachments: attachments,
        sent_by: user.id,
        metadata: sendError ? { error: sendError } : {},
      })
      .select()
      .single();

    if (saveError) {
      return NextResponse.json(
        { error: saveError.message },
        { status: 500 }
      );
    }

    // Update thread (trigger will handle last_message update)
    await supabase
      .from('inbox_threads')
      .update({
        unread_count: 0,
        status: thread.status === 'open' ? 'open' : thread.status,
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      message: savedMessage,
      externalMessageId,
      error: sendError,
    });

  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Send message via Meta Graph API (Facebook/Instagram)
 */
async function sendMetaMessage(socialAccount, recipientId, message, attachments = []) {
  const accessToken = socialAccount.access_token;

  if (!accessToken) {
    throw new Error('No access token available');
  }

  // Build message payload
  let messagePayload = {};

  if (message) {
    messagePayload.text = message;
  }

  // Handle attachments (images, files)
  if (attachments.length > 0) {
    const attachment = attachments[0]; // Send first attachment
    messagePayload = {
      attachment: {
        type: attachment.type || 'image',
        payload: {
          url: attachment.url,
          is_reusable: true,
        },
      },
    };
  }

  // Send via Graph API
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: messagePayload,
        messaging_type: 'RESPONSE',
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to send message');
  }

  const data = await response.json();
  return {
    messageId: data.message_id,
    recipientId: data.recipient_id,
  };
}
