/**
 * Force Publish a Scheduled Post
 *
 * Manually publishes a specific post, bypassing time checks
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get the first scheduled post
async function forcePublish() {
  console.log('🚀 Force publishing a scheduled post...\n');

  // Get one scheduled post
  const { data: posts, error: fetchError } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'scheduled')
    .limit(1);

  if (fetchError) {
    console.error('❌ Error:', fetchError);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('No scheduled posts found.');
    return;
  }

  const post = posts[0];
  console.log(`Found post: "${post.content?.substring(0, 50)}..."`);
  console.log(`Post ID: ${post.id}`);
  console.log(`Platforms: ${JSON.stringify(post.platforms)}\n`);

  // Call the publish endpoint directly
  console.log('Calling publish endpoint...\n');

  const response = await fetch(`http://localhost:3000/api/posts/${post.id}/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workspaceId: post.workspace_id,
    }),
  });

  const result = await response.json();

  if (response.ok) {
    console.log('✅ Successfully published!\n');
    console.log('Result:', JSON.stringify(result, null, 2));
  } else {
    console.log('❌ Failed to publish\n');
    console.log('Error:', JSON.stringify(result, null, 2));
  }
}

forcePublish();
