// Every fact declares when it goes off. If today is past its window, the site
// flags it rather than hiding it.
//
// The failure mode for a solo operator is not lying, it is decay. A site that
// flags its own stale figures is more trustworthy than one that pretends.

import type { AnyFact, Fact, StalenessClass } from "./types";
import { isDerived } from "./types";

/** Days. `live` refetches on load and `projection` never expires; it is
 *  restated with its vintage instead. */
export const STALENESS_WINDOW: Record<StalenessClass, number | null> = {
  live: 0,
  fast: 30,
  quarterly: 100,
  slow: 400,
  projection: null,
};

const DAY_MS = 86_400_000;

/**
 * The anchor is the retrieval, not the event. A figure goes stale because the
 * verification aged, not because the world did, which is why this reads
 * retrieved_at and never touches as_of.
 *
 * Where a fact has several sources, the anchor is the most recent retrieval
 * among its best sources, meaning those at the highest tier it has. Not the
 * most recent retrieval overall.
 *
 * That distinction is the whole rule. A figure resting on a NASA budget
 * document checked in January and a trade reprint checked in July has not been
 * re-verified by the reprint: whether an outlet still prints a number says
 * nothing about whether the originating party revised it. Anchoring on the most
 * recent retrieval of anything would let a cheap re-check launder a figure into
 * looking fresh, which is the same laundering this publication exists to catch,
 * performed on ourselves.
 *
 * Only sources that state the value count, because a source that does not print
 * the number never verified it in the first place.
 */
export function verificationAnchor(fact: Fact): string | null {
  const stating = fact.sources.filter((s) => s.states_value);
  if (stating.length === 0) return null;

  // Tier 1 is the best. Lower number wins.
  const bestTier = Math.min(...stating.map((s) => s.tier));
  return stating
    .filter((s) => s.tier === bestTier)
    .map((s) => s.retrieved_at)
    .sort()
    .at(-1)!;
}

export type Staleness = {
  class: StalenessClass;
  anchor: string | null;
  expiresOn: string | null;
  stale: boolean;
};

export function staleness(fact: AnyFact, now: Date): Staleness {
  // A derived fact is only as fresh as its inputs, so it carries no window of
  // its own unless one was set deliberately.
  const cls: StalenessClass = isDerived(fact)
    ? (fact.stale_after ?? "projection")
    : fact.stale_after;

  const window = STALENESS_WINDOW[cls];
  if (window === null) {
    return { class: cls, anchor: null, expiresOn: null, stale: false };
  }

  const anchor = isDerived(fact) ? null : verificationAnchor(fact);
  if (!anchor) {
    return { class: cls, anchor: null, expiresOn: null, stale: false };
  }

  const expires = new Date(Date.parse(anchor) + window * DAY_MS);
  return {
    class: cls,
    anchor,
    expiresOn: expires.toISOString().slice(0, 10),
    stale: now.getTime() > expires.getTime(),
  };
}

/** Stale facts render flagged, never hidden. Nothing in this module removes a
 *  record from a page; it only reports that the check has aged. */
export function isStale(fact: AnyFact, now: Date): boolean {
  return staleness(fact, now).stale;
}
