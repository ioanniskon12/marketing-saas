/**
 * Admin API - Run Database Migration
 *
 * This endpoint runs the inbox tables migration.
 * Should only be used by admins.
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Read and execute migration SQL
    const migrationSQL = `
      -- Inbox Tables for DM/Messaging functionality

      -- Table: inbox_contacts
      CREATE TABLE IF NOT EXISTS inbox_contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        platform VARCHAR(50) NOT NULL,
        external_id VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        username VARCHAR(255),
        profile_picture_url TEXT,
        email VARCHAR(255),
        phone VARCHAR(50),
        locale VARCHAR(10),
        metadata JSONB DEFAULT '{}',
        tags TEXT[] DEFAULT '{}',
        first_message_at TIMESTAMPTZ,
        last_message_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(workspace_id, platform, external_id)
      );

      -- Table: inbox_threads
      CREATE TABLE IF NOT EXISTS inbox_threads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        social_account_id UUID REFERENCES social_accounts(id) ON DELETE SET NULL,
        contact_id UUID NOT NULL REFERENCES inbox_contacts(id) ON DELETE CASCADE,
        platform VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
        last_message TEXT,
        last_message_at TIMESTAMPTZ,
        last_message_type VARCHAR(50) DEFAULT 'text',
        unread_count INTEGER DEFAULT 0,
        is_automated BOOLEAN DEFAULT FALSE,
        tags TEXT[] DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Table: inbox_messages
      CREATE TABLE IF NOT EXISTS inbox_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        thread_id UUID NOT NULL REFERENCES inbox_threads(id) ON DELETE CASCADE,
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        contact_id UUID NOT NULL REFERENCES inbox_contacts(id) ON DELETE CASCADE,
        direction VARCHAR(10) NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        content TEXT,
        external_message_id VARCHAR(255),
        attachments JSONB DEFAULT '[]',
        metadata JSONB DEFAULT '{}',
        sent_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
        is_read BOOLEAN DEFAULT FALSE,
        delivered_at TIMESTAMPTZ,
        read_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_inbox_contacts_workspace ON inbox_contacts(workspace_id);
      CREATE INDEX IF NOT EXISTS idx_inbox_contacts_platform ON inbox_contacts(workspace_id, platform);
      CREATE INDEX IF NOT EXISTS idx_inbox_contacts_external ON inbox_contacts(platform, external_id);
      CREATE INDEX IF NOT EXISTS idx_inbox_threads_workspace ON inbox_threads(workspace_id);
      CREATE INDEX IF NOT EXISTS idx_inbox_threads_contact ON inbox_threads(contact_id);
      CREATE INDEX IF NOT EXISTS idx_inbox_threads_status ON inbox_threads(workspace_id, status);
      CREATE INDEX IF NOT EXISTS idx_inbox_threads_platform ON inbox_threads(workspace_id, platform);
      CREATE INDEX IF NOT EXISTS idx_inbox_threads_assigned ON inbox_threads(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_inbox_threads_last_message ON inbox_threads(workspace_id, last_message_at DESC);
      CREATE INDEX IF NOT EXISTS idx_inbox_messages_thread ON inbox_messages(thread_id);
      CREATE INDEX IF NOT EXISTS idx_inbox_messages_workspace ON inbox_messages(workspace_id);
      CREATE INDEX IF NOT EXISTS idx_inbox_messages_contact ON inbox_messages(contact_id);
      CREATE INDEX IF NOT EXISTS idx_inbox_messages_created ON inbox_messages(thread_id, created_at DESC);
    `;

    // Execute migration
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // If rpc doesn't exist, try direct query approach
      // Note: This requires the SQL to be run in Supabase dashboard
      console.error('Migration error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        note: 'Please run the migration SQL directly in Supabase SQL Editor'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Inbox tables created successfully'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
