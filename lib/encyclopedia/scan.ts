// Fact discovery.
//
// WHY THIS IS A SCAN AND NOT A FRONTMATTER FIELD.
//
// The facts an entry uses are found by reading its body, never by reading a
// list somebody maintained by hand. A hand-maintained list goes stale: a figure
// gets cut from a paragraph and the id stays in the header, or a figure gets
// added and the header is never touched. Nothing fails when that happens, which
// is the problem. The list would silently stop describing the entry, and the
// graph is built from it, so the graph would silently stop describing the site.
//
// A scan cannot go stale. It has no second copy to drift from: the body is the
// only statement of which facts an entry cites, and the scan reads that
// statement. If a figure is removed the edge disappears on the next build,
// without anyone remembering to remove it.
//
// This is the same rule the fact store applies to values, one level up. A
// derived fact stores its formula and recomputes on read rather than caching a
// result, because a cached result is a second copy of a number. A declared fact
// list would be a second copy of a citation.
//
// Do not add a `facts` field to the frontmatter. The absence is the design.

/** Placeholder figures contribute nothing: they carry no id because they point
 *  at no record. Only `<Figure id="..." />` cites a fact. */
const FIGURE_TAG = /<Figure\b[^>]*\/?>/g;
const ID_ATTRIBUTE = /\bid\s*=\s*["']([^"']+)["']/;

/**
 * Fact record ids cited by an MDX body, in first-appearance order, deduplicated.
 *
 * Known limit, stated because a guard trusted past its range is worse than no
 * guard: this reads the raw body, so a `<Figure id="..." />` written inside a
 * fenced code block as an example would be counted as a citation. No entry does
 * that today. If one ever needs to, the fix is to mask non-prose the way the
 * numeral lint does through tools/mdx-prose.mjs, not to reintroduce a declared
 * list.
 */
export function discoverFactIds(body: string): string[] {
  const found: string[] = [];
  for (const tag of body.match(FIGURE_TAG) ?? []) {
    const id = tag.match(ID_ATTRIBUTE)?.[1];
    if (id && !found.includes(id)) found.push(id);
  }
  return found;
}
