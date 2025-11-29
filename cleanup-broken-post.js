/**
 * Clean up broken posts (published status but no platform_posts)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanupBrokenPost() {
  console.log('Cleaning up broken post...\n');

  const postId = '4ecc4b6a-42de-4366-bfd8-11113a2cf6dc';

  // Delete the post
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error);
    return;
  }

  console.log('✅ Broken post deleted successfully');
}

cleanupBrokenPost().then(() => {
  console.log('\nCleanup complete!');
  process.exit(0);
}).catch((error) => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});
