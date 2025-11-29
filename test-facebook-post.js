/**
 * Test Facebook Image Post
 *
 * Quick script to test posting an image to Facebook
 */

const PAGE_TOKEN = "EAAWLni9Tpu4BPzTKSZAZA6odL2ljzDEe9yvf11YX75UNWDFLUnPJA15TsAT45dIKc9SbdgOBA7xhYTSEuIdgs3bWn27oBmXTCwMjTH5wr0ZC6l8kp6ndZA9Hek0rNSZCKAgtFkyHKZBWfjZAhSwuZAfIJZBLRbLkFCwQcwywikPLRbvJbALD9ZAg8sKPmWypIOT1bylT4OUZC7f3ZB4HU1HElLxHLYtS"; // From your environment

async function postImageToFacebook() {
  try {
    const pageId = "876037742260317"; // Your Facebook Page ID
    const message = "Test post with image from my SaaS app! 🚀";
    const imageUrl = "https://picsum.photos/800/600"; // Sample image URL

    console.log('📸 Posting image to Facebook...');
    console.log('Page ID:', pageId);
    console.log('Message:', message);
    console.log('Image URL:', imageUrl);
    console.log('---');

    const params = new URLSearchParams({
      access_token: PAGE_TOKEN,
      message: message,
      url: imageUrl,
    });

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/photos`,
      {
        method: 'POST',
        body: params,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error posting to Facebook:', data);
      console.error('Error message:', data.error?.message);
      return;
    }

    console.log('✅ Successfully posted to Facebook!');
    console.log('Post ID:', data.id);
    console.log('Post URL:', `https://www.facebook.com/${data.id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

postImageToFacebook();
