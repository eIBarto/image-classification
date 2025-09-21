// Next.js configuration
// - Allow optimized images from project S3 bucket
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '*.s3.eu-central-1.amazonaws.com',
          port: '',
          pathname: '/projects/**',
          
        },
      ],
    },
  }

module.exports = nextConfig
