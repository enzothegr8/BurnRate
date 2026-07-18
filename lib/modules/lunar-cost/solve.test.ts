import { describe, expect, it } from "vitest";
import { markFor } from "@/lib/facts/types";
import { modelFigure } from "./model";
import { solveMission } from "./solve";
import type { MissionResult } from "./types";

describe("record-backed solver", () => {
  it("solves a small Falcon Heavy orbit mission from store records", () => {
    const result = solveMission({ payloadKg: 2000, vehicleId: "falcon-heavy", mode: "orbit" });
    expect(result.kind).toBe("feasible");
    if (result.kind !== "feasible") return;
    expect(result.imleoKg.value).toBeCloseTo(20663.3, 0);
    expect(result.cost.launches.value).toBe(1);
    expect(result.cost.totalUsd.value).toBe(97_000_000);
    // Orbit mode has no descent leg.
    expect(result.legs.map((l) => l.leg.id)).toEqual(["leo-insertion", "tli", "loi"]);
  });

  it("returns missing-input for New Glenn: GS-2 has no published Isp or dry mass", () => {
    const result = solveMission({ payloadKg: 1000, vehicleId: "new-glenn", mode: "orbit" });
    expect(result.kind).toBe("missing-input");
    if (result.kind !== "missing-input") return;
    const slots = result.missing.map((m) => m.slot);
    expect(slots).toContain("stage.new-glenn-gs2.isp");
    expect(slots).toContain("stage.new-glenn-gs2.dry-mass");
  });

  it("returns missing-input for Blue Ghost landings: dry mass and Isp are unpublished", () => {
    const result = solveMission({
      payloadKg: 94,
      vehicleId: "falcon-heavy",
      mode: "land",
      landerId: "blue-ghost",
    });
    expect(result.kind).toBe("missing-input");
    if (result.kind !== "missing-input") return;
    const slots = result.missing.map((m) => m.slot);
    expect(slots).toContain("lander.blue-ghost.isp");
    expect(slots).toContain("lander.blue-ghost.dry-mass");
  });

  it("a 5 t payload on the Apollo LM binds on descent propellant, structured, not thrown", () => {
    const result = solveMission({
      payloadKg: 5000,
      vehicleId: "falcon-heavy",
      mode: "land",
      landerId: "apollo-lm",
    });
    expect(result.kind).toBe("infeasible");
    if (result.kind !== "infeasible") return;
    expect(result.constraint).toBe("lander-propellant");
    expect(result.requiredKg.value).toBeCloseTo(9260.5, 0);
    expect(result.capacityKg.value).toBe(8248);
    expect(result.ratio.value).toBeGreaterThan(1);
    expect(result.bindingElement).toBe("Apollo Lunar Module");
  });

  it("a thousand-tonne payload binds Starship on stage propellant", () => {
    const result = solveMission({ payloadKg: 1_000_000, vehicleId: "starship", mode: "orbit" });
    expect(result.kind).toBe("infeasible");
    if (result.kind !== "infeasible") return;
    expect(result.constraint).toBe("stage-propellant");
  });

  it("multi-launch missions round up and price every launch", () => {
    const result = solveMission({ payloadKg: 200_000, vehicleId: "starship", mode: "orbit" });
    expect(result.kind).toBe("feasible");
    if (result.kind !== "feasible") return;
    expect(result.cost.launches.value).toBe(Math.ceil(result.imleoKg.value / 100_000));
    expect(result.cost.launches.value).toBeGreaterThan(1);
    const launchLine = result.cost.lines.find((l) => l.label === "Launches");
    expect(launchLine?.amount?.value).toBe(result.cost.launches.value * 2_000_000);
  });

  it("the Apollo LM's unchecked payload capacity is surfaced as an assumption", () => {
    const result = solveMission({
      payloadKg: 100,
      vehicleId: "saturn-v",
      mode: "land",
      landerId: "apollo-lm",
    });
    expect(result.kind).toBe("feasible");
    if (result.kind !== "feasible") return;
    expect(result.assumptions.some((a) => a.includes("lander-max-payload"))).toBe(true);
  });
});

/**
 * The guard: no code path can produce a `confirmed` model output. Every
 * figure the engine synthesizes carries kind "derived" (dotted forever) and
 * no confidence field. This walks entire results and fails on any object
 * that claims otherwise.
 */
describe("guard: no code path produces confirmed", () => {
  function walk(node: unknown, visit: (obj: Record<string, unknown>) => void, seen = new Set<object>()): void {
    if (!node || typeof node !== "object") return;
    if (seen.has(node as object)) return;
    seen.add(node as object);
    if (!Array.isArray(node)) visit(node as Record<string, unknown>);
    for (const value of Object.values(node)) walk(value, visit, seen);
  }

  function assertNoConfirmedOutputs(result: MissionResult): void {
    walk(result, (obj) => {
      if (typeof obj.id === "string" && obj.id.startsWith("model.")) {
        expect(obj.kind).toBe("derived");
        expect("confidence" in obj).toBe(false);
        expect(markFor(obj as never)).toBe("dotted");
      }
      // Store inputs may be reported or derived; none may claim confirmed
      // out of this engine today (agents never mark confirmed, and no record
      // in the store is promoted).
      if (obj.confidence === "confirmed") {
        throw new Error(`confirmed confidence reached an engine result via '${String(obj.id)}'`);
      }
    });
  }

  it("holds across feasible, infeasible, and missing-input results", () => {
    assertNoConfirmedOutputs(solveMission({ payloadKg: 2000, vehicleId: "falcon-heavy", mode: "orbit" }));
    assertNoConfirmedOutputs(
      solveMission({ payloadKg: 100, vehicleId: "saturn-v", mode: "land", landerId: "apollo-lm" })
    );
    assertNoConfirmedOutputs(
      solveMission({ payloadKg: 5000, vehicleId: "falcon-heavy", mode: "land", landerId: "apollo-lm" })
    );
    assertNoConfirmedOutputs(solveMission({ payloadKg: 1000, vehicleId: "new-glenn", mode: "orbit" }));
  });

  it("modelFigure refuses empty notes: every derived number names its judgment", () => {
    expect(() =>
      modelFigure({ id: "x", value: 1, unit: "kg", label: "x", formula: "x", inputs: [], notes: " " })
    ).toThrow();
  });
});
