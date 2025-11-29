'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Mail, Send, AlertCircle, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

export default function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('pending-approval');

  const templates = [
    {
      id: 'pending-approval',
      name: 'Pending Approval Reminder',
      description: 'Reminds clients to review and approve shared plans',
      icon: Clock,
      color: '#f59e0b',
    },
    {
      id: 'approaching-deadline',
      name: 'Approaching Deadline',
      description: 'Warns when a shared plan is about to expire',
      icon: AlertCircle,
      color: '#ef4444',
    },
    {
      id: 'new-comment',
      name: 'New Comment Notification',
      description: 'Notifies when someone comments on a shared plan',
      icon: Mail,
      color: '#8B5CF6',
    },
    {
      id: 'new-approval',
      name: 'New Approval Received',
      description: 'Notifies when a post is approved',
      icon: CheckCircle,
      color: '#10b981',
    },
    {
      id: 'new-rejection',
      name: 'Post Rejected',
      description: 'Notifies when a post is rejected with feedback',
      icon: XCircle,
      color: '#ef4444',
    },
    {
      id: 'plan-expired',
      name: 'Plan Expired',
      description: 'Notifies when a shared plan has expired',
      icon: Calendar,
      color: '#9ca3af',
    },
  ];

  const renderEmailTemplate = (templateId) => {
    const sampleData = {
      clientName: 'Sarah Johnson',
      planName: 'Q1 2025 Social Media Calendar',
      planLink: 'http://localhost:3000/share/plan/demo-123',
      daysLeft: 3,
      postContent: '🎉 New product launch! Check out our latest collection. Link in bio!',
      approverName: 'Mike Davis',
      approverEmail: 'mike.d@client.com',
      feedback: 'I think we need to revise the messaging. It doesn\'t quite match our brand guidelines.',
      commentAuthor: 'Emily Rodriguez',
      commentText: 'Love this direction! Could we add more video content in March?',
    };

    const templates = {
      'pending-approval': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Feedback Is Needed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                ⏰ Your Feedback Is Needed
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #374151;">
                Hi <strong>${sampleData.clientName}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #374151;">
                You still have items waiting for your review in <strong>${sampleData.planName}</strong>.
              </p>

              <!-- Info Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #92400e;">
                      📋 Pending Items
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #78350f;">
                      We're waiting for your approval or feedback on several posts before we can proceed with publishing.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                Please take a moment to review and provide your feedback.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${sampleData.planLink}" style="display: inline-block; padding: 14px 32px; background-color: #f59e0b; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Review Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                Thank you for your time!
              </p>
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
      `,

      'approaching-deadline': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deadline Approaching</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                ⚠️ Deadline Approaching
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #374151;">
                Hi <strong>${sampleData.clientName}</strong>,
              </p>

              <!-- Warning Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #991b1b;">
                      ⏱️ Only ${sampleData.daysLeft} Days Left
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #7f1d1d;">
                      Your shared plan <strong>${sampleData.planName}</strong> will expire in ${sampleData.daysLeft} days. Please review and approve the remaining items before the deadline.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                After the deadline, you'll no longer be able to access or provide feedback on this plan.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${sampleData.planLink}" style="display: inline-block; padding: 14px 32px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Review Before Deadline
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
      `,

      'new-comment': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Comment Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
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
                <strong>${sampleData.commentAuthor}</strong> commented on <strong>${sampleData.planName}</strong>
              </p>

              <!-- Comment Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-left: 4px solid #8B5CF6; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #1f2937;">
                      ${sampleData.commentAuthor}
                    </p>
                    <p style="margin: 0; font-size: 14px; line-height: 20px; color: #374151;">
                      ${sampleData.commentText}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Post Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">
                      Post
                    </p>
                    <p style="margin: 8px 0 0; font-size: 14px; color: #374151;">
                      ${sampleData.postContent}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${sampleData.planLink}" style="display: inline-block; padding: 14px 32px; background-color: #8B5CF6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      View Comment
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
      `,

      'new-approval': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Post Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                ✅ Post Approved!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #374151;">
                Great news! <strong>${sampleData.approverName}</strong> approved a post in <strong>${sampleData.planName}</strong>
              </p>

              <!-- Success Badge -->
              <table role="presentation" style="margin: 20px 0;">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 8px 16px; background-color: #d1fae5; color: #10b981; border-radius: 6px; font-weight: 600; font-size: 14px;">
                      ✅ APPROVED
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Approval Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-left: 4px solid #10b981; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #1f2937;">
                      ${sampleData.approverName}
                    </p>
                    <p style="margin: 0; font-size: 14px; line-height: 20px; color: #374151;">
                      Approved! Great work on this one. Ready to publish.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Post Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">
                      Post
                    </p>
                    <p style="margin: 8px 0 0; font-size: 14px; color: #374151;">
                      ${sampleData.postContent}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${sampleData.planLink}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      View Approval
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
      `,

      'new-rejection': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Post Rejected</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                ❌ Revision Needed
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #374151;">
                <strong>${sampleData.approverName}</strong> requested changes to a post in <strong>${sampleData.planName}</strong>
              </p>

              <!-- Status Badge -->
              <table role="presentation" style="margin: 20px 0;">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 8px 16px; background-color: #fee2e2; color: #ef4444; border-radius: 6px; font-weight: 600; font-size: 14px;">
                      ❌ REJECTED
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Feedback Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-left: 4px solid #ef4444; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">
                      Feedback
                    </p>
                    <p style="margin: 0; font-size: 14px; line-height: 20px; color: #374151;">
                      ${sampleData.feedback}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Post Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">
                      Post
                    </p>
                    <p style="margin: 8px 0 0; font-size: 14px; color: #374151;">
                      ${sampleData.postContent}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${sampleData.planLink}" style="display: inline-block; padding: 14px 32px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      View Feedback
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
      `,

      'plan-expired': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plan Expired</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                📅 Plan Expired
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #374151;">
                Hi <strong>${sampleData.clientName}</strong>,
              </p>

              <!-- Info Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; border-left: 4px solid #9ca3af; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #374151;">
                      📌 Share Link No Longer Active
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                      The shared plan <strong>${sampleData.planName}</strong> has expired. You can no longer access or provide feedback on this plan.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                If you need access to this plan again, please contact your account manager to request a new share link.
              </p>

              <p style="margin: 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                Thank you for your collaboration!
              </p>
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
      `,
    };

    return templates[templateId] || templates['pending-approval'];
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
  const Icon = selectedTemplateData?.icon || Mail;

  return (
    <PageContainer>
      <Header>
        <Title>📧 Email Templates</Title>
        <Description>Preview all system email notifications (Admin Only)</Description>
      </Header>

      <ContentLayout>
        {/* Sidebar - Template List */}
        <Sidebar>
          <SidebarHeader>
            <SidebarTitle>Email Templates</SidebarTitle>
          </SidebarHeader>

          <TemplateList>
            {templates.map((template) => {
              const TemplateIcon = template.icon;
              return (
                <TemplateCard
                  key={template.id}
                  $active={selectedTemplate === template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <TemplateIcon>
                    <TemplateIcon size={20} color={template.color} />
                  </TemplateIcon>
                  <TemplateInfo>
                    <TemplateName>{template.name}</TemplateName>
                    <TemplateDescription>{template.description}</TemplateDescription>
                  </TemplateInfo>
                </TemplateCard>
              );
            })}
          </TemplateList>
        </Sidebar>

        {/* Main Content - Email Preview */}
        <MainContent>
          <PreviewHeader>
            <PreviewTitle>
              <Icon size={24} color={selectedTemplateData.color} />
              {selectedTemplateData.name}
            </PreviewTitle>
            <PreviewDescription>{selectedTemplateData.description}</PreviewDescription>
          </PreviewHeader>

          <EmailPreview>
            <EmailFrame
              srcDoc={renderEmailTemplate(selectedTemplate)}
              title="Email Preview"
            />
          </EmailPreview>
        </MainContent>
      </ContentLayout>
    </PageContainer>
  );
}

// Styled Components

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background.default};
  padding: 40px 20px;
`;

const Header = styled.div`
  max-width: 1600px;
  margin: 0 auto 40px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const Description = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const ContentLayout = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SidebarHeader = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const SidebarTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const TemplateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TemplateCard = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  background: ${props => props.$active
    ? props.theme.colors.background.elevated
    : props.theme.colors.background.paper};
  border: 2px solid ${props => props.$active
    ? props.theme.colors.primary.main
    : props.theme.colors.border.default};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.background.elevated};
  }
`;

const TemplateIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TemplateInfo = styled.div`
  flex: 1;
`;

const TemplateName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const TemplateDescription = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
`;

const MainContent = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PreviewHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const PreviewTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const PreviewDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const EmailPreview = styled.div``;

const EmailFrame = styled.iframe`
  width: 100%;
  height: 800px;
  border: none;
`;
