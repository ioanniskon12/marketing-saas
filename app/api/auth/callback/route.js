/**
 * OAuth Callback Route Handler
 *
 * Handles OAuth authentication callbacks from providers like Google, GitHub, etc.
 * This route exchanges the OAuth code for a session and redirects the user.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(
        errorDescription || error
      )}`
    );
  }

  // Exchange code for session
  if (code) {
    const supabase = await createClient();

    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent(
            'Failed to complete sign in. Please try again.'
          )}`
        );
      }

      // Check if this is a new user and create profile
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        // Create profile if it doesn't exist
        if (!profile && !profileError) {
          await supabase.from('user_profiles').insert({
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url,
          });
        }
      }

      // Successful authentication, redirect to intended destination
      return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
    } catch (error) {
      console.error('Unexpected error during auth callback:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(
          'An unexpected error occurred. Please try again.'
        )}`
      );
    }
  }

  // No code provided
  return NextResponse.redirect(
    `${requestUrl.origin}/login?error=${encodeURIComponent(
      'No authentication code provided'
    )}`
  );
}
