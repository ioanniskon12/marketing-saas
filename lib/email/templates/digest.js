/**
 * Digest Email Template
 *
 * Sent daily/weekly/monthly with performance summaries
 */

import { baseTemplate, replaceVariables } from './base.js';

/**
 * Generate digest email HTML
 * @param {Object} data - Email data
 * @param {string} data.userName - User's name
 * @param {string} data.workspaceName - Workspace name
 * @param {string} data.period - Digest period (daily, weekly, monthly)
 * @param {string} data.dateRange - Date range string
 * @param {Object} data.stats - Performance statistics
 * @param {Array} data.topPosts - Array of top performing posts
 * @param {Array} data.recentMentions - Array of recent mentions
 * @param {Object} data.recommendations - AI recommendations
 * @returns {string} HTML email
 */
export function digestEmail({
  userName,
  workspaceName,
  period = 'weekly',
  dateRange,
  stats = {},
  topPosts = [],
  recentMentions = [],
  recommendations = {},
}) {
  const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);

  const {
    totalPosts = 0,
    totalReach = 0,
    totalEngagements = 0,
    engagementRate = 0,
    followerGrowth = 0,
    topPlatform = 'N/A',
    reachChange = 0,
    engagementChange = 0,
  } = stats;

  const content = `
    <h1>Your ${periodLabel} Social Media Summary 📊</h1>

    <p>Hi ${userName},</p>

    <p>
      Here's how <strong>${workspaceName}</strong> performed ${dateRange}.
      ${totalPosts > 0
        ? `Great work staying active with ${totalPosts} post${totalPosts > 1 ? 's' : ''}!`
        : `No posts were published during this period.`
      }
    </p>

    ${totalPosts > 0 ? `
      <div class="divider"></div>

      <h2>Performance Overview</h2>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
        <tr>
          <td width="33%" style="padding: 16px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
            <div class="stat-value">${totalReach.toLocaleString()}</div>
            <div class="stat-label">Total Reach</div>
            ${reachChange !== 0 ? `
              <div style="font-size: 12px; color: ${reachChange > 0 ? '#10b981' : '#ef4444'}; margin-top: 4px;">
                ${reachChange > 0 ? '↑' : '↓'} ${Math.abs(reachChange)}%
              </div>
            ` : ''}
          </td>
          <td width="10"></td>
          <td width="33%" style="padding: 16px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
            <div class="stat-value">${totalEngagements.toLocaleString()}</div>
            <div class="stat-label">Engagements</div>
            ${engagementChange !== 0 ? `
              <div style="font-size: 12px; color: ${engagementChange > 0 ? '#10b981' : '#ef4444'}; margin-top: 4px;">
                ${engagementChange > 0 ? '↑' : '↓'} ${Math.abs(engagementChange)}%
              </div>
            ` : ''}
          </td>
          <td width="10"></td>
          <td width="33%" style="padding: 16px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
            <div class="stat-value">${engagementRate.toFixed(2)}%</div>
            <div class="stat-label">Engagement Rate</div>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
        <tr>
          <td width="50%" style="padding: 16px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
            <div class="stat-value">${totalPosts}</div>
            <div class="stat-label">Posts Published</div>
          </td>
          <td width="10"></td>
          <td width="50%" style="padding: 16px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
            <div class="stat-value" style="color: ${followerGrowth >= 0 ? '#10b981' : '#ef4444'};">
              ${followerGrowth > 0 ? '+' : ''}${followerGrowth}
            </div>
            <div class="stat-label">Follower Growth</div>
          </td>
        </tr>
      </table>

      ${topPlatform !== 'N/A' ? `
        <div class="alert-box info">
          <p style="margin: 0;">
            <strong>Top Performing Platform:</strong> ${topPlatform}
          </p>
        </div>
      ` : ''}

      ${topPosts.length > 0 ? `
        <div class="divider"></div>

        <h2>Your Best Performing Posts 🌟</h2>

        ${topPosts.map((post, index) => `
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
              <div style="flex: 1;">
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">
                  #${index + 1} • ${post.platform || 'Social Media'}
                </div>
                <div style="color: #6b7280; font-size: 14px;">
                  ${new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div style="background-color: #ffffff; padding: 8px 12px; border-radius: 6px; font-weight: 600; color: #6366f1;">
                ${post.engagement_rate?.toFixed(2)}% engagement
              </div>
            </div>
            <p style="margin: 8px 0; color: #4b5563; font-size: 14px;">
              ${post.content?.substring(0, 150)}${post.content?.length > 150 ? '...' : ''}
            </p>
            <div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;">
              <span>❤️ ${post.likes_count?.toLocaleString() || 0}</span>
              <span>💬 ${post.comments_count?.toLocaleString() || 0}</span>
              <span>🔄 ${post.shares_count?.toLocaleString() || 0}</span>
            </div>
          </div>
        `).join('')}
      ` : ''}

      ${recentMentions.length > 0 ? `
        <div class="divider"></div>

        <h2>Recent Mentions & Conversations 💬</h2>

        <p>You've been mentioned ${recentMentions.length} time${recentMentions.length > 1 ? 's' : ''} recently:</p>

        ${recentMentions.slice(0, 3).map(mention => `
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
              <div>
                <strong style="color: #1f2937;">${mention.author_display_name || mention.author_username}</strong>
                <span style="color: #6b7280; font-size: 14px;"> • ${mention.platform}</span>
              </div>
              ${mention.sentiment ? `
                <div style="background-color: ${
                  mention.sentiment === 'positive' ? '#d1fae5' :
                  mention.sentiment === 'negative' ? '#fee2e2' : '#e5e7eb'
                }; color: ${
                  mention.sentiment === 'positive' ? '#065f46' :
                  mention.sentiment === 'negative' ? '#991b1b' : '#374151'
                }; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                  ${mention.sentiment}
                </div>
              ` : ''}
            </div>
            <p style="margin: 0; color: #4b5563; font-size: 14px;">
              ${mention.content?.substring(0, 120)}${mention.content?.length > 120 ? '...' : ''}
            </p>
          </div>
        `).join('')}

        ${recentMentions.length > 3 ? `
          <div style="text-align: center; margin-top: 16px;">
            <a href="{{APP_URL}}/dashboard/listening" class="button button-secondary">
              View All Mentions
            </a>
          </div>
        ` : ''}
      ` : ''}

      ${recommendations.bestPostingTimes?.length > 0 ? `
        <div class="divider"></div>

        <h2>Recommendations for You 💡</h2>

        <div class="alert-box success">
          <h3 style="margin-top: 0;">Best Times to Post</h3>
          <p style="margin-bottom: 8px;">Based on your audience engagement, consider posting at:</p>
          <ul style="margin: 0; padding-left: 20px;">
            ${recommendations.bestPostingTimes.map(time => `
              <li>${time}</li>
            `).join('')}
          </ul>
        </div>

        ${recommendations.contentSuggestion ? `
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-top: 12px; border-radius: 4px;">
            <h3 style="margin-top: 0;">Content Tip</h3>
            <p style="margin-bottom: 0;">${recommendations.contentSuggestion}</p>
          </div>
        ` : ''}
      ` : ''}

      <div class="divider"></div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="{{APP_URL}}/dashboard/analytics" class="button">
          View Full Analytics Report
        </a>
      </div>
    ` : `
      <div class="alert-box warning">
        <h3 style="margin-top: 0;">No Activity This Period</h3>
        <p style="margin-bottom: 0;">
          You didn't publish any posts ${dateRange}. Keep your audience engaged by scheduling regular content!
        </p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="{{APP_URL}}/dashboard/posts/create" class="button">
          Create Your First Post
        </a>
      </div>
    `}

    <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
      Keep up the great work!<br>
      <strong>The SocialFlow Team</strong>
    </p>

    <p class="text-muted">
      This is your ${period} digest.
      <a href="{{APP_URL}}/settings/notifications" style="color: #6366f1; text-decoration: none;">Manage email preferences</a>
    </p>
  `;

  const html = baseTemplate({
    content,
    previewText: `Your ${period} summary: ${totalPosts} posts, ${totalEngagements.toLocaleString()} engagements`,
    title: `${periodLabel} Social Media Digest - SocialFlow`,
  });

  return replaceVariables(html, {
    USER_NAME: userName,
    WORKSPACE_NAME: workspaceName,
  });
}

