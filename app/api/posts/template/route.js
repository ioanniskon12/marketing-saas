/**
 * Post Template API Route
 *
 * Download Excel template for bulk post import.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateTemplate } from '@/lib/excel/parser';
import * as XLSX from 'xlsx';

/**
 * GET /api/posts/template
 * Download Excel template for bulk import
 */
export async function GET(request) {
  try {
    const supabase = await createClient();

    // Get current user (optional - template doesn't require auth but good to track)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate template workbook
    const workbook = generateTemplate();

    // Convert to buffer
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    // Return as file download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="posts-import-template.xlsx"',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
