/**
 * Workspaces API Routes
 *
 * CRUD operations for workspaces.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/workspaces
 * Get all workspaces for the current user
 */
export async function GET(request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's workspaces
    const { data: workspaces, error } = await supabase
      .from('workspace_members')
      .select(`
        workspace_id,
        role,
        created_at,
        workspaces (
          id,
          name,
          slug,
          logo_url,
          logo_size,
          owner_id,
          subscription_plan,
          subscription_status,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format response
    const formattedWorkspaces = workspaces.map(item => ({
      id: item.workspaces.id,
      name: item.workspaces.name,
      slug: item.workspaces.slug,
      logo_url: item.workspaces.logo_url,
      logo_size: item.workspaces.logo_size,
      ownerId: item.workspaces.owner_id,
      subscriptionPlan: item.workspaces.subscription_plan,
      subscriptionStatus: item.workspaces.subscription_status,
      role: item.role,
      createdAt: item.workspaces.created_at,
      memberSince: item.created_at,
    }));

    return NextResponse.json({
      workspaces: formattedWorkspaces,
      count: formattedWorkspaces.length,
    });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces
 * Create a new workspace
 */
export async function POST(request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, slug } = body;

    // Validate input
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Validate slug format (lowercase, alphanumeric, hyphens only)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const { data: existingWorkspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingWorkspace) {
      return NextResponse.json(
        { error: 'Workspace slug already exists' },
        { status: 409 }
      );
    }

    // Create workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name,
        slug,
        owner_id: user.id,
        subscription_plan: 'free',
        subscription_status: 'active',
      })
      .select()
      .single();

    if (workspaceError) throw workspaceError;

    // Add owner as workspace member (this is handled by trigger in database)
    // But we'll verify it was created
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspace.id)
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        ownerId: workspace.owner_id,
        subscriptionPlan: workspace.subscription_plan,
        subscriptionStatus: workspace.subscription_status,
        role: membership?.role || 'owner',
        createdAt: workspace.created_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}
