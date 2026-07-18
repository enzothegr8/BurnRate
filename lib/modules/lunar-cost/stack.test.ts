import { describe, expect, it } from "vitest";
import { massRatio } from "./physics";
import {
  launchesFor,
  maxOrbitPayloadSingleLaunch,
  solveStack,
  type NumericDvs,
  type NumericLander,
  type NumericStage,
} from "./stack";

const STAGE: NumericStage = { ispS: 421, dryMassKg: 13_000, propellantCapacityKg: 106_000 };
const LANDER: NumericLander = {
  ispS: 311,
  dryMassKg: 4_500,
  propellantCapacityKg: 8_200,
  maxPayloadKg: 500,
};
const DVS: NumericDvs = { tliMps: 3_150, loiMps: 850, descentMps: 1_900 };

describe("IMLEO through a multi-leg stack", () => {
  it("orbit mode matches the closed form IMLEO = (dry + payload) * R_loi * R_tli", () => {
    const payload = 2_000;
    const result = solveStack({ payloadKg: payload, mode: "orbit", stage: STAGE, lander: null, dvs: DVS });
    expect(result.kind).toBe("feasible");
    if (result.kind !== "feasible") return;
    const closedForm =
      (STAGE.dryMassKg + payload) * massRatio(DVS.loiMps, STAGE.ispS) * massRatio(DVS.tliMps, STAGE.ispS);
    expect(result.imleoKg).toBeCloseTo(closedForm, 6);
  });

  it("landing mode chains lander propellant into the stage's carried mass", () => {
    const payload = 200;
    const result = solveStack({ payloadKg: payload, mode: "land", stage: STAGE, lander: LANDER, dvs: DVS });
    expect(result.kind).toBe("feasible");
    if (result.kind !== "feasible") return;

    const landerFinal = LANDER.dryMassKg + payload;
    const landerProp = landerFinal * (massRatio(DVS.descentMps, LANDER.ispS) - 1);
    expect(result.landerPropellantKg).toBeCloseTo(landerProp, 6);

    const carried = LANDER.dryMassKg + landerProp + payload;
    expect(result.carriedKg).toBeCloseTo(carried, 6);

    const closedForm =
      (STAGE.dryMassKg + carried) * massRatio(DVS.loiMps, STAGE.ispS) * massRatio(DVS.tliMps, STAGE.ispS);
    expect(result.imleoKg).toBeCloseTo(closedForm, 6);
    expect(result.stagePropellantKg).toBeCloseTo(closedForm - STAGE.dryMassKg - carried, 6);
  });

  it("a bigger payload never cheapens the stack (monotonic IMLEO)", () => {
    const at = (kg: number) => {
      const r = solveStack({ payloadKg: kg, mode: "orbit", stage: { ...STAGE, propellantCapacityKg: null }, lander: null, dvs: DVS });
      if (r.kind !== "feasible") throw new Error("expected feasible");
      return r.imleoKg;
    };
    expect(at(2_000)).toBeGreaterThan(at(1_000));
    expect(at(10_000)).toBeGreaterThan(at(2_000));
  });
});

describe("launches rounding", () => {
  it("rounds up on any excess", () => {
    expect(launchesFor(100_001, 100_000)).toBe(2);
    expect(launchesFor(199_999, 100_000)).toBe(2);
    expect(launchesFor(200_001, 100_000)).toBe(3);
  });

  it("an exact multiple does not round up", () => {
    expect(launchesFor(100_000, 100_000)).toBe(1);
    expect(launchesFor(300_000, 100_000)).toBe(3);
  });

  it("rejects a nonpositive capacity", () => {
    expect(() => launchesFor(1, 0)).toThrow();
  });
});

describe("infeasibility is a first-class result, never a clamp or a throw", () => {
  it("payload over the lander's capacity binds on lander-max-payload", () => {
    const result = solveStack({ payloadKg: 5_000, mode: "land", stage: STAGE, lander: LANDER, dvs: DVS });
    expect(result.kind).toBe("infeasible");
    if (result.kind !== "infeasible") return;
    expect(result.constraint).toBe("lander-max-payload");
    expect(result.requiredKg).toBe(5_000);
    expect(result.capacityKg).toBe(500);
    expect(result.ratio).toBeCloseTo(10, 6);
  });

  it("a descent the tanks cannot feed binds on lander-propellant", () => {
    const smallTanks: NumericLander = { ...LANDER, maxPayloadKg: 100_000, propellantCapacityKg: 1_000 };
    const result = solveStack({ payloadKg: 400, mode: "land", stage: { ...STAGE, propellantCapacityKg: null }, lander: smallTanks, dvs: DVS });
    expect(result.kind).toBe("infeasible");
    if (result.kind !== "infeasible") return;
    expect(result.constraint).toBe("lander-propellant");
    expect(result.requiredKg).toBeGreaterThan(result.capacityKg);
    expect(result.ratio).toBeGreaterThan(1);
  });

  it("a stack the stage cannot push binds on stage-propellant", () => {
    const result = solveStack({ payloadKg: 60_000, mode: "orbit", stage: STAGE, lander: null, dvs: DVS });
    expect(result.kind).toBe("infeasible");
    if (result.kind !== "infeasible") return;
    expect(result.constraint).toBe("stage-propellant");
    expect(result.requiredKg).toBeGreaterThan(STAGE.propellantCapacityKg!);
    expect(result.ratio).toBeGreaterThan(1);
  });

  it("an unpublished capacity is reported unchecked, not assumed fine silently", () => {
    const result = solveStack({
      payloadKg: 60_000,
      mode: "orbit",
      stage: { ...STAGE, propellantCapacityKg: null },
      lander: null,
      dvs: DVS,
    });
    expect(result.kind).toBe("feasible");
    if (result.kind !== "feasible") return;
    expect(result.uncheckedConstraints).toContain("stage-propellant");
  });
});

describe("orbit payload bound", () => {
  it("the closed-form bound round-trips through the solver at capacity", () => {
    const capacity = 63_800;
    const bound = maxOrbitPayloadSingleLaunch(capacity, STAGE, DVS);
    const result = solveStack({ payloadKg: bound, mode: "orbit", stage: { ...STAGE, propellantCapacityKg: null }, lander: null, dvs: DVS });
    if (result.kind !== "feasible") throw new Error("expected feasible");
    expect(result.imleoKg).toBeCloseTo(capacity, 4);
  });
});
