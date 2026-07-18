/**
 * Record-backed mission solver. Resolves every input from the fact store,
 * runs the numeric core (stack.ts), and mints model figures for every
 * intermediate. The output carries every record it resolved, so a renderer
 * can show the full provenance of the answer.
 *
 * Missing records are a first-class result: if a required slot is null
 * (the figure does not exist in any source), the engine returns
 * kind "missing-input" naming the slot, instead of guessing.
 */

import { resolveFactOrLedgerRow } from "@/lib/facts/store";
import type { ResolvedFact } from "@/lib/facts/types";
import {
  getLander,
  getStage,
  getVehicle,
  MISSION_LEGS,
  MODEL_ASSUMPTIONS,
} from "./catalog";
import { modelFigure } from "./model";
import { launchesFor, solveStack, type NumericLander, type NumericStage } from "./stack";
import type {
  CostBreakdown,
  CostLine,
  Feasible,
  Infeasible,
  LegResult,
  MissionParams,
  MissionResult,
  MissingInput,
  ModelFigure,
  RecordSlot,
} from "./types";

interface SlotRequest {
  slot: RecordSlot;
  slotName: string;
  element: string;
  /** Stated when the slot is null. */
  emptyReason: string;
}

class SlotResolver {
  readonly resolved: ResolvedFact[] = [];
  readonly missing: MissingInput["missing"] = [];
  private readonly byId = new Map<string, ResolvedFact>();

  /** Resolve a required slot; records a MissingInput entry when null. */
  require(req: SlotRequest): ResolvedFact | null {
    if (req.slot === null) {
      this.missing.push({ slot: req.slotName, element: req.element, reason: req.emptyReason });
      return null;
    }
    return this.get(req.slot);
  }

  /** Resolve an optional slot; null slots are simply absent. */
  optional(slot: RecordSlot): ResolvedFact | null {
    if (slot === null) return null;
    return this.get(slot);
  }

  private get(id: string): ResolvedFact {
    const cached = this.byId.get(id);
    if (cached) return cached;
    const fact = resolveFactOrLedgerRow(id);
    this.byId.set(id, fact);
    this.resolved.push(fact);
    return fact;
  }
}

