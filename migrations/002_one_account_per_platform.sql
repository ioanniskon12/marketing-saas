-- =====================================================
-- Migration: Enforce One Account Per Platform Per Workspace
-- =====================================================

-- Drop the existing constraint that allowed multiple accounts per platform
ALTER TABLE social_accounts
DROP CONSTRAINT IF EXISTS social_accounts_workspace_id_platform_platform_user_id_key;

-- Add new constraint: one account per platform per workspace
ALTER TABLE social_accounts
ADD CONSTRAINT social_accounts_workspace_platform_unique
UNIQUE (workspace_id, platform);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT social_accounts_workspace_platform_unique ON social_accounts IS
'Ensures each workspace can only have one account per platform (e.g., one Instagram account, one Facebook account)';
