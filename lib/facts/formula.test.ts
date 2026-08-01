import { describe, expect, it } from "vitest";
import {
  evaluateFormula,
  lowestInputConfidence,
  parse,
  referencedIds,
  resolveDerivedConfidence,
} from "./formula";

const VALUES: Record<string, number> = {
  "a.space": 1000,
  "b.space": 4,
  "c.energy": 250,
};
const resolve = (id: string) => VALUES[id];

describe("formulas store the expression, not the result", () => {
  it("recomputes on every read", () => {
    expect(evaluateFormula("a.space / b.space", resolve)).toBe(250);
  });

  it("moves when an input moves", () => {
    const changed: Record<string, number> = { ...VALUES, "a.space": 2000 };
    expect(evaluateFormula("a.space / b.space", (id) => changed[id])).toBe(500);
  });

  it("respects precedence and parentheses", () => {
    expect(evaluateFormula("a.space / (b.space + b.space)", resolve)).toBe(125);
  });

  it("collects referenced ids", () => {
    expect(referencedIds(parse("a.space / (b.space + a.space)")).sort()).toEqual(
      ["a.space", "b.space"],
    );
  });

  it("refuses a malformed expression rather than guessing", () => {
    expect(() => parse("a.space /")).toThrow();
    expect(() => parse("(a.space")).toThrow();
  });

  it("returns NaN rather than Infinity when a denominator is zero", () => {
    expect(
      Number.isNaN(evaluateFormula("a.space / zero", (id) =>
        id === "zero" ? 0 : VALUES[id],
      )),
    ).toBe(true);
  });
});

describe("there is no path back up", () => {
  it("reports the weakest input", () => {
    expect(lowestInputConfidence(["confirmed", "reported"])).toBe("reported");
    expect(lowestInputConfidence(["confirmed", "confirmed"])).toBe("confirmed");
    expect(lowestInputConfidence(["reported", "derived"])).toBe("derived");
  });

  it("drops to derived even when every input is confirmed", () => {
    expect(resolveDerivedConfidence(["confirmed", "confirmed"])).toBe("derived");
  });

  it("drops to derived when there are no inputs at all", () => {
    expect(resolveDerivedConfidence([])).toBe("derived");
  });
});
