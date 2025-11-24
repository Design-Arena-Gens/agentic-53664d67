/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.ts, *.tsx': {
          loaders: ['tsx'],
        },
      },
    },
  },
};

export default nextConfig;
