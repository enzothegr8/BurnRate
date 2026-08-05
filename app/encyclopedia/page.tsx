import type { Metadata } from "next";
import { EmptyList } from "@/components/articles/empty-list";
import { DomainTag } from "@/components/brand/domain-tag";
import { EntryRow } from "@/components/encyclopedia/entry-row";
import {
  ENTRIES,
  entriesInDomain,
  entriesInLens,
} from "@/lib/encyclopedia/store";
import { DOMAINS, LENSES, LENS_LABEL } from "@/lib/encyclopedia/types";

export const metadata: Metadata = { title: "Encyclopedia" };

// The research archive, organized by domain and then by lens.
//
// An entry tagged with two domains appears under both, deliberately. The
// intersections are the main point of the site, and an index that filed each
// entry under one primary domain would be asserting a primary domain that the
// tag system does not have.
//
// Domains run in the fixed order Space, AI, Robotics, Energy, which is a
// presentation convention and not a ranking. Lenses run economics, politics,
// science, the order they are given in section 1.
export default function EncyclopediaPage() {
  return (
    <section className="view">
      <h1 className="lead-h">Encyclopedia</h1>
      <p className="lead-d">
        Everything Burn Rate has researched, organized and navigable. A finding
        is known when it lives in an entry or the fact store, and nowhere else.
      </p>

      <div style={{ height: 44 }} />

      {ENTRIES.length === 0 && (
        <div className="list">
          <EmptyList note="No entries yet. The archive starts empty and says so." />
        </div>
      )}

      {DOMAINS.map((domain) => {
        const entries = entriesInDomain(domain);
        return (
          <div className="encsec" key={domain}>
            <div className="encsec-h">
              <DomainTag domain={domain} />
            </div>
            <div className="list">
              {entries.length > 0 ? (
                entries.map((entry) => <EntryRow key={entry.id} entry={entry} />)
              ) : (
                <EmptyList note="Nothing filed under this domain yet." />
              )}
            </div>
          </div>
        );
      })}

      {LENSES.map((lens) => {
        const entries = entriesInLens(lens);
        return (
          <div className="encsec" key={lens}>
            <p className="sechead">{LENS_LABEL[lens]}</p>
            <div className="list">
              {entries.length > 0 ? (
                entries.map((entry) => <EntryRow key={entry.id} entry={entry} />)
              ) : (
                <EmptyList note="Nothing read through this lens yet." />
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
