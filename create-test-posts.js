const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const testPosts = [
  // Instagram Posts
  {
    platform: 'instagram',
    content: '🎨 New collection launching next week! Get ready for vibrant colors and bold designs. Which one is your favorite? 👇 #NewCollection #Fashion #Style',
    scheduled_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    status: 'scheduled',
  },
  {
    platform: 'instagram',
    content: '✨ Behind the scenes of our photoshoot! Swipe to see the magic happen ➡️ Tag someone who needs to see this! 📸 #BTS #Photography #Creative',
    scheduled_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: 'scheduled',
  },
  {
    platform: 'instagram',
    content: '🔥 FLASH SALE! 50% off everything for the next 24 hours only! Use code: FLASH50 at checkout. Link in bio! 🛍️ #Sale #Shopping #Deals',
    scheduled_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    status: 'scheduled',
  },

  // Facebook Posts
  {
    platform: 'facebook',
    content: 'We\'re thrilled to announce our partnership with @EcoFriendlyBrands! Together, we\'re committed to creating a more sustainable future. Read more about our initiative: [link] 🌱♻️ #Sustainability #Partnership #GreenFuture',
    scheduled_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    status: 'scheduled',
  },
  {
    platform: 'facebook',
    content: '📢 Join us LIVE this Friday at 3 PM for an exclusive Q&A session with our founder! Drop your questions in the comments below and we\'ll answer them during the stream. See you there! 🎥 #LiveSession #AMA #Community',
    scheduled_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'scheduled',
  },

  // Twitter Posts
  {
    platform: 'twitter',
    content: '🚀 Big announcement coming tomorrow at 10 AM EST! Any guesses? Drop your predictions below! 👇 #ComingSoon #BigNews',
    scheduled_time: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000),
    status: 'scheduled',
  },
  {
    platform: 'twitter',
    content: '💡 Pro tip: Did you know you can increase productivity by 40% with these 3 simple habits? Thread 🧵👇\n\n1. Time blocking\n2. Single-tasking\n3. Regular breaks\n\n#ProductivityHacks #WorkSmart',
    scheduled_time: new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000),
    status: 'scheduled',
  },
  {
    platform: 'twitter',
    content: 'Just crossed 10K followers! 🎉 Thank you all for the amazing support. Here\'s to the next milestone! 🚀 Special shoutout to our day-one supporters ❤️ #Milestone #ThankYou #Community',
    scheduled_time: new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000),
    status: 'scheduled',
  },

  // YouTube Posts (Community Tab)
  {
    platform: 'youtube',
    content: '🎬 New video dropping this Sunday! "10 Things You Didn\'t Know About AI" - This one took 3 months to create and I\'m so excited to share it with you! Set your reminders! 🔔 What topic should we cover next?',
    scheduled_time: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    status: 'scheduled',
  },
  {
    platform: 'youtube',
    content: '📊 POLL: What type of content do you want to see more of?\n\nA) Tutorials\nB) Behind the scenes\nC) Product reviews\nD) Vlogs\n\nComment your choice below! Your feedback shapes our content 🎥',
    scheduled_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'scheduled',
  },

  // TikTok Posts
  {
    platform: 'tiktok',
    content: 'POV: You just discovered the easiest life hack ever 🤯 Try this and thank me later! #LifeHack #Viral #FYP #TikTokTutorial',
    scheduled_time: new Date(Date.now() + 1.2 * 24 * 60 * 60 * 1000),
    status: 'scheduled',
  },
  {
    platform: 'tiktok',
    content: 'Duet this if you agree! 👯‍♀️ Let\'s start a trend! #DuetMe #TikTokTrend #Viral #ForYou #FYP',
    scheduled_time: new Date(Date.now() + 2.8 * 24 * 60 * 60 * 1000),
    status: 'scheduled',
  },
  {
    platform: 'tiktok',
    content: 'Part 3 of the series you\'ve been waiting for! 🔥 If you missed parts 1 & 2, check my profile! Who\'s binge-watching? 👀 #Series #ContentCreator #StoryTime #Trending',
    scheduled_time: new Date(Date.now() + 4.5 * 24 * 60 * 60 * 1000),
    status: 'scheduled',
  },

  // LinkedIn Posts
  {
    platform: 'linkedin',
    content: '🎯 5 Key Lessons from Building a Startup in 2024:\n\n1. Customer feedback > Your assumptions\n2. Team culture is everything\n3. Iterate quickly, fail faster\n4. Network authentically\n5. Celebrate small wins\n\nWhat would you add to this list? #Startup #Entrepreneurship #BusinessGrowth',
    scheduled_time: new Date(Date.now() + 5.5 * 24 * 60 * 60 * 1000),
    status: 'scheduled',
  },
];

async function createTestPosts() {
  console.log('🚀 Creating test posts for all platforms...\n');

  try {
    // Get the first workspace
    const { data: workspaces, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id')
      .limit(1);

    if (workspaceError) throw workspaceError;

    if (!workspaces || workspaces.length === 0) {
      console.error('❌ No workspaces found!');
      return;
    }

    const workspaceId = workspaces[0].id;
    console.log(`📁 Using workspace: ${workspaceId}\n`);

    // Get a user from this workspace
    const { data: members, error: memberError } = await supabase
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', workspaceId)
      .limit(1);

    if (memberError) throw memberError;

    if (!members || members.length === 0) {
      console.error('❌ No workspace members found!');
      return;
    }

    const userId = members[0].user_id;

    // Create posts
    let successCount = 0;
    const platformCounts = {};

    for (const post of testPosts) {
      const postData = {
        workspace_id: workspaceId,
        created_by: userId,
        content: post.content,
        platforms: [post.platform],
        scheduled_for: post.scheduled_time.toISOString(),
        status: post.status,
      };

      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating ${post.platform} post:`, error.message);
      } else {
        successCount++;
        platformCounts[post.platform] = (platformCounts[post.platform] || 0) + 1;
        const emoji = {
          instagram: '📸',
          facebook: '👥',
          twitter: '🐦',
          youtube: '🎥',
          tiktok: '🎵',
          linkedin: '💼',
        }[post.platform] || '📝';

        console.log(`${emoji} Created ${post.platform} post: "${post.content.substring(0, 50)}..."`);
      }
    }

    console.log('\n✅ Test posts created successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Total posts: ${successCount}`);
    Object.entries(platformCounts).forEach(([platform, count]) => {
      const emoji = {
        instagram: '📸',
        facebook: '👥',
        twitter: '🐦',
        youtube: '🎥',
        tiktok: '🎵',
        linkedin: '💼',
      }[platform] || '📝';
      console.log(`   - ${emoji} ${platform}: ${count} posts`);
    });

    console.log('\n🔗 Next steps:');
    console.log('1. Go to http://localhost:3000/dashboard/plans-hub');
    console.log('2. Select posts from different platforms');
    console.log('3. Click "Share Plan" to test auto-save');
    console.log('4. Create a share link and test emoji reactions');
    console.log('\n💡 Run "node create-demo-feedback.js" to add feedback to shared plans');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestPosts();
