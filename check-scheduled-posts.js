/**
 * Check Scheduled Posts
 *
 * Shows all scheduled posts with their details to debug scheduling issues
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkScheduledPosts() {
  console.log('📅 Checking scheduled posts...\n');

  // Get current time
  const now = new Date();
  console.log('Current time:', now.toISOString());
  console.log('Local time:', now.toLocaleString());
  console.log('');

  // Get all posts with 'scheduled' status
  const { data: scheduledPosts, error: scheduledError } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'scheduled')
    .order('scheduled_for', { ascending: true });

  if (scheduledError) {
    console.error('❌ Error fetching scheduled posts:', scheduledError);
    return;
  }

  console.log(`Found ${scheduledPosts?.length || 0} scheduled posts:\n`);

  if (!scheduledPosts || scheduledPosts.length === 0) {
    console.log('No scheduled posts found.');
    return;
  }

  // Show details for each post
  for (const post of scheduledPosts) {
    const scheduledTime = new Date(post.scheduled_for);
    const isPast = scheduledTime <= now;
    const minutesUntil = Math.round((scheduledTime - now) / 60000);

    console.log(`Post ID: ${post.id.substring(0, 8)}...`);
    console.log(`  Content: "${post.content?.substring(0, 50)}..."`);
    console.log(`  Scheduled for: ${scheduledTime.toISOString()}`);
    console.log(`  Local time: ${scheduledTime.toLocaleString()}`);
    console.log(`  Status: ${isPast ? '⏰ PAST DUE' : `⏱️  ${minutesUntil} minutes from now`}`);
    console.log(`  Created at: ${post.created_at}`);
    console.log(`  Platforms (account IDs): ${JSON.stringify(post.platforms)}`);
    console.log('');

    // Check if these accounts exist and are active
    if (post.platforms && post.platforms.length > 0) {
      const { data: accounts, error: accountsError } = await supabase
        .from('social_accounts')
        .select('id, platform, platform_account_name, is_active')
        .in('id', post.platforms);

      if (accountsError) {
        console.error('  ❌ Error fetching accounts:', accountsError.message);
      } else if (!accounts || accounts.length === 0) {
        console.log('  ⚠️  WARNING: No social accounts found for this post!');
      } else {
        console.log('  Social accounts:');
        accounts.forEach(acc => {
          console.log(`    - ${acc.platform}: ${acc.platform_account_name} (${acc.is_active ? '✅ active' : '❌ inactive'})`);
        });
      }
      console.log('');
    }
  }

  // Also check recently published/failed posts
  console.log('\n📊 Recent posts (last 30 minutes):');
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

  const { data: recentPosts, error: recentError } = await supabase
    .from('posts')
    .select('*')
    .in('status', ['published', 'failed', 'publishing'])
    .gte('updated_at', thirtyMinutesAgo.toISOString())
    .order('updated_at', { ascending: false });

  if (recentError) {
    console.error('❌ Error:', recentError);
  } else if (recentPosts && recentPosts.length > 0) {
    recentPosts.forEach(post => {
      console.log(`  ${post.status === 'published' ? '✅' : '❌'} ${post.content?.substring(0, 30)}... (${post.status})`);
      console.log(`     Updated: ${new Date(post.updated_at).toLocaleString()}`);
    });
  } else {
    console.log('  No recent posts');
  }
}

checkScheduledPosts();
