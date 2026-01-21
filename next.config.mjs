/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/repair',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    DBLG_HOST: process.env.DBLG_HOST,
    DBLG_PORT: process.env.DBLG_PORT,
    DBLG_NAME: process.env.DBLG_NAME,
    DBLG_USER: process.env.DBLG_USER,
    DBLG_PASSWORD: process.env.DBLG_PASSWORD,
  },
}

export default nextConfig