/**
 * Plain text version of digest email
 */
export function digestEmailText({
  userName,
  workspaceName,
  period = 'weekly',
  dateRange,
  stats = {},
  topPosts = [],
  recentMentions = [],
}) {
  const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);

  const {
    totalPosts = 0,
    totalReach = 0,
    totalEngagements = 0,
    engagementRate = 0,
    followerGrowth = 0,
  } = stats;

  return `
Your ${periodLabel} Social Media Summary

Hi ${userName},

Here's how ${workspaceName} performed ${dateRange}.

PERFORMANCE OVERVIEW
--------------------
Total Reach: ${totalReach.toLocaleString()}
Total Engagements: ${totalEngagements.toLocaleString()}
Engagement Rate: ${engagementRate.toFixed(2)}%
Posts Published: ${totalPosts}
Follower Growth: ${followerGrowth > 0 ? '+' : ''}${followerGrowth}

${topPosts.length > 0 ? `
TOP PERFORMING POSTS
--------------------
${topPosts.map((post, index) => `
${index + 1}. ${post.platform} (${post.engagement_rate?.toFixed(2)}% engagement)
   ${post.content?.substring(0, 100)}...
   ❤️ ${post.likes_count || 0} 💬 ${post.comments_count || 0} 🔄 ${post.shares_count || 0}
`).join('\n')}
` : ''}

${recentMentions.length > 0 ? `
RECENT MENTIONS
---------------
${recentMentions.slice(0, 3).map(mention => `
• ${mention.author_display_name} on ${mention.platform} (${mention.sentiment})
  ${mention.content?.substring(0, 100)}...
`).join('\n')}
` : ''}

View full analytics: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/analytics

Keep up the great work!
The SocialFlow Team

Manage email preferences: ${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications
  `.trim();
}
