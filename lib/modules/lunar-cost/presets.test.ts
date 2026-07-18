import { describe, expect, it } from "vitest";
import { divergedFields, effectiveParams, evaluatePreset } from "./presets";

/**
 * Preset fixtures: THE MODEL-VS-ACTUAL DELTA IS ASSERTED AND REPORTED, NOT
 * TUNED. The expected values below are what the engine produced against the
 * as-flown records on 2026-07-17, recorded as the module's published error
 * bar. If the engine or a record changes, these numbers move and the change
 * is reviewed consciously; nothing here gets a constant fitted to close a
 * gap. A fitted constant is a fabricated number wearing a lab coat.
 *
 * The report, in the test names and here in one place:
 *   Apollo 11: IMLEO +11.5% over the spacecraft-only EOI record; post-TLI
 *   mass -45.4% (structural: the record excludes the S-IVB, the model keeps
 *   its stage attached and carries no CSM); cost +314% (vintage-crossed:
 *   model 2025 CPI dollars vs then-year record, and the model's sum is
 *   incomplete because no LM unit cost exists).
 *   Apollo 17: IMLEO +4.8%; post-TLI -48.8% (same structure, heavier
 *   J-mission hardware the model does not carry). No cost record exists.
 */
describe("Apollo 11 preset, pristine", () => {
  const evaluation = evaluatePreset({ presetId: "apollo-11", overrides: {} });

  it("solves and compares against every as-flown record", () => {
    expect(evaluation.pristine).toBe(true);
    expect(evaluation.result.kind).toBe("feasible");
    expect(evaluation.comparison).not.toBeNull();
    expect(evaluation.comparison!.map((r) => r.field)).toEqual(["leoMassKg", "tliMassKg", "costUsd"]);
  });

  it("reports IMLEO +11.5% against the spacecraft-only EOI record", () => {
    const row = evaluation.comparison!.find((r) => r.field === "leoMassKg")!;
    expect(row.model.value).toBeCloseTo(50951.8, 0);
    expect(row.actual.value).toBe(45702);
    expect(row.deltaAbs.value).toBeCloseTo(5249.8, 0);
    expect(row.deltaPct.value).toBeCloseTo(0.1149, 3);
  });

  it("reports post-TLI mass -45.4%, a structural delta the records explain", () => {
    const row = evaluation.comparison!.find((r) => r.field === "tliMassKg")!;
    expect(row.model.value).toBeCloseTo(23978.5, 0);
    expect(row.actual.value).toBe(43893);
    expect(row.deltaPct.value).toBeCloseTo(-0.4537, 3);
  });

  it("reports cost +314% across stated vintages, on an incomplete sum", () => {
    const row = evaluation.comparison!.find((r) => r.field === "costUsd")!;
    expect(row.model.value).toBeCloseTo(1_470_407_407, 0);
    expect(row.actual.value).toBe(355_000_000);
    expect(row.deltaPct.value).toBeCloseTo(3.142, 2);
    if (evaluation.result.kind === "feasible") {
      expect(evaluation.result.cost.completeSum).toBe(false);
    }
  });

  it("every comparison figure the model minted is dotted; every actual keeps its own mark", () => {
    for (const row of evaluation.comparison!) {
      expect(row.model.kind).toBe("derived");
      expect(row.deltaAbs.kind).toBe("derived");
      expect(row.deltaPct.kind).toBe("derived");
      expect(row.actual.kind).toBe("fact");
    }
  });
});

describe("Apollo 17 preset, pristine", () => {
  const evaluation = evaluatePreset({ presetId: "apollo-17", overrides: {} });

  it("reports IMLEO +4.8% and no cost row, because no cost record exists", () => {
    expect(evaluation.comparison!.map((r) => r.field)).toEqual(["leoMassKg", "tliMassKg"]);
    const leo = evaluation.comparison!.find((r) => r.field === "leoMassKg")!;
    expect(leo.deltaPct.value).toBeCloseTo(0.0482, 3);
  });
});

describe("Blue Ghost Mission 1 preset", () => {
  it("returns missing-input naming the unpublished slots; the absence is the result", () => {
    const evaluation = evaluatePreset({ presetId: "blue-ghost-m1", overrides: {} });
    expect(evaluation.pristine).toBe(true);
    expect(evaluation.result.kind).toBe("missing-input");
    expect(evaluation.comparison).toBeNull();
    if (evaluation.result.kind !== "missing-input") return;
    const slots = evaluation.result.missing.map((m) => m.slot);
    expect(slots).toContain("lander.blue-ghost.dry-mass");
    expect(slots).toContain("lander.blue-ghost.isp");
  });
});

describe("dirty state: the instant a field diverges, the as-flown column detaches", () => {
  it("an override that changes a value flips pristine and withholds the comparison", () => {
    const evaluation = evaluatePreset({ presetId: "apollo-11", overrides: { payloadKg: 100 } });
    expect(evaluation.pristine).toBe(false);
    expect(evaluation.divergedFields).toEqual(["payloadKg"]);
    expect(evaluation.comparison).toBeNull();
    expect(evaluation.result.kind).toBe("feasible");
  });

  it("an override equal to the as-flown value is not an edit", () => {
    const evaluation = evaluatePreset({ presetId: "apollo-11", overrides: { payloadKg: 0 } });
    expect(evaluation.pristine).toBe(true);
    expect(evaluation.divergedFields).toEqual([]);
    expect(evaluation.comparison).not.toBeNull();
  });

  it("reverting a diverged field restores pristine", () => {
    expect(divergedFields({ presetId: "apollo-11", overrides: { payloadKg: 500 } })).toEqual(["payloadKg"]);
    expect(divergedFields({ presetId: "apollo-11", overrides: { payloadKg: 0 } })).toEqual([]);
  });

  it("multiple diverged fields are all named", () => {
    const evaluation = evaluatePreset({
      presetId: "apollo-11",
      overrides: { payloadKg: 100, vehicleId: "starship" },
    });
    expect(evaluation.pristine).toBe(false);
    expect(evaluation.divergedFields.sort()).toEqual(["payloadKg", "vehicleId"]);
    expect(evaluation.comparison).toBeNull();
  });

  it("effectiveParams merges overrides onto the preset", () => {
    const params = effectiveParams({ presetId: "apollo-11", overrides: { payloadKg: 250 } });
    expect(params.payloadKg).toBe(250);
    expect(params.vehicleId).toBe("saturn-v");
    expect(params.mode).toBe("land");
  });
});
