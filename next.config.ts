import type { NextConfig } from "next";
import createMDX from "@next/mdx";

/*
 * Static site, no backend, per data-model.md section 6. Deploy target is
 * Vercel, which would handle more, but the export stays: the spec commits to
 * a static site and it keeps the project portable. No basePath, no GitHub
 * Pages workarounds.
 */
const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

/*
 * Articles are MDX in /content/articles with YAML frontmatter. The plugins
 * are named as strings for Turbopack compatibility (node_modules/next/dist/
 * docs/01-app/02-guides/mdx.md). remark-mdx-frontmatter exports the YAML as
 * a `frontmatter` object from each module, which lib/articles.ts validates
 * at build time.
 */
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter", "remark-mdx-frontmatter"],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
