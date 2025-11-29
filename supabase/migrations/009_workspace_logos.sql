/**
 * Workspace Logos Migration
 *
 * Adds logo_size column and creates storage bucket for workspace logos
 */

-- Add logo_size column to workspaces table
ALTER TABLE workspaces
ADD COLUMN IF NOT EXISTS logo_size VARCHAR(20) DEFAULT 'medium' CHECK (logo_size IN ('small', 'medium', 'large'));

-- Create storage bucket for workspace logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-logos', 'workspace-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for workspace-logos bucket
CREATE POLICY "Workspace admins can upload logos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'workspace-logos'
    AND auth.uid() IN (
      SELECT user_id
      FROM workspace_members
      WHERE workspace_id::text = (storage.foldername(name))[1]
      AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Workspace logos are publicly viewable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'workspace-logos');

CREATE POLICY "Workspace admins can update logos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'workspace-logos'
    AND auth.uid() IN (
      SELECT user_id
      FROM workspace_members
      WHERE workspace_id::text = (storage.foldername(name))[1]
      AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Workspace admins can delete logos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'workspace-logos'
    AND auth.uid() IN (
      SELECT user_id
      FROM workspace_members
      WHERE workspace_id::text = (storage.foldername(name))[1]
      AND role IN ('owner', 'admin', 'editor')
    )
  );
