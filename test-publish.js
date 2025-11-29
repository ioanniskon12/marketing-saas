/**
 * Test publishing a post to Facebook
 */

require('dotenv').config({ path: '.env.local' });

async function testPublish() {
  const postId = '6984e83f-97b7-4f31-a2a1-16df0b0e3e77';
  const publishUrl = `http://localhost:3000/api/posts/${postId}/publish`;

  console.log('Testing publish endpoint...');
  console.log('URL:', publishUrl);
  console.log('');

  try {
    const response = await fetch(publishUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ Post published successfully to Facebook!');
      if (result.platformPosts) {
        Object.entries(result.platformPosts).forEach(([accountId, data]) => {
          console.log(`\nPlatform: ${data.platform}`);
          console.log(`Post ID: ${data.platform_post_id}`);
          console.log(`URL: ${data.post_url}`);
        });
      }
    } else {
      console.log('\n❌ Publishing failed');
      if (result.errors) {
        console.log('Errors:', result.errors);
      }
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPublish().then(() => {
  console.log('\nTest complete!');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
