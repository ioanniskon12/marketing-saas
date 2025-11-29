/**
 * Platform-Specific Metadata Migration
 *
 * Adds a JSONB column to store platform-specific post data that doesn't
 * fit in the standard post schema (e.g., Instagram Reel cover frames,
 * YouTube thumbnails, Twitter threads, etc.)
 */

-- Add platform_metadata column to posts table
ALTER TABLE posts
ADD COLUMN platform_metadata JSONB DEFAULT '{}'::jsonb;

-- Create GIN index for efficient JSON querying
CREATE INDEX IF NOT EXISTS idx_posts_platform_metadata
ON posts USING GIN (platform_metadata);

-- Add comment explaining the column
COMMENT ON COLUMN posts.platform_metadata IS 'Platform-specific metadata stored as JSON. Examples: Instagram Reel cover frames, YouTube thumbnails, Twitter threads, Facebook link previews, etc.';

/**
 * Example platform_metadata structures:
 *
 * INSTAGRAM:
 * {
 *   "instagram": {
 *     "post_type": "reel",
 *     "cover_frame_url": "https://...",
 *     "cover_frame_time": 5.2,
 *     "first_comment": "Check out my latest reel!",
 *     "tagged_users": ["@user1", "@user2"],
 *     "filter": "clarendon",
 *     "location": "New York, NY"
 *   }
 * }
 *
 * FACEBOOK:
 * {
 *   "facebook": {
 *     "post_type": "feed",
 *     "link_preview": {
 *       "url": "https://example.com",
 *       "title": "Article Title",
 *       "description": "Article description...",
 *       "thumbnail_url": "https://..."
 *     }
 *   }
 * }
 *
 * YOUTUBE:
 * {
 *   "youtube": {
 *     "title": "My Amazing Video",
 *     "description": "Full video description...",
 *     "thumbnail_url": "https://...",
 *     "category": "gaming",
 *     "tags": ["gaming", "tutorial", "guide"],
 *     "visibility": "public",
 *     "playlist_id": "PLxxx..."
 *   }
 * }
 *
 * TWITTER:
 * {
 *   "twitter": {
 *     "is_thread": true,
 *     "thread": [
 *       {
 *         "content": "Tweet 1 content...",
 *         "media_ids": [1, 2]
 *       },
 *       {
 *         "content": "Tweet 2 content...",
 *         "media_ids": [3]
 *       }
 *     ]
 *   }
 * }
 *
 * TIKTOK:
 * {
 *   "tiktok": {
 *     "cover_frame_url": "https://...",
 *     "cover_frame_time": 2.5,
 *     "music_id": "12345",
 *     "effects": ["effect1", "effect2"]
 *   }
 * }
 *
 * LINKEDIN:
 * {
 *   "linkedin": {
 *     "article_url": "https://...",
 *     "link_preview": {
 *       "title": "...",
 *       "description": "...",
 *       "image_url": "..."
 *     }
 *   }
 * }
 */
