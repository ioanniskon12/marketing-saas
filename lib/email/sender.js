/**
 * Email Sender Utility
 *
 * Handles sending emails via Resend and logging to database
 */

import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';

// Import email templates
import { welcomeEmail, welcomeEmailText } from './templates/welcome.js';
import { digestEmail, digestEmailText } from './templates/digest.js';
import {
  alertEmail,
  alertEmailText,
  postPublishedAlert,
  postFailedAlert,
  engagementDropAlert,
  newMentionAlert,
  approvalRequestAlert,
  approvalDecisionAlert,
  competitorAlert,
} from './templates/alert.js';

// Lazy initialize Resend
let resendInstance = null;

function getResend() {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

// Default sender email
const DEFAULT_FROM = process.env.EMAIL_FROM || 'SocialFlow <notifications@socialflow.app>';

/**
 * Send email via Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 * @param {string} options.from - Sender email (optional)
 * @param {string} options.emailType - Type of email for logging
 * @param {string} options.userId - User ID for logging (optional)
 * @param {string} options.workspaceId - Workspace ID for logging (optional)
 * @param {Object} options.metadata - Additional metadata (optional)
 * @returns {Promise<Object>} Resend response
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = DEFAULT_FROM,
  emailType = 'general',
  userId = null,
  workspaceId = null,
  metadata = {},
}) {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn('Resend API key not configured. Skipping email.');
      return { success: false, error: 'Resend API key not configured' };
    }

    // Send via Resend
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    // Log to database
    try {
      const supabase = await createClient();
      await supabase.from('email_logs').insert({
        user_id: userId,
        workspace_id: workspaceId,
        email_type: emailType,
        recipient_email: to,
        subject,
        status: 'sent',
        resend_id: data.id,
        metadata,
      });
    } catch (logError) {
      console.error('Error logging email to database:', logError);
      // Continue even if logging fails
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);

    // Log failed email
    try {
      const supabase = await createClient();
      await supabase.from('email_logs').insert({
        user_id: userId,
        workspace_id: workspaceId,
        email_type: emailType,
        recipient_email: to,
        subject,
        status: 'failed',
        error_message: error.message,
        metadata,
      });
    } catch (logError) {
      console.error('Error logging failed email:', logError);
    }

    return { success: false, error: error.message };
  }
}

/**
 * Check if user has email notifications enabled
 * @param {string} userId - User ID
 * @param {string} workspaceId - Workspace ID
 * @param {string} notificationType - Type of notification
 * @returns {Promise<boolean>} Whether notifications are enabled
 */
export async function checkNotificationPreferences(userId, workspaceId, notificationType) {
  try {
    const supabase = await createClient();

    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .single();

    if (!preferences) {
      // If no preferences found, return true (default enabled)
      return true;
    }

    // Check the specific notification type
    const fieldName = `email_${notificationType}`;
    return preferences[fieldName] !== false;
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    // Default to enabled if error
    return true;
  }
}

/**
 * Get user email from user ID
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} User email
 */
export async function getUserEmail(userId) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.admin.getUserById(userId);

    return user?.email || null;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}

// ====================
// EMAIL SENDING FUNCTIONS
// ====================

/**
 * Send welcome email
 */
export async function sendWelcomeEmail({
  userId,
  userName,
  userEmail,
  workspaceId,
  workspaceName,
  isNewUser = true,
}) {
  const enabled = await checkNotificationPreferences(userId, workspaceId, 'welcome');
  if (!enabled) return { success: false, reason: 'notifications_disabled' };

  const html = welcomeEmail({ userName, workspaceName, isNewUser });
  const text = welcomeEmailText({ userName, workspaceName, isNewUser });

  return sendEmail({
    to: userEmail,
    subject: `Welcome to SocialFlow${isNewUser ? '' : ` - ${workspaceName}`}!`,
    html,
    text,
    emailType: 'welcome',
    userId,
    workspaceId,
    metadata: { workspace_name: workspaceName, is_new_user: isNewUser },
  });
}

/**
 * Send digest email
 */
