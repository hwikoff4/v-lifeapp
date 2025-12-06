/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit standalone output for lean Docker/Cloud Run images
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
