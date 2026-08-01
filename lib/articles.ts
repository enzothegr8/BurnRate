// Articles are MDX files on disk. This module is the only thing that reads
// them, so the list, the domain pages, and the article route all see the same
// records and cannot drift apart.
//
// Frontmatter is validated here and a bad file throws, which fails the build.
// A piece with no rev or no doc_id is a piece that cannot be corrected later,
// and correctability is not optional for a publication that revises.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { DOMAINS, type Domain } from "./site";

export const ARTICLES_DIR = join(process.cwd(), "content", "articles");

export type ArticleStatus = "draft" | "published" | "placeholder";

export type Article = {
  slug: string;
  title: string;
  standfirst: string;
  kicker: string;
  domains: Domain[];
  date: string;
  rev: string;
  doc_id: string;
  status: ArticleStatus;
  /** Optional. A piece with no cover renders without one; there is no
   *  placeholder graphic standing in for a missing one, the same way a missing
   *  figure is an empty slot rather than an invented number. */
  cover?: string;
  coverAlt?: string;
};

const STATUSES: ArticleStatus[] = ["draft", "published", "placeholder"];

function fail(slug: string, message: string): never {
  throw new Error(`content/articles/${slug}.mdx: ${message}`);
}

function parseFrontmatter(slug: string, raw: Record<string, unknown>): Article {
  const text = (key: keyof Article): string => {
    const value = raw[key];
    if (typeof value !== "string" || value.trim() === "") {
      fail(slug, `frontmatter "${key}" is required and must be a non-empty string.`);
    }
    return value;
  };

  const domains = raw.domains;
  if (!Array.isArray(domains) || domains.length === 0) {
    fail(slug, `frontmatter "domains" must list at least one domain.`);
  }
  for (const domain of domains) {
    if (!(DOMAINS as readonly unknown[]).includes(domain)) {
      fail(slug, `frontmatter "domains" contains unknown domain "${domain}".`);
    }
  }

  const status = raw.status;
  if (!STATUSES.includes(status as ArticleStatus)) {
    fail(
      slug,
      `frontmatter "status" must be one of ${STATUSES.join(", ")}, got "${status}".`,
    );
  }

  const date = text("date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    fail(slug, `frontmatter "date" must be YYYY-MM-DD, got "${date}".`);
  }

  // Cover is optional, but a cover with no alt text is an image nobody who
  // reads with a screen reader can access, and that fails the build the same
  // way a fact with no source does.
  const cover = raw.cover;
  const coverAlt = raw.coverAlt;
  if (cover !== undefined) {
    if (typeof cover !== "string" || cover.trim() === "") {
      fail(slug, `frontmatter "cover" must be a non-empty string when present.`);
    }
    if (typeof coverAlt !== "string" || coverAlt.trim() === "") {
      fail(slug, `frontmatter "cover" is set but "coverAlt" is missing.`);
    }
  }

  return {
    slug,
    title: text("title"),
    standfirst: text("standfirst"),
    kicker: text("kicker"),
    // Stored in the fixed presentation order rather than the order typed.
    domains: DOMAINS.filter((d) => domains.includes(d)),
    date,
    rev: text("rev"),
    doc_id: text("doc_id"),
    status: status as ArticleStatus,
    cover: cover as string | undefined,
    coverAlt: coverAlt as string | undefined,
  };
}

function readAll(): Article[] {
  const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".mdx"));
  const articles = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const { data } = matter(readFileSync(join(ARTICLES_DIR, file), "utf8"));
    return parseFrontmatter(slug, data);
  });

  // Newest first. The first entry is the lead everywhere it appears.
  return articles.sort((a, b) => b.date.localeCompare(a.date));
}

export const ARTICLES: Article[] = readAll();

export function articlesInDomain(domain: Domain): Article[] {
  return ARTICLES.filter((a) => a.domains.includes(domain));
}

export function articleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
