/** @type {import('next').NextConfig} */

const nextConfig = {
  compress: true,
  poweredByHeader: false,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
