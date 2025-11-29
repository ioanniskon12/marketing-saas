-- =====================================================
-- Auto-Schedule Approved Plan Posts to Calendar
-- When a plan_post is approved, automatically create
-- a scheduled post in the calendar
-- =====================================================

-- Function to create a scheduled post from an approved plan post
CREATE OR REPLACE FUNCTION create_scheduled_post_from_plan()
RETURNS TRIGGER AS $$
DECLARE
  media_url TEXT;
  media_index INTEGER := 0;
  new_post_id UUID;
BEGIN
  -- Only proceed if the post was just approved (status changed to 'approved')
  IF NEW.approval_status = 'approved' AND (OLD.approval_status IS NULL OR OLD.approval_status != 'approved') THEN

    -- Create the scheduled post
    INSERT INTO posts (
      workspace_id,
      created_by,
      content,
      scheduled_for,
      status,
      platforms,
      platform_posts
    ) VALUES (
      NEW.workspace_id,
      COALESCE(NEW.approved_by, (SELECT created_by FROM content_plans WHERE id = NEW.plan_id)), -- Use the person who approved it, or fallback to plan creator
      NEW.caption,
      -- Combine scheduled date and time if available, otherwise set to null for manual scheduling
      CASE
        WHEN NEW.scheduled_date IS NOT NULL THEN
          CASE
            WHEN NEW.scheduled_time IS NOT NULL THEN
              (NEW.scheduled_date::TEXT || ' ' || NEW.scheduled_time::TEXT)::TIMESTAMPTZ
            ELSE
              NEW.scheduled_date::TIMESTAMPTZ
          END
        ELSE
          NULL
      END,
      CASE
        WHEN NEW.scheduled_date IS NOT NULL THEN 'scheduled'
        ELSE 'draft'
      END,
      to_jsonb(NEW.platforms), -- Convert platform array to JSONB
      COALESCE(NEW.platform_data, '{}'::jsonb) -- Use platform_data if available
    )
    RETURNING id INTO new_post_id; -- Store the created post ID for media linking

    -- Create post_media entries for each media URL
    IF NEW.media_urls IS NOT NULL AND array_length(NEW.media_urls, 1) > 0 THEN
      FOR media_url IN SELECT unnest(NEW.media_urls) LOOP
        INSERT INTO post_media (
          post_id,
          workspace_id,
          media_type,
          file_url,
          thumbnail_url,
          display_order
        ) VALUES (
          new_post_id,
          NEW.workspace_id,
          CASE
            WHEN media_url LIKE '%.mp4' OR media_url LIKE '%.mov' OR media_url LIKE '%.avi' THEN 'video'
            ELSE 'image'
          END,
          media_url,
          NEW.video_thumbnail_url, -- Use video thumbnail if available
          media_index
        );
        media_index := media_index + 1;
      END LOOP;
    END IF;

    -- Log the auto-scheduling activity
    INSERT INTO plan_activity_log (
      plan_id,
      plan_post_id,
      action,
      actor_name,
      actor_email,
      actor_user_id,
      metadata
    ) VALUES (
      NEW.plan_id,
      NEW.id,
      'auto_scheduled',
      'System',
      NULL,
      NEW.approved_by,
      jsonb_build_object(
        'scheduled_for', NEW.scheduled_date,
        'scheduled_time', NEW.scheduled_time,
        'platforms', NEW.platforms,
        'created_post_id', new_post_id
      )
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires after a plan_post is updated
CREATE TRIGGER auto_schedule_approved_plan_post
  AFTER UPDATE OF approval_status ON plan_posts
  FOR EACH ROW
  WHEN (NEW.approval_status = 'approved')
  EXECUTE FUNCTION create_scheduled_post_from_plan();

-- =====================================================
-- Add comment to explain the trigger
-- =====================================================

COMMENT ON FUNCTION create_scheduled_post_from_plan() IS
'Automatically creates a scheduled post in the calendar when a plan post is approved by a client or team member. The post will be created with the same content, media, platforms, and scheduling information from the approved plan post.';

COMMENT ON TRIGGER auto_schedule_approved_plan_post ON plan_posts IS
'Triggers automatic creation of calendar posts when plan posts are approved, enabling seamless workflow from client approval to content scheduling.';
