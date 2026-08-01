import type { Article } from "@/lib/articles";

// The foot of every piece. Rendered from frontmatter by the article route
// rather than written into each MDX body, so it cannot go missing and cannot
// disagree with the record the list is sorted by.
//
// There is no source count here yet, deliberately. A count is a number, and the
// only honest way to produce it is to resolve the records the piece actually
// cites and count their effective sources, remembering that two outlets
// repeating one sentence are one source. Typing a plausible integer into
// frontmatter would be the exact failure this publication exists to correct, so
// the line is absent until it can be computed.
export function TitleBlock({ article }: { article: Article }) {
  return (
    <div className="titleblock">
      <p className="meta">
        Doc {article.doc_id} · Rev {article.rev} · Updated {article.date} ·
        Drawn E. Carvalho
        {article.status !== "published" ? ` · ${article.status}` : ""}
      </p>
    </div>
  );
}
