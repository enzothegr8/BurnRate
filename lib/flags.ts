/**
 * Feature flags. Static site, so a flag is a build-time constant: flip the
 * env var, rebuild, and every render site moves together.
 */
export const flags = {
  /**
   * CONFIDENCE MIX on article cards: the article's facts array counted by
   * mark and rendered as a small solid/dashed/dotted key. Built and wired,
   * default off. Enable with NEXT_PUBLIC_CONFIDENCE_MIX=1 at build time.
   */
  confidenceMix: process.env.NEXT_PUBLIC_CONFIDENCE_MIX === "1",
} as const;
