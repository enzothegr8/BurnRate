import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The palette is closed, and a rule nobody checks is a rule that decays. This
// reads app/globals.css and asserts it still says exactly what section 3 of
// docs/brand-foundation.md says, no more and no less.
//
// The "no more" half is the one that matters. Colors do not enter a design
// system through a decision; they enter through a component that needed one
// value and took it. This test fails when that happens.

// Comments are stripped before anything is asserted. They explain the palette
// at length, including naming the things this file must not contain, and a
// checker that reads prose finds whatever the prose mentions. Stripping also
// stops a commented-out token from counting as a declared one.
const CSS = readFileSync(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

const PALETTE: Record<string, string> = {
  page: "#fbfbfc",
  panel: "#efeff1",
  rule: "#d8d8dc",
  muted: "#67676e",
  body: "#35353b",
  jet: "#08080a",
  "blue-deep": "#101f52",
  "blue-bright": "#1f5fe0",
  crimson: "#b3122b",
};

// Order is load bearing. A chart walks this list from the top.
const CHART_SERIES = [
  "#101f52",
  "#1f5fe0",
  "#b3122b",
  "#08080a",
  "#67676e",
];

function declaredTokens(): Map<string, string> {
  const found = new Map<string, string>();
  for (const [, name, value] of CSS.matchAll(
    /--color-([a-z0-9-]+):\s*([^;]+);/g,
  )) {
    found.set(name, value.trim().toLowerCase());
  }
  return found;
}

describe("the closed palette", () => {
  it("declares every role at the exact documented value", () => {
    const tokens = declaredTokens();
    for (const [name, hex] of Object.entries(PALETTE)) {
      expect(tokens.get(name), `--color-${name}`).toBe(hex);
    }
  });

  it("declares the chart series in the documented order and stops at five", () => {
    const tokens = declaredTokens();
    CHART_SERIES.forEach((hex, i) => {
      expect(tokens.get(`chart-${i + 1}`), `--color-chart-${i + 1}`).toBe(hex);
    });
    expect(tokens.has(`chart-${CHART_SERIES.length + 1}`)).toBe(false);
  });

  it("declares no color beyond the documented set", () => {
    const allowed = new Set([
      ...Object.keys(PALETTE),
      ...CHART_SERIES.map((_, i) => `chart-${i + 1}`),
    ]);
    const extra = [...declaredTokens().keys()].filter((n) => !allowed.has(n));
    expect(extra).toEqual([]);
  });

  it("does not reintroduce dark mode", () => {
    expect(CSS).not.toContain("prefers-color-scheme");
  });
});
