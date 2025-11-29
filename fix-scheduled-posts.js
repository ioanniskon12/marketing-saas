/**
 * Fix Scheduled Posts Account References
 *
 * Updates all scheduled posts to use the new Facebook account ID
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const OLD_ACCOUNT_ID = 'f41210ed-dae1-4184-9c69-2ff8f5c4c77b';
const NEW_ACCOUNT_ID = 'b5d4dc16-60aa-4c10-9e9f-9ead6cbfb40f';

async function fixScheduledPosts() {
  console.log('🔧 Fixing scheduled posts...\n');
  console.log(`Old account ID: ${OLD_ACCOUNT_ID}`);
  console.log(`New account ID: ${NEW_ACCOUNT_ID}\n`);

  // Get all scheduled posts
  const { data: scheduledPosts, error: fetchError } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'scheduled');

  if (fetchError) {
    console.error('❌ Error fetching posts:', fetchError);
    return;
  }

  console.log(`Found ${scheduledPosts?.length || 0} scheduled posts\n`);

  if (!scheduledPosts || scheduledPosts.length === 0) {
    console.log('No scheduled posts to fix.');
    return;
  }

  let fixed = 0;
  let skipped = 0;

  for (const post of scheduledPosts) {
    const platforms = post.platforms || [];

    // Check if this post uses the old account ID
    if (platforms.includes(OLD_ACCOUNT_ID)) {
      // Replace old ID with new ID
      const newPlatforms = platforms.map(id =>
        id === OLD_ACCOUNT_ID ? NEW_ACCOUNT_ID : id
      );

      const { error: updateError } = await supabase
        .from('posts')
        .update({ platforms: newPlatforms })
        .eq('id', post.id);

      if (updateError) {
        console.error(`❌ Failed to update post ${post.id.substring(0, 8)}...`, updateError);
      } else {
        console.log(`✅ Fixed post ${post.id.substring(0, 8)}... "${post.content?.substring(0, 30)}..."`);
        fixed++;
      }
    } else {
      console.log(`⏭️  Skipped post ${post.id.substring(0, 8)}... (doesn't use old account)`);
      skipped++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Fixed: ${fixed}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${scheduledPosts.length}`);
}

fixScheduledPosts();
