/**
 * Link Social Accounts Migration
 *
 * Adds the ability to link Instagram accounts to their parent Facebook accounts
 * since Instagram API requires Facebook/Meta credentials.
 */

-- Add parent_account_id field to link Instagram to Facebook
ALTER TABLE social_accounts
ADD COLUMN parent_account_id UUID REFERENCES social_accounts(id) ON DELETE SET NULL;

-- Add index for parent_account_id lookups
CREATE INDEX IF NOT EXISTS idx_social_accounts_parent ON social_accounts(parent_account_id);

-- Comment
COMMENT ON COLUMN social_accounts.parent_account_id IS 'Links Instagram accounts to their parent Facebook account (Meta credentials)';
