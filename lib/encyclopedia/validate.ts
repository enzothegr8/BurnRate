// Encyclopedia validation. Every rule here fails the build.
//
// The foundation doc lists them as build-failing for one reason: the
// encyclopedia is the canonical memory of the operation, and a broken link in a
// memory is worse than a missing one. A dangling `related` target renders as a
// dead row that looks like a connection. A published entry with no standfirst
// renders as a node with no preview in the graph. Neither breaks anything
// visibly enough to get noticed, so neither would ever get fixed.
//
// These functions are pure and take their world as arguments, so every rule can
// be exercised with a failing case without touching the disk.

import type { Entry } from "./types";
import { articleSlugForRef, isArticleRef } from "./types";

export type ArticleLink = {
  slug: string;
  /** The mirror field. Optional on an article, and symmetry is not required:
   *  the graph merges both directions, so either end may declare the link. */
  encyclopedia: string[];
};

export type EncyclopediaInput = {
  entries: Entry[];
  articles: ArticleLink[];
  /** Asked rather than imported, so a test can validate against a fact universe
   *  it controls instead of the real store. */
  factExists: (id: string) => boolean;
};

export function validateEncyclopedia(input: EncyclopediaInput): string[] {
  const { entries, articles, factExists } = input;
  const problems: string[] = [];

  const ids = new Set(entries.map((e) => e.id));
  const articleSlugs = new Set(articles.map((a) => a.slug));

  // An id is a permanent address. Two entries answering to one address means
  // every link to it is ambiguous, and ids are never reused precisely so that a
  // link written today still means the same thing later.
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.id)) {
      problems.push(`${entry.id}: duplicate entry id.`);
    }
    seen.add(entry.id);
  }

  for (const entry of entries) {
    const where = `content/encyclopedia/${entry.slug}.mdx`;

    // Discovered by scan, so an unknown id here means a figure cites a record
    // that does not exist: a number on a page with no provenance behind it.
    for (const factId of entry.factIds) {
      if (!factExists(factId)) {
        problems.push(
          `${where}: <Figure id="${factId}" /> has no record in the fact store.`,
        );
      }
    }

    for (const target of entry.related) {
      if (isArticleRef(target)) {
        if (!articleSlugs.has(articleSlugForRef(target))) {
          problems.push(
            `${where}: related target "${target}" resolves to no article.`,
          );
        }
      } else if (!ids.has(target)) {
        problems.push(
          `${where}: related target "${target}" resolves to no entry.`,
        );
      }
    }

    // The standfirst is the graph's hover preview. A published entry without one
    // is a node that cannot say what it is.
    if (entry.status === "published" && entry.standfirst.trim() === "") {
      problems.push(
        `${where}: status is "published", which requires an authored standfirst.`,
      );
    }

    // At least one of the two. An entry filed under neither a domain nor a lens
    // appears in no section of the index, which makes it unreachable by every
    // route a reader has.
    if (entry.domains.length === 0 && entry.lenses.length === 0) {
      problems.push(
        `${where}: needs at least one domain or one lens, and has neither.`,
      );
    }
  }

  for (const article of articles) {
    for (const target of article.encyclopedia) {
      if (!ids.has(target)) {
        problems.push(
          `content/articles/${article.slug}.mdx: encyclopedia target "${target}" resolves to no entry.`,
        );
      }
    }
  }

  return problems;
}

export function assertEncyclopediaValid(input: EncyclopediaInput): void {
  const problems = validateEncyclopedia(input);
  if (problems.length === 0) return;
  throw new Error(
    `Encyclopedia validation failed (${problems.length}):\n` +
      problems.map((p) => `  ${p}`).join("\n"),
  );
}
