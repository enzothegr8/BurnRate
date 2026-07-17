/**
 * Burn Rate fact store types.
 *
 * The notation is not a stylesheet, it is a schema (data-model.md section 1).
 * Every number on the site is a record carrying its own provenance. These types
 * are the contract for that.
 *
 * Structural guarantees, enforced here and in store.ts:
 * - A Fact carries exactly one confidence, and confidence is the only thing
 *   that maps to an underline.
 * - A DerivedFact has NO confidence field. It cannot be given one. Derived
 *   facts are dotted by construction; there is no code path to 'confirmed'.
 * - A record with zero sources fails validation and never renders.
 */

export type Confidence = "confirmed" | "reported" | "derived";

/** Source tier per editorial-standards.md section 4. 1 is primary, 5 is aggregator. */
export type SourceTier = 1 | 2 | 3 | 4 | 5;

export interface Source {
  name: string;
  /** Must resolve. A fact without a URL is a rumor (editorial-standards.md section 8). */
  url: string;
  tier: SourceTier;
  /** ISO date the source was retrieved. */
  retrieved_at: string;
}

export type Unit = "USD" | "USD_per_kg" | "count" | "percent" | "days" | "kg";

/** A stored fact. Raw value, provenance attached. Formatting is a render concern. */
export interface Fact {
  /** Dot-namespaced, stable, human-readable. Never reused. */
  id: string;
  /** Raw. Never pre-formatted. */
  value: number;
  unit: Unit;
  label: string;
  /** The date the figure describes, not the date it was fetched. */
  as_of: string;
  confidence: Confidence;
  /** At least one. Validated in store.ts; a zero-source record throws at build time. */
  sources: Source[];
  /** Competing framings, ambiguities, denominator choices. Travels with the number. */
  notes: string;
  /** Past this date the fact is flagged stale, never hidden (data-model.md section 5). */
  stale_after: string | null;
  supersedes: string | null;
}

/**
 * A derived fact stores its formula, not its result. It is recomputed on
 * render and rendered dotted, always. Note the absence of a confidence field:
 * that absence is the invariant. Do not add one.
 */
export interface DerivedFact {
  id: string;
  /** Ids of the facts (or 'ledger') this derivation reads. */
  derived_from: string[];
  /** Evaluated by lib/facts/formula.ts. Fact ids, numbers, + - * / ( ), and ledger functions. */
  formula: string;
  unit: Unit;
  label: string;
  /**
   * Required and validated non-empty. Every derived number contains a judgment
   * (a denominator, a method, a rate assumption) and the note names it. Because
   * the note lives on the record, it travels to every render site; there is no
   * way to resolve the value without also holding the note.
   */
  notes: string;
}

export type LedgerCategory =
  | "lander"
  | "rover"
  | "delivery"
  | "habitat"
  | "power"
  | "other";

/**
 * 'award' rows are signed money. 'solicitation' rows are open calls with
 * value 0. The zero is the story (data-model.md section 4); solicitation rows
 * render with the same weight as funded rows.
 */
export type LedgerStatus = "award" | "solicitation";

export interface LedgerRow {
  id: string;
  recipient: string;
  /** Raw USD. 0 for solicitation rows. */
  value: number;
  /** Unexercised option value, if the award carries one. Not part of the base. */
  option_value: number | null;
  date: string;
  category: LedgerCategory;
  phase: number;
  vehicle: string | null;
  payload: string | null;
  status: LedgerStatus;
  confidence: Confidence;
  sources: Source[];
  notes: string;
  stale_after: string | null;
}

/**
 * A fact resolved for rendering. Discriminated so a renderer cannot treat a
 * derived value as a stored one. For derived facts the notes ride along as a
 * required field on the same object as the value; holding one means holding
 * the other.
 */
export type ResolvedFact =
  | {
      kind: "fact";
      id: string;
      value: number;
      unit: Unit;
      label: string;
      as_of: string;
      confidence: Confidence;
      sources: Source[];
      notes: string;
      stale: boolean;
      stale_after: string | null;
    }
  | {
      kind: "derived";
      id: string;
      /** Computed from the stored formula at resolve time. Never stored. */
      value: number;
      unit: Unit;
      label: string;
      formula: string;
      derived_from: string[];
      /** Lowest confidence among inputs, for transparency. Rendering ignores it: derived is dotted, always. */
      lowestInputConfidence: Confidence;
      notes: string;
      stale: boolean;
    };

/** The underline mark. Derived facts map to 'dotted' unconditionally. */
export type UnderlineMark = "solid" | "dashed" | "dotted";

export function markFor(resolved: ResolvedFact): UnderlineMark {
  if (resolved.kind === "derived") return "dotted";
  switch (resolved.confidence) {
    case "confirmed":
      return "solid";
    case "reported":
      return "dashed";
    case "derived":
      return "dotted";
  }
}
