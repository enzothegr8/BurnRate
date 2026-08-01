// The notation is not a stylesheet, it is a schema. Solid, dashed, and dotted
// only render correctly if every number is a record carrying its own
// provenance. Burn Rate is not pages with numbers typed into them. It is a fact
// table that renders itself.

export type Confidence = "confirmed" | "reported" | "derived";

export const DOMAINS = ["space", "ai", "robotics", "energy"] as const;
export type Domain = (typeof DOMAINS)[number];

// Closed enum. A measurement that does not fit is a conversation about the
// schema, not a string typed into a record.
export const UNITS = [
  "USD",
  "USD_per_kg",
  "USD_per_W",
  "USD_per_MWh",
  "W",
  "Wh",
  "kg",
  "count",
  "percent",
  "days",
  "years",
  "FLOP",
  "tokens",
  "capacity_factor",
] as const;
export type Unit = (typeof UNITS)[number];

export const STALENESS_CLASSES = [
  "live",
  "fast",
  "quarterly",
  "slow",
  "projection",
] as const;
export type StalenessClass = (typeof STALENESS_CLASSES)[number];

export type Tier = 1 | 2 | 3 | 4 | 5;

export type Source = {
  name: string;
  url: string;
  /** Per claim, not per outlet. A tier 2 outlet repeating a remark from a
   *  podium is making a tier 4 claim. */
  tier: Tier;
  /** Does this source print this value? If false it is not a source for it.
   *  Corroboration for something adjacent belongs in notes. */
  states_value: boolean;
  /** Id of the underlying event when a source is relaying rather than
   *  originating. Two sources repeating one sentence are one source. */
  traces_to: string | null;
  /** Required when the tier departs from the outlet's default. */
  tier_note?: string;
  /** When the source was checked. This, not as_of, anchors staleness. */
  retrieved_at: string;
};

export type Fact = {
  /** Dot namespaced, stable, human readable. Never reused. */
  id: string;
  domain: Domain;
  /** Raw. Never pre-formatted. Formatting is a render concern. */
  value: number;
  unit: Unit;
  label: string;
  /** The date the figure describes, not the date it was fetched. */
  as_of: string;
  /** Drives the underline and nothing else does. */
  confidence: Confidence;
  /** At least one. Zero sources is invalid and must not render. */
  sources: Source[];
  /** Competing framings, ambiguities, denominator choices. Required for FLOP. */
  notes?: string;
  stale_after: StalenessClass;
  /** For revised figures. The old record is retained, never deleted. */
  supersedes?: string;
};

// A derived fact is a separate type, not a Fact with a flag.
//
// It carries no confidence field because it cannot be more confident than its
// inputs, and because the answer is always "derived" anyway. The `confidence?:
// never` below is the enforcement: it makes assigning any confidence to a
// derived fact a compile error rather than something a validator has to catch
// after the fact. See types.test.ts, which asserts that the error still fires.
//
// This matters more than it looks. Marking a reported figure as derived is as
// wrong as the reverse, and the failure mode for a derived record is not
// mislabeling, it is a component quietly overriding the mark to something the
// arithmetic does not support.
export type DerivedFact = {
  id: string;
  domain: Domain;
  unit: Unit;
  label: string;
  as_of: string;
  /** Ids of the records this is computed from. Must match the formula. */
  derived_from: string[];
  /** The expression, never the result. Recomputed on read. */
  formula: string;
  /** Present when the formula spans domains. Ratios across domains are legal
   *  and are the point. Sums are not. */
  cross_domain?: Domain[];
  /** May not be empty. Every derived number contains a judgment: a denominator,
   *  a method, a rate assumption. Name it. */
  notes: string;
  stale_after?: StalenessClass;
  supersedes?: string;
  confidence?: never;
};

export type AnyFact = Fact | DerivedFact;

export function isDerived(fact: AnyFact): fact is DerivedFact {
  return "formula" in fact;
}

/** What a component receives: the record, the recomputed value, and the mark. */
export type ResolvedFact = {
  id: string;
  domain: Domain;
  unit: Unit;
  label: string;
  value: number;
  confidence: Confidence;
  stale: boolean;
  record: AnyFact;
};
