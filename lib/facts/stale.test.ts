import { describe, expect, it } from "vitest";
import { isStale, staleness, verificationAnchor } from "./stale";
import type { Fact, Source } from "./types";

function source(over: Partial<Source> = {}): Source {
  return {
    name: "Test source",
    url: "https://example.com/test",
    tier: 1,
    states_value: true,
    traces_to: null,
    retrieved_at: "2026-01-01",
    ...over,
  };
}

function fact(over: Partial<Fact> = {}): Fact {
  return {
    id: "test.fact",
    domain: "space",
    value: 1,
    unit: "USD",
    label: "Test",
    // Deliberately ancient. If staleness ever reads as_of this test fails,
    // which is the point of the gap between these two dates.
    as_of: "2001-01-01",
    confidence: "reported",
    sources: [source()],
    stale_after: "fast",
    ...over,
  };
}

describe("the anchor is the retrieval, not the event", () => {
  it("ignores as_of entirely", () => {
    const old = fact({ as_of: "1999-01-01" });
    expect(verificationAnchor(old)).toBe("2026-01-01");
  });

  it("takes the most recent retrieval among sources that state the value", () => {
    const many = fact({
      sources: [
        source({ retrieved_at: "2026-01-01" }),
        source({ retrieved_at: "2026-05-01" }),
        source({ retrieved_at: "2026-03-01" }),
      ],
    });
    expect(verificationAnchor(many)).toBe("2026-05-01");
  });

  it("ignores a fresher retrieval at a worse tier", () => {
    // The figure rests on the tier 1 document. A trade reprint being re-read in
    // July says nothing about whether the originating party revised it.
    const mixed = fact({
      sources: [
        source({ name: "Agency filing", tier: 1, retrieved_at: "2026-01-01" }),
        source({ name: "Trade reprint", tier: 3, retrieved_at: "2026-07-01" }),
      ],
    });
    expect(verificationAnchor(mixed)).toBe("2026-01-01");
  });

  it("takes the most recent retrieval when several sources share the best tier", () => {
    const twoPrimaries = fact({
      sources: [
        source({ tier: 1, retrieved_at: "2026-01-01" }),
        source({ tier: 1, retrieved_at: "2026-04-01" }),
        source({ tier: 4, retrieved_at: "2026-09-01" }),
      ],
    });
    expect(verificationAnchor(twoPrimaries)).toBe("2026-04-01");
  });

  it("uses the best tier available, even when that is a weak one", () => {
    const noPrimary = fact({
      sources: [
        source({ tier: 3, retrieved_at: "2026-02-01" }),
        source({ tier: 5, retrieved_at: "2026-08-01" }),
      ],
    });
    expect(verificationAnchor(noPrimary)).toBe("2026-02-01");
  });

  it("ignores a retrieval by a source that does not state the value", () => {
    const mixed = fact({
      sources: [
        source({ retrieved_at: "2026-01-01" }),
        source({ retrieved_at: "2026-12-01", states_value: false }),
      ],
    });
    expect(verificationAnchor(mixed)).toBe("2026-01-01");
  });
});

describe("windows", () => {
  it("flags a fast figure past thirty days", () => {
    const f = fact({ stale_after: "fast" });
    expect(isStale(f, new Date("2026-01-20"))).toBe(false);
    expect(isStale(f, new Date("2026-03-01"))).toBe(true);
  });

  it("holds a quarterly figure for a hundred days", () => {
    const f = fact({ stale_after: "quarterly" });
    expect(isStale(f, new Date("2026-03-01"))).toBe(false);
    expect(isStale(f, new Date("2026-06-01"))).toBe(true);
  });

  it("holds a slow figure for four hundred days", () => {
    const f = fact({ stale_after: "slow" });
    expect(isStale(f, new Date("2026-12-01"))).toBe(false);
    expect(isStale(f, new Date("2027-06-01"))).toBe(true);
  });

  it("never expires a projection, which is restated with its vintage instead", () => {
    const f = fact({ stale_after: "projection" });
    expect(isStale(f, new Date("2099-01-01"))).toBe(false);
    expect(staleness(f, new Date("2099-01-01")).expiresOn).toBeNull();
  });

  it("reports the expiry date so a page can say when rather than just that", () => {
    expect(staleness(fact({ stale_after: "fast" }), new Date("2026-01-05")).expiresOn).toBe(
      "2026-01-31",
    );
  });
});
