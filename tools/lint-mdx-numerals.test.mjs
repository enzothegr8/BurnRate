import { describe, expect, it } from "vitest";
import { findViolations } from "./lint-mdx-numerals.mjs";

const lines = (v) => v.map((x) => x.line);

describe("what the tripwire catches", () => {
  it("fails on a bare digit in prose", () => {
    expect(findViolations("The award was $188M, unmarked.")).toHaveLength(1);
  });

  it("reports the line and the offending text", () => {
    const found = findViolations("clean line\nthe cost was 42 dollars\n");
    expect(found).toHaveLength(1);
    expect(found[0].line).toBe(2);
    expect(found[0].text).toBe("the cost was 42 dollars");
  });

  it("catches a digit buried in a longer word", () => {
    expect(findViolations("about 3x more")).toHaveLength(1);
  });
});

describe("what it legitimately strips", () => {
  it("ignores frontmatter", () => {
    const text = `---
title: A piece
date: 2026-07-31
rev: "01"
---

Clean prose with no numerals.`;
    expect(findViolations(text)).toEqual([]);
  });

  it("ignores JSX tags and their attributes, where ids and dates live", () => {
    expect(
      findViolations('A figure sits here: <Figure id="fixture.space.cost.2026" />'),
    ).toEqual([]);
  });

  it("ignores a JSX tag broken across lines", () => {
    const text = `Prose before.

<Figure
  placeholder="$000B"
  confidence="reported"
/>

Prose after.`;
    expect(findViolations(text)).toEqual([]);
  });

  it("ignores fenced code", () => {
    const text = ["Prose.", "", "```js", "const x = 42;", "```", "", "More prose."].join(
      "\n",
    );
    expect(findViolations(text)).toEqual([]);
  });

  it("ignores inline code", () => {
    expect(findViolations("The constant `31536000` is definitional.")).toEqual([]);
  });

  it("ignores import and export lines", () => {
    expect(
      findViolations('import { Figure } from "@/components/facts/figure";\n\nProse.'),
    ).toEqual([]);
  });

  it("ignores digits inside an MDX comment", () => {
    expect(findViolations("{/* a note mentioning 2026 */}\n")).toEqual([]);
  });
});

describe("the escape hatch", () => {
  it("exempts the line carrying the comment", () => {
    expect(
      findViolations("{/* numerals-ok: a section number, not a claim */} Part 2"),
    ).toEqual([]);
  });

  it("exempts the line directly below the comment", () => {
    const text = `{/* numerals-ok: ordinal, not a measurement */}
The 3rd attempt.`;
    expect(findViolations(text)).toEqual([]);
  });

  it("does not exempt two lines below", () => {
    const text = `{/* numerals-ok: only reaches one line */}
The 3rd attempt.
But 42 here is unmarked.`;
    expect(lines(findViolations(text))).toEqual([3]);
  });
});

describe("the limits it does not pretend to cover", () => {
  it("cannot see a spelled-out number, which is still a claim", () => {
    expect(findViolations("The program cost twenty billion dollars.")).toEqual(
      [],
    );
  });

  it("cannot tell whether a Figure points at the right record", () => {
    expect(findViolations('<Figure id="the.wrong.record" />')).toEqual([]);
  });
});
