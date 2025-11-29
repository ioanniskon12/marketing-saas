/**
 * Auto-Publish Scheduler for Local Development
 *
 * This script runs in the background and automatically publishes scheduled posts
 * every minute, simulating what Vercel Cron does in production.
 *
 * Usage: node auto-publish-scheduler.js
 * Keep this running in a separate terminal while developing!
 */

const CRON_SECRET = 'dev-secret-123';
const CHECK_INTERVAL = 60000; // 60 seconds = 1 minute

console.log('🤖 Auto-Publish Scheduler Started');
console.log('📅 Checking for scheduled posts every 60 seconds');
console.log('Press Ctrl+C to stop\n');

let checkCount = 0;

async function checkAndPublish() {
  try {
    checkCount++;
    const now = new Date().toLocaleTimeString();

    console.log(`[${now}] Check #${checkCount}: Looking for scheduled posts...`);

    const response = await fetch('http://localhost:3000/api/cron/publish-posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`   ❌ Error:`, data.error);
      return;
    }

    if (data.summary && data.summary.total > 0) {
      console.log(`   ✅ Published ${data.summary.published} of ${data.summary.total} posts`);

      if (data.results) {
        data.results.forEach(result => {
          if (result.status === 'published') {
            console.log(`      📤 Post ${result.postId.substring(0, 8)}... → Published`);
          } else {
            console.log(`      ❌ Post ${result.postId.substring(0, 8)}... → Failed`);
          }
        });
      }
    } else {
      console.log(`   ℹ️  No posts scheduled for now`);
    }

  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
  }
}

// Run immediately on start
checkAndPublish();

// Then check every minute
setInterval(checkAndPublish, CHECK_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Auto-Publish Scheduler stopped');
  console.log(`Total checks performed: ${checkCount}`);
  process.exit(0);
});
