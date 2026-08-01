import type { Metadata } from "next";
import Link from "next/link";
import { ArticleRow } from "@/components/articles/article-row";
import { DomainTags } from "@/components/brand/domain-tag";
import { ARTICLES } from "@/lib/site";

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
      <p className="lead-d">{lead.dek}</p>
      <p className="meta">
        {lead.date} · Rev {lead.rev} · Sources {lead.sources}
      </p>

      <div style={{ height: 44 }} />

      <p className="sechead">All articles</p>
      <div className="list" style={{ paddingTop: 4 }}>
        {rest.map((a) => (
          <ArticleRow key={a.slug} article={a} />
        ))}
      </div>
    </section>
  );
}
