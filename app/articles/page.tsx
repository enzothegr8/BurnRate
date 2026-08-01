import type { Metadata } from "next";
import Link from "next/link";
import { ArticleRow } from "@/components/articles/article-row";
import { EmptyList } from "@/components/articles/empty-list";
import { DomainTags } from "@/components/brand/domain-tag";
import { ARTICLES } from "@/lib/articles";

export const metadata: Metadata = { title: "Articles" };

// One lead at large scale, then a hairline-separated list of everything else.
// It should look correct with one piece and with two hundred.
export default function ArticlesPage() {
  const [lead, ...rest] = ARTICLES;

  return (
    <section className="view">
      <DomainTags domains={lead.domains} />
      <p className="kick">{lead.kicker}</p>
      <Link href={`/articles/${lead.slug}`}>
        <h1 className="lead-h">{lead.title}</h1>
      </Link>
      <p className="lead-d">{lead.standfirst}</p>
      <p className="meta">
        {lead.date} · Rev {lead.rev}
      </p>

      <div style={{ height: 44 }} />

      <p className="sechead">All articles</p>
      <div className="list" style={{ paddingTop: 4 }}>
        {rest.length > 0 ? (
          rest.map((a) => <ArticleRow key={a.slug} article={a} />)
        ) : (
          <EmptyList note="Nothing else yet. The lead above is the whole archive." />
        )}
      </div>
    </section>
  );
}
