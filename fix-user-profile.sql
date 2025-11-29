-- Complete fix for user profile and workspace setup
-- Run this entire script in Supabase SQL Editor

-- Step 1: Create user profile
INSERT INTO user_profiles (id, full_name, email_notifications)
SELECT id, 'Giannis', true
FROM auth.users
WHERE email = 'gianniskon12@gmail.com'
ON CONFLICT (id) DO UPDATE
SET full_name = 'Giannis',
    email_notifications = true;

-- Step 2: Ensure workspace exists and is properly set up
INSERT INTO workspaces (id, name, slug, owner_id)
SELECT
  COALESCE(
    (SELECT id FROM workspaces WHERE owner_id = (SELECT id FROM auth.users WHERE email = 'gianniskon12@gmail.com') LIMIT 1),
    gen_random_uuid()
  ),
  'My Workspace',
  'my-workspace-' || substring(md5(random()::text) from 1 for 8),
  (SELECT id FROM auth.users WHERE email = 'gianniskon12@gmail.com')
WHERE NOT EXISTS (
  SELECT 1 FROM workspaces WHERE owner_id = (SELECT id FROM auth.users WHERE email = 'gianniskon12@gmail.com')
);

-- Step 3: Ensure workspace member entry exists
INSERT INTO workspace_members (workspace_id, user_id, role, invitation_accepted_at)
SELECT
  w.id,
  u.id,
  'owner',
  now()
FROM auth.users u
CROSS JOIN workspaces w
WHERE u.email = 'gianniskon12@gmail.com'
  AND w.owner_id = u.id
ON CONFLICT (workspace_id, user_id) DO UPDATE
SET role = 'owner',
    invitation_accepted_at = COALESCE(workspace_members.invitation_accepted_at, now());

-- Step 4: Verify the setup
SELECT
  'User Profile' as table_name,
  up.id,
  up.full_name,
  u.email
FROM user_profiles up
JOIN auth.users u ON u.id = up.id
WHERE u.email = 'gianniskon12@gmail.com'

UNION ALL

SELECT
  'Workspace' as table_name,
  w.id,
  w.name,
  u.email as owner_email
FROM workspaces w
JOIN auth.users u ON u.id = w.owner_id
WHERE u.email = 'gianniskon12@gmail.com'

UNION ALL

SELECT
  'Workspace Member' as table_name,
  wm.id,
  wm.role,
  u.email
FROM workspace_members wm
JOIN auth.users u ON u.id = wm.user_id
WHERE u.email = 'gianniskon12@gmail.com';
