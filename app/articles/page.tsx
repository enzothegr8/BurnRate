import type { Metadata } from "next";
import Link from "next/link";
import { ArticleMetaLine } from "@/components/articles/article-meta";
import { getAllArticles, type ArticleMeta } from "@/lib/articles";

/**
 * The article gallery. Asymmetric on purpose: the newest piece runs large
 * and full-width, the rest run small in a grid below it, collapsing to one
 * column on mobile. Scale contrast, not tiles (brand-bible.md section 7.4).
 *
 * Designed for sparse. At n=1 the feature stands alone and the page is
 * complete; the grid only exists once there is something to put in it, and
 * an incomplete grid row reads as editorial, not broken, because entries are
 * hairline-topped blocks rather than boxes. Do not pad the grid with
 * fabricated pieces.
 *
 * Hover motion is a rule that inks in across the entry's top hairline.
 * Nothing scales, nothing rotates, nothing floats.
 */

export const metadata: Metadata = {
  title: "Articles · Burn Rate",
  description: "Burn Rate. The economics of the space industry.",
};

/** The top hairline inking in, the only motion an entry gets. */
function HoverRule() {
  return (
    <span
      aria-hidden
      className="absolute inset-x-0 -top-px block h-px w-0 bg-ink transition-[width] duration-500 group-hover:w-full"
    />
  );
}

function FeatureEntry({ article }: { article: ArticleMeta }) {
  return (
    <article className="relative">
      <Link href={`/articles/${article.slug}`} className="group block py-12">
        <HoverRule />
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
          {article.category}
        </p>
        <h2 className="mt-3 max-w-4xl font-display text-4xl leading-tight text-ink sm:text-5xl md:text-6xl">
          {article.title}
        </h2>
        <p className="mt-5 max-w-2xl font-sans text-base leading-relaxed text-secondary">
          {article.dek}
        </p>
        <div className="mt-6">
          <ArticleMetaLine article={article} />
        </div>
      </Link>
    </article>
  );
}

function GridEntry({ article }: { article: ArticleMeta }) {
  return (
    <li className="relative border-t border-rule">
      <Link href={`/articles/${article.slug}`} className="group block py-8">
        <HoverRule />
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
          {article.category}
        </p>
        <h3 className="mt-2 font-display text-2xl leading-snug text-ink">{article.title}</h3>
        <p className="mt-3 line-clamp-3 font-sans text-sm leading-relaxed text-secondary">
          {article.dek}
        </p>
        <div className="mt-4">
          <ArticleMetaLine article={article} />
        </div>
      </Link>
    </li>
  );
}

export default async function ArticlesPage() {
  const articles = await getAllArticles();
  const [feature, ...rest] = articles;

  return (
    <main className="mx-auto w-full max-w-5xl px-6">
      <header className="border-b border-rule py-10">
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
          <Link href="/">Burn Rate</Link>
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink">Articles</h1>
        <p className="mt-2 max-w-xl font-sans text-sm text-secondary">
          Living documents. Every piece carries a revision number, and every figure
          carries its provenance in the type.
        </p>
      </header>

      {!feature && (
        <p className="py-12 font-mono text-xs uppercase tracking-widest text-muted">
          No articles yet.
        </p>
      )}

      {feature && <FeatureEntry article={feature} />}

      {rest.length > 0 && (
        <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <GridEntry key={article.slug} article={article} />
          ))}
        </ul>
      )}

      <div className="h-10 border-t border-rule" />
    </main>
  );
}
