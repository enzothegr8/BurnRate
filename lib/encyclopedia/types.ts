// The encyclopedia schema. Section 5 of the foundation doc, "The encyclopedia".
//
// An entry is a record in the article pipeline: one MDX file, frontmatter
// validated at build time, body rendered through the same components. The
// numeral lint, <Figure />, and the fact store apply to it unchanged, because an
// entry can no more contain a bare number than an article can.

import { DOMAINS, type Domain } from "@/lib/facts/types";

export { DOMAINS };
export type { Domain };

// Fixed enum, from section 1: the lenses Burn Rate reads its four domains
// through. Closed the same way the domain list is closed. A fourth lens is a
// revision to the foundation doc, not a string typed into frontmatter.
export const LENSES = ["economics", "politics", "science"] as const;
export type Lens = (typeof LENSES)[number];

export const LENS_LABEL: Record<Lens, string> = {
  economics: "Economics",
  politics: "Politics",
  science: "Science",
};

// A stub is a real status, not a missing one. It renders: a title, its
// connections, and a plain statement that nothing is written yet. The shape of
// what is not yet known is information, so it is shown rather than hidden.
export const ENTRY_STATUSES = ["stub", "draft", "published"] as const;
export type EntryStatus = (typeof ENTRY_STATUSES)[number];

/** Every entry id carries this. The route slug is the id with it removed. */
export const ID_PREFIX = "enc.";

/** A related[] target pointing at an article rather than an entry. */
export const ARTICLE_REF_PREFIX = "article:";

export type Entry = {
  /** `enc.` prefixed, dot namespaced, stable, human readable. Never reused. */
  id: string;
  /** The id minus the `enc.` prefix. Also the MDX filename, which the loader
   *  checks, because the route imports the body by slug. */
  slug: string;
  title: string;
  /** Authored, and mandatory once status is `published`. Doubles as the hover
   *  preview in the graph view, which is why it is never an auto-truncated
   *  body excerpt: a truncation is not a sentence and reads as broken. */
  standfirst: string;
  domains: Domain[];
  lenses: Lens[];
  /** Raw targets as written: `enc.foo` for an entry, `article:slug` for a
   *  piece. A dangling target fails the build. */
  related: string[];
  status: EntryStatus;
  rev: string;
  updated: string;
  /** Discovered by scanning the body, never declared in frontmatter. See
   *  scan.ts for why. */
  factIds: string[];
};

export function slugForId(id: string): string {
  return id.startsWith(ID_PREFIX) ? id.slice(ID_PREFIX.length) : id;
}

export function isArticleRef(target: string): boolean {
  return target.startsWith(ARTICLE_REF_PREFIX);
}

export function articleSlugForRef(target: string): string {
  return target.slice(ARTICLE_REF_PREFIX.length);
}
