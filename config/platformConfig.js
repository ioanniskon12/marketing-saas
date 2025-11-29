/**
 * Multi-Platform Social Media Configuration
 *
 * Includes default sizes, prompts, and specifications for all supported platforms
 */

export const PLATFORM_CONFIG = {
  instagram: {
    name: 'Instagram',
    icon: 'Instagram',
    color: '#E4405F',
    types: {
      post: {
        name: 'Post',
        description: 'Single image post',
        mediaType: 'image',
        defaultSize: { width: 1080, height: 1350, aspectRatio: '4:5' },
        presets: [
          { name: 'Portrait', width: 1080, height: 1350, aspectRatio: '4:5' },
          { name: 'Square', width: 1080, height: 1080, aspectRatio: '1:1' },
        ],
        formats: ['JPEG', 'PNG', 'WebP'],
        maxFileSize: 8 * 1024 * 1024, // 8 MB
        aiPrompt: `Generate an Instagram post about [TOPIC].

Create a catchy caption with a clear hook, value, and CTA (max 2,200 characters).

Suggest 3–5 relevant hashtags.

Recommend a visual concept (image or lifestyle scene) matching the caption.

Tone: modern, aesthetic, relatable, and on-brand.

Include emoji placement and paragraph breaks for better readability.`,
      },
      carousel: {
        name: 'Carousel',
        description: 'Multi-image post',
        mediaType: 'multiple_images',
        defaultSize: { width: 1080, height: 1350, aspectRatio: '4:5' },
        presets: [
          { name: 'Portrait', width: 1080, height: 1350, aspectRatio: '4:5' },
          { name: 'Square', width: 1080, height: 1080, aspectRatio: '1:1' },
        ],
        formats: ['JPEG', 'PNG', 'WebP'],
        maxFileSize: 8 * 1024 * 1024, // 8 MB per image
        maxSlides: 10,
        aiPrompt: `Generate a 5–7-slide Instagram carousel about [TOPIC].

Each slide should include short text (3–10 words max).

Slide 1: Hook headline.
Slides 2–5: Main content (tips, story, or key points).
Slide 6–7: CTA ("Save this post", "Share with a friend", "Visit the link in bio").

Provide a caption to summarise the carousel.

Suggest hashtags and visual layout style (colour palette, image type, typography).`,
      },
      reel: {
        name: 'Reel',
        description: 'Short video',
        mediaType: 'video',
        defaultSize: { width: 1080, height: 1920, aspectRatio: '9:16' },
        presets: [
          { name: 'Vertical', width: 1080, height: 1920, aspectRatio: '9:16' },
        ],
        formats: ['MP4', 'MOV', 'WebM'],
        maxFileSize: 100 * 1024 * 1024, // 100 MB
        duration: { min: 15, max: 60 },
        aiPrompt: `Generate an Instagram Reel script about [TOPIC].

Duration: 15–30 seconds.

Include: Hook (first 2 seconds), 3–4 short points, closing CTA.

Suggest caption (100–200 characters) with relevant hashtags.

Recommend trending audio or sound category.

Optionally include subtitle text overlay ideas.`,
      },
      story: {
        name: 'Story',
        description: 'Instagram Story',
        mediaType: 'image_or_video',
        defaultSize: { width: 1080, height: 1920, aspectRatio: '9:16' },
        presets: [
          { name: 'Vertical', width: 1080, height: 1920, aspectRatio: '9:16' },
        ],
        formats: ['JPEG', 'PNG', 'MP4', 'MOV'],
        maxFileSize: 100 * 1024 * 1024, // 100 MB
        duration: { max: 15 },
        aiPrompt: `Generate an Instagram Story about [TOPIC].

Include engaging text overlays and sticker suggestions.

Keep it casual and authentic.

Add poll, question, or CTA sticker ideas.`,
      },
    },
  },

  facebook: {
    name: 'Facebook',
    icon: 'Facebook',
    color: '#1877F2',
    types: {
      post: {
        name: 'Image Post',
        description: 'Single image post',
        mediaType: 'image',
        defaultSize: { width: 1200, height: 628, aspectRatio: '1.91:1' },
        presets: [
          { name: 'Landscape', width: 1200, height: 628, aspectRatio: '1.91:1' },
          { name: 'Portrait', width: 1080, height: 1350, aspectRatio: '4:5' },
        ],
        formats: ['JPEG', 'PNG'],
        maxFileSize: 8 * 1024 * 1024, // 8 MB
        aiPrompt: `Generate a Facebook post about [TOPIC].

Write 2–3 short paragraphs with natural emoji use.

Hook in first line (engaging, relatable, or surprising).

Include clear CTA ("Join us," "Learn more," "Shop now").

Suggest visual idea (image, photo, or graphic).`,
      },
      carousel: {
        name: 'Carousel',
        description: 'Multiple images',
        mediaType: 'multiple_images',
        defaultSize: { width: 1080, height: 1080, aspectRatio: '1:1' },
        presets: [
          { name: 'Square', width: 1080, height: 1080, aspectRatio: '1:1' },
        ],
        formats: ['JPEG', 'PNG'],
        maxFileSize: 8 * 1024 * 1024,
        maxSlides: 10,
        aiPrompt: `Generate a Facebook carousel post about [TOPIC].

Create 3–5 slides with engaging visuals and text.

Include a summary caption with CTA.`,
      },
      video: {
        name: 'Video',
        description: 'Video post',
        mediaType: 'video',
        defaultSize: { width: 1080, height: 1920, aspectRatio: '9:16' },
        presets: [
          { name: 'Vertical', width: 1080, height: 1920, aspectRatio: '9:16' },
          { name: 'Square', width: 1080, height: 1080, aspectRatio: '1:1' },
        ],
        formats: ['MP4', 'MOV'],
        maxFileSize: 100 * 1024 * 1024,
        aiPrompt: `Create a short Facebook video script about [TOPIC].

Duration: 30–60 seconds.

Start with an attention-grabber and keep it friendly and energetic.

Include narration or text overlays.

Suggest caption and 3 hashtags.`,
      },
    },
  },

  twitter: {
    name: 'X (Twitter)',
    icon: 'Twitter',
    color: '#1DA1F2',
    types: {
      tweet: {
        name: 'Tweet',
        description: 'Text tweet',
        mediaType: 'text',
        maxLength: 280,
        aiPrompt: `Write 3 tweet variations about [TOPIC].

Max 260 characters each.

Use a catchy hook or thought-provoking statement.

Include optional hashtags (1–2).`,
      },
      image_tweet: {
        name: 'Image Tweet',
        description: 'Tweet with image',
        mediaType: 'image',
        defaultSize: { width: 1200, height: 675, aspectRatio: '16:9' },
        presets: [
          { name: 'Landscape', width: 1200, height: 675, aspectRatio: '16:9' },
        ],
        formats: ['JPEG', 'PNG', 'GIF'],
        maxFileSize: 5 * 1024 * 1024, // 5 MB (GIF < 15 MB)
        maxLength: 280,
        aiPrompt: `Write a tweet about [TOPIC] with an image concept.

Max 260 characters.

Suggest a quote card, stat chart, or visual meme idea (1200×675).

Include 1–2 hashtags.`,
      },
    },
  },

  linkedin: {
    name: 'LinkedIn',
    icon: 'Linkedin',
    color: '#0A66C2',
    types: {
      post: {
        name: 'Post',
        description: 'Professional post',
        mediaType: 'image',
        defaultSize: { width: 1200, height: 1200, aspectRatio: '1:1' },
        presets: [
          { name: 'Square', width: 1200, height: 1200, aspectRatio: '1:1' },
          { name: 'Landscape', width: 1200, height: 627, aspectRatio: '1.91:1' },
        ],
        formats: ['JPEG', 'PNG'],
        maxFileSize: 8 * 1024 * 1024,
        aiPrompt: `Write a LinkedIn post about [TOPIC].

Structure: Hook → Insight → Takeaway → CTA.

Keep tone professional yet approachable.

Use short paragraphs and line breaks.

Suggest relevant hashtags (3–5).

Recommend one clean image or infographic concept.`,
      },
      article: {
        name: 'Article Summary',
        description: 'Article or long-form',
        mediaType: 'text',
        aiPrompt: `Write a LinkedIn article summary about [TOPIC].

Professional tone with clear value proposition.

Include key takeaways and CTA.`,
      },
    },
  },

  youtube: {
    name: 'YouTube',
    icon: 'Youtube',
    color: '#FF0000',
    types: {
      video: {
        name: 'Video',
        description: 'Standard video with thumbnail',
        mediaType: 'video',
        thumbnailRequired: true,
        thumbnailSize: { width: 1280, height: 720, aspectRatio: '16:9' },
        formats: ['MP4', 'MOV'],
        maxFileSize: 2 * 1024 * 1024 * 1024, // 2 GB
        aiPrompt: `Generate YouTube video assets about [TOPIC].

Title: up to 70 characters, high click-through appeal.

Description: 150–200 words, SEO-optimised with keywords.

Include 5–10 keyword tags.

Suggest a 10–15 second intro script (optional).

Recommend thumbnail design idea (emotion, text overlay, colours).`,
      },
      short: {
        name: 'Short',
        description: 'YouTube Short',
        mediaType: 'video',
        defaultSize: { width: 1080, height: 1920, aspectRatio: '9:16' },
        presets: [
          { name: 'Vertical', width: 1080, height: 1920, aspectRatio: '9:16' },
        ],
        formats: ['MP4', 'MOV'],
        maxFileSize: 2 * 1024 * 1024 * 1024,
        duration: { min: 15, max: 60 },
        aiPrompt: `Generate a YouTube Shorts script about [TOPIC].

Duration: 15–60 seconds.

Include on-screen text and voice-over ideas.

Hook in the first 2 seconds.

Add caption and 3 hashtags.`,
      },
    },
  },

  tiktok: {
    name: 'TikTok',
    icon: 'Music',
    color: '#000000',
    types: {
      video: {
        name: 'Video',
        description: 'TikTok video',
        mediaType: 'video',
        defaultSize: { width: 1080, height: 1920, aspectRatio: '9:16' },
        presets: [
          { name: 'Vertical', width: 1080, height: 1920, aspectRatio: '9:16' },
        ],
        formats: ['MP4', 'MOV', 'WebM'],
        maxFileSize: 100 * 1024 * 1024,
        duration: { min: 15, max: 60 },
        aiPrompt: `Create a TikTok video script about [TOPIC].

Duration: 15–30 seconds.

Include a bold hook in the first 2 seconds.

3–5 short lines or actions.

Suggest trending sound or filter category.

Include subtitle text and on-screen captions.

Add engaging caption (100 characters) and 3–5 hashtags.`,
      },
    },
  },
};

