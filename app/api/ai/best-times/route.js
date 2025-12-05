/**
 * AI Best Posting Times API Route
 *
 * Generates country-specific best posting times using AI based on
 * local user behavior patterns and engagement research.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

let openaiInstance = null;

function getOpenAI() {
  if (!openaiInstance && process.env.OPENAI_API_KEY) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

// Simple in-memory cache for best times (persists during server lifetime)
const bestTimesCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * POST /api/ai/best-times
 * Generate best posting times for a specific country and platform
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
    const { country, countryCode, timezone, platform = 'instagram' } = body;

    // Validate required fields
    if (!country || !timezone) {
      return NextResponse.json(
        { error: 'Country and timezone are required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${countryCode || country}-${platform}`;
    const cached = bestTimesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        country,
        platform,
        bestTimes: cached.data,
        fromCache: true,
      });
    }

    const openai = getOpenAI();
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key is invalid or missing' },
        { status: 500 }
      );
    }

    // Generate best times using AI
    const systemPrompt = `You are a social media analytics expert with deep knowledge of user behavior patterns across different countries and platforms.

Your task is to provide the best posting times for ${platform} in ${country} (timezone: ${timezone}).

Consider:
- Local work schedules and commute times
- Cultural habits (meal times, siesta in some countries, etc.)
- Peak social media usage patterns for ${platform} in this specific country
- Weekday vs weekend differences
- Local holidays and typical daily routines

Return your response in this exact JSON format:
{
  "weekday": [
    { "time": "HH:MM", "label": "H:MM AM/PM", "engagement": "high|peak|medium" },
    { "time": "HH:MM", "label": "H:MM AM/PM", "engagement": "high|peak|medium" },
    { "time": "HH:MM", "label": "H:MM AM/PM", "engagement": "high|peak|medium" }
  ],
  "weekend": [
    { "time": "HH:MM", "label": "H:MM AM/PM", "engagement": "high|peak|medium" },
    { "time": "HH:MM", "label": "H:MM AM/PM", "engagement": "high|peak|medium" },
    { "time": "HH:MM", "label": "H:MM AM/PM", "engagement": "high|peak|medium" }
  ],
  "bestDays": ["Day1", "Day2"],
  "worstDay": "Day",
  "description": "Brief explanation of the posting patterns for this country"
}

Provide 3 optimal time slots for weekdays and 3 for weekends. Use 24-hour format for "time" and 12-hour format for "label".`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate the best posting times for ${platform} in ${country}` },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    const bestTimes = JSON.parse(content);

    // Build day-by-day structure from weekday/weekend data
    const dayByDayTimes = {
      monday: bestTimes.weekday,
      tuesday: bestTimes.weekday,
      wednesday: bestTimes.weekday,
      thursday: bestTimes.weekday,
      friday: [...bestTimes.weekday.slice(0, 1), ...bestTimes.weekend.slice(0, 2)],
      saturday: bestTimes.weekend,
      sunday: bestTimes.weekend.slice(0, Math.max(2, bestTimes.weekend.length - 1)),
      bestDays: bestTimes.bestDays || ['Wednesday', 'Thursday'],
      worstDay: bestTimes.worstDay || 'Sunday',
      description: bestTimes.description || '',
    };

    // Cache the result
    bestTimesCache.set(cacheKey, {
      data: dayByDayTimes,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      country,
      platform,
      bestTimes: dayByDayTimes,
      fromCache: false,
    });

  } catch (error) {
    console.error('AI best times generation error:', error);

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

    return NextResponse.json(
      { error: error.message || 'Failed to generate best posting times' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/best-times
 * Get cached best times for a country (if available)
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

    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get('countryCode');
    const platform = searchParams.get('platform') || 'instagram';

    if (!countryCode) {
      return NextResponse.json(
        { error: 'countryCode is required' },
        { status: 400 }
      );
    }

    const cacheKey = `${countryCode}-${platform}`;
    const cached = bestTimesCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        countryCode,
        platform,
        bestTimes: cached.data,
        fromCache: true,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'No cached data available. Use POST to generate.',
    });

  } catch (error) {
    console.error('Error fetching cached best times:', error);
    return NextResponse.json(
      { error: 'Failed to fetch best times' },
      { status: 500 }
    );
  }
}
