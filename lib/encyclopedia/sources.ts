// The source count for an entry's title block.
//
// The article title block deliberately has no source count, and says why: a
// count is a number, and the only honest way to produce one is to resolve the
// records a piece actually cites and count their effective sources. That is now
// possible for entries, because fact discovery gives us the cited ids by
// scanning the body rather than by trusting a hand-written list.
//
// Two things this gets right that a naive count would not.
//
// Derived records carry no sources of their own. Their provenance is whatever
// their inputs carry, so the walk follows derived_from down to the records that
// actually cite something. A derived figure counted as zero sources would
// understate it; counted as one would invent one.
//
// Two outlets reprinting one remark are one source. effectiveSourceCount
// already collapses by traces_to, so the sources are pooled across every cited
// record before counting, not counted per record and summed. Summing per record
// would count the same underlying utterance once for every figure that leans on
// it, which is the exact shape that makes a claim look better sourced than it is.

import { getRecord } from "@/lib/facts/store";
import type { Source } from "@/lib/facts/types";
import { isDerived } from "@/lib/facts/types";
import { effectiveSourceCount } from "@/lib/facts/validate";

function collectSources(
  id: string,
  into: Source[],
  seen: Set<string>,
): void {
  if (seen.has(id)) return;
  seen.add(id);

  const record = getRecord(id);
  if (!record) return;

  if (isDerived(record)) {
    for (const input of record.derived_from) collectSources(input, into, seen);
    return;
  }
  into.push(...record.sources);
}

/** Effective sources behind every figure an entry cites, pooled and collapsed. */
export function sourceCountFor(factIds: readonly string[]): number {
  const pooled: Source[] = [];
  const seen = new Set<string>();
  for (const id of factIds) collectSources(id, pooled, seen);
  return effectiveSourceCount(pooled);
}
