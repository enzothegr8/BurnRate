import type { ArticleMeta } from "@/lib/articles";
import { ConfidenceMix } from "@/components/articles/confidence-mix";

/**
 * The metadata line under an article headline, on cards and on the article
 * page. Everything on it is true and is ours: date, revision, read time
 * computed from the source, and, behind its flag, the confidence mix.
 * The rev here is plain ink: brand-bible.md section 9 scopes orange to the
 * title block's rev, and repeating it across a grid of cards would break
 * section 5's one-orange-per-section rule. No ratings, no view counts;
 * invented numbers have no place on a publication whose product is that its
 * numbers declare their provenance.
 */
export function ArticleMetaLine({
  article,
  showUpdated = false,
}: {
  article: ArticleMeta;
  showUpdated?: boolean;
}) {
  return (
    <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
      {article.date}
      {" · "}Rev {article.rev}
      {showUpdated && article.updated !== article.date && <> · Updated {article.updated}</>}
      {article.readMinutes !== null && <> · {article.readMinutes} min read</>}
      <ConfidenceMix factIds={article.facts} />
    </p>
  );
}
