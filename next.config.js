/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "/api/auth/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
