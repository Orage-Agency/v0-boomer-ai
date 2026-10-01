/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@boomer-ai/shared"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
