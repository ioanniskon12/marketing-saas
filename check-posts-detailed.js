/**
 * Check posts in database with detailed platform_posts info
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPosts() {
  console.log('Checking all posts in database...\n');

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('No posts found in database.');
    return;
  }

  console.log(`Found ${posts.length} post(s):\n`);

  posts.forEach((post, index) => {
    console.log(`Post ${index + 1}:`);
    console.log(`  ID: ${post.id}`);
    console.log(`  Status: ${post.status}`);
    console.log(`  Content: ${post.content?.substring(0, 50)}${post.content?.length > 50 ? '...' : ''}`);
    console.log(`  Platforms: ${JSON.stringify(post.platforms)}`);
    console.log(`  Platform Posts: ${JSON.stringify(post.platform_posts, null, 2)}`);
    console.log(`  Created: ${post.created_at}`);
    console.log(`  Published: ${post.published_at}`);
    console.log('');
  });
}

checkPosts().then(() => {
  console.log('Check complete!');
  process.exit(0);
}).catch((error) => {
  console.error('Check failed:', error);
  process.exit(1);
});
