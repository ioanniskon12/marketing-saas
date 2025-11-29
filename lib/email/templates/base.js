/**
 * Base Email Template
 *
 * Provides common HTML structure and styling for all email templates
 */

/**
 * Generate base email template with content
 * @param {Object} options - Template options
 * @param {string} options.content - HTML content to insert
 * @param {string} options.previewText - Preview text shown in email clients
 * @param {string} options.title - Email title
 * @returns {string} Complete HTML email
 */
export function baseTemplate({ content, previewText = '', title = 'SocialFlow' }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    /* Reset styles */
    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    /* Base styles */
    .email-body {
      background-color: #f6f9fc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #1f2937;
    }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .email-header {
      background-color: #6366f1;
      padding: 32px 24px;
      text-align: center;
    }

    .email-logo {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      text-decoration: none;
      margin: 0;
    }

    .email-content {
      background-color: #ffffff;
      padding: 40px 24px;
    }

    .email-footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }

    .button {
      display: inline-block;
      padding: 12px 32px;
      background-color: #6366f1;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 16px 0;
    }

    .button:hover {
      background-color: #4f46e5;
    }

    .button-secondary {
      background-color: #e5e7eb;
      color: #1f2937 !important;
    }

    .button-secondary:hover {
      background-color: #d1d5db;
    }

    h1, h2, h3 {
      color: #1f2937;
      margin-top: 0;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    h2 {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    p {
      margin: 0 0 16px 0;
      color: #4b5563;
    }

    .text-muted {
      color: #6b7280;
      font-size: 14px;
    }

    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 24px 0;
    }

    .stats-container {
      display: flex;
      gap: 16px;
      margin: 24px 0;
    }

    .stat-card {
      flex: 1;
      background-color: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #6b7280;
    }

    .alert-box {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 16px;
      margin: 16px 0;
      border-radius: 4px;
    }

    .alert-box.warning {
      background-color: #fffbeb;
      border-left-color: #f59e0b;
    }

    .alert-box.success {
      background-color: #f0fdf4;
      border-left-color: #10b981;
    }

    .alert-box.info {
      background-color: #eff6ff;
      border-left-color: #3b82f6;
    }

    @media only screen and (max-width: 600px) {
      .email-content {
        padding: 24px 16px;
      }

      .stats-container {
        flex-direction: column;
      }

      h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body class="email-body">
  <!-- Preview text (hidden in email body) -->
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>

  <!-- Email container -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" class="email-body">
    <tr>
      <td align="center" style="padding: 24px 0;">
        <table class="email-container" width="600" cellpadding="0" cellspacing="0" border="0">

          <!-- Header -->
          <tr>
            <td class="email-header">
              <h1 class="email-logo">SocialFlow</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="email-content">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer">
              <p style="margin: 0 0 8px 0;">
                <strong>SocialFlow</strong> - Social Media Management Made Simple
              </p>
              <p style="margin: 0 0 16px 0;">
                <a href="{{APP_URL}}/dashboard" style="color: #6366f1; text-decoration: none;">Dashboard</a> •
                <a href="{{APP_URL}}/settings/notifications" style="color: #6366f1; text-decoration: none;">Email Preferences</a> •
                <a href="{{APP_URL}}/support" style="color: #6366f1; text-decoration: none;">Support</a>
              </p>
              <p style="margin: 0; font-size: 12px;">
                You're receiving this email because you have an account with SocialFlow.<br>
                <a href="{{APP_URL}}/settings/notifications" style="color: #6b7280; text-decoration: underline;">Manage email preferences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Replace template variables
 * @param {string} html - HTML template string
 * @param {Object} variables - Variables to replace
 * @returns {string} HTML with replaced variables
 */
export function replaceVariables(html, variables = {}) {
  let result = html;

  // Default variables
  const defaults = {
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    CURRENT_YEAR: new Date().getFullYear(),
  };

  const allVariables = { ...defaults, ...variables };

  // Replace all {{VARIABLE}} patterns
  Object.entries(allVariables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}
