/**
 * Extract environment variables for Vercel deployment
 */

import 'dotenv/config';

console.log('\n=== ENVIRONMENT VARIABLES FOR VERCEL ===\n');

// Supabase (from current environment)
console.log('DATABASE (Required):');
console.log(`NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT SET'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY || 'NOT SET'}`);

console.log('\nFACEBOOK (Required):');
console.log(`FACEBOOK_APP_ID=${process.env.FACEBOOK_APP_ID || process.env.FACEBOOK_CLIENT_ID || 'NOT SET'}`);
console.log(`FACEBOOK_APP_SECRET=${process.env.FACEBOOK_APP_SECRET || process.env.FACEBOOK_CLIENT_SECRET || 'NOT SET'}`);

console.log('\nAPPLICATION:');
console.log(`NEXT_PUBLIC_APP_URL=${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`);
console.log(`CRON_SECRET=0NncqkbObk0UOX8+GbncQSV1hb0nUiFeORy9SGJx1qo=`);

console.log('\nOPTIONAL:');
console.log(`RESEND_API_KEY=${process.env.RESEND_API_KEY || 'NOT SET'}`);
console.log(`OPENAI_API_KEY=${process.env.OPENAI_API_KEY || 'NOT SET'}`);

console.log('\n===========================================\n');
