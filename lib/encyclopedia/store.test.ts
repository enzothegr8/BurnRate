import { describe, expect, it } from "vitest";
import { ENTRIES, entryBySlug, relatedFor } from "./store";

// Importing the store is the test. assertEncyclopediaValid runs at module load,
// so a dangling link or an unmarked figure anywhere in content/encyclopedia
// fails here, in `prebuild`, before next build ever starts.
describe("the encyclopedia store", () => {
  it("loads and validates the entries on disk", () => {
    expect(ENTRIES.length).toBeGreaterThan(0);
  });

  it("derives the slug from the id", () => {
    for (const entry of ENTRIES) {
      expect(entry.id).toBe(`enc.${entry.slug}`);
    }
  });

  it("discovers the facts the draft seed cites", () => {
    const entry = entryBySlug("kardashev-scale");
    expect(entry?.factIds).toContain("fixture.energy.civilization.output");
  });

  it("finds the stub from the draft and the draft from the stub", () => {
    const draft = entryBySlug("kardashev-scale");
    const stub = entryBySlug("starmind");
    expect(relatedFor(draft!).map((l) => l.kind === "entry" && l.entry.slug)).toContain(
      "starmind",
    );
    expect(relatedFor(stub!).map((l) => l.kind === "entry" && l.entry.slug)).toContain(
      "kardashev-scale",
    );
  });

  it("does not list an entry as related to itself", () => {
    for (const entry of ENTRIES) {
      const ids = relatedFor(entry).map((l) =>
        l.kind === "entry" ? l.entry.id : `article:${l.slug}`,
      );
      expect(ids).not.toContain(entry.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
