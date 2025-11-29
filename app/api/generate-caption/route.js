/**
 * Generate Caption API Route
 *
 * Uses OpenAI GPT-4 to generate engaging social media captions.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateCaption, generateHashtags, improveCaption, generateCaptionFromImage } from '@/lib/openai/client';

/**
 * POST /api/generate-caption
 * Generate AI captions
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
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      type = 'generate', // 'generate', 'hashtags', 'improve', 'from-image'
      prompt,
      caption,
      imageUrl,
      platforms = [],
      tone = 'professional',
      includeHashtags = true,
      includeEmojis = true,
      numberOfVariations = 3,
      numberOfHashtags = 10,
      maxLength,
    } = body;

    let result;

    switch (type) {
      case 'generate':
        // Generate new captions from prompt
        if (!prompt) {
          return NextResponse.json(
            { error: 'Prompt is required for caption generation' },
            { status: 400 }
          );
        }

        result = await generateCaption({
          prompt,
          platforms,
          tone,
          includeHashtags,
          includeEmojis,
          numberOfVariations,
          maxLength,
        });

        return NextResponse.json({
          captions: result,
          count: result.length,
        });

      case 'hashtags':
        // Generate hashtags for content
        if (!caption) {
          return NextResponse.json(
            { error: 'Caption is required for hashtag generation' },
            { status: 400 }
          );
        }

        result = await generateHashtags({
          content: caption,
          numberOfHashtags,
          platform: platforms[0] || 'instagram',
        });

        return NextResponse.json({
          hashtags: result,
          count: result.length,
        });

      case 'improve':
        // Improve existing caption
        if (!caption) {
          return NextResponse.json(
            { error: 'Caption is required for improvement' },
            { status: 400 }
          );
        }

        result = await improveCaption({
          caption,
          tone,
        });

        return NextResponse.json({
          improvedCaption: result,
        });

      case 'from-image':
        // Generate captions from image
        if (!imageUrl) {
          return NextResponse.json(
            { error: 'Image URL is required' },
            { status: 400 }
          );
        }

        result = await generateCaptionFromImage({
          imageUrl,
          platforms,
          tone,
          numberOfVariations,
        });

        return NextResponse.json({
          captions: result,
          count: result.length,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid generation type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Caption generation error:', error);

    // Handle OpenAI specific errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key is invalid or missing' },
        { status: 500 }
      );
    }

    if (error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate caption' },
      { status: 500 }
    );
  }
}
