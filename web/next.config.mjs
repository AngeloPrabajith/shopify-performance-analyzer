import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const analyzerDist = join(__dirname, "..", "dist");

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["playwright"],
  webpack: (config) => {
    config.resolve.alias["@analyzer"] = join(analyzerDist, "index.js");
    return config;
  },
};

export default nextConfig;
