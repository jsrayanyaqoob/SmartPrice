/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: false,
  output: "standalone",
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;
