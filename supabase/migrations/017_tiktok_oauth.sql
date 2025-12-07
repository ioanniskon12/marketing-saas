/**
 * TikTok OAuth Support Migration
 *
 * Adds code_verifier column for PKCE support (required by TikTok OAuth)
 * Run this in Supabase SQL Editor.
 */

-- Add code_verifier column for PKCE (TikTok and other platforms that require it)
ALTER TABLE oauth_states
ADD COLUMN IF NOT EXISTS code_verifier TEXT;

-- Add youtube to the platform check if not already present
-- First drop the old constraint if it exists
ALTER TABLE social_accounts
DROP CONSTRAINT IF EXISTS social_accounts_platform_check;

-- Add new constraint with all platforms including youtube
ALTER TABLE social_accounts
ADD CONSTRAINT social_accounts_platform_check
CHECK (platform IN ('instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'youtube'));

-- Add refresh_token_expires_at column if not exists (used by TikTok)
ALTER TABLE social_accounts
ADD COLUMN IF NOT EXISTS refresh_token_expires_at TIMESTAMPTZ;

-- Add platform_username column if not exists
ALTER TABLE social_accounts
ADD COLUMN IF NOT EXISTS platform_username VARCHAR(255);
