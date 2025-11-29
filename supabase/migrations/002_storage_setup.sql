/**
 * Storage Setup Migration
 *
 * Creates storage buckets for media files and sets up access policies.
 */

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for media bucket
CREATE POLICY "Workspace members can upload media"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND auth.uid() IN (
      SELECT user_id
      FROM workspace_members
      WHERE workspace_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Workspace members can view media"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'media'
    AND (
      auth.uid() IN (
        SELECT user_id
        FROM workspace_members
        WHERE workspace_id::text = (storage.foldername(name))[1]
      )
      OR storage.objects.is_public = true
    )
  );

CREATE POLICY "Workspace members can update media"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'media'
    AND auth.uid() IN (
      SELECT user_id
      FROM workspace_members
      WHERE workspace_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Workspace members can delete media"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'media'
    AND auth.uid() IN (
      SELECT wm.user_id
      FROM workspace_members wm
      WHERE wm.workspace_id::text = (storage.foldername(name))[1]
      AND wm.role IN ('owner', 'admin', 'editor')
    )
  );

-- Storage policies for avatars bucket
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatars are publicly viewable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Helper function to check workspace membership
CREATE OR REPLACE FUNCTION is_workspace_member(workspace_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM workspace_members
    WHERE workspace_id = workspace_uuid
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's workspace role
CREATE OR REPLACE FUNCTION get_workspace_role(workspace_uuid UUID)
RETURNS VARCHAR AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role
  FROM workspace_members
  WHERE workspace_id = workspace_uuid
  AND user_id = auth.uid();

  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has permission in workspace
CREATE OR REPLACE FUNCTION has_workspace_permission(
  workspace_uuid UUID,
  required_roles VARCHAR[]
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM workspace_members
    WHERE workspace_id = workspace_uuid
    AND user_id = auth.uid()
    AND role = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