export async function sendDigestEmail({
  userId,
  userName,
  userEmail,
  workspaceId,
  workspaceName,
  period = 'weekly',
  dateRange,
  stats,
  topPosts = [],
  recentMentions = [],
  recommendations = {},
}) {
  const enabled = await checkNotificationPreferences(userId, workspaceId, `digest_${period}`);
  if (!enabled) return { success: false, reason: 'notifications_disabled' };

  const html = digestEmail({
    userName,
    workspaceName,
    period,
    dateRange,
    stats,
    topPosts,
    recentMentions,
    recommendations,
  });

  const text = digestEmailText({
    userName,
    workspaceName,
    period,
    dateRange,
    stats,
    topPosts,
    recentMentions,
  });

  const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);

  return sendEmail({
    to: userEmail,
    subject: `Your ${periodLabel} Social Media Summary - ${workspaceName}`,
    html,
    text,
    emailType: `digest_${period}`,
    userId,
    workspaceId,
    metadata: { workspace_name: workspaceName, period, date_range: dateRange },
  });
}

/**
 * Send post published alert
 */
export async function sendPostPublishedAlert({
  userId,
  userName,
  userEmail,
  workspaceId,
  postContent,
  platforms,
  publishedAt,
}) {
  const enabled = await checkNotificationPreferences(userId, workspaceId, 'post_published');
  if (!enabled) return { success: false, reason: 'notifications_disabled' };

  const html = postPublishedAlert({ userName, postContent, platforms, publishedAt });
  const text = alertEmailText({
    userName,
    title: 'Post Published Successfully',
    message: 'Your scheduled post has been published to your social media accounts.',
    details: {
      'Published At': new Date(publishedAt).toLocaleString(),
      'Platforms': platforms.join(', '),
    },
  });

  return sendEmail({
    to: userEmail,
    subject: 'Post Published Successfully',
    html,
    text,
    emailType: 'post_published',
    userId,
    workspaceId,
    metadata: { platforms, published_at: publishedAt },
  });
}

/**
 * Send post failed alert
 */
export async function sendPostFailedAlert({
  userId,
  userName,
  userEmail,
  workspaceId,
  postContent,
  platforms,
  errorMessage,
}) {
  const enabled = await checkNotificationPreferences(userId, workspaceId, 'post_failed');
  if (!enabled) return { success: false, reason: 'notifications_disabled' };

  const html = postFailedAlert({ userName, postContent, platforms, errorMessage });
  const text = alertEmailText({
    userName,
    title: 'Post Publishing Failed',
    message: 'We encountered an error while trying to publish your scheduled post.',
    details: {
      'Platforms': platforms.join(', '),
      'Error': errorMessage,
    },
  });

  return sendEmail({
    to: userEmail,
    subject: 'Post Publishing Failed',
    html,
    text,
    emailType: 'post_failed',
    userId,
    workspaceId,
    metadata: { platforms, error: errorMessage },
  });
}

/**
 * Send engagement drop alert
 */
export async function sendEngagementDropAlert({
  userId,
  userName,
  userEmail,
  workspaceId,
  currentRate,
  previousRate,
  dropPercentage,
  period,
}) {
  const enabled = await checkNotificationPreferences(userId, workspaceId, 'analytics_summary');
  if (!enabled) return { success: false, reason: 'notifications_disabled' };

  const html = engagementDropAlert({ userName, currentRate, previousRate, dropPercentage, period });
  const text = alertEmailText({
    userName,
    title: 'Engagement Rate Drop Detected',
    message: `Your engagement rate has dropped by ${dropPercentage}% compared to the previous ${period}.`,
    details: {
      'Current Rate': `${currentRate.toFixed(2)}%`,
      'Previous Rate': `${previousRate.toFixed(2)}%`,
    },
  });

  return sendEmail({
    to: userEmail,
    subject: 'Engagement Rate Drop Detected',
    html,
    text,
    emailType: 'engagement_alert',
    userId,
    workspaceId,
    metadata: { current_rate: currentRate, previous_rate: previousRate, drop_percentage: dropPercentage },
  });
}

/**
 * Send new mention alert
 */
export async function sendNewMentionAlert({
  userId,
  userName,
  userEmail,
  workspaceId,
  workspaceName,
  mention,
}) {
  const enabled = await checkNotificationPreferences(userId, workspaceId, 'new_mention');
  if (!enabled) return { success: false, reason: 'notifications_disabled' };

  const html = newMentionAlert({ userName, mention, workspaceName });
  const text = alertEmailText({
    userName,
    title: 'New Mention Detected',
    message: `Someone mentioned ${workspaceName} on ${mention.platform}!`,
    details: {
      'Author': mention.author_display_name || mention.author_username,
      'Platform': mention.platform,
      'Sentiment': mention.sentiment,
    },
  });

  return sendEmail({
    to: userEmail,
    subject: `New Mention on ${mention.platform}`,
    html,
    text,
    emailType: 'new_mention',
    userId,
    workspaceId,
    metadata: { platform: mention.platform, sentiment: mention.sentiment },
  });
}

