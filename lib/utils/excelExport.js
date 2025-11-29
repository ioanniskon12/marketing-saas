/**
 * Excel Export Utility
 *
 * Exports posts to Excel format
 */

import * as XLSX from 'xlsx';

/**
 * Export posts to Excel file
 * @param {Array} posts - Array of post objects
 * @param {String} filename - Output filename (without extension)
 */
export function exportPostsToExcel(posts, filename = 'posts') {
  // Prepare data for Excel
  const excelData = [];

  // Add header row
  excelData.push([
    'Post ID',
    'Content',
    'Hashtags',
    'Platforms',
    'Status',
    'Scheduled For',
    'Created At',
  ]);

  // Add post data
  posts.forEach(post => {
    const hashtags = post.hashtags && post.hashtags.length > 0
      ? post.hashtags.map(tag => `#${tag}`).join(' ')
      : '';

    const platforms = post.platforms && Array.isArray(post.platforms)
      ? post.platforms.map(p => p.platform || p).join(', ')
      : '';

    const scheduledFor = post.scheduled_for
      ? new Date(post.scheduled_for).toLocaleString()
      : '';

    const createdAt = post.created_at
      ? new Date(post.created_at).toLocaleString()
      : '';

    excelData.push([
      post.id || '',
      post.content || '',
      hashtags,
      platforms,
      post.status || '',
      scheduledFor,
      createdAt,
    ]);
  });

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 10 },  // Post ID
    { wch: 60 },  // Content
    { wch: 40 },  // Hashtags
    { wch: 30 },  // Platforms
    { wch: 12 },  // Status
    { wch: 20 },  // Scheduled For
    { wch: 20 },  // Created At
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Posts');

  // Generate file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export posts in content planner format (like your example.xlsx)
 * This format has hashtags in first column and multiple post contents in subsequent columns
 */
export function exportPostsPlannerFormat(posts, filename = 'social-media-plan') {
  // Group posts by their hashtag sets
  const postsByHashtags = new Map();

  posts.forEach(post => {
    const hashtagKey = (post.hashtags || []).sort().join(',');
    if (!postsByHashtags.has(hashtagKey)) {
      postsByHashtags.set(hashtagKey, []);
    }
    postsByHashtags.get(hashtagKey).push(post);
  });

  // Prepare data for Excel
  const excelData = [];

  // Add title
  excelData.push(['Social Media Content Plan']);
  excelData.push(['']);
  excelData.push(['POSTS']);
  excelData.push(['']);

  // Add header row
  excelData.push(['Hashtags', 'Post 1', 'Post 2', 'Post 3', 'Post 4', 'Post 5', 'Post 6']);

  // Add posts grouped by hashtags
  postsByHashtags.forEach((groupPosts, hashtagKey) => {
    const hashtags = hashtagKey
      ? hashtagKey.split(',').map(tag => `#${tag}`).join(' ')
      : '';

    const row = [hashtags];

    // Add up to 6 posts in this row
    for (let i = 0; i < Math.min(groupPosts.length, 6); i++) {
      row.push(groupPosts[i].content || '');
    }

    excelData.push(row);
  });

  // If no grouped posts, add individual posts
  if (postsByHashtags.size === 0 && posts.length > 0) {
    // Add each post in its own row
    posts.forEach(post => {
      const hashtags = post.hashtags && post.hashtags.length > 0
        ? post.hashtags.map(tag => `#${tag}`).join(' ')
        : '';

      excelData.push([hashtags, post.content || '']);
    });
  }

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 40 },  // Hashtags
    { wch: 50 },  // Post 1
    { wch: 50 },  // Post 2
    { wch: 50 },  // Post 3
    { wch: 50 },  // Post 4
    { wch: 50 },  // Post 5
    { wch: 50 },  // Post 6
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Content Plan');

  // Generate file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Create and download Excel template for importing posts
 */
export function downloadImportTemplate() {
  const excelData = [];

  // Add title and instructions
  excelData.push(['Social Media Import Template']);
  excelData.push(['']);
  excelData.push(['Instructions: Add hashtags in the first column (e.g., #Marketing #SocialMedia), then add post captions in subsequent columns']);
  excelData.push(['']);
  excelData.push(['Hashtags', 'Post 1', 'Post 2', 'Post 3', 'Post 4', 'Post 5', 'Post 6']);

  // Add example row
  excelData.push([
    '#Example #Template',
    'This is an example post caption. Add your content here!',
    'You can add multiple posts per row with the same hashtags.',
    'Each column represents a different post.',
    '',
    '',
    ''
  ]);

  // Add empty rows for user to fill in
  for (let i = 0; i < 10; i++) {
    excelData.push(['', '', '', '', '', '', '']);
  }

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 40 },  // Hashtags
    { wch: 50 },  // Post 1
    { wch: 50 },  // Post 2
    { wch: 50 },  // Post 3
    { wch: 50 },  // Post 4
    { wch: 50 },  // Post 5
    { wch: 50 },  // Post 6
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

  // Generate file
  XLSX.writeFile(workbook, 'post-import-template.xlsx');
}
