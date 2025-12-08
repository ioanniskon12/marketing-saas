const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function applyMigration() {
  console.log('Applying migration for post_plan_shares...\n');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Post Plan Shares Table
      CREATE TABLE IF NOT EXISTS post_plan_shares (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        share_token VARCHAR(64) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        client_name VARCHAR(255),
        permission VARCHAR(20) NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'comment', 'approve')),
        show_analytics BOOLEAN DEFAULT false,
        password_hash TEXT,
        expires_at TIMESTAMP WITH TIME ZONE,
        view_count INTEGER DEFAULT 0,
        last_viewed_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Junction table for share -> posts relationship
      CREATE TABLE IF NOT EXISTS post_plan_share_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        share_id UUID NOT NULL REFERENCES post_plan_shares(id) ON DELETE CASCADE,
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        position INTEGER DEFAULT 0,
        content_snapshot TEXT,
        media_snapshot JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(share_id, post_id)
      );

      -- Feedback table
      CREATE TABLE IF NOT EXISTS post_plan_share_feedback (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        share_id UUID NOT NULL REFERENCES post_plan_shares(id) ON DELETE CASCADE,
        post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
        feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('reaction', 'comment', 'approval')),
        reaction VARCHAR(20),
        comment TEXT,
        approved BOOLEAN,
        author_name VARCHAR(255),
        author_email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  if (error) {
    // Try direct SQL queries instead
    console.log('RPC not available, trying direct table creation...');

    // Create post_plan_shares table
    const { error: err1 } = await supabase
      .from('post_plan_shares')
      .select('id')
      .limit(1);

    if (err1 && err1.code === '42P01') {
      console.log('Tables do not exist. Please run the SQL migration manually in Supabase dashboard.');
      console.log('\nMigration file: supabase/migrations/018_post_plan_shares.sql');
    } else if (!err1) {
      console.log('Tables already exist!');
    } else {
      console.log('Error checking tables:', err1.message);
    }
    return;
  }

  console.log('Migration applied successfully!');
}

applyMigration();
