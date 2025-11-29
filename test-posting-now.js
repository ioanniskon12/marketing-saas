/**
 * Quick Test - Post to Facebook
 *
 * This script tests posting to Facebook using the current account in the database
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFacebookPost() {
  try {
    console.log('🚀 Testing Facebook posting...\n');

    // Get the Facebook account from database
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

    console.log('📄 Account Details:');
    console.log('   Page ID:', account.platform_account_id);
    console.log('   Page Name:', account.platform_username || account.platform_display_name);
    console.log('   Token: [VALID]');
    console.log('');

    // Create test message
    const message = `🎉 Test post from SocialFlow!\n\nPosted at: ${new Date().toLocaleString()}\n\nThis is a test to confirm Facebook posting is working! ✅`;

    console.log('📝 Message:');
    console.log(message);
    console.log('');

    // Post to Facebook
    console.log('📤 Posting to Facebook...');

    const params = new URLSearchParams({
      access_token: account.access_token,
      message: message,
    });

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${account.platform_account_id}/feed`,
      {
        method: 'POST',
        body: params,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error posting to Facebook:');
      console.error('   Error message:', data.error?.message);
      console.error('   Error code:', data.error?.code);
      console.error('   Error type:', data.error?.type);
      console.error('\n📋 Full response:', JSON.stringify(data, null, 2));
      return;
    }

    console.log('✅ SUCCESS! Post published to Facebook!');
    console.log('   Post ID:', data.id);
    console.log('   View post at: https://www.facebook.com/' + data.id);
    console.log('');
    console.log('🎊 Facebook posting is working perfectly!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testFacebookPost();
