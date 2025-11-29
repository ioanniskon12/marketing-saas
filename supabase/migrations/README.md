# Database Migrations

This directory contains all SQL migrations for the Social Media SaaS application.

## Running Migrations

These migrations must be run in order using the Supabase SQL Editor.

### Steps:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the sidebar
3. Run each migration file in order (001, 002, 003, etc.)
4. Copy the entire contents of each file and execute it

### Migration Order:

1. **001_initial_schema.sql** - Core tables (workspaces, workspace_members, user_profiles)
2. **002_storage_setup.sql** - Storage buckets and helper functions
3. **003_social_accounts.sql** - Social media account connections
4. **004_posts.sql** - Posts and post media tables
5. **005_analytics.sql** - Analytics tracking tables
6. **006_advanced_features.sql** - Advanced features (drafts, AI, tags, etc.)
7. **007_email_notifications.sql** - Email notification system
8. **008_calendar_sharing.sql** - Calendar sharing features

## After Running Migrations

Once all migrations are complete, you need to create an initial workspace:

```sql
-- Get your user ID from auth.users
SELECT id, email FROM auth.users;

-- Create a workspace (replace the user_id with your ID)
INSERT INTO workspaces (name, slug, owner_id)
VALUES ('My Workspace', 'my-workspace', 'YOUR_USER_ID_HERE');
```

The workspace owner will automatically be added as a member with the 'owner' role.

## Verifying Migrations

Check that all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- analytics_snapshots
- calendar_share_analytics
- calendar_share_comments
- calendar_shares
- email_logs
- oauth_states
- post_analytics
- post_media
- post_tags
- posts
- social_accounts
- tag_categories
- tags
- user_profiles
- workspace_members
- workspaces

## Troubleshooting

### Error: "relation already exists"
If you see this error, the table already exists. You can skip that migration or drop the table first:
```sql
DROP TABLE IF EXISTS table_name CASCADE;
```

### Error: "permission denied"
Make sure you're running the migrations as the database owner or have sufficient privileges.

### Error: "column does not exist"
This usually means migrations were run out of order. Drop all tables and start from 001 again.

## Local Development

For local development with Supabase CLI:

```bash
# Reset database
supabase db reset

# Apply migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > types/database.types.ts
```
