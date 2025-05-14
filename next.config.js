/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '*.s3.eu-central-1.amazonaws.com', // todo whitelist bucket explicitly
          port: '',
          pathname: '/projects/**',
          //search: '',
        },
      ],
    },
  }

module.exports = nextConfig
