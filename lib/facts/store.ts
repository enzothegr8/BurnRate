/**
 * The Burn Rate fact store.
 *
 * Loads the JSON records, validates them, and resolves values for rendering.
 * Validation runs at module load, so `next build` fails on an invalid record.
 * That is deliberate: provenance is structural, and an uncited record must not
 * render (data-model.md section 1).
 *
 * Invariants enforced here:
 * 1. A record with zero sources throws. Every source needs a resolving URL.
 * 2. A derived fact carries no confidence field. If one appears in the JSON,
 *    the build throws. Derived facts are dotted by construction.
 * 3. Confidence maps to the underline and nothing else does (see figure.tsx,
 *    which takes only a ResolvedFact and has no styling escape hatch).
 * 4. Values are stored raw. Formatting lives in format.ts.
 * 5. A stale fact is flagged, never hidden.
 */

import factsJson from "@/data/facts.json";
import ledgerJson from "@/data/ledger.json";
import { evaluateFormula, referencedIds, type FormulaContext } from "./formula";
import type {
  Confidence,
  DerivedFact,
  Fact,
  LedgerRow,
  ResolvedFact,
  Source,
} from "./types";

interface FactFile {
  facts: Fact[];
  derived: DerivedFact[];
}

const CONFIDENCES: Confidence[] = ["confirmed", "reported", "derived"];
const CONFIDENCE_RANK: Record<Confidence, number> = {
  derived: 1,
  reported: 2,
  confirmed: 3,
};

const SECONDS_PER_DAY_MS = 86_400_000;

function fail(recordId: string, problem: string): never {
  throw new Error(`[fact store] Invalid record '${recordId}': ${problem}`);
}

function validateSources(id: string, sources: unknown): asserts sources is Source[] {
  if (!Array.isArray(sources) || sources.length === 0) {
    fail(id, "a record with zero sources is invalid and must not render");
  }
  for (const source of sources) {
    const s = source as Partial<Source>;
    if (!s.name) fail(id, "source is missing a name");
    if (!s.url || !/^https?:\/\//.test(s.url)) {
      fail(id, `source '${s.name}' has no resolving URL; a fact without a URL is a rumor`);
    }
    if (typeof s.tier !== "number" || s.tier < 1 || s.tier > 5) {
      fail(id, `source '${s.name}' has an invalid tier`);
    }
    // A source that does not state the record's claim is not a source for it
    // (data-model.md section 2). There is no exemption: the zeros that once
    // appeared to need one are derived facts with no sources array, computed
    // by counting an empty ledger category. A solicitation row's claim is the
    // solicitation itself, which sources do print.
    if (s.states_value !== true) {
      fail(
        id,
        `source '${s.name}' does not state the value; it is corroboration and belongs in notes`
      );
    }
    if (s.traces_to !== null && typeof s.traces_to !== "string") {
      fail(id, `source '${s.name}' is missing traces_to (an event id, or null when originating)`);
    }
    if ("tier_note" in s && (typeof s.tier_note !== "string" || s.tier_note.trim() === "")) {
      fail(id, `source '${s.name}' has an empty tier_note; say why the tier departs`);
    }
    if (!s.retrieved_at) fail(id, `source '${s.name}' is missing retrieved_at`);
  }
}

function validateFact(fact: Fact): void {
  if (!fact.id) throw new Error("[fact store] Fact with no id");
  if (typeof fact.value !== "number" || !Number.isFinite(fact.value)) {
    fail(fact.id, "value must be a finite number, stored raw");
  }
  if (!CONFIDENCES.includes(fact.confidence)) {
    fail(fact.id, `confidence '${String(fact.confidence)}' is not a confidence level`);
  }
  validateSources(fact.id, fact.sources);
}

