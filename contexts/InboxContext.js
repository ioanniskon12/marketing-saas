/**
 * Inbox Context
 *
 * Provides inbox state (unread count, notifications) across the app.
 */

'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from './WorkspaceContext';
import { showToast } from '@/components/ui/Toast';

const InboxContext = createContext(null);

export function InboxProvider({ children }) {
  const { currentWorkspace } = useWorkspace();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const supabaseRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  // Initialize Supabase client
  useEffect(() => {
    supabaseRef.current = createClient();
  }, []);

  // Fetch initial unread count
  useEffect(() => {
    if (!currentWorkspace) return;
    fetchUnreadCount();
  }, [currentWorkspace]);

  // Setup realtime subscription for new messages
  useEffect(() => {
    if (!currentWorkspace || !supabaseRef.current) return;

    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`inbox-notifications-${currentWorkspace.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inbox_messages',
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        async (payload) => {
          const newMessage = payload.new;

          // Only notify for incoming messages
          if (newMessage.direction === 'in') {
            // Avoid duplicate notifications
            if (lastMessageIdRef.current === newMessage.id) return;
            lastMessageIdRef.current = newMessage.id;

            // Fetch contact name for the notification
            const { data: thread } = await supabase
              .from('inbox_threads')
              .select('contact:inbox_contacts(name)')
              .eq('id', newMessage.thread_id)
              .single();

            const contactName = thread?.contact?.name || 'Someone';
            const messagePreview = newMessage.content?.substring(0, 50) || 'New message';

            // Show toast notification
            showToast.info(`${contactName}: ${messagePreview}`);

            // Add to notifications list
            setNotifications(prev => [{
              id: newMessage.id,
              type: 'message',
              title: contactName,
              message: messagePreview,
              threadId: newMessage.thread_id,
              createdAt: new Date().toISOString(),
              read: false,
            }, ...prev].slice(0, 20)); // Keep last 20

            // Update unread count
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspace]);

  const fetchUnreadCount = async () => {
    if (!currentWorkspace || !supabaseRef.current) return;

    try {
      const { data, error } = await supabaseRef.current
        .from('inbox_threads')
        .select('unread_count')
        .eq('workspace_id', currentWorkspace.id);

      if (!error && data) {
        const total = data.reduce((sum, thread) => sum + (thread.unread_count || 0), 0);
        setUnreadCount(total);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const refreshUnreadCount = () => {
    fetchUnreadCount();
  };

  return (
    <InboxContext.Provider value={{
      unreadCount,
      notifications,
      markNotificationAsRead,
      clearNotifications,
      refreshUnreadCount,
    }}>
      {children}
    </InboxContext.Provider>
  );
}

export function useInbox() {
  const context = useContext(InboxContext);
  if (!context) {
    throw new Error('useInbox must be used within an InboxProvider');
  }
  return context;
}
