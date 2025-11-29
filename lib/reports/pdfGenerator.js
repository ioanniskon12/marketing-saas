/**
 * White-Label PDF Report Generator
 *
 * Generate branded PDF reports for analytics data.
 */

import PdfPrinter from 'pdfmake';

// Define fonts for pdfmake
const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

/**
 * Generate analytics report PDF
 */
export async function generateAnalyticsReport(data, branding = {}) {
  const {
    workspaceName,
    reportTitle = 'Social Media Analytics Report',
    period,
    summary,
    timeline,
    topPosts,
    competitors = [],
  } = data;

  const {
    logo = null,
    primaryColor = '#6366f1',
    companyName = workspaceName,
    hideWatermark = false,
  } = branding;

  const printer = new PdfPrinter(fonts);

  // Build document definition
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],

    header: (currentPage) => {
      if (currentPage === 1) return null;

      return {
        margin: [40, 20, 40, 20],
        columns: [
          {
            text: companyName,
            style: 'headerText',
          },
          {
            text: `Page ${currentPage}`,
            alignment: 'right',
            style: 'headerText',
          },
        ],
      };
    },

    footer: (currentPage, pageCount) => {
      const elements = [
        {
          text: `Generated on ${new Date().toLocaleDateString()}`,
          alignment: 'center',
          style: 'footerText',
        },
      ];

      if (!hideWatermark) {
        elements.push({
          text: 'Powered by YourSaaS',
          alignment: 'center',
          style: 'watermark',
          margin: [0, 5, 0, 0],
        });
      }

      return {
        margin: [40, 20, 40, 20],
        stack: elements,
      };
    },

    content: [
      // Cover page
      {
        stack: [
          logo
            ? { image: logo, width: 100, alignment: 'center', margin: [0, 0, 0, 40] }
            : { text: companyName, style: 'companyName', alignment: 'center', margin: [0, 0, 0, 40] },

          { text: reportTitle, style: 'title', alignment: 'center', margin: [0, 0, 0, 20] },

          { text: `${period.start} - ${period.end}`, style: 'subtitle', alignment: 'center', margin: [0, 0, 0, 60] },

          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  { text: 'Report Period', style: 'tableHeader' },
                  { text: 'Key Metrics', style: 'tableHeader' },
                ],
                [
                  { text: `${period.days} days`, style: 'tableCell' },
                  { text: `${summary.postsPublished || 0} posts published`, style: 'tableCell' },
                ],
              ],
            },
            layout: 'lightHorizontalLines',
          },
        ],
        pageBreak: 'after',
      },

      // Executive Summary
      {
        text: 'Executive Summary',
        style: 'sectionHeader',
        pageBreak: 'before',
      },

      {
        columns: [
          {
            width: '25%',
            stack: [
              { text: 'Followers', style: 'metricLabel' },
              { text: formatNumber(summary.followers), style: 'metricValue', color: primaryColor },
              summary.followersGrowth
                ? { text: `${summary.followersGrowth > 0 ? '+' : ''}${summary.followersGrowth}%`, style: 'metricChange', color: summary.followersGrowth > 0 ? '#10b981' : '#ef4444' }
                : {},
            ],
          },
          {
            width: '25%',
            stack: [
              { text: 'Engagement', style: 'metricLabel' },
              { text: formatNumber(summary.totalEngagement), style: 'metricValue', color: primaryColor },
            ],
          },
          {
            width: '25%',
            stack: [
              { text: 'Avg Rate', style: 'metricLabel' },
              { text: `${summary.avgEngagementRate}%`, style: 'metricValue', color: primaryColor },
            ],
          },
          {
            width: '25%',
            stack: [
              { text: 'Reach', style: 'metricLabel' },
              { text: formatNumber(summary.totalReach), style: 'metricValue', color: primaryColor },
            ],
          },
        ],
        columnGap: 10,
        margin: [0, 20, 0, 40],
      },

      // Performance Overview
      {
        text: 'Performance Overview',
        style: 'sectionHeader',
        margin: [0, 20, 0, 10],
      },

      {
        text: 'Follower Growth Trend',
        style: 'subSectionHeader',
        margin: [0, 0, 0, 10],
      },

      timeline && timeline.length > 0 ? {
        table: {
          widths: ['auto', '*', '*', '*', '*'],
          headerRows: 1,
          body: [
            [
              { text: 'Date', style: 'tableHeader' },
              { text: 'Followers', style: 'tableHeader' },
              { text: 'Engagement', style: 'tableHeader' },
              { text: 'Reach', style: 'tableHeader' },
              { text: 'Rate', style: 'tableHeader' },
            ],
            ...timeline.slice(0, 10).map(day => [
              { text: day.date, style: 'tableCell' },
              { text: formatNumber(day.followers), style: 'tableCell' },
              { text: formatNumber(day.engagement), style: 'tableCell' },
              { text: formatNumber(day.reach), style: 'tableCell' },
              { text: `${day.engagementRate}%`, style: 'tableCell' },
            ]),
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20],
      } : { text: 'No timeline data available', style: 'noData' },

      // Top Performing Posts
      topPosts && topPosts.length > 0 ? [
        {
          text: 'Top Performing Posts',
          style: 'sectionHeader',
          pageBreak: 'before',
        },

        ...topPosts.slice(0, 5).map((post, index) => ({
          stack: [
            { text: `#${index + 1} Post`, style: 'postRank', margin: [0, 10, 0, 5] },
            { text: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''), style: 'postContent', margin: [0, 0, 0, 10] },
            {
              columns: [
                { text: `❤️ ${formatNumber(post.likes)}`, style: 'postMetric' },
                { text: `💬 ${formatNumber(post.comments)}`, style: 'postMetric' },
                { text: `🔄 ${formatNumber(post.shares)}`, style: 'postMetric' },
                { text: `📊 ${post.engagementRate}%`, style: 'postMetric' },
              ],
              columnGap: 15,
            },
            { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 0.5, lineColor: '#e5e7eb' }] },
          ],
        })),
      ] : [],

      // Competitor Comparison (if available)
      competitors && competitors.length > 0 ? [
        {
          text: 'Competitor Comparison',
          style: 'sectionHeader',
          pageBreak: 'before',
        },

        {
          table: {
            widths: ['*', 'auto', 'auto', 'auto'],
            headerRows: 1,
            body: [
              [
                { text: 'Competitor', style: 'tableHeader' },
                { text: 'Followers', style: 'tableHeader' },
                { text: 'Engagement', style: 'tableHeader' },
                { text: 'Rate', style: 'tableHeader' },
              ],
              ...competitors.map(comp => [
                { text: comp.name, style: 'tableCell' },
                { text: formatNumber(comp.followers || 0), style: 'tableCell' },
                { text: formatNumber(comp.avgEngagement || 0), style: 'tableCell' },
                { text: `${comp.engagementRate || 0}%`, style: 'tableCell' },
              ]),
            ],
          },
          layout: 'lightHorizontalLines',
        },
      ] : [],

      // Recommendations
      {
        text: 'Recommendations',
        style: 'sectionHeader',
        pageBreak: 'before',
      },

      {
        ul: [
          'Continue posting during peak engagement times',
          'Focus on content types that generate high engagement',
          'Maintain consistent posting schedule',
          'Monitor competitor activity for insights',
          'Engage with audience comments and messages',
        ],
        style: 'recommendations',
      },
    ],

    styles: {
      companyName: {
        fontSize: 28,
        bold: true,
        color: primaryColor,
      },
      title: {
        fontSize: 24,
        bold: true,
        color: '#1f2937',
      },
      subtitle: {
        fontSize: 14,
        color: '#6b7280',
      },
      sectionHeader: {
        fontSize: 18,
        bold: true,
        color: '#1f2937',
        margin: [0, 20, 0, 10],
      },
      subSectionHeader: {
        fontSize: 14,
        bold: true,
        color: '#4b5563',
      },
      metricLabel: {
        fontSize: 10,
        color: '#6b7280',
        margin: [0, 0, 0, 5],
      },
      metricValue: {
        fontSize: 24,
        bold: true,
        margin: [0, 0, 0, 5],
      },
      metricChange: {
        fontSize: 12,
        bold: true,
      },
      tableHeader: {
        fillColor: '#f3f4f6',
        bold: true,
        fontSize: 10,
        color: '#374151',
        margin: [5, 5, 5, 5],
      },
      tableCell: {
        fontSize: 10,
        color: '#1f2937',
        margin: [5, 5, 5, 5],
      },
      postRank: {
        fontSize: 12,
        bold: true,
        color: primaryColor,
      },
      postContent: {
        fontSize: 10,
        color: '#374151',
        lineHeight: 1.5,
      },
      postMetric: {
        fontSize: 9,
        color: '#6b7280',
      },
      recommendations: {
        fontSize: 11,
        color: '#374151',
        lineHeight: 1.6,
      },
      headerText: {
        fontSize: 9,
        color: '#6b7280',
      },
      footerText: {
        fontSize: 8,
        color: '#9ca3af',
      },
      watermark: {
        fontSize: 7,
        color: '#d1d5db',
      },
      noData: {
        fontSize: 10,
        color: '#9ca3af',
        italics: true,
      },
    },

    defaultStyle: {
      font: 'Roboto',
    },
  };

  // Create PDF document
  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  return new Promise((resolve, reject) => {
    const chunks = [];

    pdfDoc.on('data', (chunk) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);

    pdfDoc.end();
  });
}

