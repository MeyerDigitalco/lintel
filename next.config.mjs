/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Keep heavy Node-only libs out of the server bundle so they load at runtime.
    serverComponentsExternalPackages: ["pdf-parse", "tesseract.js"],
  },
};

export default nextConfig;
