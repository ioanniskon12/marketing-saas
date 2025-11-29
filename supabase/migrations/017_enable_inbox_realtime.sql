-- Enable Supabase Realtime for inbox tables
-- This allows clients to subscribe to real-time updates

-- Add inbox tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE inbox_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE inbox_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE inbox_contacts;
