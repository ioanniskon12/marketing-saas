'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const NOTIFICATION_PERMISSION_KEY = 'notificationsEnabled';
const LAST_CHECK_KEY = 'lastNotificationCheck';
const POLL_INTERVAL = 30000; // Check every 30 seconds

export function useNotifications() {
  const [permission, setPermission] = useState('default');
  const [enabled, setEnabled] = useState(false);
  const [lastFeedbackCount, setLastFeedbackCount] = useState(0);
  const pollIntervalRef = useRef(null);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);

      // Load saved preference
      const savedEnabled = localStorage.getItem(NOTIFICATION_PERMISSION_KEY);
      setEnabled(savedEnabled === 'true' && Notification.permission === 'granted');
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        setEnabled(true);
        localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  // Show a notification
  const showNotification = useCallback((title, options = {}) => {
    if (permission !== 'granted' || !enabled) return;

    try {
      const notification = new Notification(title, {
        icon: '/icon-192.png', // Fallback icon
        badge: '/badge-72.png', // Fallback badge
        vibrate: [200, 100, 200],
        tag: 'plan-feedback',
        renotify: true,
        requireInteraction: false,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        if (options.url) {
          window.location.href = options.url;
        }
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [permission, enabled]);

  // Check for new feedback
  const checkForNewFeedback = useCallback(async () => {
    if (!enabled) return;

    try {
      const response = await fetch('/api/calendar/share/feedback');
      const data = await response.json();

      if (data.success && data.shares) {
        // Calculate total feedback count
        const totalFeedback = data.shares.reduce((sum, share) => {
          return sum + share.stats.totalComments + share.stats.totalApprovals + share.stats.totalRejections;
        }, 0);

        // Check if we have new feedback
        const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0');
        if (lastCheck > 0 && totalFeedback > lastCheck) {
          const newCount = totalFeedback - lastCheck;

          // Show notification for new feedback
          showNotification(
            `${newCount} New Feedback Item${newCount > 1 ? 's' : ''}`,
            {
              body: 'You have received new feedback on your shared plans',
              icon: '/icon-192.png',
              url: '/dashboard/plans-hub?tab=feedback',
            }
          );
        }

        // Update last check
        localStorage.setItem(LAST_CHECK_KEY, totalFeedback.toString());
        setLastFeedbackCount(totalFeedback);
      }
    } catch (error) {
      console.error('Error checking for new feedback:', error);
    }
  }, [enabled, showNotification]);

  // Start polling for new feedback
  useEffect(() => {
    if (enabled) {
      // Check immediately
      checkForNewFeedback();

      // Set up polling
      pollIntervalRef.current = setInterval(checkForNewFeedback, POLL_INTERVAL);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [enabled, checkForNewFeedback]);

  // Toggle notifications
  const toggleNotifications = useCallback(async () => {
    if (!enabled) {
      // Try to enable
      const granted = await requestPermission();
      if (granted) {
        setEnabled(true);
        localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
      }
    } else {
      // Disable
      setEnabled(false);
      localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'false');
    }
  }, [enabled, requestPermission]);

  return {
    permission,
    enabled,
    toggleNotifications,
    showNotification,
    requestPermission,
    lastFeedbackCount,
  };
}
