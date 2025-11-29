/**
 * Calendar Share Email Notifications
 *
 * Email notification functions for calendar sharing events
 */

import { Resend } from 'resend';

let resendInstance = null;

function getResend() {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

const fromEmail = process.env.EMAIL_FROM || 'noreply@yourdomain.com';

/**
 * Send email when a calendar share is created
 */
export async function sendShareCreatedEmail(recipientEmail, shareData, password = null) {
  try {
    const { title, description, shareUrl, creatorName, expiresAt, companyName } = shareData;

    const subject = `${creatorName || 'Someone'} shared a content calendar with you`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                📅 Calendar Shared
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #374151;">
                ${creatorName || 'Someone'} has shared a content calendar with you.
              </p>

              <!-- Share Info Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #1f2937;">
                      ${title}
                    </h2>
                    ${description ? `
                    <p style="margin: 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                      ${description}
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>

              ${password ? `
              <!-- Password Alert -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #92400e;">
                      🔒 Password Protected
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #92400e;">
                      Password: <strong>${password}</strong>
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              ${expiresAt ? `
              <p style="margin: 20px 0; font-size: 14px; color: #6b7280;">
                ⏰ This share expires on ${new Date(expiresAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              ` : ''}

              <!-- CTA Button -->
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td>
                    <a href="${shareUrl}" style="display: inline-block; padding: 14px 32px; background-color: #8B5CF6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      View Calendar
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                Or copy this link: <br>
                <a href="${shareUrl}" style="color: #8B5CF6; word-break: break-all;">${shareUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                ${companyName ? `Sent by ${companyName} · ` : ''}Powered by Social Media SaaS
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const resend = getResend();
    if (!resend) {
      console.warn('Resend API key not configured. Skipping email.');
      return { success: false, error: 'Resend API key not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending share created email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (error) {
    console.error('Error in sendShareCreatedEmail:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send email notification when a new comment is received
 */
export async function sendNewCommentEmail(workspaceOwnerEmail, commentData, shareTitle) {
  try {
    const { authorName, authorEmail, comment, postContent, createdAt } = commentData;

    const subject = `New comment on shared calendar: ${shareTitle}`;

    const truncatedPostContent = postContent
      ? (postContent.length > 100 ? postContent.substring(0, 97) + '...' : postContent)
      : 'Post';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                💬 New Comment Received
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #374151;">
                Someone commented on your shared calendar <strong>${shareTitle}</strong>
              </p>

              <!-- Comment Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-left: 4px solid #8B5CF6; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="margin-bottom: 12px;">
                      <strong style="font-size: 14px; color: #1f2937;">${authorName}</strong>
                      <span style="font-size: 12px; color: #9ca3af; margin-left: 8px;">${authorEmail}</span>
                    </div>
                    <p style="margin: 0; font-size: 14px; line-height: 20px; color: #374151; white-space: pre-wrap;">
                      ${comment}
                    </p>
                    <p style="margin: 12px 0 0; font-size: 12px; color: #9ca3af;">
                      ${new Date(createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Post Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                      Post
                    </p>
                    <p style="margin: 8px 0 0; font-size: 14px; color: #374151;">
                      ${truncatedPostContent}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/calendar/shares" style="display: inline-block; padding: 14px 32px; background-color: #8B5CF6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      View in Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Powered by Social Media SaaS
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const resend = getResend();
    if (!resend) {
      console.warn('Resend API key not configured. Skipping email.');
      return { success: false, error: 'Resend API key not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: workspaceOwnerEmail,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending new comment email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (error) {
    console.error('Error in sendNewCommentEmail:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send email notification when an approval/rejection is received
 */
export async function sendApprovalReceivedEmail(workspaceOwnerEmail, approvalData, shareTitle) {
  try {
    const { approverName, approverEmail, approved, feedback, postContent, createdAt } = approvalData;

    const subject = `Post ${approved ? 'approved' : 'rejected'} on ${shareTitle}`;

    const truncatedPostContent = postContent
      ? (postContent.length > 100 ? postContent.substring(0, 97) + '...' : postContent)
      : 'Post';

    const statusColor = approved ? '#10b981' : '#ef4444';
    const statusBg = approved ? '#d1fae5' : '#fee2e2';
    const statusText = approved ? 'APPROVED' : 'REJECTED';
    const statusIcon = approved ? '✅' : '❌';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}DD 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                ${statusIcon} Post ${statusText}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #374151;">
                Someone ${approved ? 'approved' : 'rejected'} a post on your shared calendar <strong>${shareTitle}</strong>
              </p>

              <!-- Status Badge -->
              <table role="presentation" style="margin: 20px 0;">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 8px 16px; background-color: ${statusBg}; color: ${statusColor}; border-radius: 6px; font-weight: 600; font-size: 14px;">
                      ${statusIcon} ${statusText}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Approval Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-left: 4px solid ${statusColor}; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="margin-bottom: 12px;">
                      <strong style="font-size: 14px; color: #1f2937;">${approverName}</strong>
                      <span style="font-size: 12px; color: #9ca3af; margin-left: 8px;">${approverEmail}</span>
                    </div>
                    ${feedback ? `
                    <div style="margin: 12px 0;">
                      <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">
                        Feedback
                      </p>
                      <p style="margin: 0; font-size: 14px; line-height: 20px; color: #374151; white-space: pre-wrap;">
                        ${feedback}
                      </p>
                    </div>
                    ` : ''}
                    <p style="margin: 12px 0 0; font-size: 12px; color: #9ca3af;">
                      ${new Date(createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Post Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                      Post
                    </p>
                    <p style="margin: 8px 0 0; font-size: 14px; color: #374151;">
                      ${truncatedPostContent}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/calendar/shares" style="display: inline-block; padding: 14px 32px; background-color: #8B5CF6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      View in Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Powered by Social Media SaaS
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const resend = getResend();
    if (!resend) {
      console.warn('Resend API key not configured. Skipping email.');
      return { success: false, error: 'Resend API key not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: workspaceOwnerEmail,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending approval received email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (error) {
    console.error('Error in sendApprovalReceivedEmail:', error);
    return { success: false, error: error.message };
  }
}
