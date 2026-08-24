/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This project lives inside a home directory that has its own lockfile.
  outputFileTracingRoot: import.meta.dirname,
  // Three.js ships ESM; Next handles it natively. Keep the bundle honest.
  experimental: { optimizePackageImports: ['@react-three/drei'] },
};
export default nextConfig;
