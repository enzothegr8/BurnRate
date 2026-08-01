import Link from "next/link";
import { DomainTags } from "@/components/brand/domain-tag";
import type { Article } from "@/lib/articles";

// The "Latest" lead, at full lead scale.
//
// When the piece carries a cover image, the tags, kicker, headline, and
// standfirst sit directly on top of it rather than in a caption strip below.
// The dark layer between the image and the text is a single flat tint, mixed
// down from the jet token rather than typed in as its own translucent hex, and
// it is never a gradient: one solid color, one opacity, the same rule that
// governs every panel in this system. A hairline border still closes the card.
//
// A piece with no cover falls back to the plain teaser. There is no
// placeholder graphic standing in for a missing one, the same way a missing
// figure is an empty slot rather than an invented number.
export function LeadTeaser({ article }: { article: Article }) {
  const tags = <DomainTags domains={article.domains} />;
  const kicker = <p className="kick">{article.kicker}</p>;
  const standfirst = <p className="lead-d">{article.standfirst}</p>;
  const meta = (
    <p className="meta">
      {article.date} · Rev {article.rev}
    </p>
  );

  if (!article.cover) {
    return (
      <div>
        {tags}
        {kicker}
        <Link href={`/articles/${article.slug}`}>
          <h1 className="lead-h">{article.title}</h1>
        </Link>
        {standfirst}
        {meta}
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/articles/${article.slug}`}
        className="lead-cover"
        aria-label={article.title}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- covers are
            hand-built SVG vector art; see the same note in CoverImage. */}
        <img
          className="lead-cover-img"
          src={article.cover}
          alt={article.coverAlt ?? ""}
        />
        <div className="lead-cover-scrim" aria-hidden />
        <div className="lead-cover-text">
          {tags}
          {kicker}
          <h1 className="lead-h">{article.title}</h1>
          {standfirst}
        </div>
      </Link>
      <div style={{ marginTop: "var(--space-12)" }}>{meta}</div>
    </div>
  );
}
