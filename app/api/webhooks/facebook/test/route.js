/**
 * Facebook Webhook Test Endpoint
 *
 * This endpoint helps diagnose webhook configuration issues.
 * Access it at: /api/webhooks/facebook/test
 */

import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = createAdminClient();

  // Get all Facebook pages from database
  const { data: pages } = await supabase
    .from('social_accounts')
    .select('id, platform_account_id, account_name, platform')
    .eq('platform', 'facebook');

  const diagnostics = {
    timestamp: new Date().toISOString(),
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/facebook`,
    verifyToken: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'NOT_SET',
    connectedPages: pages || [],
    instructions: {
      step1: 'Go to Facebook Developer Console: https://developers.facebook.com/apps/',
      step2: `Select your app (App ID: ${process.env.FACEBOOK_APP_ID})`,
      step3: 'Click on "Messenger" in the left sidebar',
      step4: 'Scroll to "Webhooks" section',
      step5: 'Under "Callback URL", click "Test" button to send a test event',
      step6: 'OR subscribe your page to webhooks:',
      step6a: '  - Find the "Webhooks" section',
      step6b: `  - Look for page "${pages?.[0]?.account_name}" (ID: ${pages?.[0]?.platform_account_id})`,
      step6c: '  - Click "Subscribe" next to the page',
      step7: 'Send a message to your Facebook Page to test',
    },
    troubleshooting: {
      issue1: 'Webhook not receiving events',
      solution1: [
        'Make sure ngrok is still running',
        'Verify the callback URL matches ngrok URL exactly',
        'Check that the page is subscribed to the webhook',
        'Ensure app is not in Development Mode with restricted users',
      ],
      issue2: 'How to check if page is subscribed',
      solution2: [
        'In Facebook Developer Console > Messenger > Webhooks',
        'Look for your page in the list',
        'It should show "Subscribed" status',
      ],
    },
  };

  return NextResponse.json(diagnostics, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
