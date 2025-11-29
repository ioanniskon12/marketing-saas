-- Media Library Enhancement
-- Make post_id nullable in post_media table to support library-only uploads
-- Add file_name column to store original filename

ALTER TABLE post_media
ALTER COLUMN post_id DROP NOT NULL;

-- Add file_name column
ALTER TABLE post_media
ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Add comments
COMMENT ON COLUMN post_media.post_id IS 'Post ID - nullable for library-only media that hasn''t been added to a post yet';
COMMENT ON COLUMN post_media.file_name IS 'Original filename of the uploaded media file';
