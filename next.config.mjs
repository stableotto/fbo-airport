/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
