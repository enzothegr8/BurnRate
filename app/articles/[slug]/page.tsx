import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DomainTags } from "@/components/brand/domain-tag";
import { Figure } from "@/components/facts/figure";
import { ARTICLES, articleBySlug } from "@/lib/site";

// A single centered measure at 64 characters. The measure is centered so that
// full-width breakout media can be added later as a variant without
// restructuring the page around it.

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

        {/* Placeholder prose. It exists to show how a marked figure sits inside
            a sentence, not to make a claim. Every figure below is visibly fake
            on purpose: this repository is public, and a plausible fake number
            in a publication built on marking its numbers is the one thing it
            must never ship. */}
        <p>
          The pitch is free cooling and uninterrupted sun. The bill is launch
          mass. Announced capacity across the credible proposals sits at{" "}
          <Figure value="0.0GW" confidence="reported" />, against contracted
          capacity of <Figure value="0GW" confidence="confirmed" />. Announced,
          contracted, and energized are three different numbers wearing one
          word, and this sentence is placeholder copy.
        </p>

        <div className="inset">
          <p>
            An inset panel. Assumptions, denominators, and anything a reader can
            skip without losing the argument.
          </p>
        </div>

        <p>
          The implied cost per delivered watt works out to{" "}
          <Figure value="$00.00/W" confidence="derived" /> on the most generous
          assumptions available, and the assumptions are doing most of the work.
          Placeholder copy.
        </p>

        <p>
          Until someone publishes delivered watts per kilogram on orbit, every
          projection in this category is an argument about physics dressed as a
          financial model. Placeholder copy.
        </p>

        <div className="titleblock">
          <p className="meta">
            Doc BR-0000 · Rev {article.rev} · Updated {article.date} · Drawn E.
            Carvalho · Sources {article.sources}
          </p>
        </div>
      </div>
    </section>
  );
}