function validateDerived(raw: DerivedFact, knownIds: Set<string>): void {
  if (!raw.id) throw new Error("[fact store] Derived fact with no id");
  // Invariant 2. The JSON is checked as data because TypeScript types do not
  // survive into the file: a derived record carrying a confidence field is a
  // corrupted record, and there is no code path that reads one.
  if ("confidence" in (raw as object)) {
    fail(raw.id, "a derived fact must not carry a confidence field; it is dotted by construction");
  }
  if (!raw.formula) fail(raw.id, "derived fact has no formula");
  if (!raw.notes || raw.notes.trim() === "") {
    fail(raw.id, "derived fact has empty notes; every derived number contains a judgment, name it");
  }
  const refs = referencedIds(raw.formula);
  for (const ref of refs) {
    if (!knownIds.has(ref)) fail(raw.id, `formula references unknown id '${ref}'`);
    if (!raw.derived_from.includes(ref)) {
      fail(raw.id, `formula reads '${ref}' but derived_from does not declare it`);
    }
  }
  const usesLedger = /ledger_sum|days_since_max_ledger_date/.test(raw.formula);
  if (usesLedger && !raw.derived_from.includes("ledger")) {
    fail(raw.id, "formula reads the ledger but derived_from does not declare 'ledger'");
  }
}

function validateLedgerRow(row: LedgerRow): void {
  if (!row.id) throw new Error("[fact store] Ledger row with no id");
  if (typeof row.value !== "number" || row.value < 0) fail(row.id, "value must be a non-negative number");
  if (!CONFIDENCES.includes(row.confidence)) fail(row.id, "invalid confidence");
  if (row.status !== "award" && row.status !== "solicitation") fail(row.id, "invalid status");
  if (row.status === "solicitation" && row.value !== 0) {
    fail(row.id, "a solicitation row must have value 0; the zero is the story");
  }
  // The Verified column is the promotion rule as a field. Confidence cannot
  // read confirmed unless Enzo has recorded opening the primary source.
  if (row.confidence === "confirmed" && (!row.verified || row.verified.trim() === "")) {
    fail(row.id, "a confirmed row with an empty verified field is a bug in the ledger");
  }
  validateSources(row.id, row.sources);
}

const factFile = factsJson as unknown as FactFile;
const ledger = ledgerJson as unknown as LedgerRow[];

const factById = new Map<string, Fact>();
const derivedById = new Map<string, DerivedFact>();

function loadAndValidate(): void {
  for (const fact of factFile.facts) {
    if (factById.has(fact.id)) fail(fact.id, "duplicate id; ids are never reused");
    validateFact(fact);
    factById.set(fact.id, fact);
  }
  const knownIds = new Set<string>(factById.keys());
  for (const derived of factFile.derived) knownIds.add(derived.id);
  for (const derived of factFile.derived) {
    if (factById.has(derived.id)) fail(derived.id, "id collides with a stored fact");
    if (derivedById.has(derived.id)) fail(derived.id, "duplicate id; ids are never reused");
    validateDerived(derived, knownIds);
    derivedById.set(derived.id, derived);
  }
  for (const row of ledger) validateLedgerRow(row);
}

loadAndValidate();

export function isStale(staleAfter: string | null, today: Date): boolean {
  if (!staleAfter) return false;
  return today.getTime() > new Date(staleAfter).getTime();
}

function ledgerAwards(): LedgerRow[] {
  return ledger.filter((row) => row.status === "award");
}

function ledgerSum(mode: "base" | "with_options"): number {
  return ledgerAwards().reduce((total, row) => {
    const option = mode === "with_options" && row.option_value ? row.option_value : 0;
    return total + row.value + option;
  }, 0);
}

function ledgerCategorySum(category: string): number {
  return ledgerAwards()
    .filter((row) => row.category === category)
    .reduce((total, row) => total + row.value, 0);
}

function daysSinceMaxLedgerDate(today: Date): number {
  const max = Math.max(...ledgerAwards().map((row) => new Date(row.date).getTime()));
  return Math.floor((today.getTime() - max) / SECONDS_PER_DAY_MS);
}

function lowestConfidence(values: Confidence[]): Confidence {
  return values.reduce((lowest, c) =>
    CONFIDENCE_RANK[c] < CONFIDENCE_RANK[lowest] ? c : lowest
  );
}

/**
 * Resolve a fact or derived fact for rendering. Derived values are computed
 * here, from the stored formula, every time. The result is never stored
 * (data-model.md section 3).
 */
export function resolveFact(id: string, today: Date = new Date()): ResolvedFact {
  return resolveWithGuard(id, today, new Set());
}

