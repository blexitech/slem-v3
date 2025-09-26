/** @type {import('next').NextConfig} */

const nextConfig = {
  compress: true,
  poweredByHeader: false,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
