'use client';

import { useState } from 'react';
import styled from 'styled-components';

export default function EmailPreviewPage() {
  // Comprehensive sample data with multiple posts
  const sampleData = {
    shareTitle: "Q1 2025 Social Media Calendar",

    approvals: [
      {
        postContent: "🎉 New product launch! Check out our latest collection. Link in bio! #NewCollection #Fashion #Style",
        postImage: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop",
        postType: "image",
        approverName: "Sarah Johnson",
        approverEmail: "sarah.j@company.com",
        feedback: "Approved! The content strategy looks solid and aligns well with our brand voice.",
        createdAt: new Date().toISOString(),
      },
      {
        postContent: "✨ Behind the scenes of our photoshoot today! Stay tuned for more amazing content 📸",
        postImage: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400&h=400&fit=crop",
        postType: "video",
        approverName: "Mike Chen",
        approverEmail: "mike.c@company.com",
        feedback: "Love it! Great behind-the-scenes content.",
        createdAt: new Date().toISOString(),
      },
    ],

    comments: [
      {
        postContent: "🌟 Weekly Motivation: Success is not final, failure is not fatal. #MondayMotivation #Inspiration",
        postImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop",
        postType: "image",
        authorName: "John Smith",
        authorEmail: "john.s@company.com",
        comment: "This looks great! Could we add more video content in March? Also, let's consider using different hashtags.",
        createdAt: new Date().toISOString(),
      },
      {
        postContent: "🚀 We're hiring! Join our amazing team as a Social Media Manager. Apply now! #JobOpening #Careers",
        postImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop",
        postType: "image",
        authorName: "Emily Rodriguez",
        authorEmail: "emily.r@company.com",
        comment: "Can we update the job description link? Also, should we boost this post?",
        createdAt: new Date().toISOString(),
      },
    ],

    rejections: [
      {
        postContent: "🔥 Hot take: The best marketing strategy is simply being helpful. Stop selling. Start solving.",
        postImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop",
        postType: "image",
        approverName: "Mike Davis",
        approverEmail: "mike.d@company.com",
        feedback: "I think we need to revise the messaging. It doesn't quite match our brand guidelines. Can we schedule a call?",
        createdAt: new Date().toISOString(),
      },
      {
        postContent: "💡 Pro tip: Use Instagram Reels to increase your engagement by 300%! #SocialMediaTips #Marketing",
        postImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop",
        postType: "video",
        approverName: "Lisa Thompson",
        approverEmail: "lisa.t@company.com",
        feedback: "The statistics need to be fact-checked. Let's revise with accurate data.",
        createdAt: new Date().toISOString(),
      },
    ],
  };

  const renderFeedbackEmail = () => {
    const data = sampleData;

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    // Helper to render a 2-column grid of posts
    const renderPostGrid = (items, type) => {
      return items.map((item, index) => {
        const isVideo = item.postType === 'video';
        const truncatedContent = item.postContent.length > 80
          ? item.postContent.substring(0, 77) + '...'
          : item.postContent;

        const name = type === 'comment' ? item.authorName : item.approverName;
        const email = type === 'comment' ? item.authorEmail : item.approverEmail;
        const feedback = type === 'comment' ? item.comment : item.feedback;

        return `
          <tr>
            <td style="width: 50%; padding: 8px; vertical-align: top;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="position: relative;">
                    <img src="${item.postImage}" alt="Post" style="width: 100%; height: 180px; object-fit: cover; display: block;" />
                    ${isVideo ? `
                      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 48px; height: 48px; background: rgba(0,0,0,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <div style="width: 0; height: 0; border-left: 16px solid white; border-top: 10px solid transparent; border-bottom: 10px solid transparent; margin-left: 4px;"></div>
                      </div>
                    ` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px;">
                    <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.4; color: #374151;">
                      ${truncatedContent}
                    </p>
                    <div style="padding: 10px; background: #ffffff; border-radius: 6px; margin-top: 8px;">
                      <div style="margin-bottom: 6px;">
                        <strong style="font-size: 12px; color: #1f2937;">${name}</strong>
                        <span style="font-size: 11px; color: #9ca3af; margin-left: 6px;">${email}</span>
                      </div>
                      <p style="margin: 0; font-size: 12px; line-height: 1.4; color: #374151;">
                        ${feedback}
                      </p>
                      <p style="margin: 6px 0 0; font-size: 10px; color: #9ca3af;">
                        ${formatDate(item.createdAt)}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
            ${index % 2 === 0 && index + 1 < items.length ? `
              <td style="width: 50%; padding: 8px; vertical-align: top;">
                <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="position: relative;">
                      <img src="${items[index + 1].postImage}" alt="Post" style="width: 100%; height: 180px; object-fit: cover; display: block;" />
                      ${items[index + 1].postType === 'video' ? `
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 48px; height: 48px; background: rgba(0,0,0,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                          <div style="width: 0; height: 0; border-left: 16px solid white; border-top: 10px solid transparent; border-bottom: 10px solid transparent; margin-left: 4px;"></div>
                        </div>
                      ` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px;">
                      <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.4; color: #374151;">
                        ${items[index + 1].postContent.length > 80 ? items[index + 1].postContent.substring(0, 77) + '...' : items[index + 1].postContent}
                      </p>
                      <div style="padding: 10px; background: #ffffff; border-radius: 6px; margin-top: 8px;">
                        <div style="margin-bottom: 6px;">
                          <strong style="font-size: 12px; color: #1f2937;">${type === 'comment' ? items[index + 1].authorName : items[index + 1].approverName}</strong>
                          <span style="font-size: 11px; color: #9ca3af; margin-left: 6px;">${type === 'comment' ? items[index + 1].authorEmail : items[index + 1].approverEmail}</span>
                        </div>
                        <p style="margin: 0; font-size: 12px; line-height: 1.4; color: #374151;">
                          ${type === 'comment' ? items[index + 1].comment : items[index + 1].feedback}
                        </p>
                        <p style="margin: 6px 0 0; font-size: 10px; color: #9ca3af;">
                          ${formatDate(items[index + 1].createdAt)}
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            ` : index % 2 === 0 ? '<td style="width: 50%;"></td>' : ''}
          </tr>
        `;
      }).filter((_, index) => index % 2 === 0).join('');
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feedback Summary: ${data.shareTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 700px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                📊 Feedback Summary
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                ${data.shareTitle}
              </p>
            </td>
          </tr>

          <!-- Summary Stats -->
          <tr>
            <td style="padding: 24px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 33.33%; text-align: center; padding: 16px; background: #d1fae5; border-radius: 8px;">
                    <div style="font-size: 28px; font-weight: 700; color: #10b981; margin-bottom: 4px;">
                      ${data.approvals.length}
                    </div>
                    <div style="font-size: 12px; color: #059669; font-weight: 600; text-transform: uppercase;">
                      Approvals
                    </div>
                  </td>
                  <td style="width: 33.33%; text-align: center; padding: 16px; background: #e0e7ff; border-radius: 8px;">
                    <div style="font-size: 28px; font-weight: 700; color: #8B5CF6; margin-bottom: 4px;">
                      ${data.comments.length}
                    </div>
                    <div style="font-size: 12px; color: #7C3AED; font-weight: 600; text-transform: uppercase;">
                      Comments
                    </div>
                  </td>
                  <td style="width: 33.33%; text-align: center; padding: 16px; background: #fee2e2; border-radius: 8px;">
                    <div style="font-size: 28px; font-weight: 700; color: #ef4444; margin-bottom: 4px;">
                      ${data.rejections.length}
                    </div>
                    <div style="font-size: 12px; color: #dc2626; font-weight: 600; text-transform: uppercase;">
                      Rejections
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${data.approvals.length > 0 ? `
          <!-- Approvals Section -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 16px 0; border-bottom: 2px solid #10b981;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #10b981; display: flex; align-items: center;">
                      ✅ Approvals (${data.approvals.length})
                    </h2>
                  </td>
                </tr>
              </table>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                ${renderPostGrid(data.approvals, 'approval')}
              </table>
            </td>
          </tr>
          ` : ''}

          ${data.comments.length > 0 ? `
          <!-- Comments Section -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 16px 0; border-bottom: 2px solid #8B5CF6;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #8B5CF6; display: flex; align-items: center;">
                      💬 Comments (${data.comments.length})
                    </h2>
                  </td>
                </tr>
              </table>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                ${renderPostGrid(data.comments, 'comment')}
              </table>
            </td>
          </tr>
          ` : ''}

          ${data.rejections.length > 0 ? `
          <!-- Rejections Section -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 16px 0; border-bottom: 2px solid #ef4444;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #ef4444; display: flex; align-items: center;">
                      ❌ Rejections (${data.rejections.length})
                    </h2>
                  </td>
                </tr>
              </table>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                ${renderPostGrid(data.rejections, 'rejection')}
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center">
                    <a href="#" style="display: inline-block; padding: 14px 32px; background-color: #8B5CF6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      View Full Dashboard
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
  };

  return (
    <PageContainer>
      <Header>
        <Title>📧 Email Notification Preview</Title>
        <Description>Preview comprehensive feedback email with all approvals, comments, and rejections</Description>
      </Header>

      <PreviewContainer>
        <EmailFrame
          srcDoc={renderFeedbackEmail()}
          title="Email Preview"
        />
      </PreviewContainer>
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
  max-width: 1200px;
  margin: 0 auto 40px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 12px 0;
`;

const Description = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const PreviewContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const EmailFrame = styled.iframe`
  width: 100%;
  height: 1000px;
  border: none;
`;
