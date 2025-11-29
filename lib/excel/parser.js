/**
 * Excel Parser Utilities
 *
 * Parse Excel files for bulk post import.
 */

import * as XLSX from 'xlsx';

/**
 * Expected column names in the Excel template
 */
export const EXPECTED_COLUMNS = [
  'content',
  'scheduled_date',
  'scheduled_time',
  'platforms',
  'media_urls',
  'status',
];

/**
 * Parse Excel file buffer to JSON
 */
export function parseExcelFile(buffer) {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('Excel file is empty');
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
    });

    if (jsonData.length === 0) {
      throw new Error('Excel file has no data');
    }

    // Extract headers and rows
    const headers = jsonData[0].map(h => String(h).trim().toLowerCase());
    const rows = jsonData.slice(1);

    // Validate headers
    const missingColumns = EXPECTED_COLUMNS.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Map rows to objects
    const posts = rows.map((row, index) => {
      const post = {};

      headers.forEach((header, colIndex) => {
        post[header] = row[colIndex] !== undefined ? String(row[colIndex]).trim() : '';
      });

      post._rowNumber = index + 2; // +2 for header row and 0-based index
      return post;
    });

    // Filter out completely empty rows
    const nonEmptyPosts = posts.filter(post => {
      return EXPECTED_COLUMNS.some(col => post[col] && post[col].length > 0);
    });

    return {
      success: true,
      posts: nonEmptyPosts,
      totalRows: nonEmptyPosts.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to parse Excel file',
      posts: [],
      totalRows: 0,
    };
  }
}

/**
 * Parse platforms string
 * Accepts: "instagram, facebook" or "instagram,facebook" or "instagram;facebook"
 */
export function parsePlatforms(platformsStr) {
  if (!platformsStr || typeof platformsStr !== 'string') {
    return [];
  }

  const platforms = platformsStr
    .toLowerCase()
    .split(/[,;]/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  return platforms;
}

/**
 * Parse media URLs string
 * Accepts: "url1, url2" or "url1\nurl2" or "url1;url2"
 */
export function parseMediaUrls(mediaStr) {
  if (!mediaStr || typeof mediaStr !== 'string') {
    return [];
  }

  const urls = mediaStr
    .split(/[,;\n]/)
    .map(url => url.trim())
    .filter(url => url.length > 0);

  return urls;
}

/**
 * Parse date string
 * Accepts: "2024-01-15", "01/15/2024", "15-01-2024", Excel serial dates
 */
export function parseDate(dateStr) {
  if (!dateStr) {
    return null;
  }

  // Handle Excel serial dates (number)
  if (typeof dateStr === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + dateStr * 86400000);
    return date;
  }

  // Handle string dates
  const str = String(dateStr).trim();

  // Try ISO format first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return new Date(str);
  }

  // Try MM/DD/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [month, day, year] = str.split('/');
    return new Date(year, month - 1, day);
  }

  // Try DD-MM-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(str)) {
    const [day, month, year] = str.split('-');
    return new Date(year, month - 1, day);
  }

  // Try parsing as-is
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    return date;
  }

  return null;
}

/**
 * Parse time string
 * Accepts: "14:30", "2:30 PM", "14:30:00", Excel serial times
 */
export function parseTime(timeStr) {
  if (!timeStr) {
    return null;
  }

  // Handle Excel serial times (decimal number between 0 and 1)
  if (typeof timeStr === 'number' && timeStr < 1) {
    const totalMinutes = Math.round(timeStr * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const str = String(timeStr).trim();

  // Try HH:MM or HH:MM:SS format
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
    const [hours, minutes] = str.split(':');
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // Try H:MM AM/PM format
  const ampmMatch = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1]);
    const minutes = ampmMatch[2];
    const meridiem = ampmMatch[3].toUpperCase();

    if (meridiem === 'PM' && hours < 12) {
      hours += 12;
    }
    if (meridiem === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  return null;
}

/**
 * Combine date and time into ISO string
 */
export function combineDateAndTime(dateStr, timeStr) {
  const date = parseDate(dateStr);
  const time = parseTime(timeStr);

  if (!date) {
    return null;
  }

  if (time) {
    const [hours, minutes] = time.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  } else {
    // Default to noon if no time specified
    date.setHours(12, 0, 0, 0);
  }

  return date.toISOString();
}

/**
 * Generate Excel template
 */
export function generateTemplate() {
  const headers = [
    'content',
    'scheduled_date',
    'scheduled_time',
    'platforms',
    'media_urls',
    'status',
  ];

  const exampleData = [
    [
      'Check out our latest product! 🚀\n\nAvailable now on our website.',
      '2024-12-01',
      '14:30',
      'instagram, facebook',
      'https://example.com/image1.jpg',
      'scheduled',
    ],
    [
      'Behind the scenes at our office today! 💼',
      '2024-12-02',
      '10:00',
      'linkedin',
      '',
      'draft',
    ],
    [
      'Weekend vibes! 🌴 What are your plans?',
      '2024-12-07',
      '09:00',
      'instagram, facebook, linkedin',
      'https://example.com/image2.jpg, https://example.com/image3.jpg',
      'scheduled',
    ],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exampleData]);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 50 }, // content
    { wch: 15 }, // scheduled_date
    { wch: 15 }, // scheduled_time
    { wch: 30 }, // platforms
    { wch: 50 }, // media_urls
    { wch: 12 }, // status
  ];

  // Add comments/notes
  if (!worksheet['!comments']) {
    worksheet['!comments'] = [];
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Posts');

  return workbook;
}

/**
 * Convert posts data to Excel workbook
 */
export function postsToWorkbook(posts) {
  const headers = [
    'content',
    'scheduled_date',
    'scheduled_time',
    'platforms',
    'media_urls',
    'status',
  ];

  const rows = posts.map(post => {
    const scheduledDate = post.scheduled_for
      ? new Date(post.scheduled_for).toISOString().split('T')[0]
      : '';

    const scheduledTime = post.scheduled_for
      ? new Date(post.scheduled_for).toTimeString().slice(0, 5)
      : '';

    const platforms = Array.isArray(post.platforms)
      ? post.platforms.join(', ')
      : '';

    const mediaUrls = post.post_media && Array.isArray(post.post_media)
      ? post.post_media.map(m => m.file_url).join(', ')
      : '';

    return [
      post.content || '',
      scheduledDate,
      scheduledTime,
      platforms,
      mediaUrls,
      post.status || 'draft',
    ];
  });

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 50 }, // content
    { wch: 15 }, // scheduled_date
    { wch: 15 }, // scheduled_time
    { wch: 30 }, // platforms
    { wch: 50 }, // media_urls
    { wch: 12 }, // status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Posts');

  return workbook;
}
