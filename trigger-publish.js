/**
 * Manually Trigger Scheduled Post Publishing
 *
 * This script manually triggers the cron job to publish scheduled posts.
 * Use this during local development since Vercel cron only works in production.
 */

const CRON_SECRET = 'dev-secret-123'; // For local development

async function triggerPublish() {
  try {
    console.log('🚀 Triggering scheduled post publishing...\n');

    const url = `http://localhost:3000/api/cron/publish-posts`;

    console.log('📡 Calling:', url);
    console.log('');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', data);
      return;
    }

    console.log('✅ Success!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   Total posts checked:', data.summary?.total || 0);
    console.log('   Successfully published:', data.summary?.published || 0);
    console.log('   Failed:', data.summary?.failed || 0);
    console.log('');

    if (data.results && data.results.length > 0) {
      console.log('📝 Details:');
      data.results.forEach((result, index) => {
        console.log(`   ${index + 1}. Post ${result.postId.substring(0, 8)}...`);
        console.log(`      Status: ${result.status}`);
        if (result.platforms) {
          result.platforms.forEach(p => {
            console.log(`      - ${p.platform}: ${p.status}`);
            if (p.platformPostId) {
              console.log(`        Post ID: ${p.platformPostId}`);
            }
            if (p.error) {
              console.log(`        Error: ${p.error}`);
            }
          });
        }
        console.log('');
      });
    } else {
      console.log('ℹ️  No scheduled posts found for the current time.');
      console.log('   Posts are checked for the last 5 minutes.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

triggerPublish();
