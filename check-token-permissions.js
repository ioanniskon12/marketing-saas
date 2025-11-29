// Script to check what permissions a Facebook token actually has
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appId = process.env.FACEBOOK_APP_ID;
const appSecret = process.env.FACEBOOK_APP_SECRET;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTokenPermissions() {
  // Get the Facebook account
  const { data: account, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('platform', 'facebook')
    .eq('platform_account_id', '876037742260317') // Owlmarketing page ID
    .single();

  if (error || !account) {
    console.error('Error fetching account:', error);
    return;
  }

  console.log('\n=== Facebook Account ===');
  console.log('Page ID:', account.platform_account_id);
  console.log('Page Name:', account.platform_username);
  console.log('Token preview:', account.access_token?.substring(0, 30) + '...');

  // Use Facebook's debug_token endpoint to check permissions
  // This works for both user and page tokens
  const debugUrl = `https://graph.facebook.com/v18.0/debug_token?input_token=${account.access_token}&access_token=${appId}|${appSecret}`;

  try {
    const response = await fetch(debugUrl);
    const debugData = await response.json();

    console.log('\n=== Token Debug Info ===');
    console.log(JSON.stringify(debugData, null, 2));

    if (debugData.data) {
      console.log('\n=== Granted Scopes ===');
      if (debugData.data.scopes) {
        debugData.data.scopes.forEach(scope => {
          console.log('✓', scope);
        });

        // Check if pages_manage_posts is granted
        if (debugData.data.scopes.includes('pages_manage_posts')) {
          console.log('\n✅ pages_manage_posts permission is GRANTED');
        } else {
          console.log('\n❌ pages_manage_posts permission is MISSING');
          console.log('\nTo fix this, you need to:');
          console.log('1. Go to https://developers.facebook.com/apps/' + appId);
          console.log('2. Go to Roles > Roles');
          console.log('3. Add yourself as a Tester, Developer, or Admin');
          console.log('4. Then disconnect and reconnect your Facebook account in the app');
          console.log('\nOR submit your app for App Review to get pages_manage_posts approved for production.');
        }
      }

      console.log('\n=== Token Type ===');
      console.log('Type:', debugData.data.type);
      console.log('App ID:', debugData.data.app_id);
      console.log('Valid:', debugData.data.is_valid);
      console.log('Expires at:', debugData.data.expires_at ? new Date(debugData.data.expires_at * 1000).toISOString() : 'Never');
    }
  } catch (err) {
    console.error('Error checking token:', err.message);
  }
}

checkTokenPermissions();
