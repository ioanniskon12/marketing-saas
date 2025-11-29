/**
 * Create Demo Posts for All Platforms
 *
 * Run this script to populate the database with sample posts
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Demo posts data
const demoPosts = [
  // Instagram Posts
  {
    content: '🎉 New product launch! Check out our latest collection. Link in bio! #NewCollection #Fashion #Style',
    content_type: 'feed',
    media: [{
      media_type: 'image',
      file_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1080&h=1080&fit=crop',
      thumbnail_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    }],
    scheduled_for: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    platforms: ['instagram'],
    hashtags: ['NewCollection', 'Fashion', 'Style'],
  },
  {
    content: '✨ Behind the scenes of our photoshoot today! Stay tuned for more amazing content 📸 #BTS #Photography #CreativeProcess',
    content_type: 'feed',
    media: [{
      media_type: 'image',
      file_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1080&h=1080&fit=crop',
      thumbnail_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=400&fit=crop',
    }],
    scheduled_for: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    platforms: ['instagram'],
    hashtags: ['BTS', 'Photography', 'CreativeProcess'],
  },
  {
    content: '🎬 NEW REEL: Watch how we create magic! Swipe to see the final result ➡️ #Reels #ContentCreation #Tutorial',
    content_type: 'reel',
    media: [{
      media_type: 'video',
      file_url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1080&h=1920&fit=crop',
      thumbnail_url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=700&fit=crop',
    }],
    scheduled_for: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    platforms: ['instagram'],
    hashtags: ['Reels', 'ContentCreation', 'Tutorial'],
  },

  // Facebook Posts
  {
    content: 'Exciting news! We\'re thrilled to announce our partnership with leading brands. This means better products and services for you! 🎊\n\nLearn more: [link]',
    content_type: 'feed',
    media: [{
      media_type: 'image',
      file_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=630&fit=crop',
      thumbnail_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=210&fit=crop',
    }],
    scheduled_for: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    platforms: ['facebook'],
    hashtags: [],
  },
  {
    content: '📢 Community Update: Thank you for 10,000 followers! To celebrate, we\'re hosting a special giveaway. Comment below to enter! 🎁',
    content_type: 'feed',
    media: [{
      media_type: 'image',
      file_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=630&fit=crop',
      thumbnail_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=210&fit=crop',
    }],
    scheduled_for: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    platforms: ['facebook'],
    hashtags: [],
  },

  // YouTube Posts
  {
    content: '🎥 NEW VIDEO: "How to Master Social Media Marketing in 2025" is now live! \n\nIn this comprehensive guide, we cover:\n✅ Content strategy\n✅ Engagement tactics\n✅ Analytics insights\n\nWatch now and let us know your thoughts in the comments!',
    content_type: 'video',
    media: [{
      media_type: 'video',
      file_url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=1280&h=720&fit=crop',
      thumbnail_url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=225&fit=crop',
    }],
    scheduled_for: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    platforms: ['youtube'],
    hashtags: ['SocialMediaMarketing', 'Marketing2025', 'Tutorial'],
  },

  // LinkedIn Posts
  {
    content: '💼 Industry Insights: The Future of Digital Marketing\n\nAs we move into 2025, here are 5 key trends every marketer should know:\n\n1. AI-powered personalization\n2. Video-first content strategy\n3. Authentic storytelling\n4. Community building\n5. Data-driven decisions\n\nWhat trends are you seeing in your industry? Let\'s discuss in the comments. 👇',
    content_type: 'feed',
    media: [{
      media_type: 'image',
      file_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=628&fit=crop',
      thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=209&fit=crop',
    }],
    scheduled_for: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    platforms: ['linkedin'],
    hashtags: ['DigitalMarketing', 'Marketing', 'IndustryTrends'],
  },
  {
    content: '🚀 We\'re hiring! Join our amazing team as a Social Media Manager.\n\nWe\'re looking for someone who:\n• Has 3+ years of experience\n• Loves creating engaging content\n• Understands analytics and ROI\n• Is passionate about innovation\n\nInterested? Send us a DM or apply via the link in our profile.',
    content_type: 'feed',
    media: [{
      media_type: 'image',
      file_url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=628&fit=crop',
      thumbnail_url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=209&fit=crop',
    }],
    scheduled_for: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    platforms: ['linkedin'],
    hashtags: ['Hiring', 'SocialMediaJobs', 'CareerOpportunity'],
  },

  // Twitter Posts
  {
    content: '🔥 Hot take: The best marketing strategy is simply being helpful.\n\nStop selling. Start solving.\n\n#Marketing #Business #GrowthTips',
    content_type: 'feed',
    media: [],
    scheduled_for: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    platforms: ['twitter'],
    hashtags: ['Marketing', 'Business', 'GrowthTips'],
  },
  {
    content: '📊 NEW BLOG POST: "10 Data-Driven Strategies to Boost Your Social Media ROI"\n\nRead the full article here: [link]\n\n#SocialMedia #Marketing #Analytics',
    content_type: 'feed',
    media: [{
      media_type: 'image',
      file_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop',
      thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
    }],
    scheduled_for: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    platforms: ['twitter'],
    hashtags: ['SocialMedia', 'Marketing', 'Analytics'],
  },

  // TikTok Posts
  {
    content: '🎵 Trending now! Watch us recreate this viral dance challenge. Can you do it better? Tag us! #TikTokChallenge #Viral #Trending',
    content_type: 'video',
    media: [{
      media_type: 'video',
      file_url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1080&h=1920&fit=crop',
      thumbnail_url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=700&fit=crop',
    }],
    scheduled_for: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    platforms: ['tiktok'],
    hashtags: ['TikTokChallenge', 'Viral', 'Trending'],
  },
  {
    content: '✨ Quick tip: How to grow your TikTok in 30 seconds! Follow for more social media hacks 🚀 #TikTokTips #Growth #SocialMedia',
    content_type: 'video',
    media: [{
      media_type: 'video',
      file_url: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=1080&h=1920&fit=crop',
      thumbnail_url: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=700&fit=crop',
    }],
    scheduled_for: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    platforms: ['tiktok'],
    hashtags: ['TikTokTips', 'Growth', 'SocialMedia'],
  },

  // Multi-platform posts
  {
    content: '🌟 Weekly Motivation: "Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill\n\n#MondayMotivation #Inspiration #Success',
    content_type: 'feed',
    media: [{
      media_type: 'image',
      file_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1080&h=1080&fit=crop',
      thumbnail_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=400&fit=crop',
    }],
    scheduled_for: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    platforms: ['instagram', 'facebook', 'twitter'],
    hashtags: ['MondayMotivation', 'Inspiration', 'Success'],
  },
  {
    content: '🎁 FLASH SALE! 50% off everything for the next 24 hours! Don\'t miss out on this incredible offer. Shop now! ⏰ #Sale #Shopping #LimitedTime',
    content_type: 'feed',
    media: [{
      media_type: 'image',
      file_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1080&h=1080&fit=crop',
      thumbnail_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=400&fit=crop',
    }],
    scheduled_for: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    platforms: ['instagram', 'facebook'],
    hashtags: ['Sale', 'Shopping', 'LimitedTime'],
  },
];

async function createDemoPosts() {
  try {
    console.log('🚀 Creating demo posts for all platforms...\n');

    // Get the first workspace
    const { data: workspaces, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id, owner_id')
      .limit(1);

    if (workspaceError) {
      throw new Error(`Failed to fetch workspace: ${workspaceError.message}`);
    }

    if (!workspaces || workspaces.length === 0) {
      throw new Error('No workspace found. Please create a workspace first.');
    }

    const workspace = workspaces[0];
    console.log(`✅ Using workspace: ${workspace.id}`);
    console.log(`✅ Owner: ${workspace.owner_id}\n`);

    let createdCount = 0;
    const platformCounts = {};

    // Create posts one by one
    for (const postData of demoPosts) {
      try {
        const { media, ...postFields } = postData;

        // Create post
        const { data: post, error: postError } = await supabase
          .from('posts')
          .insert({
            workspace_id: workspace.id,
            created_by: workspace.owner_id,
            ...postFields,
          })
          .select()
          .single();

        if (postError) {
          console.error(`❌ Failed to create post:`, postError.message);
          continue;
        }

        // Add media if provided
        if (media && media.length > 0) {
          const mediaInserts = media.map((item, index) => ({
            post_id: post.id,
            workspace_id: workspace.id,
            media_type: item.media_type,
            file_url: item.file_url,
            thumbnail_url: item.thumbnail_url,
            display_order: index,
          }));

          const { error: mediaError } = await supabase
            .from('post_media')
            .insert(mediaInserts);

          if (mediaError) {
            console.error(`⚠️  Failed to add media to post ${post.id}:`, mediaError.message);
          }
        }

        createdCount++;
        postData.platforms.forEach(platform => {
          platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        });

        console.log(`✓ Created ${postData.content_type} post for ${postData.platforms.join(', ')}`);
      } catch (error) {
        console.error(`❌ Error creating post:`, error.message);
      }
    }

    console.log(`\n✅ Successfully created ${createdCount} demo posts!\n`);

    // Summary
    console.log('📊 Posts by platform:');
    Object.entries(platformCounts).forEach(([platform, count]) => {
      console.log(`   ${platform}: ${count} posts`);
    });

    console.log('\n🎉 All done! You can now test the plans feature at:');
    console.log('   http://localhost:3000/dashboard/plans\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDemoPosts();