/**
 * Send approval request alert
 */
export async function sendApprovalRequestAlert({
  userId,
  userName,
  userEmail,
  workspaceId,
  workspaceName,
  requesterName,
  postContent,
}) {
  const enabled = await checkNotificationPreferences(userId, workspaceId, 'approval_request');
  if (!enabled) return { success: false, reason: 'notifications_disabled' };

  const html = approvalRequestAlert({ userName, requesterName, postContent, workspaceName });
  const text = alertEmailText({
    userName,
    title: 'Post Approval Request',
    message: `${requesterName} has submitted a post for your approval in ${workspaceName}.`,
    details: {
      'Requested By': requesterName,
      'Workspace': workspaceName,
    },
  });

  return sendEmail({
    to: userEmail,
    subject: `Post Approval Request - ${workspaceName}`,
    html,
    text,
    emailType: 'approval_request',
    userId,
    workspaceId,
    metadata: { requester_name: requesterName, workspace_name: workspaceName },
  });
}

/**
 * Send approval decision alert
 */
export async function sendApprovalDecisionAlert({
  userId,
  userName,
  userEmail,
  workspaceId,
  decision,
  reviewerName,
  postContent,
  comments,
}) {
  const enabled = await checkNotificationPreferences(userId, workspaceId, 'approval_decision');
  if (!enabled) return { success: false, reason: 'notifications_disabled' };

  const html = approvalDecisionAlert({ userName, decision, reviewerName, postContent, comments });
  const text = alertEmailText({
    userName,
    title: `Post ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
    message: `${reviewerName} has ${decision} your post.`,
    details: {
      'Decision': decision,
      'Reviewed By': reviewerName,
    },
  });

  return sendEmail({
    to: userEmail,
    subject: `Post ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
    html,
    text,
    emailType: 'approval_decision',
    userId,
    workspaceId,
    metadata: { decision, reviewer_name: reviewerName },
  });
}

/**
 * Send competitor alert
 */
export async function sendCompetitorAlert({
  userId,
  userName,
  userEmail,
  workspaceId,
  competitorName,
  alertMessage,
  metrics,
}) {
  const enabled = await checkNotificationPreferences(userId, workspaceId, 'competitor_alert');
  if (!enabled) return { success: false, reason: 'notifications_disabled' };

  const html = competitorAlert({ userName, competitorName, alertMessage, metrics });
  const text = alertEmailText({
    userName,
    title: 'Competitor Activity Alert',
    message: alertMessage,
    details: { 'Competitor': competitorName, ...metrics },
  });

  return sendEmail({
    to: userEmail,
    subject: `Competitor Alert: ${competitorName}`,
    html,
    text,
    emailType: 'competitor_alert',
    userId,
    workspaceId,
    metadata: { competitor_name: competitorName, metrics },
  });
}

/**
 * Send custom alert
 */
export async function sendCustomAlert({
  userId,
  userName,
  userEmail,
  workspaceId,
  alertType = 'info',
  title,
  message,
  details = {},
  actionUrl,
  actionText,
}) {
  const html = alertEmail({ userName, alertType, title, message, details, actionUrl, actionText });
  const text = alertEmailText({ userName, alertType, title, message, details });

  return sendEmail({
    to: userEmail,
    subject: title,
    html,
    text,
    emailType: 'custom_alert',
    userId,
    workspaceId,
    metadata: { alert_type: alertType, title },
  });
}

// Export all functions
export default {
  sendEmail,
  sendWelcomeEmail,
  sendDigestEmail,
  sendPostPublishedAlert,
  sendPostFailedAlert,
  sendEngagementDropAlert,
  sendNewMentionAlert,
  sendApprovalRequestAlert,
  sendApprovalDecisionAlert,
  sendCompetitorAlert,
  sendCustomAlert,
  checkNotificationPreferences,
  getUserEmail,
};
