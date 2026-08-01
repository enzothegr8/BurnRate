import Link from "next/link";
import { DomainTags } from "@/components/brand/domain-tag";
import type { Article } from "@/lib/articles";

// One row in a hairline-separated list. No card grid: equal-weight cards hide
// judgment and the layout visibly breaks at low volume.
export function ArticleRow({
  article,
  showStandfirst = true,
}: {
  article: Article;
  showStandfirst?: boolean;
}) {
  return (
    <div className="it">
      <Link href={`/articles/${article.slug}`}>
        <DomainTags domains={article.domains} />
        <h3 className="row-h">{article.title}</h3>
        {showStandfirst && <p className="row-d">{article.standfirst}</p>}
        <p className="meta">
          {article.date} · Rev {article.rev}
        </p>
      </Link>
    </div>
  );
}
