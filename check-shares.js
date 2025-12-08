const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkShares() {
  console.log('Checking post_plan_shares...\n');

  // Check shares
  const { data: shares, error: sharesError } = await supabase
    .from('post_plan_shares')
    .select('*');

  if (sharesError) {
    console.error('Error fetching shares:', sharesError.message);
    return;
  }

  console.log('Shares found:', shares?.length || 0);
  if (shares && shares.length > 0) {
    shares.forEach(share => {
      console.log(`\n- Token: ${share.share_token}`);
      console.log(`  Title: ${share.title}`);
      console.log(`  Active: ${share.is_active}`);
      console.log(`  Created: ${share.created_at}`);
    });
  }

  // Check items
  const { data: items, error: itemsError } = await supabase
    .from('post_plan_share_items')
    .select('*');

  console.log('\n\nShare items found:', items?.length || 0);
  if (itemsError) {
    console.error('Error fetching items:', itemsError.message);
  }
}

checkShares();