export function solveMission(params: MissionParams): MissionResult {
  const vehicle = getVehicle(params.vehicleId);
  const stage = getStage(params.stageId ?? vehicle.defaultStageId);
  const lander = params.mode === "land" ? getLander(params.landerId) : null;

  const r = new SlotResolver();

  const stageIsp = r.require({
    slot: stage.ispFactId,
    slotName: `stage.${stage.id}.isp`,
    element: stage.name,
    emptyReason: "No source prints a specific impulse for this stage.",
  });
  const stageDry = r.require({
    slot: stage.dryMassFactId,
    slotName: `stage.${stage.id}.dry-mass`,
    element: stage.name,
    emptyReason: "No source prints a dry mass for this stage.",
  });
  const stageCap = r.optional(stage.propellantCapacityFactId);

  const leoCapacity = r.require({
    slot: vehicle.leoCapacityFactId,
    slotName: `vehicle.${vehicle.id}.leo-capacity`,
    element: vehicle.name,
    emptyReason: "No source prints a LEO capacity for this vehicle.",
  });

  let landerIsp: ResolvedFact | null = null;
  let landerDry: ResolvedFact | null = null;
  let landerCap: ResolvedFact | null = null;
  let landerMax: ResolvedFact | null = null;
  if (lander) {
    landerIsp = r.require({
      slot: lander.ispFactId,
      slotName: `lander.${lander.id}.isp`,
      element: lander.name,
      emptyReason: "No source prints a descent engine specific impulse for this lander.",
    });
    landerDry = r.require({
      slot: lander.dryMassFactId,
      slotName: `lander.${lander.id}.dry-mass`,
      element: lander.name,
      emptyReason: "No source prints a dry mass for this lander.",
    });
    landerCap = r.optional(lander.propellantCapacityFactId);
    landerMax = r.optional(lander.maxPayloadFactId);
  }

  const legs = MISSION_LEGS.filter((leg) => params.mode === "land" || !leg.landingOnly);
  const dvFacts = new Map(legs.map((leg) => [leg.id, r.require({
    slot: leg.dvFactId,
    slotName: `leg.${leg.id}.dv`,
    element: leg.name,
    emptyReason: "No source prints a delta-v for this leg.",
  })]));

  if (r.missing.length > 0) {
    return { kind: "missing-input", params, missing: r.missing };
  }

  const dv = (legId: string): ResolvedFact => {
    const fact = dvFacts.get(legId);
    if (!fact) throw new Error(`[lunar-cost] leg '${legId}' missing from mission legs`);
    return fact;
  };

  const numericStage: NumericStage = {
    ispS: stageIsp!.value,
    dryMassKg: stageDry!.value,
    propellantCapacityKg: stageCap?.value ?? null,
  };
  const numericLander: NumericLander | null = lander
    ? {
        ispS: landerIsp!.value,
        dryMassKg: landerDry!.value,
        propellantCapacityKg: landerCap?.value ?? null,
        maxPayloadKg: landerMax?.value ?? null,
      }
    : null;

  const solved = solveStack({
    payloadKg: params.payloadKg,
    mode: params.mode,
    stage: numericStage,
    lander: numericLander,
    dvs: {
      tliMps: dv("tli").value,
      loiMps: dv("loi").value,
      descentMps: params.mode === "land" ? dv("descent").value : 0,
    },
  });

  const assumptions = [...MODEL_ASSUMPTIONS];

  if (solved.kind === "infeasible") {
    const capacityFact =
      solved.constraint === "lander-max-payload"
        ? landerMax!
        : solved.constraint === "lander-propellant"
          ? landerCap!
          : stageCap!;
    const required = modelFigure({
      id: `required.${solved.constraint}`,
      value: solved.requiredKg,
      unit: "kg",
      label:
        solved.constraint === "lander-max-payload"
          ? "Payload mass requested"
          : "Propellant the burn requires",
      formula:
        solved.constraint === "lander-max-payload"
          ? "user payload input"
          : "final_mass * (exp(dv / (isp * g0)) - 1)",
      inputs: r.resolved,
      notes:
        "Computed by the engine while solving backwards from the requested payload. The request exceeded a recorded capacity; the gap is the result.",
    });
    const infeasible: Infeasible = {
      kind: "infeasible",
      params,
      constraint: solved.constraint,
      bindingElement:
        solved.constraint === "stage-propellant" ? stage.name : (lander?.name ?? stage.name),
      requiredKg: required,
      capacityKg: capacityFact,
      ratio: modelFigure({
        id: `ratio.${solved.constraint}`,
        value: solved.ratio,
        unit: "count",
        label: "Required over capacity",
        formula: "required / capacity",
        inputs: [capacityFact],
        notes:
          "Dimensionless. Greater than one by construction; how many times over the recorded capacity the request is.",
      }),
      legsSolved: [],
      assumptions,
    };
    return infeasible;
  }

  for (const constraint of solved.uncheckedConstraints) {
    assumptions.push(
      `The ${constraint} constraint was NOT checked: no source prints the capacity record it needs. Feasibility here is unverified, not verified.`
    );
  }

  // Leg results, in flight order, each mass a model figure.
  const legResults: LegResult[] = [];
  const mkMass = (id: string, value: number, label: string, formula: string, notes: string): ModelFigure =>
    modelFigure({ id, value, unit: "kg", label, formula, inputs: r.resolved, notes });

  const imleo = mkMass(
    "imleo",
    solved.imleoKg,
    "Initial mass in low Earth orbit",
    "stage_dry + stage_propellant + carried_stack",
    "The full translunar stack in LEO, solved backwards from the payload with the rocket equation. Impulsive burns; no gravity, steering, plane-change, finite-burn, boil-off, or margin terms."
  );

  legResults.push({
    leg: legs.find((l) => l.id === "leo-insertion")!,
    dv: dv("leo-insertion"),
    executedBy: vehicle.name,
    initialMassKg: imleo,
    finalMassKg: imleo,
    propellantKg: null,
  });

  const postTli = mkMass(
    "post-tli-mass",
    solved.postTliMassKg,
    "Stack after trans-lunar injection",
    "stage_dry + loi_propellant + carried_stack",
    "Includes the transfer stage dry mass, which in the model stays attached through LOI. Historical missions that dropped the injection stage after TLI print a smaller injected mass; see the README."
  );
  legResults.push({
    leg: legs.find((l) => l.id === "tli")!,
    dv: dv("tli"),
    executedBy: stage.name,
    initialMassKg: imleo,
    finalMassKg: postTli,
    propellantKg: mkMass(
      "tli-propellant",
      solved.tliPropellantKg,
      "TLI propellant",
      "post_tli_mass * (exp(dv_tli / (isp * g0)) - 1)",
      "Impulsive burn by the transfer stage."
    ),
  });

  const postLoi = mkMass(
    "post-loi-mass",
    solved.imleoKg - solved.tliPropellantKg - solved.loiPropellantKg,
    "Stack in low lunar orbit",
    "stage_dry + carried_stack",
    "Stage dry mass plus everything it carried, after both stage burns."
  );
  legResults.push({
    leg: legs.find((l) => l.id === "loi")!,
    dv: dv("loi"),
    executedBy: stage.name,
    initialMassKg: postTli,
    finalMassKg: postLoi,
    propellantKg: mkMass(
      "loi-propellant",
      solved.loiPropellantKg,
      "LOI propellant",
      "(stage_dry + carried_stack) * (exp(dv_loi / (isp * g0)) - 1)",
      "Impulsive burn by the transfer stage."
    ),
  });

  if (params.mode === "land" && lander) {
    const touchdown = mkMass(
      "touchdown-mass",
      numericLander!.dryMassKg + params.payloadKg,
      "Lander plus payload on the surface",
      "lander_dry + payload",
      "Dry lander at touchdown; residual propellant not modeled."
    );
    legResults.push({
      leg: legs.find((l) => l.id === "descent")!,
      dv: dv("descent"),
      executedBy: lander.name,
      initialMassKg: mkMass(
        "pre-descent-mass",
        solved.carriedKg,
        "Lander stack before descent",
        "lander_dry + lander_propellant + payload",
        "The mass the transfer stage delivered to low lunar orbit."
      ),
      finalMassKg: touchdown,
      propellantKg: mkMass(
        "descent-propellant",
        solved.landerPropellantKg,
        "Descent propellant",
        "(lander_dry + payload) * (exp(dv_descent / (isp * g0)) - 1)",
        "Impulsive burn by the lander."
      ),
    });
  }

  const cost = buildCost(params, r, vehicle.name, stage, lander, imleo, leoCapacity!);

  const feasible: Feasible = {
    kind: "feasible",
    params,
    legs: legResults,
    imleoKg: imleo,
    cost,
    inputs: r.resolved,
    assumptions,
  };
  return feasible;
}

