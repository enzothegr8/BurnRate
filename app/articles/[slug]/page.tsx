import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TitleBlock } from "@/components/articles/title-block";
import { DomainTags } from "@/components/brand/domain-tag";
import { ARTICLES, articleBySlug } from "@/lib/articles";

// A single centered measure at 64 characters. The measure is centered so that
// full-width breakout media can be added later as a variant without
// restructuring the page around it.
//
// The header and the title block are rendered here from frontmatter rather than
// written into each MDX body, so every piece carries them and none of them can
// disagree with the record the list is sorted by. The body is the only thing
// the MDX file supplies.

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug(slug);
  return { title: article ? article.title : "Article" };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();

  const { default: Body } = await import(`@/content/articles/${slug}.mdx`);

  return (
    <section className="view art">
      <div className="measure">
        <Link href="/articles" className="back">
          ← All articles
        </Link>

        <DomainTags domains={article.domains} />
        <p className="kick">{article.kicker}</p>
        <h2>{article.title}</h2>
        <p className="stand">{article.standfirst}</p>

        <Body />

        <TitleBlock article={article} />
      </div>
    </section>
  );
}
