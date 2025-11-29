/**
 * AI Content Generation API Route
 *
 * Generates platform-specific content using AI based on platform configuration.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generatePlatformContent, generateContentVariations } from '@/lib/openai/client';
import { PLATFORM_CONFIG, getDefaultSize, getPresets } from '@/config/platformConfig';

/**
 * POST /api/ai/generate
 * Generate AI content for social media posts
 */
export async function POST(request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI generation is not available. OpenAI API key not configured.' },
        { status: 503 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      platform,
      postType = 'post',
      topic,
      tone = 'professional',
      numberOfVariations = 1,
      customDimensions = null,
      useDefaultSize = true,
    } = body;

    // Validate required fields
    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      );
    }

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Validate platform and post type
    const platformConfig = PLATFORM_CONFIG[platform.toLowerCase()];
    if (!platformConfig) {
      return NextResponse.json(
        { error: `Invalid platform: ${platform}` },
        { status: 400 }
      );
    }

    const typeConfig = platformConfig.types[postType];
    if (!typeConfig) {
      return NextResponse.json(
        { error: `Invalid post type: ${postType} for platform ${platform}` },
        { status: 400 }
      );
    }

    // Generate content
    let result;

    if (numberOfVariations > 1) {
      // Generate multiple variations
      const variations = await generateContentVariations({
        platform: platform.toLowerCase(),
        postType,
        topic,
        numberOfVariations,
        tone,
      });

      result = variations;
    } else {
      // Generate single content
      const content = await generatePlatformContent({
        platform: platform.toLowerCase(),
        postType,
        topic,
        tone,
      });

      result = [content];
    }

    // Get media specifications
    const mediaSpecs = {
      defaultSize: getDefaultSize(platform.toLowerCase(), postType),
      presets: getPresets(platform.toLowerCase(), postType),
      formats: typeConfig.formats,
      maxFileSize: typeConfig.maxFileSize,
      mediaType: typeConfig.mediaType,
    };

    // Apply custom dimensions if provided
    if (!useDefaultSize && customDimensions) {
      mediaSpecs.customSize = {
        width: customDimensions.width,
        height: customDimensions.height,
        aspectRatio: customDimensions.aspectRatio || `${customDimensions.width}:${customDimensions.height}`,
      };
    }

    return NextResponse.json({
      success: true,
      platform: platformConfig.name,
      postType: typeConfig.name,
      topic,
      variations: result,
      mediaSpecs,
      count: result.length,
    });

  } catch (error) {
    console.error('AI generation error:', error);

    // Handle OpenAI specific errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key is invalid or missing' },
        { status: 500 }
      );
    }

    if (error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'AI service quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error.message?.includes('No prompt template')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/generate
 * Get available platforms and post types
 */
export async function GET(request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build available options
    const platforms = Object.keys(PLATFORM_CONFIG).map(platformKey => {
      const config = PLATFORM_CONFIG[platformKey];
      return {
        id: platformKey,
        name: config.name,
        icon: config.icon,
        color: config.color,
        types: Object.keys(config.types).map(typeKey => {
          const type = config.types[typeKey];
          return {
            id: typeKey,
            name: type.name,
            description: type.description,
            mediaType: type.mediaType,
            defaultSize: type.defaultSize,
            presets: type.presets,
            formats: type.formats,
          };
        }),
      };
    });

    return NextResponse.json({
      success: true,
      platforms,
      toneOptions: [
        { value: 'professional', label: 'Professional' },
        { value: 'casual', label: 'Casual' },
        { value: 'funny', label: 'Funny' },
        { value: 'inspirational', label: 'Inspirational' },
        { value: 'educational', label: 'Educational' },
      ],
    });

  } catch (error) {
    console.error('Error fetching AI generation options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generation options' },
      { status: 500 }
    );
  }
}
