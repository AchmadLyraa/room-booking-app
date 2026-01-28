/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "http://192.168.18.10:3000",
    "http://localhost:3000",
    "local-origin.dev",
    "*.local-origin.dev",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
