import { describe, expect, it } from "vitest";
import { findViolations } from "./lint-mdx-emdash.mjs";

// Escaped, not literal. A test file for the em dash prohibition is the one
// place a literal em dash could hide in the repo with a good excuse, and then
// "zero em dashes anywhere" stops being checkable by a plain search.
const EM = "\u2014";
const lines = (v) => v.map((x) => x.line);

describe("what the tripwire catches", () => {
  it("fails on an em dash in prose", () => {
    expect(findViolations(`The award ${EM} all of it ${EM} was reported.`)).toHaveLength(
      2,
    );
  });

  it("reports the line, the column, and the offending text", () => {
    const found = findViolations(`clean line\nthe cost ${EM} eventually`);
    expect(found).toHaveLength(1);
    expect(found[0].line).toBe(2);
    expect(found[0].column).toBe(10);
    expect(found[0].text).toBe(`the cost ${EM} eventually`);
  });

  it("catches every occurrence on one line, not just the first", () => {
    expect(lines(findViolations(`a ${EM} b ${EM} c`))).toEqual([1, 1]);
  });
});

describe("what it legitimately strips", () => {
  it("ignores frontmatter", () => {
    const text = `---
title: A piece ${EM} with a dash in the title
---

Clean prose.`;
    expect(findViolations(text)).toEqual([]);
  });

  it("ignores fenced code", () => {
    const text = ["Prose.", "", "```js", `const x = "${EM}";`, "```", "", "More."].join(
      "\n",
    );
    expect(findViolations(text)).toEqual([]);
  });

  it("ignores inline code, where a dash may be the subject", () => {
    expect(findViolations(`The character \`${EM}\` is prohibited.`)).toEqual([]);
  });

  it("ignores JSX tags and their attributes", () => {
    expect(findViolations(`<Figure id="a.b" note="x ${EM} y" />`)).toEqual([]);
  });
});

describe("the punctuation that is allowed instead", () => {
  it("passes a middle dot, the separator convention", () => {
    expect(findViolations("NASA · 2026-05-26 · retrieved 2026-07-17")).toEqual([]);
  });

  it("passes hyphens and en dashes, which are different marks", () => {
    expect(findViolations("A well-sourced 2029–2032 window.")).toEqual([]);
  });
});

describe("no escape hatch", () => {
  it("still fails on a line carrying a numerals-ok style comment", () => {
    expect(
      findViolations(`{/* em-dash-ok: it is not */} The award ${EM} reported.`),
    ).toHaveLength(1);
  });
});
