/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isProd ? '/acida-revista' : '',
  assetPrefix: isProd ? '/acida-revista/' : '',
  images: { unoptimized: true },
};

export default nextConfig;
