/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['upload.wikimedia.org', 'api.telegram.org', 'ipfs.io', 'boldai-bucket.s3.us-east-1.amazonaws.com', 'i.pravatar.cc'],
  },
};

export default nextConfig;
