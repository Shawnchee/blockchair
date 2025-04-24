import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['images.pexels.com','jalcuslxbhoxepybolxw.supabase.co', 'news.digitalmarketingphilippines.com'],
    },
    eslint: {
      ignoreDuringBuilds: true,
    }
}

export default nextConfig;
