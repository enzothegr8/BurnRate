import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests only, for now. The fact store validators are the reason this is
// here: the numbers standard is only enforceable if the rules that carry it are
// tested, and the fact store pass adds a failing case for every rule.
export default defineConfig({
  test: {
    environment: "node",
    include: [
      "lib/**/*.test.ts",
      "tests/**/*.test.ts",
      "tools/**/*.test.mjs",
    ],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
