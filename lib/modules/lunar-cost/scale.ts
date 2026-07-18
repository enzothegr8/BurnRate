/**
 * Payload scale bounds for the input's side note. COMPUTED from the vehicle
 * and lander records, never hardcoded: the note is a view onto the store
 * like everything else, and its bounds carry their records' notation.
 *
 * The payload input itself is free: any value, no clamping, no validation,
 * Run never disabled. These bounds exist to give the number scale, not to
 * fence it.
 */

import { resolveFactOrLedgerRow } from "@/lib/facts/store";
import type { ResolvedFact } from "@/lib/facts/types";
import { getLander, getStage, getVehicle, MISSION_LEGS } from "./catalog";
import { modelFigure } from "./model";
import { maxOrbitPayloadSingleLaunch } from "./stack";
import type { ModelFigure } from "./types";

export interface ScaleBounds {
  /** The lander's published payload capacity, with its own mark. Null when
   * no source prints one; the note renders the absence, not a guess. */
  landing: ResolvedFact | null;
  landingEmptyReason: string | null;
  /** Largest single-launch payload around the Moon: computed, dotted. Null
   * when a required record is missing. */
  orbitSingleLaunch: ModelFigure | null;
  orbitEmptyReason: string | null;
}

export function scaleBounds(vehicleId: string, landerId?: string): ScaleBounds {
  const vehicle = getVehicle(vehicleId);
  const stage = getStage(vehicle.defaultStageId);

  let landing: ResolvedFact | null = null;
  let landingEmptyReason: string | null = null;
  if (landerId) {
    const lander = getLander(landerId);
    if (lander.maxPayloadFactId) {
      landing = resolveFactOrLedgerRow(lander.maxPayloadFactId);
    } else {
      landingEmptyReason = `No source prints a payload capacity for ${lander.name}.`;
    }
  } else {
    landingEmptyReason = "No lander selected.";
  }

  let orbitSingleLaunch: ModelFigure | null = null;
  let orbitEmptyReason: string | null = null;
  const tli = MISSION_LEGS.find((l) => l.id === "tli")!;
  const loi = MISSION_LEGS.find((l) => l.id === "loi")!;
  if (vehicle.leoCapacityFactId && stage.ispFactId && stage.dryMassFactId) {
    const capacity = resolveFactOrLedgerRow(vehicle.leoCapacityFactId);
    const isp = resolveFactOrLedgerRow(stage.ispFactId);
    const dry = resolveFactOrLedgerRow(stage.dryMassFactId);
    const dvTli = resolveFactOrLedgerRow(tli.dvFactId);
    const dvLoi = resolveFactOrLedgerRow(loi.dvFactId);
    const value = maxOrbitPayloadSingleLaunch(
      capacity.value,
      { ispS: isp.value, dryMassKg: dry.value, propellantCapacityKg: null },
      { tliMps: dvTli.value, loiMps: dvLoi.value, descentMps: 0 }
    );
    orbitSingleLaunch = modelFigure({
      id: `scale.orbit-single-launch.${vehicle.id}`,
      value,
      unit: "kg",
      label: `Largest payload one ${vehicle.name} launch puts in lunar orbit, per this model`,
      formula: "leo_capacity / (R_loi * R_tli) - stage_dry",
      inputs: [capacity, isp, dry, dvTli, dvLoi],
      notes:
        "Closed-form inversion of the same impulsive-burn model the solver uses; every simplification the solver states applies here. A negative value means the transfer stage alone exceeds the vehicle's LEO capacity, which is a finding, not an error.",
    });
  } else {
    orbitEmptyReason = "A record this bound needs (capacity, stage Isp, or stage dry mass) has no published figure.";
  }

  return { landing, landingEmptyReason, orbitSingleLaunch, orbitEmptyReason };
}
