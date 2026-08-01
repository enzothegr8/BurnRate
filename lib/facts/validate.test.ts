import { describe, expect, it } from "vitest";
import type { AnyFact, DerivedFact, Fact, Source } from "./types";
import {
  effectiveSourceCount,
  validateDerivedFact,
  validateFact,
  validateStore,
} from "./validate";

// Every rule below gets a case that fails it. A validator suite that only shows
// valid input proves the happy path and nothing else, and the whole reason
// these rules exist is the input nobody meant to write.

function source(over: Partial<Source> = {}): Source {
  return {
    name: "Test source",
    url: "https://example.com/test",
    tier: 1,
    states_value: true,
    traces_to: null,
    retrieved_at: "2026-07-01",
    ...over,
  };
}

function fact(over: Partial<Fact> = {}): Fact {
  return {
    id: "test.fact",
    domain: "space",
    value: 1,
    unit: "USD",
    label: "Test",
    as_of: "2026-06-01",
    confidence: "reported",
    sources: [source()],
    stale_after: "fast",
    ...over,
  };
}

function derived(over: Partial<DerivedFact> = {}): DerivedFact {
  return {
    id: "test.derived",
    domain: "space",
    unit: "USD_per_kg",
    label: "Test derived",
    as_of: "2026-06-01",
    derived_from: ["a.space", "b.space"],
    formula: "a.space / b.space",
    notes: "A denominator choice worth naming.",
    ...over,
  };
}

const LOOKUP: Record<string, AnyFact> = {
  "a.space": fact({ id: "a.space", domain: "space" }),
  "b.space": fact({ id: "b.space", domain: "space" }),
  "c.energy": fact({ id: "c.energy", domain: "energy" }),
  "d.ai": fact({ id: "d.ai", domain: "ai" }),
};
const lookup = (id: string) => LOOKUP[id];

const rules = (errors: { rule: string }[]) => errors.map((e) => e.rule);

describe("a fact needs a source that states its value", () => {
  it("accepts a fact with one originating source", () => {
    expect(validateFact(fact())).toEqual([]);
  });

  it("rejects a fact with zero sources", () => {
    expect(rules(validateFact(fact({ sources: [] })))).toContain("no-sources");
  });

  it("rejects a source that does not state the value", () => {
    const errors = validateFact(
      fact({ sources: [source({ states_value: false })] }),
    );
    // It is both an error in itself and leaves the fact unsourced, because a
    // source cited for a figure it does not print never supported it.
    expect(rules(errors)).toContain("source-states-value");
    expect(rules(errors)).toContain("no-sources");
  });
});

describe("two sources repeating one sentence are one source", () => {
  it("counts sources sharing a traces_to once", () => {
    const shared = [
      source({ name: "Outlet A", traces_to: "utterance.1" }),
      source({ name: "Outlet B", traces_to: "utterance.1" }),
    ];
    expect(effectiveSourceCount(shared)).toBe(1);
  });

  it("counts originating sources separately", () => {
    expect(
      effectiveSourceCount([
        source({ name: "Filing" }),
        source({ name: "Other filing" }),
      ]),
    ).toBe(2);
  });

  it("does not count a repetition that fails states_value", () => {
    expect(
      effectiveSourceCount([
        source({ traces_to: "utterance.1" }),
        source({ traces_to: "utterance.2", states_value: false }),
      ]),
    ).toBe(1);
  });

  it("rejects a fact whose only two sources trace to the same utterance and neither states the value", () => {
    const errors = validateFact(
      fact({
        sources: [
          source({ traces_to: "utterance.1", states_value: false }),
          source({ traces_to: "utterance.1", states_value: false }),
        ],
      }),
    );
    expect(rules(errors)).toContain("no-sources");
  });
});

describe("a FLOP figure states precision, generation, and peak versus achieved", () => {
  const flop = (notes: string) =>
    validateFact(fact({ unit: "FLOP", value: 1e18, notes }));

  it("accepts notes carrying all three", () => {
    expect(
      rules(flop("fp8 precision, Blackwell generation, peak rather than achieved")),
    ).not.toContain("flop-notes");
  });

  it("rejects notes with no precision", () => {
    expect(rules(flop("Blackwell generation, peak figure"))).toContain(
      "flop-notes",
    );
  });

  it("rejects notes with no generation", () => {
    expect(rules(flop("fp8, peak figure"))).toContain("flop-notes");
  });

  it("rejects notes that never say peak or achieved", () => {
    expect(rules(flop("fp8 precision, Blackwell generation"))).toContain(
      "flop-notes",
    );
  });

  it("rejects a FLOP fact with no notes at all", () => {
    expect(rules(validateFact(fact({ unit: "FLOP", value: 1e18 })))).toContain(
      "flop-notes",
    );
  });
});

