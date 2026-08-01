// Seed fixtures. These are not claims about the world and must never render on
// a public page.
//
// One note on the confirmed fixture below. The promotion rule says only Enzo
// marks a figure confirmed, after opening the primary URL himself, and no agent
// may do it. That rule is about figures. These are not figures: the values are
// synthetic, the ids are namespaced `fixture.`, and the URLs point at
// example.com. The confirmed one exists so the solid mark has something to
// exercise in a test. If a record here ever describes something real, it stops
// being a fixture and the promotion rule applies to it in full.

import type { DerivedFact, Fact } from "./types";

export const FIXTURE_FACTS: Fact[] = [
  {
    id: "fixture.space.program.cost",
    domain: "space",
    value: 1_000_000_000,
    unit: "USD",
    label: "FIXTURE, synthetic program cost",
    as_of: "2026-06-30",
    confidence: "confirmed",
    sources: [
      {
        name: "FIXTURE originating record",
        url: "https://example.com/fixture/program-cost",
        tier: 1,
        states_value: true,
        traces_to: null,
        retrieved_at: "2026-07-15",
      },
    ],
    notes: "Fixture record. Exercises the solid mark.",
    stale_after: "quarterly",
  },
  {
    id: "fixture.space.program.mass",
    domain: "space",
    value: 1_000_000,
    unit: "kg",
    label: "FIXTURE, synthetic delivered mass",
    as_of: "2026-06-30",
    confidence: "reported",
    sources: [
      {
        name: "FIXTURE trade outlet",
        url: "https://example.com/fixture/mass-a",
        tier: 3,
        states_value: true,
        traces_to: "fixture.utterance.mass-briefing",
        retrieved_at: "2026-07-10",
      },
      {
        // Same underlying sentence as the row above, so the two collapse to one
        // source. This is the shape that makes a figure look better sourced
        // than it is.
        name: "FIXTURE second outlet reprinting the same remark",
        url: "https://example.com/fixture/mass-b",
        tier: 3,
        states_value: true,
        traces_to: "fixture.utterance.mass-briefing",
        tier_note:
          "Fixture. Both rows trace to one spoken sentence and count once.",
        retrieved_at: "2026-07-12",
      },
    ],
    notes: "Fixture record. Exercises the dashed mark and traces_to collapsing.",
    stale_after: "fast",
  },
  {
    id: "fixture.ai.cluster.peak_flop",
    domain: "ai",
    value: 1e18,
    unit: "FLOP",
    label: "FIXTURE, synthetic cluster throughput",
    as_of: "2026-06-30",
    confidence: "reported",
    sources: [
      {
        name: "FIXTURE operator disclosure",
        url: "https://example.com/fixture/cluster",
        tier: 1,
        states_value: true,
        traces_to: null,
        retrieved_at: "2026-07-20",
      },
    ],
    notes:
      "Fixture record. Precision is fp8, generation is the fixture generation, and this is a peak figure rather than achieved.",
    stale_after: "quarterly",
  },
];

export const FIXTURE_DERIVED: DerivedFact[] = [
  {
    id: "fixture.space.program.cost_per_kg",
    domain: "space",
    unit: "USD_per_kg",
    label: "FIXTURE, synthetic cost per kilogram",
    as_of: "2026-06-30",
    derived_from: ["fixture.space.program.cost", "fixture.space.program.mass"],
    formula: "fixture.space.program.cost / fixture.space.program.mass",
    notes:
      "Fixture record. Exercises the dotted mark. The denominator is delivered mass rather than launched mass, which is the judgment this note exists to name.",
    stale_after: "fast",
  },
];

export const FIXTURE_RECORDS = [...FIXTURE_FACTS, ...FIXTURE_DERIVED];
