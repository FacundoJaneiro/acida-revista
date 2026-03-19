/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  output: 'export',
  basePath: isGithubPages ? '/acida-revista' : '',
  assetPrefix: isGithubPages ? '/acida-revista/' : '',
  images: { unoptimized: true },
};

export default nextConfig;
