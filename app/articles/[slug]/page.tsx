import type { Metadata } from "next";
import Link from "next/link";
import { ArticleMetaLine } from "@/components/articles/article-meta";
import { TitleBlock } from "@/components/ui/title-block";
import { getArticle, getArticleSlugs } from "@/lib/articles";
import { resolveFactOrLedgerRow } from "@/lib/facts/store";
import type { Source } from "@/lib/facts/types";

/**
 * An article. Title block at the head, MDX body as a view onto the fact
 * store, revision log and engineering title block at the foot. Articles are
 * living documents, not archives (brand-bible.md section 9).
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { meta } = await getArticle(slug);
  return { title: `${meta.title} · Burn Rate`, description: meta.dek };
}

/**
 * Every source behind every record the piece references, deduped by URL.
 * Derived facts carry no sources by construction; their inputs either appear
 * in the facts array themselves or are one hover away on the figure.
 */
function articleSources(factIds: string[]): Source[] {
  const collected: Source[] = [];
  for (const id of factIds) {
    const resolved = resolveFactOrLedgerRow(id);
    if (resolved.kind === "fact") collected.push(...resolved.sources);
  }
  const seen = new Set<string>();
  return collected.filter((source) => {
    if (seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { meta, Body } = await getArticle(slug);

  return (
    <main className="mx-auto w-full max-w-5xl px-6">
      <header className="border-b border-rule py-10">
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
          <Link href="/">Burn Rate</Link>
          {" · "}
          <Link href="/articles">Articles</Link>
        </p>
        <p className="mt-8 font-mono text-[0.65rem] uppercase tracking-widest text-muted">
          {meta.category}
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-4xl leading-tight text-ink sm:text-5xl">
          {meta.title}
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-secondary">
          {meta.dek}
        </p>
        <div className="mt-6">
          <ArticleMetaLine article={meta} showUpdated />
        </div>
      </header>

      <article className="max-w-2xl pb-16 pt-6">
        <Body />
      </article>

      <section aria-label="Revision log" className="border-t border-rule py-6">
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
          Revision log
        </p>
        <ul className="mt-2 space-y-1">
          {meta.revisions.map((revision) => (
            <li key={revision.rev} className="font-mono text-xs text-secondary">
              Rev {revision.rev} · {revision.date} · {revision.change}
            </li>
          ))}
        </ul>
      </section>

      {/* Doc code is a flat BR-ART until there are enough articles to want a
          numbering registry. The rev here is the article's, and it is the
          one orange element of this section. */}
      <TitleBlock
        doc="BR-ART"
        rev={meta.rev}
        updated={meta.updated}
        sources={articleSources(meta.facts)}
      />
      <div className="h-10" />
    </main>
  );
}
