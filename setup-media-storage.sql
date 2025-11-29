-- Supabase Media Storage Setup Script
-- Run this in your Supabase SQL Editor

-- 1. Create the media bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true, -- Make public for easier serving
  104857600, -- 100MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for Media Bucket

-- Policy: Allow authenticated users to view their workspace media
CREATE POLICY "Users can view their workspace media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'media'
  AND auth.uid() IN (
    SELECT wm.user_id
    FROM workspace_members wm
    WHERE wm.workspace_id::text = (storage.foldername(name))[1]
  )
);

-- Policy: Allow authenticated users to upload to their workspace
CREATE POLICY "Users can upload to their workspace"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media'
  AND auth.uid() IN (
    SELECT wm.user_id
    FROM workspace_members wm
    WHERE wm.workspace_id::text = (storage.foldername(name))[1]
  )
);

-- Policy: Allow authenticated users to update their workspace media
CREATE POLICY "Users can update their workspace media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media'
  AND auth.uid() IN (
    SELECT wm.user_id
    FROM workspace_members wm
    WHERE wm.workspace_id::text = (storage.foldername(name))[1]
  )
);

-- Policy: Allow authenticated users to delete their workspace media
CREATE POLICY "Users can delete their workspace media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media'
  AND auth.uid() IN (
    SELECT wm.user_id
    FROM workspace_members wm
    WHERE wm.workspace_id::text = (storage.foldername(name))[1]
  )
);

-- 3. Optional: Create media_library tracking table
-- (Only if you want to store additional metadata in the database)

CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  duration FLOAT,
  thumbnail_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_library_workspace ON media_library(workspace_id);
CREATE INDEX IF NOT EXISTS idx_media_library_created ON media_library(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_library_mime ON media_library(mime_type);

-- RLS Policies for media_library table
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their workspace media records
CREATE POLICY "Users can view their workspace media records"
ON media_library FOR SELECT
USING (
  workspace_id IN (
    SELECT wm.workspace_id
    FROM workspace_members wm
    WHERE wm.user_id = auth.uid()
  )
);

-- Policy: Users can insert media records for their workspace
CREATE POLICY "Users can insert media records for their workspace"
ON media_library FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT wm.workspace_id
    FROM workspace_members wm
    WHERE wm.user_id = auth.uid()
  )
);

-- Policy: Users can update their workspace media records
CREATE POLICY "Users can update their workspace media records"
ON media_library FOR UPDATE
USING (
  workspace_id IN (
    SELECT wm.workspace_id
    FROM workspace_members wm
    WHERE wm.user_id = auth.uid()
  )
);

-- Policy: Users can delete their workspace media records
CREATE POLICY "Users can delete their workspace media records"
ON media_library FOR DELETE
USING (
  workspace_id IN (
    SELECT wm.workspace_id
    FROM workspace_members wm
    WHERE wm.user_id = auth.uid()
  )
);

-- 4. Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for media_library
DROP TRIGGER IF EXISTS update_media_library_updated_at ON media_library;
CREATE TRIGGER update_media_library_updated_at
  BEFORE UPDATE ON media_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Media storage setup complete!';
  RAISE NOTICE 'Bucket "media" created with public access';
  RAISE NOTICE 'Storage policies configured for workspace isolation';
  RAISE NOTICE 'media_library table created (optional tracking)';
END $$;
