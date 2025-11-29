// Script to fetch the PAGE token and update it in the database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPageToken() {
  // Get the current Facebook account (which has a USER token)
  const { data: account, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('platform', 'facebook')
    .eq('platform_account_id', '876037742260317')
    .single();

  if (error || !account) {
    console.error('Error fetching account:', error);
    return;
  }

  console.log('\n=== Current Account ===');
  console.log('Token type: USER (incorrect - needs to be PAGE)');
  console.log('Token preview:', account.access_token?.substring(0, 30) + '...');

  // Use the USER token to fetch the PAGE token
  const userToken = account.access_token;

  console.log('\n=== Fetching PAGE token from Facebook ===');
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token&access_token=${userToken}`
  );

  const data = await response.json();

  if (data.error) {
    console.error('Facebook API error:', data.error);
    return;
  }

  if (!data.data || data.data.length === 0) {
    console.error('No pages found');
    return;
  }

  // Find the Owlmarketing page
  const owlPage = data.data.find(page => page.id === '876037742260317');

  if (!owlPage) {
    console.error('Owlmarketing page not found in /me/accounts');
    console.log('Available pages:', data.data.map(p => ({ id: p.id, name: p.name })));
    return;
  }

  console.log('Found page:', owlPage.name, '(' + owlPage.id + ')');
  console.log('PAGE token preview:', owlPage.access_token?.substring(0, 30) + '...');

  // Update the database with the PAGE token
  const { error: updateError } = await supabase
    .from('social_accounts')
    .update({
      access_token: owlPage.access_token,
      platform_display_name: owlPage.name,
      account_type: 'page', // Mark it as a page token
      updated_at: new Date().toISOString(),
    })
    .eq('id', account.id);

  if (updateError) {
    console.error('Error updating account:', updateError);
    return;
  }

  console.log('\n✅ Successfully updated to use PAGE token!');
  console.log('\nNow try creating a post - it should work!');

  // Verify the token type
  console.log('\n=== Verifying new token ===');
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  const debugUrl = `https://graph.facebook.com/v18.0/debug_token?input_token=${owlPage.access_token}&access_token=${appId}|${appSecret}`;
  const debugResponse = await fetch(debugUrl);
  const debugData = await debugResponse.json();

  if (debugData.data) {
    console.log('Token type:', debugData.data.type);
    console.log('Has pages_manage_posts:', debugData.data.scopes?.includes('pages_manage_posts') ? '✅ YES' : '❌ NO');
  }
}

fixPageToken();
