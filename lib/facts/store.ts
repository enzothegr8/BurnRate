// The store. It validates itself when it is imported, so an invalid record
// throws during the build rather than rendering a number that has not earned
// its mark.
//
// It currently holds the fixtures and nothing else, because no real figure has
// been gathered against this schema yet. An empty store is the honest state and
// it is not a problem to solve by inventing rows.

import { evaluateFormula, resolveDerivedConfidence } from "./formula";
import { FIXTURE_RECORDS } from "./fixtures";
import { isStale } from "./stale";
import type { AnyFact, Confidence, ResolvedFact } from "./types";
import { isDerived } from "./types";
import { assertStoreValid } from "./validate";

export const RECORDS: AnyFact[] = [...FIXTURE_RECORDS];

// Runs at module load. This is the build-time gate.
assertStoreValid(RECORDS);

const BY_ID = new Map(RECORDS.map((r) => [r.id, r]));

export function getRecord(id: string): AnyFact | undefined {
  return BY_ID.get(id);
}

function valueOf(record: AnyFact): number {
  if (!isDerived(record)) return record.value;
  // The formula is recomputed on read, every read. Nothing caches the result,
  // because a cached result is a second copy of a number.
  return evaluateFormula(record.formula, (id) => {
    const input = getRecord(id);
    if (!input) throw new Error(`${record.id} references unknown "${id}"`);
    return valueOf(input);
  });
}

function confidenceOf(record: AnyFact): Confidence {
  if (!isDerived(record)) return record.confidence;
  const inputs = record.derived_from.map((id) => {
    const input = getRecord(id);
    return input ? confidenceOf(input) : "derived";
  });
  return resolveDerivedConfidence(inputs);
}

/** What a component gets. Never the raw record, so nothing downstream can set
 *  a mark the arithmetic does not support. */
export function resolveFact(
  id: string,
  now: Date = new Date(),
): ResolvedFact | undefined {
  const record = getRecord(id);
  if (!record) return undefined;
  return {
    id: record.id,
    domain: record.domain,
    unit: record.unit,
    label: record.label,
    value: valueOf(record),
    confidence: confidenceOf(record),
    stale: isStale(record, now),
    record,
  };
}
