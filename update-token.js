// Temporary script to update Facebook page token manually
// Run this with: node update-token.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateToken() {
  // PASTE YOUR TOKEN FROM GRAPH API EXPLORER HERE:
  const newToken = 'EAAT6zM7jyBoBP3rmZAAnY74xnik2UgG0EKnAfAhrxLo7shaJL4ugde3mwTx1crhiiGQfBv01k0GAshaWyLJgRZCHy3mWMNfOXQX6ZCgjI0b3AiDYc1oDwXzfTWeaZCLin42sOtZAZB2R4U3ZCWoUuRrYBF0oQ6idj2L6QKnR1EPGOdCxYfcR0vlHV4iHLzYTWFcIIElJJZCEeyNP8RLZCstNmmnLilGnzRYzVCfgFeoDOi2oqyRsoE5OcsnQMY0Dz2tEEFyH53ZApomIHlKcjoFvQfeEZB905ZAR3RvOyitxZAwZDZD';
  const pageId = '876037742260317'; // Your Owlmarketing page ID

  if (newToken === 'PASTE_YOUR_TOKEN_HERE') {
    console.error('\n⚠️  Please edit this file and paste your token from Graph API Explorer\n');
    return;
  }

  console.log('Updating token for page:', pageId);

  const { data, error } = await supabase
    .from('social_accounts')
    .update({
      access_token: newToken,
      platform_display_name: 'Owlmarketing',
      account_type: 'page',
    })
    .eq('platform', 'facebook')
    .eq('platform_account_id', pageId)
    .select();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('✅ Token updated successfully!');
  console.log('Updated accounts:', data);
  console.log('\nNow try creating a post - it should work!');
}

updateToken();
