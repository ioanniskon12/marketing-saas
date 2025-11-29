/**
 * Alert Email Template
 *
 * Sent for important notifications and alerts
 */

import { baseTemplate, replaceVariables } from './base.js';

/**
 * Generate alert email HTML
 * @param {Object} data - Email data
 * @param {string} data.userName - User's name
 * @param {string} data.alertType - Type of alert
 * @param {string} data.title - Alert title
 * @param {string} data.message - Alert message
 * @param {Object} data.details - Additional details
 * @param {string} data.actionUrl - URL for action button
 * @param {string} data.actionText - Text for action button
 * @returns {string} HTML email
 */
export function alertEmail({
  userName,
  alertType = 'info',
  title,
  message,
  details = {},
  actionUrl,
  actionText = 'View Details',
}) {
  const alertColors = {
    success: { bg: '#f0fdf4', border: '#10b981', icon: '✅' },
    error: { bg: '#fef2f2', border: '#ef4444', icon: '❌' },
    warning: { bg: '#fffbeb', border: '#f59e0b', icon: '⚠️' },
    info: { bg: '#eff6ff', border: '#3b82f6', icon: 'ℹ️' },
  };

  const alertStyle = alertColors[alertType] || alertColors.info;

  const content = `
    <h1>${alertStyle.icon} ${title}</h1>

    <p>Hi ${userName},</p>

    <div class="alert-box ${alertType}">
      <p style="margin: 0; font-size: 16px;">
        ${message}
      </p>
    </div>

    ${Object.keys(details).length > 0 ? `
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <h3 style="margin-top: 0;">Details</h3>
        ${Object.entries(details).map(([key, value]) => `
          <div style="display: flex; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <div style="flex: 1; color: #6b7280; font-weight: 500;">${key}:</div>
            <div style="flex: 2; color: #1f2937; font-weight: 600;">${value}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${actionUrl ? `
      <div style="text-align: center; margin: 32px 0;">
        <a href="${actionUrl}" class="button">
          ${actionText}
        </a>
      </div>
    ` : ''}

    <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
      Best regards,<br>
      <strong>The SocialFlow Team</strong>
    </p>
  `;

  const html = baseTemplate({
    content,
    previewText: title,
    title: `Alert: ${title}`,
  });

  return replaceVariables(html, {
    USER_NAME: userName,
  });
}

/**
 * Post published successfully alert
 */
export function postPublishedAlert({ userName, postContent, platforms, publishedAt }) {
  return alertEmail({
    userName,
    alertType: 'success',
    title: 'Post Published Successfully',
    message: 'Your scheduled post has been published to your social media accounts.',
    details: {
      'Published At': new Date(publishedAt).toLocaleString(),
      'Platforms': platforms.join(', '),
      'Content': postContent.substring(0, 100) + (postContent.length > 100 ? '...' : ''),
    },
    actionUrl: '{{APP_URL}}/dashboard/posts',
    actionText: 'View All Posts',
  });
}

/**
 * Post failed alert
 */
export function postFailedAlert({ userName, postContent, platforms, errorMessage }) {
  return alertEmail({
    userName,
    alertType: 'error',
    title: 'Post Publishing Failed',
    message: 'We encountered an error while trying to publish your scheduled post.',
    details: {
      'Platforms': platforms.join(', '),
      'Content': postContent.substring(0, 100) + (postContent.length > 100 ? '...' : ''),
      'Error': errorMessage,
    },
    actionUrl: '{{APP_URL}}/dashboard/posts',
    actionText: 'Retry Publishing',
  });
}

/**
 * Engagement drop alert
 */
export function engagementDropAlert({ userName, currentRate, previousRate, dropPercentage, period }) {
  return alertEmail({
    userName,
    alertType: 'warning',
    title: 'Engagement Rate Drop Detected',
    message: `Your engagement rate has dropped by ${dropPercentage}% compared to the previous ${period}.`,
    details: {
      'Current Engagement Rate': `${currentRate.toFixed(2)}%`,
      'Previous Engagement Rate': `${previousRate.toFixed(2)}%`,
      'Change': `-${dropPercentage}%`,
      'Period': period,
    },
    actionUrl: '{{APP_URL}}/dashboard/analytics',
    actionText: 'View Analytics',
  });
}

/**
 * New mention alert
 */
export function newMentionAlert({ userName, mention, workspaceName }) {
  return alertEmail({
    userName,
    alertType: 'info',
    title: 'New Mention Detected',
    message: `Someone mentioned ${workspaceName} on ${mention.platform}!`,
    details: {
      'Platform': mention.platform,
      'Author': mention.author_display_name || mention.author_username,
      'Sentiment': mention.sentiment,
      'Engagement': `${mention.likes_count || 0} likes, ${mention.comments_count || 0} comments`,
      'Content': mention.content.substring(0, 150) + (mention.content.length > 150 ? '...' : ''),
    },
    actionUrl: '{{APP_URL}}/dashboard/listening',
    actionText: 'View Mention',
  });
}

/**
 * Approval request alert
 */
export function approvalRequestAlert({ userName, requesterName, postContent, workspaceName }) {
  return alertEmail({
    userName,
    alertType: 'info',
    title: 'Post Approval Request',
    message: `${requesterName} has submitted a post for your approval in ${workspaceName}.`,
    details: {
      'Requested By': requesterName,
      'Workspace': workspaceName,
      'Content Preview': postContent.substring(0, 150) + (postContent.length > 150 ? '...' : ''),
    },
    actionUrl: '{{APP_URL}}/dashboard/approvals',
    actionText: 'Review Post',
  });
}

/**
 * Approval decision alert
 */
export function approvalDecisionAlert({ userName, decision, reviewerName, postContent, comments }) {
  return alertEmail({
    userName,
    alertType: decision === 'approved' ? 'success' : 'warning',
    title: `Post ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
    message: `${reviewerName} has ${decision} your post.`,
    details: {
      'Decision': decision === 'approved' ? 'Approved ✓' : 'Rejected ✗',
      'Reviewed By': reviewerName,
      'Content Preview': postContent.substring(0, 150) + (postContent.length > 150 ? '...' : ''),
      ...(comments ? { 'Comments': comments } : {}),
    },
    actionUrl: '{{APP_URL}}/dashboard/posts',
    actionText: 'View Post',
  });
}

/**
 * Competitor alert
 */
export function competitorAlert({ userName, competitorName, alertMessage, metrics }) {
  return alertEmail({
    userName,
    alertType: 'info',
    title: 'Competitor Activity Alert',
    message: alertMessage,
    details: {
      'Competitor': competitorName,
      ...metrics,
    },
    actionUrl: '{{APP_URL}}/dashboard/analytics/competitors',
    actionText: 'View Competitor Analysis',
  });
}

/**
 * Plain text version of alert email
 */
export function alertEmailText({ userName, alertType, title, message, details = {} }) {
  return `
${title}

Hi ${userName},

${message}

${Object.keys(details).length > 0 ? `
DETAILS:
${Object.entries(details).map(([key, value]) => `${key}: ${value}`).join('\n')}
` : ''}

Best regards,
The SocialFlow Team

Manage email preferences: ${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications
  `.trim();
}
