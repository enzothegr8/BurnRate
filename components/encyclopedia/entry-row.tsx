import Link from "next/link";
import { LENS_LABEL, type Entry } from "@/lib/encyclopedia/types";

// One row in a hairline-separated list, the same treatment the articles list
// uses. No card grid, and the same reason: equal-weight cards hide judgment and
// the layout visibly breaks at low volume.
//
// A stub renders muted and marked rather than hidden. An archive that showed
// only its finished entries would misrepresent itself, and the gaps are part of
// what the encyclopedia is for. There is no invented standfirst standing in for
// the missing one, the same way a missing figure is an empty slot rather than a
// number somebody made up.
//
// No domain tags on the row. The section head above it is the domain tag, and
// repeating it on every row under it says nothing the position has not already
// said. Lens sections take the same treatment for consistency: an entry's
// domains are one click away on the entry itself.
export function EntryRow({ entry }: { entry: Entry }) {
  const isStub = entry.status === "stub";
  const lenses = entry.lenses.map((l) => LENS_LABEL[l]);

  return (
    <div className="it">
      <Link href={`/encyclopedia/${entry.slug}`}>
        <h3 className={isStub ? "row-h stub-h" : "row-h"}>{entry.title}</h3>
        {entry.standfirst !== "" && <p className="row-d">{entry.standfirst}</p>}
        <p className="meta">
          {isStub && <span className="stub-mark">Stub</span>}
          {!isStub && entry.status !== "published" && <span>{entry.status}</span>}
          {(entry.status !== "published" || isStub) && lenses.length > 0 && " · "}
          {lenses.join(" · ")}
        </p>
      </Link>
    </div>
  );
}
