import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DomainTags } from "@/components/brand/domain-tag";
import { EntryTitleBlock } from "@/components/encyclopedia/entry-title-block";
import { RelatedBlock } from "@/components/encyclopedia/related-block";
import { ENTRIES, entryBySlug, relatedFor } from "@/lib/encyclopedia/store";
import { LENS_LABEL } from "@/lib/encyclopedia/types";

// Reuses the article page shape: one centered measure at 64 characters, the
// header and title block rendered from frontmatter rather than written into the
// body, and the body as the only thing the MDX file supplies.
//
// A stub is a real page. It renders its title, its connections, and a plain
// statement that nothing is written yet, which is exactly what it is: a node
// with real edges and no content. It does not import a body, because it has
// none, and inventing a placeholder paragraph for it would be filling a gap
// rather than rendering it.

export const dynamicParams = false;

export function generateStaticParams() {
  return ENTRIES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = entryBySlug(slug);
  return { title: entry ? entry.title : "Entry" };
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = entryBySlug(slug);
  if (!entry) notFound();

  const isStub = entry.status === "stub";
  const Body = isStub
    ? null
    : (await import(`@/content/encyclopedia/${slug}.mdx`)).default;

  return (
    <section className="view art">
      <div className="measure">
        <Link href="/encyclopedia" className="back">
          ← All entries
        </Link>

        <DomainTags domains={entry.domains} />
        {entry.lenses.length > 0 && (
          <p className="kick">
            {entry.lenses.map((l) => LENS_LABEL[l]).join(" · ")}
          </p>
        )}
        <h1 className="article-title">{entry.title}</h1>
        {entry.standfirst !== "" && <p className="stand">{entry.standfirst}</p>}
      </div>

      <div className="measure">
        {isStub ? (
          <p className="stub-note">
            This entry is a stub. It has been named and connected but not
            written, and it is shown rather than hidden because the shape of
            what is not yet known is part of what this archive is for.
          </p>
        ) : (
          <Body />
        )}

        <RelatedBlock links={relatedFor(entry)} />

        <EntryTitleBlock entry={entry} />
      </div>
    </section>
  );
}
