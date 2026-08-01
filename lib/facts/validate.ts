// Provenance becomes structural. You cannot forget to cite something, because
// an uncited record will not render.
//
// These rules run at build time and fail the build. That is deliberate. A rule
// that only runs when someone remembers to look is a rule that decays, and the
// whole promise of this publication is that the notation does not decay.

import {
  DEFINITIONAL_CONSTANTS,
  additiveDomainConflicts,
  numericLiterals,
  parse,
  referencedIds,
} from "./formula";
import type { AnyFact, DerivedFact, Fact, Source } from "./types";
import { isDerived } from "./types";

export type ValidationError = {
  id: string;
  rule: string;
  message: string;
};

export class FactStoreError extends Error {
  constructor(public errors: ValidationError[]) {
    super(
      `Fact store is invalid:\n${errors
        .map((e) => `  ${e.id} [${e.rule}] ${e.message}`)
        .join("\n")}`,
    );
    this.name = "FactStoreError";
  }
}

/**
 * Two sources repeating one sentence are one source.
 *
 * A capex figure spoken once on an earnings call and printed by six outlets is
 * one source with six repetitions. traces_to records the underlying utterance,
 * so everything pointing at the same one collapses to a single count. A source
 * with traces_to null is originating and counts on its own.
 *
 * Sources that do not state the value are excluded before counting, because a
 * source cited for a figure it does not print never supported it.
 */
export function effectiveSourceCount(sources: Source[]): number {
  const stating = sources.filter((s) => s.states_value);
  const relayed = new Set<string>();
  let originating = 0;
  for (const source of stating) {
    if (source.traces_to === null) originating += 1;
    else relayed.add(source.traces_to);
  }
  return originating + relayed.size;
}

// A keyword tripwire, not comprehension. It cannot tell whether the precision
// stated is the right one, only that the record says something about precision
// at all. That is still worth having: the common failure is silence, not a
// wrong answer.
const FLOP_REQUIREMENTS: { label: string; pattern: RegExp }[] = [
  { label: "precision", pattern: /precision|fp\d+|bf16|tf32|int\d+/i },
  { label: "generation", pattern: /generation|\bgen\b/i },
  { label: "peak versus achieved", pattern: /peak|achieved|sustained/i },
];

export function validateFact(fact: Fact): ValidationError[] {
  const errors: ValidationError[] = [];
  const fail = (rule: string, message: string) =>
    errors.push({ id: fact.id, rule, message });

  for (const source of fact.sources) {
    if (!source.states_value) {
      fail(
        "source-states-value",
        `source "${source.name}" does not state this value, so it is not a source for it. Corroboration for something adjacent belongs in notes.`,
      );
    }
  }

  if (effectiveSourceCount(fact.sources) === 0) {
    fail(
      "no-sources",
      "has no source that states its value. A figure without a resolving source is a rumor and does not render.",
    );
  }

  if (fact.unit === "FLOP") {
    const missing = FLOP_REQUIREMENTS.filter(
      (r) => !r.pattern.test(fact.notes ?? ""),
    ).map((r) => r.label);
    if (missing.length > 0) {
      fail(
        "flop-notes",
        `is a FLOP figure whose notes do not state ${missing.join(", ")}. Without all three it is not comparable to anything.`,
      );
    }
  }

  return errors;
}

export function validateDerivedFact(
  fact: DerivedFact,
  domainOf: (id: string) => AnyFact | undefined,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const fail = (rule: string, message: string) =>
    errors.push({ id: fact.id, rule, message });

  if (fact.notes.trim() === "") {
    fail(
      "derived-notes",
      "has empty notes. Every derived number contains a judgment: a denominator, a method, a rate assumption. Name it.",
    );
  }

  let tree;
  try {
    tree = parse(fact.formula);
  } catch (error) {
    fail("formula-unparseable", (error as Error).message);
    return errors;
  }

  for (const literal of numericLiterals(tree)) {
    if (!DEFINITIONAL_CONSTANTS.has(literal)) {
      fail(
        "formula-literal",
        `formula references the literal ${literal}. A derived fact points at a record id, never a raw number. The test is not whether a number looks trivial, it is whether it could turn out to be wrong.`,
      );
    }
  }

  const referenced = referencedIds(tree);
  for (const id of referenced) {
    if (!domainOf(id)) {
      fail("formula-unknown-id", `formula references unknown record "${id}".`);
    }
  }

  // Consistency check beyond the listed rules: derived_from is what a reader
  // and a staleness pass both trust, so it has to be the same set the formula
  // actually uses.
  const declared = new Set(fact.derived_from);
  for (const id of referenced) {
    if (!declared.has(id)) {
      fail(
        "derived-from-mismatch",
        `formula uses "${id}" but derived_from does not list it.`,
      );
    }
  }
  for (const id of declared) {
    if (!referenced.includes(id)) {
      fail(
        "derived-from-mismatch",
        `derived_from lists "${id}" but the formula does not use it.`,
      );
    }
  }

  const conflicts = additiveDomainConflicts(tree, (id) => domainOf(id)?.domain);
  for (const conflict of conflicts) {
    fail(
      "cross-domain-sum",
      `${conflict}. The overlaps between domains are real and unquantified, so the four are reported separately. Ratios across domains are legal and are the point; sums are not.`,
    );
  }

  return errors;
}

export function validateStore(records: AnyFact[]): ValidationError[] {
  const byId = new Map<string, AnyFact>();
  const errors: ValidationError[] = [];

  for (const record of records) {
    if (byId.has(record.id)) {
      errors.push({
        id: record.id,
        rule: "duplicate-id",
        message: "id is used more than once. Ids are stable and never reused.",
      });
    }
    byId.set(record.id, record);
  }

  const lookup = (id: string) => byId.get(id);

  for (const record of records) {
    errors.push(
      ...(isDerived(record)
        ? validateDerivedFact(record, lookup)
        : validateFact(record)),
    );
  }

  return errors;
}

/** Throws on the first invalid store. Called at module load by the store, so an
 *  invalid record fails the build rather than reaching a page. */
export function assertStoreValid(records: AnyFact[]): void {
  const errors = validateStore(records);
  if (errors.length > 0) throw new FactStoreError(errors);
}
