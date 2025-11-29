-- Add feed_position column to posts table for feed ordering
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS feed_position INTEGER;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_feed_position ON posts(feed_position);

-- Add comment to explain the column
COMMENT ON COLUMN posts.feed_position IS 'Position of the post in the feed (0-indexed). Used for custom feed ordering';
