import { describe, expect, it } from "vitest";
import type { Entry } from "./types";
import { validateEncyclopedia, type EncyclopediaInput } from "./validate";

// Every rule gets a case that fails it. A validator suite that only shows valid
// input proves the happy path and nothing else, and the whole reason these rules
// exist is the input nobody meant to write.

function entry(over: Partial<Entry> = {}): Entry {
  return {
    id: "enc.test",
    slug: "test",
    title: "Test entry",
    standfirst: "A standfirst.",
    domains: ["space"],
    lenses: ["economics"],
    related: [],
    status: "draft",
    rev: "01",
    updated: "2026-08-05",
    factIds: [],
    ...over,
  };
}

function input(over: Partial<EncyclopediaInput> = {}): EncyclopediaInput {
  return {
    entries: [entry()],
    articles: [],
    factExists: () => true,
    ...over,
  };
}

describe("validateEncyclopedia", () => {
  it("passes a well formed entry", () => {
    expect(validateEncyclopedia(input())).toEqual([]);
  });

  it("fails an unknown fact id cited by a figure", () => {
    const problems = validateEncyclopedia(
      input({
        entries: [entry({ factIds: ["fact.that.does.not.exist"] })],
        factExists: () => false,
      }),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("fact.that.does.not.exist");
  });

  it("passes a fact id the store knows", () => {
    const problems = validateEncyclopedia(
      input({
        entries: [entry({ factIds: ["fixture.known"] })],
        factExists: (id) => id === "fixture.known",
      }),
    );
    expect(problems).toEqual([]);
  });

  it("fails a related target resolving to no entry", () => {
    const problems = validateEncyclopedia(
      input({ entries: [entry({ related: ["enc.nowhere"] })] }),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("enc.nowhere");
  });

  it("fails a related target resolving to no article", () => {
    const problems = validateEncyclopedia(
      input({ entries: [entry({ related: ["article:nowhere"] })] }),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("article:nowhere");
  });

  it("passes a related target that resolves in either direction", () => {
    const problems = validateEncyclopedia(
      input({
        entries: [
          entry({ id: "enc.a", slug: "a", related: ["enc.b", "article:real"] }),
          entry({ id: "enc.b", slug: "b" }),
        ],
        articles: [{ slug: "real", encyclopedia: [] }],
      }),
    );
    expect(problems).toEqual([]);
  });

  it("fails an article encyclopedia target resolving to no entry", () => {
    const problems = validateEncyclopedia(
      input({ articles: [{ slug: "piece", encyclopedia: ["enc.nowhere"] }] }),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("content/articles/piece.mdx");
  });

  it("fails a published entry with no standfirst", () => {
    const problems = validateEncyclopedia(
      input({ entries: [entry({ status: "published", standfirst: "" })] }),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("published");
  });

  it("fails a published entry whose standfirst is only whitespace", () => {
    const problems = validateEncyclopedia(
      input({ entries: [entry({ status: "published", standfirst: "   " })] }),
    );
    expect(problems).toHaveLength(1);
  });

  it("allows a stub with no standfirst", () => {
    const problems = validateEncyclopedia(
      input({ entries: [entry({ status: "stub", standfirst: "" })] }),
    );
    expect(problems).toEqual([]);
  });

  it("fails an entry with no domain and no lens", () => {
    const problems = validateEncyclopedia(
      input({ entries: [entry({ domains: [], lenses: [] })] }),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("at least one domain or one lens");
  });

  it("allows an entry with a lens but no domain", () => {
    const problems = validateEncyclopedia(
      input({ entries: [entry({ domains: [], lenses: ["politics"] })] }),
    );
    expect(problems).toEqual([]);
  });

  it("fails a duplicated entry id", () => {
    const problems = validateEncyclopedia(
      input({
        entries: [entry({ id: "enc.same", slug: "a" }), entry({ id: "enc.same", slug: "b" })],
      }),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("duplicate entry id");
  });

  it("reports every problem rather than stopping at the first", () => {
    const problems = validateEncyclopedia(
      input({
        entries: [
          entry({
            status: "published",
            standfirst: "",
            domains: [],
            lenses: [],
            related: ["enc.nowhere"],
          }),
        ],
      }),
    );
    expect(problems.length).toBeGreaterThanOrEqual(3);
  });
});
