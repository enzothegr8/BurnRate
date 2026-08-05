import { sourceCountFor } from "@/lib/encyclopedia/sources";
import type { Entry } from "@/lib/encyclopedia/types";

// The foot of every entry, rendered from frontmatter and from the discovered
// facts rather than written into the MDX body, so it cannot go missing and
// cannot disagree with the record the index is built from.
//
// This carries the source count the article title block does not. The
// difference is not that entries deserve one and articles do not: it is that
// the count is computed here from the records the body actually cites, found by
// scanning for figures. Nobody types it, so there is nothing to go stale and
// nothing to inflate. When articles gain the same scan they gain the same line.
export function EntryTitleBlock({ entry }: { entry: Entry }) {
  const sources = sourceCountFor(entry.factIds);

  return (
    <div className="titleblock">
      <p className="meta">
        Doc {entry.id} · Rev {entry.rev} · Updated {entry.updated} · Drawn E.
        Carvalho
        {entry.status !== "published" ? ` · ${entry.status}` : ""}
        {" · "}
        {/* A computed count of the records this entry cites, not a claim about
            the world. It comes from the scan and cannot be typed, which is the
            only reason it is allowed to be a number on the page. */}
        {sources} {sources === 1 ? "source" : "sources"}
      </p>
    </div>
  );
}
