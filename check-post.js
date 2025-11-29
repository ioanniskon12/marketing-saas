/**
 * Check if post was created and published
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPost() {
  console.log('Checking for posts...\n');

  // Get all posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching posts:', error);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('❌ No posts found');
    return;
  }

  console.log(`✅ Found ${posts.length} post(s)!\n`);

  posts.forEach((post, index) => {
    console.log(`Post ${index + 1}:`);
    console.log(`  ID: ${post.id}`);
    console.log(`  Content: ${post.content?.substring(0, 50)}...`);
    console.log(`  Status: ${post.status}`);
    console.log(`  Platforms: ${post.platforms?.join(', ') || 'None'}`);
    console.log(`  Scheduled for: ${post.scheduled_for || 'Not scheduled'}`);
    console.log(`  Published at: ${post.published_at || 'Not published yet'}`);
    console.log(`  Error: ${post.error_message || 'None'}`);
    console.log(`  Created: ${new Date(post.created_at).toLocaleString()}`);
    console.log('');
  });
}

checkPost().then(() => {
  console.log('\nCheck complete!');
  process.exit(0);
}).catch((error) => {
  console.error('Check failed:', error);
  process.exit(1);
});
