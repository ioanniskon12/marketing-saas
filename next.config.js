/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: [
      'localhost',
      'supabase.co',
      'your-supabase-project.supabase.co',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

module.exports = nextConfig;
