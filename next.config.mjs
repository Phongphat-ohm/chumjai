/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    webpackBuildWorker: false,
    cpus: 1,
    serverActions: {
      allowedOrigins: [
        "*.sslip.io",
        "*.nip.io",
        "*.traefik.me",
        "45.83.207.107",
        "45.83.207.107:*",
        "svb18wgcoozobzzyebaqlq6o.45.83.207.107.sslip.io",
        "localhost:3000",
        "localhost:80",
        "localhost",
      ],
    },
  },
  poweredByHeader: false,
};

export default nextConfig;
