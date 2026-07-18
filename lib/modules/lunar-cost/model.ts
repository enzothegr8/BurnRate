/**
 * Model output synthesis. Every number the engine computes leaves through
 * modelFigure(), which builds a derived ResolvedFact: dotted by
 * construction, carrying its formula, its inputs, and a non-empty note
 * naming the judgment. There is no other way to mint an output, and there
 * is no code path to `confirmed`; the guard test walks results and asserts
 * both.
 *
 * Synthesized ids are prefixed "model." so a reader (and the guard test)
 * can tell a computed figure from a stored record at a glance.
 */

import type { Confidence, ResolvedFact, Unit } from "@/lib/facts/types";
import type { ModelFigure } from "./types";

const CONFIDENCE_RANK: Record<Confidence, number> = {
  derived: 1,
  reported: 2,
  confirmed: 3,
};

export function modelFigure(opts: {
  /** Will be prefixed "model." if not already. */
  id: string;
  value: number;
  unit: Unit;
  label: string;
  formula: string;
  /** The resolved records this figure was computed from. */
  inputs: ResolvedFact[];
  /** Required non-empty: every derived number contains a judgment. */
  notes: string;
}): ModelFigure {
  if (!opts.notes || opts.notes.trim() === "") {
    throw new Error(`[lunar-cost] model figure '${opts.id}' has empty notes; name the judgment`);
  }
  const confidences = opts.inputs.map((input): Confidence =>
    input.kind === "derived" ? "derived" : input.confidence
  );
  const lowest =
    confidences.length > 0
      ? confidences.reduce((low, c) => (CONFIDENCE_RANK[c] < CONFIDENCE_RANK[low] ? c : low))
      : "derived";
  return {
    kind: "derived",
    id: opts.id.startsWith("model.") ? opts.id : `model.${opts.id}`,
    value: opts.value,
    unit: opts.unit,
    label: opts.label,
    formula: opts.formula,
    derived_from: opts.inputs.map((input) => input.id),
    lowestInputConfidence: lowest,
    notes: opts.notes,
    stale: opts.inputs.some((input) => input.stale),
  };
}
