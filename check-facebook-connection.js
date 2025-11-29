/**
 * Check if Facebook account was connected successfully
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkFacebookConnection() {
  console.log('Checking Facebook connection...\n');

  // Get all social accounts
  const { data: accounts, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('platform', 'facebook');

  if (error) {
    console.error('Error fetching accounts:', error);
    return;
  }

  if (!accounts || accounts.length === 0) {
    console.log('❌ No Facebook accounts found');
    return;
  }

  console.log('✅ Facebook account(s) found!\n');

  accounts.forEach((account, index) => {
    console.log(`Account ${index + 1}:`);
    console.log(`  Platform: ${account.platform}`);
    console.log(`  Username: ${account.username || account.platform_username || 'N/A'}`);
    console.log(`  Display Name: ${account.display_name || account.platform_display_name || 'N/A'}`);
    console.log(`  Platform User ID: ${account.platform_user_id || account.platform_account_id || 'N/A'}`);
    console.log(`  Active: ${account.is_active ? '✅ Yes' : '❌ No'}`);
    console.log(`  Created: ${new Date(account.created_at).toLocaleString()}`);
    console.log(`  Workspace ID: ${account.workspace_id}`);
    console.log('');
  });

  console.log('Total Facebook accounts:', accounts.length);
}

checkFacebookConnection().then(() => {
  console.log('\nCheck complete!');
  process.exit(0);
}).catch((error) => {
  console.error('Check failed:', error);
  process.exit(1);
});
