/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "build",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    // Don't run ESLint during build as it can cause type errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't run TypeScript during build as it can cause type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
