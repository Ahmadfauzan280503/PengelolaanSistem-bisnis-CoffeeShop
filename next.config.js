/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/accounts',
        destination: '/Penjualan',
        permanent: true,
      },
    ]
  },
};

module.exports = nextConfig;
