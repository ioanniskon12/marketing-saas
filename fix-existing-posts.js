/**
 * Fix existing posts to use account IDs instead of platform names
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixExistingPosts() {
  console.log('Fixing existing posts...\n');

  // Get the Facebook account ID
  const { data: account, error: accountError } = await supabase
    .from('social_accounts')
    .select('id, platform')
    .eq('platform', 'facebook')
    .single();

  if (accountError || !account) {
    console.error('Error getting Facebook account:', accountError);
    return;
  }

  console.log('Facebook account ID:', account.id);
  console.log('');

  // Get all posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*');

  if (postsError) {
    console.error('Error getting posts:', postsError);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('No posts found.');
    return;
  }

  // Filter posts that have 'facebook' in platforms array
  const postsToFix = posts.filter(post =>
    post.platforms && post.platforms.includes('facebook')
  );

  if (postsToFix.length === 0) {
    console.log('No posts need fixing.');
    return;
  }

  console.log(`Found ${postsToFix.length} post(s) to fix:\n`);

  // Update each post
  for (const post of postsToFix) {
    console.log(`Fixing post ${post.id}...`);
    console.log(`  Old platforms: ${JSON.stringify(post.platforms)}`);

    const { error: updateError } = await supabase
      .from('posts')
      .update({
        platforms: [account.id]
      })
      .eq('id', post.id);

    if (updateError) {
      console.error(`  ❌ Error updating post: ${updateError.message}`);
    } else {
      console.log(`  ✅ Updated to: ${JSON.stringify([account.id])}`);
    }
    console.log('');
  }

  console.log('All posts fixed!');
}

fixExistingPosts().then(() => {
  console.log('\nFix complete!');
  process.exit(0);
}).catch((error) => {
  console.error('Fix failed:', error);
  process.exit(1);
});
