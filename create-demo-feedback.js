const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createDemoFeedback() {
  console.log('🎬 Creating demo feedback data...\n');

  // Get the first workspace
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id')
    .limit(1);

  if (!workspaces || workspaces.length === 0) {
    console.error('❌ No workspaces found!');
    return;
  }

  const workspaceId = workspaces[0].id;
  console.log(`📁 Using workspace: ${workspaceId}\n`);

  // Get some posts from this workspace
  const { data: posts } = await supabase
    .from('posts')
    .select('id')
    .eq('workspace_id', workspaceId)
    .limit(5);

  if (!posts || posts.length === 0) {
    console.error('❌ No posts found in workspace!');
    return;
  }

  console.log(`📝 Found ${posts.length} posts\n`);

  // Get a user from this workspace to use as created_by
  const { data: members } = await supabase
    .from('workspace_members')
    .select('user_id')
    .eq('workspace_id', workspaceId)
    .limit(1);

  if (!members || members.length === 0) {
    console.error('❌ No workspace members found!');
    return;
  }

  const userId = members[0].user_id;

  // Create a calendar share
  const shareData = {
    workspace_id: workspaceId,
    created_by: userId,
    share_token: `demo-${Date.now()}`,
    title: 'Q1 2025 Social Media Calendar',
    description: 'Review our Q1 content calendar and provide feedback',
    permission_level: 'approve', // view, comment, or approve
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    view_count: 15,
  };

  const { data: share, error: shareError } = await supabase
    .from('calendar_shares')
    .insert(shareData)
    .select()
    .single();

  if (shareError) {
    console.error('❌ Error creating share:', shareError);
    return;
  }

  console.log(`✅ Created share: ${share.title}`);
  console.log(`🔗 Token: ${share.share_token}\n`);

  // Create demo comments
  const comments = [
    {
      calendar_share_id: share.id,
      post_id: posts[0].id,
      author_name: 'Sarah Johnson',
      author_email: 'sarah.j@client.com',
      comment: 'Love this direction! The visual style really captures our brand essence. Could we add more behind-the-scenes content?',
    },
    {
      calendar_share_id: share.id,
      post_id: posts[1].id,
      author_name: 'Mike Chen',
      author_email: 'mike.chen@client.com',
      comment: 'This caption needs work. It doesn\'t align with our messaging guidelines. Let\'s discuss alternatives.',
    },
    {
      calendar_share_id: share.id,
      post_id: posts[0].id,
      author_name: 'Emily Rodriguez',
      author_email: 'emily.r@client.com',
      comment: 'Perfect timing for this post! Our product launch aligns well with this content.',
    },
  ];

  for (const comment of comments) {
    const { error } = await supabase
      .from('calendar_share_comments')
      .insert(comment);

    if (error) {
      console.error('❌ Error creating comment:', error);
    } else {
      console.log(`💬 Added comment from ${comment.author_name}`);
    }
  }

  console.log('');

  // Create demo approvals
  const approvals = [
    {
      calendar_share_id: share.id,
      post_id: posts[0].id,
      approver_name: 'David Martinez',
      approver_email: 'david.m@client.com',
      approved: true,
      feedback: 'Approved! Great work on this one. The messaging is spot-on and the visuals are stunning.',
    },
    {
      calendar_share_id: share.id,
      post_id: posts[1].id,
      approver_name: 'Lisa Thompson',
      approver_email: 'lisa.t@client.com',
      approved: false,
      feedback: 'I need to see a revision. The tone doesn\'t match our brand voice and the CTA is too aggressive.',
    },
    {
      calendar_share_id: share.id,
      post_id: posts[2].id,
      approver_name: 'James Wilson',
      approver_email: 'james.w@client.com',
      approved: true,
      feedback: 'Looks good to me! Ready to publish.',
    },
  ];

  for (const approval of approvals) {
    const { error } = await supabase
      .from('calendar_share_approvals')
      .insert(approval);

    if (error) {
      console.error('❌ Error creating approval:', error);
    } else {
      const icon = approval.approved ? '✅' : '❌';
      console.log(`${icon} ${approval.approved ? 'Approved' : 'Rejected'} by ${approval.approver_name}`);
    }
  }

  // Log some activities
  const activities = [
    { calendar_share_id: share.id, activity_type: 'view', visitor_ip: '192.168.1.1' },
    { calendar_share_id: share.id, activity_type: 'view', visitor_ip: '192.168.1.2' },
    { calendar_share_id: share.id, activity_type: 'view', visitor_ip: '192.168.1.3' },
  ];

  for (const activity of activities) {
    await supabase.from('calendar_share_activity').insert(activity);
  }

  console.log('\n✅ Demo feedback data created successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Share: ${share.title}`);
  console.log(`   - Comments: ${comments.length}`);
  console.log(`   - Approvals: ${approvals.filter(a => a.approved).length}`);
  console.log(`   - Rejections: ${approvals.filter(a => !a.approved).length}`);
  console.log(`   - Views: ${share.view_count}`);
  console.log('\n🔗 View the feedback dashboard at:');
  console.log('   http://localhost:3000/dashboard/plan-feedback');
  console.log('\n🔗 View the shared plan at:');
  console.log(`   http://localhost:3000/share/plan/${share.share_token}`);
}

createDemoFeedback();
