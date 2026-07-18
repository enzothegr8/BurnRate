/**
 * Presets: real missions' as-flown parameters, loaded into the engine.
 *
 * Two classes of number live here and they are never conflated:
 *
 *   AS-FLOWN - what the mission actually massed, burned, cost. Historical
 *   record, resolved from the store with its own mark. The only figures in
 *   this module that could EVER reach solid, and even they are proposed
 *   `reported` (only Enzo promotes).
 *
 *   MODEL OUTPUT - what the engine computes for the same mission. Dotted
 *   forever, even when it matches, because the engine computed it.
 *
 * THE DELTA BETWEEN THEM IS THE MODULE'S ERROR BAR AND IT IS PUBLISHED:
 * model, actual, absolute delta, percent delta, per field. A module that
 * reports its own error is worth more than one that pretends.
 *
 * Dirty state: every preset field is editable. The instant one diverges
 * from the as-flown value, `pristine` flips false, the diverged fields are
 * named, and the comparison is withheld: an edited mission has no as-flown
 * record, and pretending otherwise would launder historical figures onto a
 * hypothetical.
 */

import { resolveFactOrLedgerRow } from "@/lib/facts/store";
import { PRESETS } from "./catalog";
import { modelFigure } from "./model";
import { solveMission } from "./solve";
import type {
  ComparisonRow,
  Feasible,
  MissionParams,
  ModelFigure,
  PresetEvaluation,
  PresetSpec,
  PresetState,
} from "./types";
import type { ResolvedFact } from "@/lib/facts/types";

export function getPreset(id: string): PresetSpec {
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) throw new Error(`[lunar-cost] Unknown preset '${id}'`);
  return preset;
}

/** Params after user edits. */
export function effectiveParams(state: PresetState): MissionParams {
  const preset = getPreset(state.presetId);
  return { ...preset.params, ...state.overrides };
}

/**
 * Divergence is by value, not by presence: overriding a field back to the
 * as-flown value is not an edit, it is the as-flown value.
 */
export function divergedFields(state: PresetState): (keyof MissionParams)[] {
  const preset = getPreset(state.presetId);
  const keys = Object.keys(state.overrides) as (keyof MissionParams)[];
  return keys.filter((key) => state.overrides[key] !== preset.params[key]);
}

function comparisonRow(
  field: ComparisonRow["field"],
  label: string,
  model: ModelFigure,
  actual: ResolvedFact,
  vintageNote: string
): ComparisonRow {
  const deltaAbs = modelFigure({
    id: `delta.${field}.abs`,
    value: model.value - actual.value,
    unit: actual.unit,
    label: `${label}, model minus actual`,
    formula: "model - actual",
    inputs: [actual],
    notes: `The module's published error bar on this field. Positive means the model overshoots the as-flown record. ${vintageNote}`,
  });
  const deltaPct = modelFigure({
    id: `delta.${field}.pct`,
    value: actual.value === 0 ? Number.NaN : (model.value - actual.value) / actual.value,
    unit: "percent",
    label: `${label}, delta as share of actual`,
    formula: "(model - actual) / actual",
    inputs: [actual],
    notes: `The module's published error bar on this field, as a fraction of the as-flown record. ${vintageNote}`,
  });
  return { field, label, model, actual, deltaAbs, deltaPct };
}

/** Model-vs-actual rows for a PRISTINE preset run. */
function compare(preset: PresetSpec, result: Feasible): ComparisonRow[] {
  const rows: ComparisonRow[] = [];

  if (preset.asFlown.leoMassFactId) {
    rows.push(
      comparisonRow(
        "leoMassKg",
        "Mass in low Earth orbit",
        result.imleoKg,
        resolveFactOrLedgerRow(preset.asFlown.leoMassFactId),
        "Mass framing differences between model and record are described in the record's notes."
      )
    );
  }

  if (preset.asFlown.tliMassFactId) {
    const tliLeg = result.legs.find((leg) => leg.leg.id === "tli");
    if (tliLeg) {
      rows.push(
        comparisonRow(
          "tliMassKg",
          "Translunar stack after TLI",
          tliLeg.finalMassKg,
          resolveFactOrLedgerRow(preset.asFlown.tliMassFactId),
          "The model keeps the transfer stage attached through LOI; historical injected-mass figures may exclude the spent injection stage. Part of this delta is structural and the README says so."
        )
      );
    }
  }

  if (preset.asFlown.costFactId) {
    rows.push(
      comparisonRow(
        "costUsd",
        "Mission cost",
        result.cost.totalUsd,
        resolveFactOrLedgerRow(preset.asFlown.costFactId),
        "Dollar vintages follow each record; see notes on both sides before reading this delta as pure model error."
      )
    );
  }

  return rows;
}

export function evaluatePreset(state: PresetState): PresetEvaluation {
  const preset = getPreset(state.presetId);
  const diverged = divergedFields(state);
  const pristine = diverged.length === 0;
  const result = solveMission(effectiveParams(state));

  return {
    preset,
    pristine,
    divergedFields: diverged,
    result,
    comparison: pristine && result.kind === "feasible" ? compare(preset, result) : null,
  };
}
