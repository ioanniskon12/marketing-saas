/**
 * Add YouTube Platform Support
 *
 * Run this in Supabase SQL Editor to add 'youtube' to the platform constraint
 */

-- Drop the existing constraint
ALTER TABLE social_accounts
DROP CONSTRAINT IF EXISTS social_accounts_platform_check;

-- Add new constraint with all 6 platforms including YouTube
ALTER TABLE social_accounts
ADD CONSTRAINT social_accounts_platform_check
CHECK (platform IN ('instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'youtube'));