describe("a derived fact names its judgment", () => {
  it("accepts notes with content", () => {
    expect(rules(validateDerivedFact(derived(), lookup))).toEqual([]);
  });

  it("rejects empty notes", () => {
    expect(rules(validateDerivedFact(derived({ notes: "" }), lookup))).toContain(
      "derived-notes",
    );
  });

  it("rejects notes that are only whitespace", () => {
    expect(
      rules(validateDerivedFact(derived({ notes: "   \n " }), lookup)),
    ).toContain("derived-notes");
  });
});

describe("no formula references a literal", () => {
  it("rejects an arbitrary number", () => {
    const errors = validateDerivedFact(
      derived({ formula: "a.space / 1000", derived_from: ["a.space"] }),
      lookup,
    );
    expect(rules(errors)).toContain("formula-literal");
  });

  it("allows the definitional constant for seconds in a year", () => {
    const errors = validateDerivedFact(
      derived({ formula: "a.space / 31536000", derived_from: ["a.space"] }),
      lookup,
    );
    expect(rules(errors)).not.toContain("formula-literal");
  });

  it("rejects a number that merely looks trivial", () => {
    const errors = validateDerivedFact(
      derived({ formula: "a.space * 2", derived_from: ["a.space"] }),
      lookup,
    );
    expect(rules(errors)).toContain("formula-literal");
  });
});

describe("never sum across domains", () => {
  it("rejects a sum spanning two domains", () => {
    const errors = validateDerivedFact(
      derived({
        formula: "a.space + c.energy",
        derived_from: ["a.space", "c.energy"],
        unit: "USD",
      }),
      lookup,
    );
    expect(rules(errors)).toContain("cross-domain-sum");
  });

  it("rejects a subtraction spanning two domains", () => {
    const errors = validateDerivedFact(
      derived({
        formula: "a.space - d.ai",
        derived_from: ["a.space", "d.ai"],
        unit: "USD",
      }),
      lookup,
    );
    expect(rules(errors)).toContain("cross-domain-sum");
  });

  it("allows a ratio across domains, which is the point", () => {
    const errors = validateDerivedFact(
      derived({
        formula: "d.ai / c.energy",
        derived_from: ["d.ai", "c.energy"],
        unit: "USD_per_W",
        cross_domain: ["ai", "energy"],
      }),
      lookup,
    );
    expect(rules(errors)).not.toContain("cross-domain-sum");
  });

  it("allows a sum inside one domain", () => {
    const errors = validateDerivedFact(
      derived({
        formula: "a.space + b.space",
        derived_from: ["a.space", "b.space"],
        unit: "USD",
      }),
      lookup,
    );
    expect(rules(errors)).not.toContain("cross-domain-sum");
  });

  it("rejects a cross-domain sum hidden inside a legal ratio", () => {
    const errors = validateDerivedFact(
      derived({
        formula: "(a.space + d.ai) / c.energy",
        derived_from: ["a.space", "d.ai", "c.energy"],
        unit: "USD_per_W",
      }),
      lookup,
    );
    expect(rules(errors)).toContain("cross-domain-sum");
  });
});

describe("formula and derived_from agree", () => {
  it("rejects a formula using an id derived_from omits", () => {
    const errors = validateDerivedFact(
      derived({ formula: "a.space / b.space", derived_from: ["a.space"] }),
      lookup,
    );
    expect(rules(errors)).toContain("derived-from-mismatch");
  });

  it("rejects an unknown record", () => {
    const errors = validateDerivedFact(
      derived({ formula: "a.space / nope.missing", derived_from: ["a.space", "nope.missing"] }),
      lookup,
    );
    expect(rules(errors)).toContain("formula-unknown-id");
  });
});

describe("the store as a whole", () => {
  it("rejects a reused id", () => {
    const errors = validateStore([
      fact({ id: "same.id" }),
      fact({ id: "same.id" }),
    ]);
    expect(rules(errors)).toContain("duplicate-id");
  });

  it("passes a store that is merely empty", () => {
    expect(validateStore([])).toEqual([]);
  });
});
