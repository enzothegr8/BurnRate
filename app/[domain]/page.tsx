import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleRow } from "@/components/articles/article-row";
import { EmptyList } from "@/components/articles/empty-list";
import { Figure } from "@/components/facts/figure";
import { articlesInDomain } from "@/lib/articles";
import {
  DOMAINS,
  DOMAIN_LABEL,
  DOMAIN_MODULE_DESC,
  DOMAIN_STATS,
  type Domain,
} from "@/lib/site";

// One shared template for all four. The domain color is the only thing that
// differs, which is the point: all four sit at equal visibility and none of
// them gets a layout that implies priority.

export const dynamicParams = false;

export function generateStaticParams() {
  return DOMAINS.map((domain) => ({ domain }));
}

function isDomain(value: string): value is Domain {
  return (DOMAINS as readonly string[]).includes(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  return { title: isDomain(domain) ? DOMAIN_LABEL[domain] : "Domain" };
}

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  if (!isDomain(domain)) notFound();

  const label = DOMAIN_LABEL[domain];
  const stats = DOMAIN_STATS[domain];
  const articles = articlesInDomain(domain);

  return (
    <section className="view">
      <div className="dom-head">
        <h1 className="dom-title">{label}</h1>
        <div
          className="dom-bar"
          style={{ background: `var(--domain-${domain})` }}
        />
        <p className="dom-lede">
          Placeholder lede. One or two sentences stating what the money question
          is in this domain and what Burn Rate is counting.
        </p>
      </div>

      <div className="dom-stats">
        {stats.map((s) => (
          <div key={s.value + s.caption} className="dom-stat">
            <span className="b">
              <Figure placeholder={s.value} confidence={s.confidence} />
            </span>
            <p className="c">{s.caption}</p>
          </div>
        ))}
      </div>

      <div className="mod" style={{ marginBottom: 38 }}>
        <p className="lab">Domain module slot</p>
        <p className="desc">{DOMAIN_MODULE_DESC[domain]}</p>
      </div>

      <p className="sechead">In {label}</p>
      <div className="list" style={{ paddingTop: 4 }}>
        {articles.length > 0 ? (
          articles.map((a) => (
            <ArticleRow key={a.slug} article={a} showStandfirst={false} />
          ))
        ) : (
          <EmptyList note={`No pieces in ${label} yet.`} />
        )}
      </div>
    </section>
  );
}
