import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
    domains: ['media.istockphoto.com', 'media.varietyheaven.in',],
  },
eslint: {
    
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
