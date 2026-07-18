/**
 * Lunar cost engine types. Headless; no UI, no React.
 *
 * The governing structure is generic on purpose (the long-term goal is any
 * destination): a mission is a sequence of delta-v legs executed by a
 * vehicle stack. Only the destination is hardcoded, via the leg list in
 * catalog.ts.
 *
 * Every number the engine touches is either a store record (resolved, with
 * its own mark) or a model output. Model outputs are synthesized derived
 * ResolvedFacts: dotted forever, even when they match reality, because the
 * engine computed them (editorial-standards.md section 2, kinds not
 * degrees). There is no code path to `confirmed`; a guard test asserts it.
 */

import type { ResolvedFact } from "@/lib/facts/types";

/** A model output. Always kind "derived"; Figure renders it dotted. */
export type ModelFigure = Extract<ResolvedFact, { kind: "derived" }>;

/** A record slot: a fact id, or null when the figure does not exist in any
 * source. A null slot is rendered visibly empty, never guessed. */
export type RecordSlot = string | null;

export type LegExecution = "launch" | "stage" | "lander";

/** One delta-v leg. The dv is a fact record, not a constant. */
export interface LegSpec {
  id: string;
  name: string;
  dvFactId: string;
  /** Who executes it: the launch vehicle (priced by capacity), the transfer
   * stage, or the lander. */
  execution: LegExecution;
  /** Landing-only legs are skipped in orbit mode. */
  landingOnly: boolean;
}

export interface StageSpec {
  id: string;
  name: string;
  ispFactId: RecordSlot;
  dryMassFactId: RecordSlot;
  propellantCapacityFactId: RecordSlot;
  /** Null means the stage is not sold separately; see notes. */
  costFactId: RecordSlot;
  /** Why a null slot is null, and anything else the reader needs. */
  notes: string;
}

export interface LanderSpec {
  id: string;
  name: string;
  ispFactId: RecordSlot;
  dryMassFactId: RecordSlot;
  propellantCapacityFactId: RecordSlot;
  maxPayloadFactId: RecordSlot;
  costFactId: RecordSlot;
  notes: string;
}

export interface VehicleSpec {
  id: string;
  name: string;
  leoCapacityFactId: RecordSlot;
  /** Per-launch price in 2026 dollars (a derived record when the source
   * vintage differs; the conversion is itself a record with its method). */
  priceFactId: RecordSlot;
  /** The transfer stage this vehicle's stack uses by default. */
  defaultStageId: string;
  notes: string;
}

export type MissionMode = "orbit" | "land";

export interface MissionParams {
  payloadKg: number;
  vehicleId: string;
  mode: MissionMode;
  /** Defaults to the vehicle's defaultStageId. */
  stageId?: string;
  /** Required when mode is "land". */
  landerId?: string;
}

/** One leg, solved. Masses are model figures; the dv is the resolved record. */
export interface LegResult {
  leg: LegSpec;
  dv: ResolvedFact;
  executedBy: string;
  /** Stack mass after the burn (kg). */
  finalMassKg: ModelFigure;
  /** Propellant consumed by the burn (kg). Zero-burn legs (launch) omit it. */
  propellantKg: ModelFigure | null;
  /** Stack mass before the burn (kg). */
  initialMassKg: ModelFigure;
}

export interface CostLine {
  label: string;
  /** A store record (vehicle price, lander cost) with its own mark, or a
   * model figure (launch count times price), or null for an empty slot. */
  amount: ResolvedFact | null;
  /** Present when the slot is empty: why there is no number here. */
  emptyReason?: string;
}

export interface CostBreakdown {
  launches: ModelFigure;
  lines: CostLine[];
  /** Sum of the lines that have amounts. If any line is an empty slot, the
   * total says so in its notes and completeSum is false. */
  totalUsd: ModelFigure;
  completeSum: boolean;
}

export interface Feasible {
  kind: "feasible";
  params: MissionParams;
  legs: LegResult[];
  imleoKg: ModelFigure;
  cost: CostBreakdown;
  /** Every store record the run resolved, for provenance display. */
  inputs: ResolvedFact[];
  /** What the model does not include, stated on the face of the module. */
  assumptions: string[];
}

/**
 * Infeasibility is a first-class result, not an error. The gap is the story.
 */
export interface Infeasible {
  kind: "infeasible";
  params: MissionParams;
  /** Which constraint binds. */
  constraint:
    | "lander-max-payload"
    | "lander-propellant"
    | "stage-propellant";
  bindingElement: string;
  requiredKg: ModelFigure;
  capacityKg: ResolvedFact;
  /** required / capacity. Dimensionless, > 1 by construction. */
  ratio: ModelFigure;
  /** Legs solved before the constraint bound, for display. */
  legsSolved: LegResult[];
  assumptions: string[];
}

/**
 * A required input record does not exist in any source. The slot is built
 * and rendered visibly empty (editorial-standards.md section 8); the engine
 * reports exactly what is missing rather than guessing.
 */
export interface MissingInput {
  kind: "missing-input";
  params: MissionParams;
  missing: { slot: string; element: string; reason: string }[];
}

export type MissionResult = Feasible | Infeasible | MissingInput;

/** As-flown record slots for a preset. Historical record; the only figures
 * that can ever reach solid, and even they are proposed reported. */
export interface AsFlownSlots {
  /** Mass placed in Earth parking orbit (kg). */
  leoMassFactId: RecordSlot;
  /** Translunar-injected spacecraft mass (kg). */
  tliMassFactId: RecordSlot;
  /** Mission cost record. */
  costFactId: RecordSlot;
}

export interface PresetSpec {
  id: string;
  label: string;
  params: MissionParams;
  /** The payload figure's record, when the preset payload traces to one. */
  payloadFactId: RecordSlot;
  asFlown: AsFlownSlots;
  notes: string;
}

/** A preset with user edits. Empty overrides = pristine. */
export interface PresetState {
  presetId: string;
  overrides: Partial<MissionParams>;
}

export interface ComparisonRow {
  field: "leoMassKg" | "tliMassKg" | "costUsd";
  label: string;
  /** Model output. Dotted forever, even when it matches. */
  model: ModelFigure;
  /** As-flown record with its own mark. */
  actual: ResolvedFact;
  deltaAbs: ModelFigure;
  deltaPct: ModelFigure;
}

export interface PresetEvaluation {
  preset: PresetSpec;
  pristine: boolean;
  /** Which params the user changed. The instant one changes, the as-flown
   * column detaches and everything is model output. */
  divergedFields: (keyof MissionParams)[];
  result: MissionResult;
  /** Null when dirty: an edited mission has no as-flown record to compare
   * against, and pretending otherwise would launder the historical figures. */
  comparison: ComparisonRow[] | null;
}