/**
 * Get default size for a platform and type
 */
export function getDefaultSize(platform, type) {
  const config = PLATFORM_CONFIG[platform]?.types[type];
  return config?.defaultSize || { width: 1080, height: 1080, aspectRatio: '1:1' };
}

/**
 * Get AI prompt for a platform and type
 */
export function getAIPrompt(platform, type, topic) {
  const config = PLATFORM_CONFIG[platform]?.types[type];
  const prompt = config?.aiPrompt || '';
  return prompt.replace('[TOPIC]', topic);
}

/**
 * Get all presets for a platform and type
 */
export function getPresets(platform, type) {
  return PLATFORM_CONFIG[platform]?.types[type]?.presets || [];
}

/**
 * Validate media dimensions
 */
export function validateDimensions(width, height) {
  const MIN_SIZE = 600;
  const MAX_SIZE = 4096;

  const errors = [];

  if (width < MIN_SIZE || height < MIN_SIZE) {
    errors.push(`Dimensions must be at least ${MIN_SIZE}px on each side`);
  }

  if (width > MAX_SIZE || height > MAX_SIZE) {
    errors.push(`Dimensions cannot exceed ${MAX_SIZE}px on each side`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate aspect ratio from dimensions
 */
export function calculateAspectRatio(width, height) {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * Get recommended size warning
 */
export function getSizeWarning(platform, type, width, height) {
  const config = PLATFORM_CONFIG[platform]?.types[type];
  if (!config?.defaultSize) return null;

  const { width: defWidth, height: defHeight, aspectRatio } = config.defaultSize;
  const currentRatio = width / height;
  const recommendedRatio = defWidth / defHeight;

  // Allow 5% deviation
  if (Math.abs(currentRatio - recommendedRatio) > recommendedRatio * 0.05) {
    return `This size may display cropped on ${PLATFORM_CONFIG[platform].name}. Recommended ${defWidth}×${defHeight} (${aspectRatio}).`;
  }

  return null;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export default PLATFORM_CONFIG;
