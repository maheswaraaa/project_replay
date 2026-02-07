/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
    // Increase cache time to reduce re-fetching
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },
  // Increase timeout for external image fetching
  staticPageGenerationTimeout: 120,
  experimental: {
    // Increase timeout for image optimization
    imgOptTimeoutMs: 30000, // 30 seconds (default is 7 seconds)
  },
};

module.exports = nextConfig;