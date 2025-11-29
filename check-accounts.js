/**
 * Check Social Accounts
 *
 * Shows all social accounts to verify which ones are active
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAccounts() {
  console.log('📱 Checking social accounts...\n');

  const { data: accounts, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('platform', 'facebook')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${accounts?.length || 0} Facebook accounts:\n`);

  if (!accounts || accounts.length === 0) {
    console.log('No Facebook accounts found.');
    return;
  }

  accounts.forEach((acc, index) => {
    console.log(`${index + 1}. Account ID: ${acc.id}`);
    console.log(`   Platform User ID: ${acc.platform_user_id}`);
    console.log(`   Platform Account ID: ${acc.platform_account_id}`);
    console.log(`   Active: ${acc.is_active ? '✅ YES' : '❌ NO'}`);
    console.log(`   Token Expiry: ${acc.token_expires_at ? new Date(acc.token_expires_at).toLocaleString() : 'N/A'}`);
    console.log(`   Updated: ${new Date(acc.updated_at).toLocaleString()}`);
    console.log('');
  });

  // Show which account should be used
  const activeAccount = accounts.find(acc => acc.is_active);
  if (activeAccount) {
    console.log(`✅ Active account to use: ${activeAccount.id}`);
    console.log('');
  }
}

checkAccounts();
