import { describe, expect, it } from "vitest";
import type { DerivedFact } from "./types";

// The acceptance rule for this module is that giving a derived fact a
// confidence is a TypeScript error rather than a runtime one, so the check has
// to happen in the type system rather than in an assertion.
//
// The @ts-expect-error below is the test. If `confidence?: never` is ever
// loosened, that line stops erroring, and a directive that expects an error it
// no longer gets is itself an error. Either way tsc fails, and tsc runs during
// next build. A test that only ran under vitest would not protect the build.

const base = {
  id: "test.derived",
  domain: "space",
  unit: "USD_per_kg",
  label: "Test",
  as_of: "2026-06-01",
  derived_from: ["a", "b"],
  formula: "a / b",
  notes: "A judgment worth naming.",
} satisfies Omit<DerivedFact, "confidence">;

const rejected: DerivedFact = {
  ...base,
  // @ts-expect-error a derived fact cannot carry a confidence, at any level
  confidence: "derived",
};

const alsoRejected: DerivedFact = {
  ...base,
  // @ts-expect-error not even the one it would inherit
  confidence: "confirmed",
};

describe("a derived fact has no confidence field", () => {
  it("is dotted by construction, so the record never carries a mark", () => {
    // The objects still exist at runtime; the point is that writing them is a
    // compile error. These assertions keep the file honest as a test rather
    // than leaving the values unused.
    expect(rejected.formula).toBe("a / b");
    expect(alsoRejected.notes).not.toBe("");
  });
});
