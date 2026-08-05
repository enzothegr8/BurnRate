import { describe, expect, it } from "vitest";
import { discoverFactIds } from "./scan";

describe("discoverFactIds", () => {
  it("finds a cited record", () => {
    expect(discoverFactIds(`Text <Figure id="a.b" /> more.`)).toEqual(["a.b"]);
  });

  it("ignores placeholder figures, which cite nothing", () => {
    expect(
      discoverFactIds(`<Figure placeholder="$000B" confidence="reported" />`),
    ).toEqual([]);
  });

  it("deduplicates while keeping first appearance order", () => {
    const body = `<Figure id="b" /> <Figure id="a" /> <Figure id="b" />`;
    expect(discoverFactIds(body)).toEqual(["b", "a"]);
  });

  it("reads single quoted attributes", () => {
    expect(discoverFactIds(`<Figure id='a.b' />`)).toEqual(["a.b"]);
  });

  it("reads an id that follows another attribute", () => {
    expect(discoverFactIds(`<Figure scale="stat-m" id="a.b" />`)).toEqual([
      "a.b",
    ]);
  });

  it("finds nothing in a body with no figures", () => {
    expect(discoverFactIds("Just prose.")).toEqual([]);
  });
});
