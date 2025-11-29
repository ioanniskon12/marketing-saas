/**
 * Migration Script: Add feed_position column to posts table
 * Run with: node scripts/run-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envLines = envFile.split('\n');

let supabaseUrl = '';
let supabaseServiceKey = '';

envLines.forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.replace('NEXT_PUBLIC_SUPABASE_URL=', '').trim();
  } else if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    supabaseServiceKey = line.replace('SUPABASE_SERVICE_ROLE_KEY=', '').trim();
  }
});

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running migration: Add feed_position column...\n');

  try {
    // Add feed_position column
    console.log('Adding feed_position column to posts table...');
    const { data: addColumnData, error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE posts ADD COLUMN IF NOT EXISTS feed_position INTEGER;'
    });

    if (addColumnError && !addColumnError.message.includes('already exists')) {
      // Try alternative approach using direct SQL
      const { error: directError } = await supabase
        .from('posts')
        .select('feed_position')
        .limit(1);

      if (directError && directError.message.includes('column') && directError.message.includes('does not exist')) {
        console.log('\n⚠️  Need to run SQL manually in Supabase dashboard.\n');
        console.log('Please run the following SQL in your Supabase SQL Editor:');
        console.log('(Go to: https://app.supabase.com/project/nwgiuekwcwlhzmexkvyx/sql)\n');
        console.log('```sql');
        console.log('ALTER TABLE posts ADD COLUMN IF NOT EXISTS feed_position INTEGER;');
        console.log('CREATE INDEX IF NOT EXISTS idx_posts_feed_position ON posts(feed_position);');
        console.log('COMMENT ON COLUMN posts.feed_position IS \'Position of the post in the feed (0-indexed). Used for custom feed ordering\';');
        console.log('```\n');
        process.exit(0);
      }
    }

    console.log('✅ Column added or already exists\n');

    // Check if column exists now
    const { data: testData, error: testError } = await supabase
      .from('posts')
      .select('id, feed_position')
      .limit(1);

    if (!testError) {
      console.log('✅ Migration successful! The feed_position column is now available.');
      console.log('You can now use the drag-and-drop feed ordering feature.\n');
    } else {
      console.log('\n⚠️  Column verification failed. Please run the SQL manually:\n');
      console.log('Go to: https://app.supabase.com/project/nwgiuekwcwlhzmexkvyx/sql\n');
      console.log('```sql');
      console.log('ALTER TABLE posts ADD COLUMN IF NOT EXISTS feed_position INTEGER;');
      console.log('CREATE INDEX IF NOT EXISTS idx_posts_feed_position ON posts(feed_position);');
      console.log('```\n');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n⚠️  Please run the following SQL manually in Supabase dashboard:');
    console.log('(Go to: https://app.supabase.com/project/nwgiuekwcwlhzmexkvyx/sql)\n');
    console.log('```sql');
    console.log('ALTER TABLE posts ADD COLUMN IF NOT EXISTS feed_position INTEGER;');
    console.log('CREATE INDEX IF NOT EXISTS idx_posts_feed_position ON posts(feed_position);');
    console.log('COMMENT ON COLUMN posts.feed_position IS \'Position of the post in the feed (0-indexed). Used for custom feed ordering\';');
    console.log('```\n');
    process.exit(1);
  }
}

runMigration();
