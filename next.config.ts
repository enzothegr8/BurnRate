import type { NextConfig } from "next";

/*
 * Static site, no backend, per data-model.md section 6. Deploy target is
 * Vercel, which would handle more, but the export stays: the spec commits to
 * a static site and it keeps the project portable. No basePath, no GitHub
 * Pages workarounds.
 */
const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
