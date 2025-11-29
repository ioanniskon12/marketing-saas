/**
 * Notification Preferences API
 *
 * Manage email notification preferences for users
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/notifications
 * Get notification preferences for a workspace
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get notification preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .eq('workspace_id', workspaceId)
      .single();

    if (preferencesError && preferencesError.code !== 'PGRST116') {
      throw preferencesError;
    }

    // If no preferences found, return defaults
    if (!preferences) {
      return NextResponse.json({
        preferences: {
          email_welcome: true,
          email_digest_daily: true,
          email_digest_weekly: true,
          email_post_published: true,
          email_post_failed: true,
          email_analytics_summary: true,
          email_new_mention: true,
          email_approval_request: true,
          email_approval_decision: true,
          email_competitor_alert: false,
          digest_frequency: 'weekly',
          digest_day: 1,
          digest_time: '09:00:00',
          alert_engagement_drop: true,
          engagement_drop_threshold: 20,
          alert_mention_sentiment: true,
          mention_sentiment_threshold: 'negative',
        },
      });
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create or update notification preferences
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { workspace_id, preferences } = body;

    if (!workspace_id) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'preferences object is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has access to workspace
    const { data: workspaceUser, error: workspaceError } = await supabase
      .from('workspace_users')
      .select('*')
      .eq('workspace_id', workspace_id)
      .eq('user_id', user.id)
      .single();

    if (workspaceError || !workspaceUser) {
      return NextResponse.json(
        { error: 'Access denied to workspace' },
        { status: 403 }
      );
    }

    // Prepare update data (only include valid fields)
    const validFields = [
      'email_welcome',
      'email_digest_daily',
      'email_digest_weekly',
      'email_post_published',
      'email_post_failed',
      'email_analytics_summary',
      'email_new_mention',
      'email_approval_request',
      'email_approval_decision',
      'email_competitor_alert',
      'digest_frequency',
      'digest_day',
      'digest_time',
      'alert_engagement_drop',
      'engagement_drop_threshold',
      'alert_mention_sentiment',
      'mention_sentiment_threshold',
    ];

    const updateData = {};
    validFields.forEach(field => {
      if (preferences[field] !== undefined) {
        updateData[field] = preferences[field];
      }
    });

    // Upsert preferences
    const { data: updatedPreferences, error: updateError } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        workspace_id,
        ...updateData,
      }, {
        onConflict: 'user_id,workspace_id',
      })
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      message: 'Notification preferences updated successfully',
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Update specific notification preference fields
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { workspace_id, updates } = body;

    if (!workspace_id) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'updates object is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get existing preferences
    const { data: existingPreferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .eq('workspace_id', workspace_id)
      .single();

    if (!existingPreferences) {
      return NextResponse.json(
        { error: 'Notification preferences not found' },
        { status: 404 }
      );
    }

    // Update preferences
    const { data: updatedPreferences, error: updateError } = await supabase
      .from('notification_preferences')
      .update(updates)
      .eq('user_id', user.id)
      .eq('workspace_id', workspace_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      message: 'Notification preferences updated successfully',
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Reset notification preferences to defaults
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete preferences (will be recreated with defaults)
    const { error: deleteError } = await supabase
      .from('notification_preferences')
      .delete()
      .eq('user_id', user.id)
      .eq('workspace_id', workspaceId);

    if (deleteError) throw deleteError;

    // Recreate with defaults
    const { data: newPreferences, error: createError } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: user.id,
        workspace_id: workspaceId,
      })
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({
      message: 'Notification preferences reset to defaults',
      preferences: newPreferences,
    });
  } catch (error) {
    console.error('Error resetting notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to reset notification preferences' },
      { status: 500 }
    );
  }
}
