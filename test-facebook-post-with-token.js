/**
 * Test Facebook Image Post (with your own token)
 *
 * Instructions:
 * 1. Go to https://developers.facebook.com/tools/explorer/
 * 2. Select your app from dropdown
 * 3. Click "Generate Access Token"
 * 4. Select these permissions:
 *    - pages_show_list
 *    - pages_read_engagement
 *    - pages_manage_posts
 * 5. Click "Generate Token"
 * 6. Select your test page
 * 7. Copy the Page Access Token
 * 8. Replace PAGE_TOKEN below with your token
 * 9. Replace PAGE_ID with your page ID
 * 10. Run: node test-facebook-post-with-token.js
 */

const PAGE_TOKEN = "PASTE_YOUR_PAGE_TOKEN_HERE"; // Replace with token from Graph API Explorer
const PAGE_ID = "PASTE_YOUR_PAGE_ID_HERE"; // Replace with your test page ID

async function postImageToFacebook() {
  try {
    const message = "Test post with image from my SaaS app! 🚀";
    const imageUrl = "https://picsum.photos/800/600"; // Sample image URL

    console.log('📸 Posting image to Facebook...');
    console.log('Page ID:', PAGE_ID);
    console.log('Message:', message);
    console.log('Image URL:', imageUrl);
    console.log('---');

    const params = new URLSearchParams({
      access_token: PAGE_TOKEN,
      message: message,
      url: imageUrl,
    });

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PAGE_ID}/photos`,
      {
        method: 'POST',
        body: params,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error posting to Facebook:', data);
      console.error('Error message:', data.error?.message);
      console.error('Error type:', data.error?.type);
      console.error('Error code:', data.error?.code);

      if (data.error?.code === 200) {
        console.log('\n💡 This error means you need to:');
        console.log('   1. Use Facebook Test Mode with a test page');
        console.log('   2. OR submit your app for Facebook App Review');
        console.log('\nTo use Test Mode:');
        console.log('   • Go to https://developers.facebook.com/apps/1401657458149402/');
        console.log('   • Create a test page under "Roles" → "Test Pages"');
        console.log('   • Generate a token for the test page using Graph API Explorer');
      }
      return;
    }

    console.log('✅ Successfully posted to Facebook!');
    console.log('Post ID:', data.id);
    console.log('Post URL:', `https://www.facebook.com/${data.id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Validate before running
if (PAGE_TOKEN === "PASTE_YOUR_PAGE_TOKEN_HERE" || PAGE_ID === "PASTE_YOUR_PAGE_ID_HERE") {
  console.error('❌ Please update PAGE_TOKEN and PAGE_ID in the script first!');
  console.log('\n📝 Follow these steps:');
  console.log('1. Go to https://developers.facebook.com/tools/explorer/');
  console.log('2. Select your app (ID: 1401657458149402)');
  console.log('3. Click "Generate Access Token"');
  console.log('4. Select permissions: pages_show_list, pages_read_engagement, pages_manage_posts');
  console.log('5. Click "Generate Token"');
  console.log('6. Select your page');
  console.log('7. Copy the Page Access Token and Page ID');
  console.log('8. Update this script with those values');
} else {
  postImageToFacebook();
}
