const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function debug() {
  // Get all workspaces
  const { data: workspaces, error: workspaceError } = await supabase
    .from('workspaces')
    .select('id, name, owner_id');

  console.log('\n📁 Workspaces:');
  workspaces?.forEach((w, i) => {
    console.log(`${i + 1}. ${w.name || 'Unnamed'} (ID: ${w.id})`);
  });

  // Get demo posts and their workspace
  const { data: demoPosts, error: postsError } = await supabase
    .from('posts')
    .select('id, content, workspace_id, platforms')
    .contains('platforms', ['instagram'])
    .or('content.ilike.%New product launch%,content.ilike.%Behind the scenes%')
    .limit(5);

  console.log('\n📝 Demo posts workspace IDs:');
  demoPosts?.forEach((p) => {
    console.log(`- Post: "${p.content.substring(0, 40)}..." -> Workspace: ${p.workspace_id}`);
  });

  // Count posts per workspace
  const { data: allPosts } = await supabase
    .from('posts')
    .select('workspace_id');

  const counts = {};
  allPosts?.forEach(p => {
    counts[p.workspace_id] = (counts[p.workspace_id] || 0) + 1;
  });

  console.log('\n📊 Posts count per workspace:');
  Object.entries(counts).forEach(([wid, count]) => {
    const workspace = workspaces?.find(w => w.id === wid);
    console.log(`- ${workspace?.name || 'Unknown'} (${wid}): ${count} posts`);
  });
}

debug();