function resolveWithGuard(id: string, today: Date, visiting: Set<string>): ResolvedFact {
  if (visiting.has(id)) {
    throw new Error(`[fact store] Circular derivation involving '${id}'`);
  }

  const fact = factById.get(id);
  if (fact) {
    return {
      kind: "fact",
      id: fact.id,
      value: fact.value,
      unit: fact.unit,
      label: fact.label,
      as_of: fact.as_of,
      confidence: fact.confidence,
      sources: fact.sources,
      notes: fact.notes,
      stale: isStale(fact.stale_after, today),
      stale_after: fact.stale_after,
    };
  }

  const derived = derivedById.get(id);
  if (!derived) throw new Error(`[fact store] Unknown fact id '${id}'`);

  visiting.add(id);

  const inputConfidences: Confidence[] = [];
  let inputStale = false;

  const ctx: FormulaContext = {
    resolveId: (ref) => {
      const resolved = resolveWithGuard(ref, today, visiting);
      inputConfidences.push(resolved.kind === "derived" ? "derived" : resolved.confidence);
      if (resolved.stale) inputStale = true;
      return resolved.value;
    },
    ledgerSum: (mode) => {
      const rows = ledgerAwards();
      inputConfidences.push(lowestConfidence(rows.map((row) => row.confidence)));
      if (rows.some((row) => isStale(row.stale_after, today))) inputStale = true;
      return ledgerSum(mode);
    },
    ledgerCategorySum: (category) => {
      const rows = ledgerAwards().filter((row) => row.category === category);
      // An empty category contributes no input confidence: the sum over an
      // empty set is Burn Rate's own count, and the resolved fact's default
      // of 'derived' is exactly right for the only number this site originates.
      if (rows.length > 0) {
        inputConfidences.push(lowestConfidence(rows.map((row) => row.confidence)));
        if (rows.some((row) => isStale(row.stale_after, today))) inputStale = true;
      }
      return ledgerCategorySum(category);
    },
    daysSinceMaxLedgerDate: () => daysSinceMaxLedgerDate(today),
  };

  const value = evaluateFormula(derived.formula, ctx);
  visiting.delete(id);

  return {
    kind: "derived",
    id: derived.id,
    value,
    unit: derived.unit,
    label: derived.label,
    formula: derived.formula,
    derived_from: derived.derived_from,
    lowestInputConfidence:
      inputConfidences.length > 0 ? lowestConfidence(inputConfidences) : "derived",
    notes: derived.notes,
    stale: inputStale,
  };
}

export function getLedger(): LedgerRow[] {
  return [...ledger];
}

/** Resolve a ledger row into the shape Figure renders. Same rules, same marks. */
export function resolveLedgerRow(
  id: string,
  today: Date = new Date()
): Extract<ResolvedFact, { kind: "fact" }> {
  const row = ledger.find((r) => r.id === id);
  if (!row) throw new Error(`[fact store] Unknown ledger row '${id}'`);
  return {
    kind: "fact",
    id: row.id,
    value: row.value,
    unit: "USD",
    label: `${row.recipient}, ${row.payload ?? row.category}`,
    as_of: row.date,
    confidence: row.confidence,
    sources: row.sources,
    notes: row.notes,
    stale: isStale(row.stale_after, today),
    stale_after: row.stale_after,
  };
}

/** Resolve the unexercised option period on a ledger row as its own figure. */
export function resolveLedgerOption(
  id: string,
  today: Date = new Date()
): Extract<ResolvedFact, { kind: "fact" }> {
  const row = ledger.find((r) => r.id === id);
  if (!row) throw new Error(`[fact store] Unknown ledger row '${id}'`);
  if (!row.option_value) {
    throw new Error(`[fact store] Ledger row '${id}' carries no option value`);
  }
  return {
    kind: "fact",
    id: `${row.id}.option`,
    value: row.option_value,
    unit: "USD",
    label: `${row.recipient}, option period`,
    as_of: row.date,
    confidence: row.confidence,
    sources: row.sources,
    notes: row.notes,
    stale: isStale(row.stale_after, today),
    stale_after: row.stale_after,
  };
}

/**
 * Resolve an id from either table. A ledger row is a record with provenance
 * exactly like a stored fact; body copy referencing an award should not need
 * to know which file it lives in. Same rules, same marks.
 */
export function resolveFactOrLedgerRow(id: string, today: Date = new Date()): ResolvedFact {
  if (factById.has(id) || derivedById.has(id)) return resolveFact(id, today);
  return resolveLedgerRow(id, today);
}

export function getFactIds(): string[] {
  return [...factById.keys(), ...derivedById.keys()];
}

export function getLedgerRowIds(): string[] {
  return ledger.map((row) => row.id);
}
