/**
 * The article layer. Articles are MDX in /content/articles, one file per
 * piece, YAML frontmatter exported by remark-mdx-frontmatter as a
 * `frontmatter` object.
 *
 * Validation runs when an article loads during `next build`, in the same
 * spirit as the fact store: a malformed article fails the build rather than
 * rendering wrong. In particular the `facts` array is checked against the
 * store, so an article cannot claim to reference a record that does not
 * exist.
 *
 * Server-only: this module reads the filesystem and must not be imported
 * from a client component.
 */

import fs from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";
import { getFactIds, getLedgerRowIds } from "@/lib/facts/store";

export const ARTICLE_CATEGORIES = ["MONEY", "LAUNCHES", "POLICY"] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export interface ArticleRevision {
  rev: string;
  date: string;
  change: string;
}

export interface ArticleFrontmatter {
  title: string;
  dek: string;
  category: ArticleCategory;
  /** First publication date, ISO. */
  date: string;
  rev: string;
  updated: string;
  slug: string;
  /** Fact and ledger-row ids the piece references. Validated against the store. */
  facts: string[];
  /** One line per revision, newest last. Rev 01 is first publication. */
  revisions: ArticleRevision[];
}

export interface ArticleMeta extends ArticleFrontmatter {
  /**
   * Whole minutes at 200 words per minute over the MDX body text. Computed
   * from the source; if a file ever defeats the computation this is null and
   * the read time is omitted rather than guessed.
   */
  readMinutes: number | null;
}

export interface Article {
  meta: ArticleMeta;
  Body: ComponentType;
}

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const READ_WPM = 200;

function fail(slug: string, problem: string): never {
  throw new Error(`[articles] Invalid article '${slug}': ${problem}`);
}

function validateFrontmatter(slug: string, raw: unknown): ArticleFrontmatter {
  if (!raw || typeof raw !== "object") fail(slug, "missing frontmatter");
  const fm = raw as Partial<ArticleFrontmatter>;
  for (const field of ["title", "dek", "category", "date", "rev", "updated", "slug"] as const) {
    if (typeof fm[field] !== "string" || fm[field].trim() === "") {
      fail(slug, `frontmatter field '${field}' is missing or empty`);
    }
  }
  if (!ARTICLE_CATEGORIES.includes(fm.category as ArticleCategory)) {
    fail(slug, `category '${String(fm.category)}' is not one of ${ARTICLE_CATEGORIES.join(", ")}`);
  }
  if (fm.slug !== slug) {
    fail(slug, `frontmatter slug '${String(fm.slug)}' does not match the filename`);
  }
  if (!ISO_DATE.test(fm.date!)) fail(slug, `date '${fm.date}' is not ISO yyyy-mm-dd`);
  if (!ISO_DATE.test(fm.updated!)) fail(slug, `updated '${fm.updated}' is not ISO yyyy-mm-dd`);

  if (!Array.isArray(fm.facts) || fm.facts.length === 0) {
    fail(slug, "facts must be a non-empty array; an article that references no records is prose, not a view onto the store");
  }
  const known = new Set([...getFactIds(), ...getLedgerRowIds()]);
  for (const id of fm.facts) {
    if (!known.has(id)) fail(slug, `facts references unknown record '${id}'`);
  }

  if (!Array.isArray(fm.revisions) || fm.revisions.length === 0) {
    fail(slug, "revisions must be a non-empty array; Rev 01 is first publication");
  }
  for (const rev of fm.revisions) {
    if (!rev.rev || !rev.date || !rev.change) {
      fail(slug, "each revision needs rev, date, and change");
    }
    if (!ISO_DATE.test(rev.date)) fail(slug, `revision date '${rev.date}' is not ISO yyyy-mm-dd`);
  }
  const last = fm.revisions[fm.revisions.length - 1];
  if (last.rev !== fm.rev || last.date !== fm.updated) {
    fail(slug, "the newest revision log entry must match rev and updated; the log is the record, the fields are the summary");
  }

  return fm as ArticleFrontmatter;
}

/**
 * Words in the MDX body at 200wpm, frontmatter, comments, import/export
 * lines, code, and JSX tags stripped. Numbers rendered by <Figure /> are not
 * in the source text, so a heavily figured piece reads a touch longer than
 * computed; the error is small and in the honest direction.
 */
function computeReadMinutes(rawMdx: string): number | null {
  const body = rawMdx
    .replace(/^---[\s\S]*?\n---/, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/^(?:import|export)\s[^\n]*$/gm, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<\/?[A-Za-z][^<>]*>/g, " ")
    .replace(/[#>*_[\]()]/g, " ");
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words === 0) return null;
  return Math.max(1, Math.round(words / READ_WPM));
}

export function getArticleSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export async function getArticle(slug: string): Promise<Article> {
  const mod = await import(`@/content/articles/${slug}.mdx`);
  const frontmatter = validateFrontmatter(slug, mod.frontmatter);
  const rawMdx = fs.readFileSync(path.join(ARTICLES_DIR, `${slug}.mdx`), "utf8");
  return {
    meta: { ...frontmatter, readMinutes: computeReadMinutes(rawMdx) },
    Body: mod.default as ComponentType,
  };
}

/** All articles, newest first. */
export async function getAllArticles(): Promise<ArticleMeta[]> {
  const slugs = getArticleSlugs();
  const articles = await Promise.all(slugs.map((slug) => getArticle(slug)));
  return articles
    .map((article) => article.meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}