function buildCost(
  params: MissionParams,
  r: SlotResolver,
  vehicleName: string,
  stage: ReturnType<typeof getStage>,
  lander: ReturnType<typeof getLander> | null,
  imleo: ModelFigure,
  leoCapacity: ResolvedFact
): CostBreakdown {
  const vehicle = getVehicle(params.vehicleId);
  const launches = modelFigure({
    id: "launches",
    value: launchesFor(imleo.value, leoCapacity.value),
    unit: "count",
    label: `${vehicleName} launches`,
    formula: "ceil(imleo / vehicle_leo_capacity)",
    inputs: [leoCapacity],
    notes:
      "Assumes the stack can be aggregated in LEO across launches at no extra cost or propellant loss. That assumption is stated, not hidden, and it is generous.",
  });

  const lines: CostLine[] = [];
  let completeSum = true;
  let total = 0;
  const totalInputs: ResolvedFact[] = [leoCapacity];

  const price = r.optional(vehicle.priceFactId);
  if (price) {
    const launchLine = modelFigure({
      id: "launch-cost",
      value: launches.value * price.value,
      unit: "USD",
      label: `${vehicleName}, ${launches.value} launch(es)`,
      formula: "launches * vehicle_price",
      inputs: [price, leoCapacity],
      notes: price.notes,
    });
    lines.push({ label: "Launches", amount: launchLine });
    total += launchLine.value;
    totalInputs.push(price);
  } else {
    lines.push({
      label: "Launches",
      amount: null,
      emptyReason: `No source prints a per-launch price for ${vehicleName}. The slot exists; the figure does not.`,
    });
    completeSum = false;
  }

  const stageCost = r.optional(stage.costFactId);
  if (stageCost) {
    lines.push({ label: `${stage.name} (transfer stage)`, amount: stageCost });
    total += stageCost.value;
    totalInputs.push(stageCost);
  } else {
    lines.push({
      label: `${stage.name} (transfer stage)`,
      amount: null,
      emptyReason: stage.notes,
    });
    // A stage priced within the launch is a stated structure, not a missing
    // figure; it does not mark the sum incomplete on its own.
  }

  if (params.mode === "land" && lander) {
    const landerCost = r.optional(lander.costFactId);
    if (landerCost) {
      lines.push({ label: `${lander.name} (lander)`, amount: landerCost });
      total += landerCost.value;
      totalInputs.push(landerCost);
    } else {
      lines.push({
        label: `${lander.name} (lander)`,
        amount: null,
        emptyReason: `No source prints a cost for ${lander.name}. The slot exists; the figure does not.`,
      });
      completeSum = false;
    }
  }

  const totalUsd = modelFigure({
    id: "mission-cost",
    value: total,
    unit: "USD",
    label: "Mission cost, 2026 dollars",
    formula: "launches * vehicle_price + stage_cost + lander_cost",
    inputs: totalInputs,
    notes: completeSum
      ? "Sum of the lines above. Dollar vintages follow the price records; see each record's notes for what its figure includes."
      : "INCOMPLETE SUM: at least one cost slot has no published figure. The lines that exist are summed; the total is a floor, not a cost.",
  });

  return { launches, lines, totalUsd, completeSum };
}
