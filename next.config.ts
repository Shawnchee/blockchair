import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['images.pexels.com','jalcuslxbhoxepybolxw.supabase.co'],
    },
    eslint: {
      ignoreDuringBuilds: true,
    }
}

export default nextConfig;
