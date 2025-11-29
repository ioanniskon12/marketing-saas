/**
 * Post Import API Route
 *
 * Import posts from Excel file with validation.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';
import { parseExcelFile } from '@/lib/excel/parser';
import {
  validatePosts,
  transformPostForDb,
  findDuplicates,
  generateValidationReport,
} from '@/lib/excel/validator';

/**
 * POST /api/posts/import
 * Import posts from Excel file
 *
 * Supports two modes:
 * 1. validate: Parse and validate file, return errors/warnings
 * 2. import: Actually create the posts in database
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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    const workspaceId = formData.get('workspace_id');
    const mode = formData.get('mode') || 'validate'; // 'validate' or 'import'

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(
      supabase,
      user.id,
      workspaceId,
      'posts:create'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel file
    const parseResult = parseExcelFile(buffer);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error },
        { status: 400 }
      );
    }

    const { posts, totalRows } = parseResult;

    if (posts.length === 0) {
      return NextResponse.json(
        { error: 'No valid posts found in file' },
        { status: 400 }
      );
    }

    // Get connected social accounts for this workspace
    const { data: socialAccounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('id, platform')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true);

    if (accountsError) throw accountsError;

    const connectedPlatforms = socialAccounts.map(a => a.platform);
    const accountIdsByPlatform = {};
    socialAccounts.forEach(account => {
      accountIdsByPlatform[account.platform] = account.id;
    });

    // Validate posts
    const validationResult = validatePosts(posts, connectedPlatforms);

    // Check for duplicates
    const duplicates = findDuplicates(posts);

    // Generate validation report
    const report = generateValidationReport(validationResult);

    // If mode is 'validate', return validation results
    if (mode === 'validate') {
      return NextResponse.json({
        success: true,
        mode: 'validate',
        validation: {
          ...report,
          duplicates: duplicates.length > 0 ? duplicates : undefined,
        },
      });
    }

    // If mode is 'import', proceed with creating posts
    if (mode === 'import') {
      // Only import valid posts
      const { validPosts } = validationResult;

      if (validPosts.length === 0) {
        return NextResponse.json(
          { error: 'No valid posts to import' },
          { status: 400 }
        );
      }

      const importResults = [];
      const errors = [];

      // Import posts one by one
      for (const post of validPosts) {
        try {
          // Transform post to database format
          const postData = transformPostForDb(
            post,
            workspaceId,
            user.id,
            accountIdsByPlatform
          );

          // Insert post
          const { data: createdPost, error: postError } = await supabase
            .from('posts')
            .insert({
              workspace_id: postData.workspace_id,
              created_by: postData.created_by,
              content: postData.content,
              platforms: postData.platforms,
              scheduled_for: postData.scheduled_for,
              status: postData.status,
            })
            .select()
            .single();

          if (postError) throw postError;

          // Insert media if any
          if (postData.media && postData.media.length > 0) {
            const mediaInserts = postData.media.map(media => ({
              post_id: createdPost.id,
              workspace_id: workspaceId,
              file_url: media.file_url,
              file_type: media.file_type,
              file_size: media.file_size,
              order_index: media.order_index,
            }));

            const { error: mediaError } = await supabase
              .from('post_media')
              .insert(mediaInserts);

            if (mediaError) {
              console.error('Error inserting media:', mediaError);
              // Continue anyway, post was created
            }
          }

          importResults.push({
            rowNumber: post._rowNumber,
            postId: createdPost.id,
            status: 'success',
          });
        } catch (error) {
          console.error(`Error importing post from row ${post._rowNumber}:`, error);
          errors.push({
            rowNumber: post._rowNumber,
            error: error.message || 'Failed to import post',
          });
        }
      }

      return NextResponse.json({
        success: true,
        mode: 'import',
        summary: {
          total: posts.length,
          imported: importResults.length,
          failed: errors.length,
          skipped: posts.length - validPosts.length,
        },
        results: importResults,
        errors: errors.length > 0 ? errors : undefined,
        validation: {
          ...report,
          duplicates: duplicates.length > 0 ? duplicates : undefined,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid mode' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error importing posts:', error);
    return NextResponse.json(
      { error: 'Failed to import posts' },
      { status: 500 }
    );
  }
}
