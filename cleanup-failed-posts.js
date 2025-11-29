/**
 * Clean up failed posts stuck in publishing status
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanupFailedPosts() {
  console.log('Cleaning up failed posts...\n');

  const postIds = [
    '07480414-464e-490c-a7be-261da7a463b7',
    'ad0a3e07-b3d9-48d3-9195-f58ad3550046'
  ];

  for (const postId of postIds) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error(`❌ Error deleting post ${postId}:`, error);
    } else {
      console.log(`✅ Deleted post ${postId}`);
    }
  }

  console.log('\n✅ All failed posts cleaned up!');
}

cleanupFailedPosts().then(() => {
  console.log('\nCleanup complete!');
  process.exit(0);
}).catch((error) => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});
