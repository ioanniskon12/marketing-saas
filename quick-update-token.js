/**
 * Quick Token Update
 *
 * Paste your new token below and run: node quick-update-token.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// ⬇️ PASTE YOUR NEW TOKEN HERE ⬇️
const NEW_TOKEN = "PASTE_YOUR_TOKEN_HERE";
// ⬆️ PASTE YOUR NEW TOKEN ABOVE ⬆️

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (NEW_TOKEN === "PASTE_YOUR_TOKEN_HERE") {
  console.log('\n❌ Please paste your new Facebook token in this file first!');
  console.log('   Edit line 10 and replace "PASTE_YOUR_TOKEN_HERE" with your token\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateToken() {
  console.log('🔄 Updating Facebook token...\n');

  const { error } = await supabase
    .from('social_accounts')
    .update({
      access_token: NEW_TOKEN,
      updated_at: new Date().toISOString(),
    })
    .eq('platform', 'facebook')
    .eq('platform_account_id', '876037742260317');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Token updated successfully!');
  console.log('\n🎉 You can now post to Facebook again!');
}

updateToken();
