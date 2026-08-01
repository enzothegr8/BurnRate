import { describe, expect, it } from "vitest";
import { format } from "./format";
import { RECORDS, resolveFact } from "./store";
import { FactStoreError, assertStoreValid } from "./validate";

// Importing ./store at the top of this file is itself part of the test: the
// store validates on load, so if a record in it is invalid this suite fails to
// import at all. That is the same gate the build runs through.

describe("the seed store", () => {
  it("loads, which means every record in it validated", () => {
    expect(RECORDS.length).toBeGreaterThan(0);
  });

  it("exercises all three marks", () => {
    expect(resolveFact("fixture.space.program.cost")?.confidence).toBe(
      "confirmed",
    );
    expect(resolveFact("fixture.space.program.mass")?.confidence).toBe(
      "reported",
    );
    expect(resolveFact("fixture.space.program.cost_per_kg")?.confidence).toBe(
      "derived",
    );
  });

  it("recomputes the derived value from its inputs", () => {
    const resolved = resolveFact("fixture.space.program.cost_per_kg");
    expect(resolved?.value).toBe(1000);
    expect(format(resolved!.value, resolved!.unit)).toBe("$1K/kg");
  });

  it("returns nothing for an id it does not hold", () => {
    expect(resolveFact("fixture.nope")).toBeUndefined();
  });
});

describe("the build-time gate", () => {
  it("throws rather than returning errors nobody reads", () => {
    expect(() =>
      assertStoreValid([
        {
          id: "bad.fact",
          domain: "space",
          value: 1,
          unit: "USD",
          label: "Unsourced",
          as_of: "2026-06-01",
          confidence: "reported",
          sources: [],
          stale_after: "fast",
        },
      ]),
    ).toThrow(FactStoreError);
  });

  it("names the record and the rule in the message", () => {
    try {
      assertStoreValid([
        {
          id: "bad.fact",
          domain: "space",
          value: 1,
          unit: "USD",
          label: "Unsourced",
          as_of: "2026-06-01",
          confidence: "reported",
          sources: [],
          stale_after: "fast",
        },
      ]);
      throw new Error("should have thrown");
    } catch (error) {
      expect((error as Error).message).toContain("bad.fact");
      expect((error as Error).message).toContain("no-sources");
    }
  });
});
