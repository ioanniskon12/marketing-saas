/**
 * OpenAI Client Wrapper
 *
 * Handles interactions with OpenAI API for content generation.
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate social media caption
 *
 * @param {Object} options - Generation options
 * @returns {Promise<string[]>} Array of generated captions
 */
export async function generateCaption({
  prompt,
  platforms = [],
  tone = 'professional',
  includeHashtags = true,
  includeEmojis = true,
  numberOfVariations = 3,
  maxLength = null,
}) {
  try {
    // Build platform-specific context
    let platformContext = '';
    if (platforms.length > 0) {
      const platformNames = platforms.map(p => {
        if (p.includes('instagram')) return 'Instagram';
        if (p.includes('facebook')) return 'Facebook';
        if (p.includes('linkedin')) return 'LinkedIn';
        return p;
      });
      platformContext = `This caption will be posted on ${platformNames.join(', ')}.`;
    }

    // Build character limit context
    let lengthContext = '';
    if (maxLength) {
      lengthContext = `Keep the caption under ${maxLength} characters.`;
    }

    // Build tone context
    const toneDescriptions = {
      professional: 'professional and business-appropriate',
      casual: 'casual and friendly',
      funny: 'humorous and entertaining',
      inspirational: 'motivational and inspiring',
      educational: 'informative and educational',
    };
    const toneContext = toneDescriptions[tone] || 'engaging and appropriate';

    // Build system prompt
    const systemPrompt = `You are an expert social media copywriter specializing in creating engaging captions for various platforms.

Your task is to generate ${numberOfVariations} different caption variations that are:
- ${toneContext}
- Optimized for social media engagement
${includeHashtags ? '- Include relevant hashtags' : '- Do not include hashtags'}
${includeEmojis ? '- Use appropriate emojis to enhance the message' : '- Do not use emojis'}
${lengthContext}
${platformContext}

Return only the captions, one per line, without numbering or additional formatting.`;

    const userPrompt = `Create ${numberOfVariations} engaging social media captions based on this prompt: ${prompt}`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    // Split into individual captions
    const captions = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim())
      .slice(0, numberOfVariations);

    return captions;
  } catch (error) {
    console.error('OpenAI caption generation error:', error);
    throw new Error('Failed to generate captions');
  }
}

/**
 * Generate hashtags for content
 *
 * @param {Object} options - Generation options
 * @returns {Promise<string[]>} Array of hashtags
 */
export async function generateHashtags({
  content,
  numberOfHashtags = 10,
  platform = 'instagram',
}) {
  try {
    const systemPrompt = `You are a social media expert specializing in hashtag strategy.
Generate ${numberOfHashtags} relevant, trending hashtags for ${platform} based on the content provided.
Return only the hashtags (with #), separated by spaces, without any additional text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Content: ${content}` },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const hashtags = response.choices[0].message.content
      .split(/\s+/)
      .filter(tag => tag.startsWith('#'))
      .slice(0, numberOfHashtags);

    return hashtags;
  } catch (error) {
    console.error('OpenAI hashtag generation error:', error);
    throw new Error('Failed to generate hashtags');
  }
}

/**
 * Improve existing caption
 *
 * @param {Object} options - Improvement options
 * @returns {Promise<string>} Improved caption
 */
export async function improveCaption({
  caption,
  improvements = [],
  tone = 'professional',
}) {
  try {
    const improvementsList = improvements.join(', ') || 'more engaging and effective';

    const systemPrompt = `You are an expert social media copywriter.
Improve the following caption to make it ${improvementsList}.
Maintain a ${tone} tone.
Return only the improved caption without any explanation.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: caption },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI caption improvement error:', error);
    throw new Error('Failed to improve caption');
  }
}

/**
 * Generate caption from image
 *
 * @param {Object} options - Generation options
 * @returns {Promise<string[]>} Array of captions
 */
export async function generateCaptionFromImage({
  imageUrl,
  platforms = [],
  tone = 'professional',
  numberOfVariations = 3,
}) {
  try {
    let platformContext = '';
    if (platforms.length > 0) {
      const platformNames = platforms.map(p => {
        if (p.includes('instagram')) return 'Instagram';
        if (p.includes('facebook')) return 'Facebook';
        if (p.includes('linkedin')) return 'LinkedIn';
        return p;
      });
      platformContext = `for ${platformNames.join(', ')}`;
    }

    const systemPrompt = `You are an expert social media copywriter.
Analyze the image and create ${numberOfVariations} engaging captions ${platformContext}.
Use a ${tone} tone.
Return only the captions, one per line.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    const captions = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim())
      .slice(0, numberOfVariations);

    return captions;
  } catch (error) {
    console.error('OpenAI image caption generation error:', error);
    throw new Error('Failed to generate captions from image');
  }
}

/**
 * Generate platform-specific content using platform configuration prompts
 *
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated content with caption, hashtags, and visual suggestions
 */
export async function generatePlatformContent({
  platform,
  postType,
  topic,
  tone = 'professional',
  customPrompt = null,
}) {
  try {
    // Import platform configuration
    const { getAIPrompt } = await import('@/config/platformConfig');

    // Get the appropriate prompt template
    const promptTemplate = customPrompt || getAIPrompt(platform, postType, topic);

    if (!promptTemplate) {
      throw new Error(`No prompt template found for ${platform} ${postType}`);
    }

    // Build system prompt
    const systemPrompt = `You are an expert social media content strategist specializing in creating engaging, platform-optimized content.

Your task is to generate comprehensive social media content based on the specific requirements provided.

Important guidelines:
- Follow the platform-specific best practices and formatting
- Use a ${tone} tone throughout
- Be creative but authentic
- Optimize for engagement and reach
- Consider the platform's unique features and audience

Return your response in JSON format with the following structure:
{
  "caption": "The main content text",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "visualSuggestion": "Description of recommended visual",
  "additionalNotes": "Any extra tips or suggestions"
}`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: promptTemplate },
      ],
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(content);

    return {
      caption: result.caption || '',
      hashtags: result.hashtags || [],
      visualSuggestion: result.visualSuggestion || '',
      additionalNotes: result.additionalNotes || '',
    };
  } catch (error) {
    console.error('OpenAI platform content generation error:', error);
    throw new Error('Failed to generate platform content');
  }
}

/**
 * Generate multiple content variations for A/B testing
 *
 * @param {Object} options - Generation options
 * @returns {Promise<Array>} Array of content variations
 */
export async function generateContentVariations({
  platform,
  postType,
  topic,
  numberOfVariations = 3,
  tone = 'professional',
}) {
  try {
    const variations = await Promise.all(
      Array.from({ length: numberOfVariations }, async () => {
        return await generatePlatformContent({
          platform,
          postType,
          topic,
          tone,
        });
      })
    );

    return variations;
  } catch (error) {
    console.error('OpenAI variations generation error:', error);
    throw new Error('Failed to generate content variations');
  }
}

/**
 * OpenAI client class
 */
export class OpenAIClient {
  async generateCaption(options) {
    return await generateCaption(options);
  }

  async generateHashtags(options) {
    return await generateHashtags(options);
  }

  async improveCaption(options) {
    return await improveCaption(options);
  }

  async generateCaptionFromImage(options) {
    return await generateCaptionFromImage(options);
  }

  async generatePlatformContent(options) {
    return await generatePlatformContent(options);
  }

  async generateContentVariations(options) {
    return await generateContentVariations(options);
  }
}

export default openai;
