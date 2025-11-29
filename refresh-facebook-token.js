/**
 * Refresh Facebook Token for Extended Validity
 *
 * Exchanges the current short-lived token for a long-lived token (60 days)
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appId = process.env.FACEBOOK_APP_ID;
const appSecret = process.env.FACEBOOK_APP_SECRET;

if (!supabaseUrl || !supabaseKey || !appId || !appSecret) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function refreshToken() {
  try {
    console.log('🔄 Refreshing Facebook token...\n');

    // Get the current Facebook account
    const { data: account, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('platform', 'facebook')
      .eq('platform_account_id', '876037742260317')
      .single();

    if (error || !account) {
      console.error('❌ Error fetching account:', error);
      return;
    }

    console.log('📄 Current Account:');
    console.log('   Page ID:', account.platform_account_id);
    console.log('   Page Name:', account.platform_username || account.platform_display_name);
    console.log('   Current token expires:', account.token_expires_at || 'Unknown');
    console.log('');

    // Exchange for long-lived token
    console.log('🔄 Requesting new long-lived token from Facebook...');

    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: account.access_token,
    });

    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Facebook API error:', errorData);
      return;
    }

    const data = await response.json();
    const { access_token, expires_in } = data;

    console.log('✅ Received new token from Facebook');
    console.log('   Expires in:', expires_in ? `${expires_in} seconds (${expires_in / 86400} days)` : 'Never');
    console.log('');

    // Calculate expiration date
    const expiresAt = expires_in
      ? new Date(Date.now() + expires_in * 1000)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // Default 60 days

    // Update the database
    console.log('💾 Updating database with new token...');

    const { error: updateError } = await supabase
      .from('social_accounts')
      .update({
        access_token: access_token,
        token_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id);

    if (updateError) {
      console.error('❌ Error updating database:', updateError);
      return;
    }

    console.log('✅ Token refreshed successfully!');
    console.log('   New expiration:', expiresAt.toISOString());
    console.log('   New expiration (local):', expiresAt.toLocaleString());
    console.log('');
    console.log('🎉 Your Facebook token is now valid for approximately 60 days!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

refreshToken();
