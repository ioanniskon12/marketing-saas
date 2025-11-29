/**
 * Add hashtags column to posts table
 *
 * This migration adds support for storing hashtags with posts
 */

-- Add hashtags column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}';

-- Create index for hashtags for faster searching
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN (hashtags);
