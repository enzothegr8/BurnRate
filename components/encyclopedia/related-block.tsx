import Link from "next/link";
import { EmptyList } from "@/components/articles/empty-list";
import type { RelatedLink } from "@/lib/encyclopedia/store";

// Everything linked to this entry, from both directions, already deduplicated
// by relatedFor().
//
// Rendered even when empty, for the reason EmptyList exists: a section that
// disappears when it has nothing in it tells the reader the section does not
// exist, which is a different statement than saying it is empty. On a stub this
// block is most of the page, and an unconnected stub is worth seeing as such.
export function RelatedBlock({ links }: { links: RelatedLink[] }) {
  return (
    <div className="related">
      <p className="sechead">Related</p>
      <div className="list">
        {links.length > 0 ? (
          links.map((link) =>
            link.kind === "entry" ? (
              <div className="it" key={link.entry.id}>
                <Link href={`/encyclopedia/${link.entry.slug}`}>
                  <h3
                    className={
                      link.entry.status === "stub" ? "row-h stub-h" : "row-h"
                    }
                  >
                    {link.entry.title}
                  </h3>
                  <p className="meta">
                    Entry
                    {link.entry.status !== "published"
                      ? ` · ${link.entry.status}`
                      : ""}
                  </p>
                </Link>
              </div>
            ) : (
              <div className="it" key={`article:${link.slug}`}>
                <Link href={`/articles/${link.slug}`}>
                  <h3 className="row-h">{link.title}</h3>
                  <p className="meta">Article</p>
                </Link>
              </div>
            ),
          )
        ) : (
          <EmptyList note="Nothing links here yet." />
        )}
      </div>
    </div>
  );
}