/**
 * Format numbers with K, M, B suffixes
 */
function formatNumber(num) {
  if (num === null || num === undefined) return '0';

  const absNum = Math.abs(num);

  if (absNum >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (absNum >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (absNum >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }

  return num.toLocaleString();
}

/**
 * Generate competitor comparison report
 */
export async function generateCompetitorReport(data, branding = {}) {
  const { workspaceName, competitors, period } = data;
  const { primaryColor = '#6366f1', companyName = workspaceName } = branding;

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],

    content: [
      { text: 'Competitor Analysis Report', style: 'title', alignment: 'center', margin: [0, 0, 0, 40] },

      {
        text: 'Competitor Overview',
        style: 'sectionHeader',
      },

      {
        table: {
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          headerRows: 1,
          body: [
            [
              { text: 'Competitor', style: 'tableHeader' },
              { text: 'Platform', style: 'tableHeader' },
              { text: 'Followers', style: 'tableHeader' },
              { text: 'Posts', style: 'tableHeader' },
              { text: 'Engagement', style: 'tableHeader' },
            ],
            ...competitors.map(comp => [
              { text: comp.name, style: 'tableCell' },
              { text: comp.platform, style: 'tableCell' },
              { text: formatNumber(comp.followers || 0), style: 'tableCell' },
              { text: formatNumber(comp.posts || 0), style: 'tableCell' },
              { text: `${comp.engagementRate || 0}%`, style: 'tableCell' },
            ]),
          ],
        },
        layout: 'lightHorizontalLines',
      },
    ],

    styles: {
      title: {
        fontSize: 24,
        bold: true,
        color: primaryColor,
      },
      sectionHeader: {
        fontSize: 18,
        bold: true,
        color: '#1f2937',
        margin: [0, 20, 0, 10],
      },
      tableHeader: {
        fillColor: '#f3f4f6',
        bold: true,
        fontSize: 10,
        color: '#374151',
        margin: [5, 5, 5, 5],
      },
      tableCell: {
        fontSize: 10,
        color: '#1f2937',
        margin: [5, 5, 5, 5],
      },
    },

    defaultStyle: {
      font: 'Roboto',
    },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  return new Promise((resolve, reject) => {
    const chunks = [];

    pdfDoc.on('data', (chunk) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);

    pdfDoc.end();
  });
}
