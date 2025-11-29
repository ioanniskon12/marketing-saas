/**
 * Welcome Email Template
 *
 * Sent when a user creates an account or joins a workspace
 */

import { baseTemplate, replaceVariables } from './base.js';

/**
 * Generate welcome email HTML
 * @param {Object} data - Email data
 * @param {string} data.userName - User's name
 * @param {string} data.workspaceName - Workspace name
 * @param {boolean} data.isNewUser - Is this a new user signup or workspace invite
 * @returns {string} HTML email
 */
export function welcomeEmail({ userName, workspaceName, isNewUser = true }) {
  const content = `
    <h1>Welcome to SocialFlow${isNewUser ? '' : `, ${userName}`}! 🎉</h1>

    <p>
      ${isNewUser
        ? `We're thrilled to have you on board! You're now ready to streamline your social media management and grow your online presence.`
        : `You've been invited to join the <strong>${workspaceName}</strong> workspace. You can now collaborate with your team to manage social media accounts together.`
      }
    </p>

    ${isNewUser ? `
      <div class="alert-box success">
        <h3 style="margin-top: 0;">Your workspace is ready!</h3>
        <p style="margin-bottom: 0;">
          Workspace: <strong>${workspaceName}</strong>
        </p>
      </div>
    ` : ''}

    <h2>Get Started in 3 Easy Steps</h2>

    <div style="margin: 24px 0;">
      <div style="display: flex; align-items: start; margin-bottom: 20px;">
        <div style="flex-shrink: 0; width: 32px; height: 32px; background-color: #6366f1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 16px;">1</div>
        <div>
          <h3 style="margin: 0 0 8px 0;">Connect Your Social Accounts</h3>
          <p style="margin: 0;">Link your Instagram, Facebook, LinkedIn, and Twitter accounts to start managing them from one place.</p>
        </div>
      </div>

      <div style="display: flex; align-items: start; margin-bottom: 20px;">
        <div style="flex-shrink: 0; width: 32px; height: 32px; background-color: #6366f1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 16px;">2</div>
        <div>
          <h3 style="margin: 0 0 8px 0;">Create Your First Post</h3>
          <p style="margin: 0;">Craft engaging content, add media, and schedule it to post at the perfect time.</p>
        </div>
      </div>

      <div style="display: flex; align-items: start;">
        <div style="flex-shrink: 0; width: 32px; height: 32px; background-color: #6366f1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 16px;">3</div>
        <div>
          <h3 style="margin: 0 0 8px 0;">Track Your Performance</h3>
          <p style="margin: 0;">Monitor analytics, engagement metrics, and discover insights to optimize your strategy.</p>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="{{APP_URL}}/dashboard" class="button">
        Go to Your Dashboard
      </a>
    </div>

    <div class="divider"></div>

    <h2>What You Can Do with SocialFlow</h2>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr>
        <td style="padding: 12px 0;">
          <div style="display: flex; align-items: center;">
            <div style="margin-right: 12px; font-size: 24px;">📅</div>
            <div>
              <strong>Schedule Posts</strong><br>
              <span style="color: #6b7280; font-size: 14px;">Plan your content calendar and auto-publish at optimal times</span>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <div style="display: flex; align-items: center;">
            <div style="margin-right: 12px; font-size: 24px;">📊</div>
            <div>
              <strong>Analytics & Insights</strong><br>
              <span style="color: #6b7280; font-size: 14px;">Track performance, engagement, and growth across all platforms</span>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <div style="display: flex; align-items: center;">
            <div style="margin-right: 12px; font-size: 24px;">👥</div>
            <div>
              <strong>Team Collaboration</strong><br>
              <span style="color: #6b7280; font-size: 14px;">Work together with approval workflows and role-based permissions</span>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <div style="display: flex; align-items: center;">
            <div style="margin-right: 12px; font-size: 24px;">👂</div>
            <div>
              <strong>Social Listening</strong><br>
              <span style="color: #6b7280; font-size: 14px;">Monitor mentions, hashtags, and competitor activity</span>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <div class="divider"></div>

    <h3>Need Help Getting Started?</h3>
    <p>
      We're here to help! Check out our <a href="{{APP_URL}}/docs" style="color: #6366f1; text-decoration: none;">documentation</a>
      or reach out to our <a href="{{APP_URL}}/support" style="color: #6366f1; text-decoration: none;">support team</a> if you have any questions.
    </p>

    <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
      Welcome aboard,<br>
      <strong>The SocialFlow Team</strong>
    </p>
  `;

  const html = baseTemplate({
    content,
    previewText: `Welcome to SocialFlow! ${isNewUser ? "Let's get you started." : `You've been invited to ${workspaceName}.`}`,
    title: 'Welcome to SocialFlow',
  });

  return replaceVariables(html, {
    USER_NAME: userName,
    WORKSPACE_NAME: workspaceName,
  });
}

/**
 * Plain text version of welcome email
 */
export function welcomeEmailText({ userName, workspaceName, isNewUser = true }) {
  return `
Welcome to SocialFlow!

${isNewUser
  ? `We're thrilled to have you on board! You're now ready to streamline your social media management and grow your online presence.

Your workspace "${workspaceName}" is ready!`
  : `Hi ${userName},

You've been invited to join the "${workspaceName}" workspace. You can now collaborate with your team to manage social media accounts together.`
}

GET STARTED IN 3 EASY STEPS:

1. Connect Your Social Accounts
   Link your Instagram, Facebook, LinkedIn, and Twitter accounts to start managing them from one place.

2. Create Your First Post
   Craft engaging content, add media, and schedule it to post at the perfect time.

3. Track Your Performance
   Monitor analytics, engagement metrics, and discover insights to optimize your strategy.

Go to Your Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

WHAT YOU CAN DO WITH SOCIALFLOW:

📅 Schedule Posts
   Plan your content calendar and auto-publish at optimal times

📊 Analytics & Insights
   Track performance, engagement, and growth across all platforms

👥 Team Collaboration
   Work together with approval workflows and role-based permissions

👂 Social Listening
   Monitor mentions, hashtags, and competitor activity

Need help? Check out our documentation or contact support:
${process.env.NEXT_PUBLIC_APP_URL}/support

Welcome aboard,
The SocialFlow Team
  `.trim();
}
