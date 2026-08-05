import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { discoverFactIds as scanTs } from "@/lib/encyclopedia/scan";
import {
  buildGraph,
  discoverFactIds as scanMjs,
  readArticles,
  readEntries,
} from "./build-graph.mjs";

// The drift guard named in build-graph.mjs. Fact discovery is defined twice,
// once in TypeScript for the site and once here because a Node script cannot
// import it. Two implementations of one rule will eventually disagree, and the
// disagreement would be silent: the site would show a figure the graph does not
// know about. This is the test that makes it loud.
describe("fact discovery parity", () => {
  const bodies = [
    `<Figure id="a.b" /> and <Figure placeholder="$000B" confidence="reported" />`,
    `<Figure id='single.quoted' />`,
    `<Figure scale="stat-m" id="after.attribute" />`,
    `<Figure id="dup" /> <Figure id="other" /> <Figure id="dup" />`,
    `No figures at all.`,
    `<Figure\n  id="across.lines"\n/>`,
  ];

  for (const body of bodies) {
    it(`agrees on ${JSON.stringify(body).slice(0, 44)}`, () => {
      expect(scanMjs(body)).toEqual(scanTs(body));
    });
  }
});

describe("buildGraph, against the seeds on disk", () => {
  const root = process.cwd();
  const entries = readEntries(join(root, "content", "encyclopedia"));
  const articles = readArticles(join(root, "content", "articles"));
  const graph = buildGraph(entries, articles);

  it("emits a node for every entry", () => {
    const ids = graph.nodes.map((n) => n.id);
    expect(ids).toContain("enc.kardashev-scale");
    expect(ids).toContain("enc.starmind");
  });

  it("carries the standfirst as the graph preview, empty for a stub", () => {
    const stub = graph.nodes.find((n) => n.id === "enc.starmind");
    const draft = graph.nodes.find((n) => n.id === "enc.kardashev-scale");
    expect(stub.status).toBe("stub");
    expect(stub.standfirst).toBe("");
    expect(draft.standfirst.length).toBeGreaterThan(0);
  });

  it("emits one related edge for the two seeds, not two", () => {
    // Both ends declare the link. Undirected and deduplicated, so it collapses.
    const related = graph.edges.filter((e) => e.kind === "related");
    expect(related).toHaveLength(1);
    expect(related[0]).toMatchObject({
      source: "enc.kardashev-scale",
      target: "enc.starmind",
      weight: 3,
    });
  });

  it("keeps taxonomy edges out of the main edge list", () => {
    expect(graph.edges.every((e) => e.kind !== "taxonomy")).toBe(true);
    expect(graph.taxonomy.length).toBeGreaterThan(0);
    expect(graph.taxonomy.every((e) => e.weight === 1)).toBe(true);
  });

  it("joins the seeds on their shared lens and not on a domain", () => {
    // Kardashev is space and energy, Starmind is ai. They share only science.
    expect(graph.taxonomy).toHaveLength(1);
    expect(graph.taxonomy[0]).toMatchObject({ via: "lens", key: "science" });
  });

  it("leaves unconnected articles out of the graph", () => {
    // The seed article names no entry and no entry names it, so it is not part
    // of this structure and must not appear as an isolated node.
    expect(graph.nodes.every((n) => n.type === "entry")).toBe(true);
  });
});

describe("buildGraph, on constructed input", () => {
  const entryA = {
    id: "enc.a",
    slug: "a",
    title: "A",
    standfirst: "",
    domains: ["space"],
    lenses: [],
    related: ["article:piece"],
    status: "draft",
    factIds: ["f.one", "f.two"],
  };
  const entryB = {
    id: "enc.b",
    slug: "b",
    title: "B",
    standfirst: "",
    domains: ["space"],
    lenses: [],
    related: [],
    status: "draft",
    factIds: ["f.two"],
  };
  const article = {
    slug: "piece",
    title: "A piece",
    standfirst: "",
    domains: ["space"],
    status: "published",
    encyclopedia: ["enc.b"],
  };

  const graph = buildGraph([entryA, entryB], [article]);

  it("pulls in an article named by an entry", () => {
    expect(graph.nodes.map((n) => n.id)).toContain("article:piece");
  });

  it("emits one fact edge per shared record, carrying the id", () => {
    const facts = graph.edges.filter((e) => e.kind === "fact");
    expect(facts).toHaveLength(1);
    expect(facts[0]).toMatchObject({
      source: "enc.a",
      target: "enc.b",
      weight: 2,
      fact: "f.two",
    });
  });

  it("reads the article mirror field as a related edge", () => {
    const related = graph.edges.filter((e) => e.kind === "related");
    expect(related).toHaveLength(2);
    expect(related.map((e) => `${e.source}|${e.target}`).sort()).toEqual([
      "article:piece|enc.a",
      "article:piece|enc.b",
    ]);
  });
});
