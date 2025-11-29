/**
 * Refresh Social Accounts Cron Job
 *
 * Refreshes profile pictures and account info from social platforms
 * Runs every 2-3 hours
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase with service role key for cron jobs
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting account refresh cron job...');

    // Get all active social accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('is_active', true);

    if (accountsError) {
      throw accountsError;
    }

    console.log(`Found ${accounts?.length || 0} active accounts to refresh`);

    const results = {
      total: accounts?.length || 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    // Refresh each account
    for (const account of accounts || []) {
      try {
        if (account.platform === 'facebook') {
          await refreshFacebookAccount(account);
          results.updated++;
        } else if (account.platform === 'instagram') {
          await refreshInstagramAccount(account);
          results.updated++;
        }
        // Add more platforms as needed
      } catch (error) {
        console.error(`Error refreshing account ${account.id}:`, error);
        results.failed++;
        results.errors.push({
          accountId: account.id,
          platform: account.platform,
          error: error.message,
        });
      }
    }

    console.log('Account refresh completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Account refresh completed',
      results,
    });

  } catch (error) {
    console.error('Error in refresh-accounts cron:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function refreshFacebookAccount(account) {
  try {
    // Fetch updated page info from Facebook
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${account.platform_account_id}?fields=id,name,picture&access_token=${account.access_token}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status}`);
    }

    const data = await response.json();

    // Update account with fresh data
    const { error: updateError } = await supabase
      .from('social_accounts')
      .update({
        platform_display_name: data.name,
        platform_profile_picture: data.picture?.data?.url,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', account.id);

    if (updateError) {
      throw updateError;
    }

    console.log(`Updated Facebook account: ${account.id} (${data.name})`);
  } catch (error) {
    console.error(`Error refreshing Facebook account ${account.id}:`, error);
    throw error;
  }
}

async function refreshInstagramAccount(account) {
  try {
    // Fetch updated Instagram account info
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${account.platform_account_id}?fields=id,name,profile_picture_url&access_token=${account.access_token}`
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    const data = await response.json();

    // Update account with fresh data
    const { error: updateError } = await supabase
      .from('social_accounts')
      .update({
        platform_display_name: data.name,
        platform_profile_picture: data.profile_picture_url,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', account.id);

    if (updateError) {
      throw updateError;
    }

    console.log(`Updated Instagram account: ${account.id} (${data.name})`);
  } catch (error) {
    console.error(`Error refreshing Instagram account ${account.id}:`, error);
    throw error;
  }
}
