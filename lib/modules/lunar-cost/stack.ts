/**
 * The numeric solver core. Pure numbers in, pure numbers out; no records,
 * no store, no synthesis. solve.ts wraps this with record resolution and
 * mints the model figures. Tests exercise this directly with controlled
 * inputs, and exercise solve.ts for the record-backed integration.
 *
 * The mission is solved BACKWARDS from the payload:
 *
 *   descent (lander, landing only)  <- payload sits on the lander
 *   LOI (transfer stage)            <- stage carries lander wet + payload
 *   TLI (transfer stage)            <- same stage, same stack
 *   LEO insertion (launch vehicle)  <- priced by capacity, not solved
 *
 * The transfer stage performs TLI and LOI with no mass dropped between
 * them. IMLEO is the full stack mass in LEO: stage dry + stage propellant
 * + everything carried.
 *
 * Infeasibility is a first-class result. Nothing clamps, nothing scales,
 * nothing throws on a big payload; the caller gets the binding constraint,
 * the required mass, the capacity, and the ratio.
 */

import { massRatio, propellantForBurn } from "./physics";

export interface NumericStage {
  ispS: number;
  dryMassKg: number;
  /** Null when the capacity is unpublished; the constraint is then not
   * checkable, which the caller must surface as an assumption. */
  propellantCapacityKg: number | null;
}

export interface NumericLander extends NumericStage {
  /** Null when unpublished. */
  maxPayloadKg: number | null;
}

export interface NumericDvs {
  tliMps: number;
  loiMps: number;
  descentMps: number;
}

export interface StackInput {
  payloadKg: number;
  mode: "orbit" | "land";
  stage: NumericStage;
  lander: NumericLander | null;
  dvs: NumericDvs;
}

export interface NumericInfeasible {
  kind: "infeasible";
  constraint: "lander-max-payload" | "lander-propellant" | "stage-propellant";
  requiredKg: number;
  capacityKg: number;
  ratio: number;
}

export interface NumericFeasible {
  kind: "feasible";
  /** Lander propellant for descent (kg); 0 in orbit mode. */
  landerPropellantKg: number;
  /** Lander wet mass incl. payload at LOI exit (kg); payload alone in orbit mode. */
  carriedKg: number;
  loiPropellantKg: number;
  tliPropellantKg: number;
  stagePropellantKg: number;
  imleoKg: number;
  /** Stack mass after the TLI burn (stage dry + LOI propellant + carried). */
  postTliMassKg: number;
  /** Constraints that could not be checked because the capacity is unpublished. */
  uncheckedConstraints: string[];
}

export type StackResult = NumericFeasible | NumericInfeasible;

export function solveStack(input: StackInput): StackResult {
  const { payloadKg, mode, stage, lander, dvs } = input;
  const unchecked: string[] = [];

  let landerPropellantKg = 0;
  let carriedKg = payloadKg;

  if (mode === "land") {
    if (!lander) throw new Error("[lunar-cost] landing mission requires a lander");

    if (lander.maxPayloadKg !== null) {
      if (payloadKg > lander.maxPayloadKg) {
        return {
          kind: "infeasible",
          constraint: "lander-max-payload",
          requiredKg: payloadKg,
          capacityKg: lander.maxPayloadKg,
          ratio: payloadKg / lander.maxPayloadKg,
        };
      }
    } else {
      unchecked.push("lander-max-payload");
    }

    const landerFinalKg = lander.dryMassKg + payloadKg;
    landerPropellantKg = propellantForBurn(landerFinalKg, dvs.descentMps, lander.ispS);

    if (lander.propellantCapacityKg !== null) {
      if (landerPropellantKg > lander.propellantCapacityKg) {
        return {
          kind: "infeasible",
          constraint: "lander-propellant",
          requiredKg: landerPropellantKg,
          capacityKg: lander.propellantCapacityKg,
          ratio: landerPropellantKg / lander.propellantCapacityKg,
        };
      }
    } else {
      unchecked.push("lander-propellant");
    }

    carriedKg = lander.dryMassKg + landerPropellantKg + payloadKg;
  }

  // LOI: the stage brakes stage-dry + carried into lunar orbit.
  const loiFinalKg = stage.dryMassKg + carriedKg;
  const loiPropellantKg = propellantForBurn(loiFinalKg, dvs.loiMps, stage.ispS);

  // TLI: same stack, plus the LOI propellant still aboard.
  const tliFinalKg = loiFinalKg + loiPropellantKg;
  const tliPropellantKg = propellantForBurn(tliFinalKg, dvs.tliMps, stage.ispS);

  const stagePropellantKg = loiPropellantKg + tliPropellantKg;

  if (stage.propellantCapacityKg !== null) {
    if (stagePropellantKg > stage.propellantCapacityKg) {
      return {
        kind: "infeasible",
        constraint: "stage-propellant",
        requiredKg: stagePropellantKg,
        capacityKg: stage.propellantCapacityKg,
        ratio: stagePropellantKg / stage.propellantCapacityKg,
      };
    }
  } else {
    unchecked.push("stage-propellant");
  }

  const imleoKg = stage.dryMassKg + stagePropellantKg + carriedKg;

  return {
    kind: "feasible",
    landerPropellantKg,
    carriedKg,
    loiPropellantKg,
    tliPropellantKg,
    stagePropellantKg,
    imleoKg,
    postTliMassKg: tliFinalKg,
    uncheckedConstraints: unchecked,
  };
}

/** ceil(IMLEO / capacity), the launch count. Exact multiples do not round up. */
export function launchesFor(imleoKg: number, leoCapacityKg: number): number {
  if (leoCapacityKg <= 0) throw new Error("[lunar-cost] LEO capacity must be positive");
  return Math.ceil(imleoKg / leoCapacityKg);
}

/**
 * Largest payload a single launch can send around the Moon (orbit mode),
 * from the closed form IMLEO = (stage dry + payload) * R_loi * R_tli.
 * May be negative when the stage alone exceeds the vehicle's capacity;
 * callers report that as a finding, not an error.
 */
export function maxOrbitPayloadSingleLaunch(
  leoCapacityKg: number,
  stage: NumericStage,
  dvs: NumericDvs
): number {
  const ratio = massRatio(dvs.loiMps, stage.ispS) * massRatio(dvs.tliMps, stage.ispS);
  return leoCapacityKg / ratio - stage.dryMassKg;
}
