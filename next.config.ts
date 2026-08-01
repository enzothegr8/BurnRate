import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
};

// Plugin names are strings rather than imported functions. Turbopack passes
// this config into Rust, and a JavaScript function cannot make that crossing,
// so an imported plugin fails at build time with an error that does not say so.
const withMDX = createMDX({
  options: {
    remarkPlugins: [
      // Parses the YAML block so it stops rendering as body text.
      "remark-frontmatter",
      // Re-exports that block as a named export the page can read.
      ["remark-mdx-frontmatter", { name: "frontmatter" }],
    ],
  },
});

export default withMDX(nextConfig);
