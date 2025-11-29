const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkPosts() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, content, platforms, scheduled_for, status, created_at, workspace_id')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`\nFound ${posts.length} posts:\n`);
  posts.forEach((post, i) => {
    console.log(`${i + 1}. ${post.platforms.join(', ')} - ${post.content.substring(0, 50)}...`);
    console.log(`   Scheduled: ${post.scheduled_for}`);
    console.log(`   Status: ${post.status}`);
    console.log(`   Workspace: ${post.workspace_id}\n`);
  });
}

checkPosts();
