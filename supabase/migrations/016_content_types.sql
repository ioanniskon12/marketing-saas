/**
 * Content Types Migration
 *
 * Adds content_type field to posts table to support different content formats
 * (feed, story, reel, video, short) for each platform.
 */

-- Add content_type column to posts
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) DEFAULT 'feed';

-- Add check constraint for valid content types
ALTER TABLE posts
ADD CONSTRAINT posts_content_type_check
CHECK (content_type IN ('feed', 'story', 'reel', 'post', 'video', 'short'));

-- Create index for content_type
CREATE INDEX IF NOT EXISTS idx_posts_content_type ON posts(content_type);

-- Update existing posts to have appropriate content type
-- Feed posts for Instagram, Post for others
UPDATE posts
SET content_type = CASE
  WHEN platforms::text LIKE '%instagram%' THEN 'feed'
  WHEN platforms::text LIKE '%youtube%' THEN 'video'
  WHEN platforms::text LIKE '%tiktok%' THEN 'video'
  ELSE 'post'
END
WHERE content_type IS NULL OR content_type = '';
