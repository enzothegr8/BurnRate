// Entries are MDX files on disk. This module is the only thing that reads them,
// so the index, the entry route, and the graph all see the same records and
// cannot drift apart. Same shape and same reasoning as lib/articles.ts.
//
// Frontmatter is validated here and a bad file throws, which fails the build.
// The cross-record rules live in ./validate.ts and run once, below, at module
// load: that is the build-time gate, the same place the fact store puts its own.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { ARTICLES } from "@/lib/articles";
import { getRecord } from "@/lib/facts/store";
import { discoverFactIds } from "./scan";
import {
  DOMAINS,
  ENTRY_STATUSES,
  ID_PREFIX,
  LENSES,
  type Domain,
  type Entry,
  type EntryStatus,
  type Lens,
  slugForId,
} from "./types";
import { assertEncyclopediaValid } from "./validate";

export const ENTRIES_DIR = join(process.cwd(), "content", "encyclopedia");

function fail(file: string, message: string): never {
  throw new Error(`content/encyclopedia/${file}: ${message}`);
}

function parseFrontmatter(
  file: string,
  raw: Record<string, unknown>,
  body: string,
): Entry {
  const text = (key: string): string => {
    const value = raw[key];
    if (typeof value !== "string" || value.trim() === "") {
      fail(file, `frontmatter "${key}" is required and must be a non-empty string.`);
    }
    return value;
  };

  const id = text("id");
  if (!id.startsWith(ID_PREFIX)) {
    fail(file, `frontmatter "id" must start with "${ID_PREFIX}", got "${id}".`);
  }

  const slug = slugForId(id);
  // The entry route imports its body by slug, so a file whose name does not
  // match its id is a page that cannot be rendered. Caught here rather than at
  // request time, where it would be a 404 that looks like a missing entry.
  if (file !== `${slug}.mdx`) {
    fail(file, `id "${id}" implies the filename "${slug}.mdx".`);
  }

  const list = (key: string): string[] => {
    const value = raw[key];
    if (value === undefined) return [];
    if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) {
      fail(file, `frontmatter "${key}" must be an array of strings when present.`);
    }
    return value as string[];
  };

  const domains = list("domains");
  for (const domain of domains) {
    if (!(DOMAINS as readonly string[]).includes(domain)) {
      fail(file, `frontmatter "domains" contains unknown domain "${domain}".`);
    }
  }

  const lenses = list("lenses");
  for (const lens of lenses) {
    if (!(LENSES as readonly string[]).includes(lens)) {
      fail(
        file,
        `frontmatter "lenses" contains unknown lens "${lens}". The enum is ${LENSES.join(", ")}.`,
      );
    }
  }

  const status = raw.status;
  if (!(ENTRY_STATUSES as readonly unknown[]).includes(status)) {
    fail(
      file,
      `frontmatter "status" must be one of ${ENTRY_STATUSES.join(", ")}, got "${status}".`,
    );
  }

  const updated = text("updated");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(updated)) {
    fail(file, `frontmatter "updated" must be YYYY-MM-DD, got "${updated}".`);
  }

  // A stub has no standfirst and that is correct, so this is not required here.
  // The `published` case is a cross-record rule and lives in validate.ts with
  // the others, so every build-failing rule is stated in one place.
  const standfirst = raw.standfirst;
  if (standfirst !== undefined && typeof standfirst !== "string") {
    fail(file, `frontmatter "standfirst" must be a string when present.`);
  }

  return {
    id,
    slug,
    title: text("title"),
    standfirst: (standfirst as string | undefined) ?? "",
    // Stored in the fixed presentation order rather than the order typed.
    domains: DOMAINS.filter((d) => domains.includes(d)) as Domain[],
    lenses: LENSES.filter((l) => lenses.includes(l)) as Lens[],
    related: list("related"),
    status: status as EntryStatus,
    rev: text("rev"),
    updated,
    factIds: discoverFactIds(body),
  };
}

function readAll(): Entry[] {
  const files = readdirSync(ENTRIES_DIR).filter((f) => f.endsWith(".mdx"));
  const entries = files.map((file) => {
    const { data, content } = matter(
      readFileSync(join(ENTRIES_DIR, file), "utf8"),
    );
    return parseFrontmatter(file, data, content);
  });

  // Alphabetical. A reference work is ordered by name, not by recency: a reader
  // arriving at an index of entries is looking for one, not catching up.
  return entries.sort((a, b) => a.title.localeCompare(b.title));
}

export const ENTRIES: Entry[] = readAll();

// The build-time gate. Runs at module load, so any route that imports the
// encyclopedia fails the build rather than rendering a broken link.
assertEncyclopediaValid({
  entries: ENTRIES,
  articles: ARTICLES.map((a) => ({
    slug: a.slug,
    encyclopedia: a.encyclopedia ?? [],
  })),
  factExists: (id) => getRecord(id) !== undefined,
});

export function entryBySlug(slug: string): Entry | undefined {
  return ENTRIES.find((e) => e.slug === slug);
}

export function entryById(id: string): Entry | undefined {
  return ENTRIES.find((e) => e.id === id);
}

export function entriesInDomain(domain: Domain): Entry[] {
  return ENTRIES.filter((e) => e.domains.includes(domain));
}

export function entriesInLens(lens: Lens): Entry[] {
  return ENTRIES.filter((e) => e.lenses.includes(lens));
}

export type RelatedLink =
  | { kind: "entry"; entry: Entry }
  | { kind: "article"; slug: string; title: string };

/**
 * Everything linked to this entry, from both directions, deduplicated.
 *
 * Symmetry is deliberately not required in the content: an entry may name an
 * article, an article may name an entry, and either alone is enough. Requiring
 * both would mean every link had to be written twice, and a link written twice
 * is a link that can disagree with itself.
 */
export function relatedFor(entry: Entry): RelatedLink[] {
  const links: RelatedLink[] = [];
  const seen = new Set<string>();

  const addEntry = (target: Entry) => {
    if (target.id === entry.id || seen.has(target.id)) return;
    seen.add(target.id);
    links.push({ kind: "entry", entry: target });
  };

  const addArticle = (slug: string) => {
    const key = `article:${slug}`;
    if (seen.has(key)) return;
    const article = ARTICLES.find((a) => a.slug === slug);
    if (!article) return;
    seen.add(key);
    links.push({ kind: "article", slug, title: article.title });
  };

  // Outbound: what this entry names.
  for (const target of entry.related) {
    if (target.startsWith("article:")) addArticle(target.slice("article:".length));
    else {
      const other = entryById(target);
      if (other) addEntry(other);
    }
  }

  // Inbound: entries that name this one, and articles whose mirror field does.
  for (const other of ENTRIES) {
    if (other.related.includes(entry.id)) addEntry(other);
  }
  for (const article of ARTICLES) {
    if ((article.encyclopedia ?? []).includes(entry.id)) addArticle(article.slug);
  }

  return links;
}
