/**
 * Test workspace query to debug WorkspaceContext issue
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWorkspaceQuery() {
  console.log('Testing workspace query...\n');

  // First, get the user ID
  const { data: users, error: userError } = await supabase
    .from('user_profiles')
    .select('id')
    .limit(1);

  if (userError) {
    console.error('Error getting user:', userError);
    return;
  }

  if (!users || users.length === 0) {
    console.log('No users found in user_profiles');
    return;
  }

  const userId = users[0].id;
  console.log('Testing with user ID:', userId);
  console.log('');

  // Test the exact query from WorkspaceContext
  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      workspace_id,
      role,
      created_at,
      workspaces (
        id,
        name,
        slug,
        logo_url,
        logo_size,
        owner_id,
        subscription_plan,
        subscription_status,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Query error:', error);
    return;
  }

  console.log('Query result:');
  console.log(JSON.stringify(data, null, 2));
  console.log('');
  console.log('Number of workspaces found:', data?.length || 0);
}

testWorkspaceQuery().then(() => {
  console.log('\nTest complete!');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
