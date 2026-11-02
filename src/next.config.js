/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  agentRules: false,
  serverExternalPackages: ["@azure/storage-blob", "@azure/identity"],
};

module.exports = nextConfig;
