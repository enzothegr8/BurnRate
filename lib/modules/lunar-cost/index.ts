/**
 * The lunar cost engine. Headless: no UI, no animation, no React. Prompt 6
 * builds the module page on top of exactly this surface.
 */

export { G0, deltaV, massRatio, propellantForBurn } from "./physics";
export {
  launchesFor,
  maxOrbitPayloadSingleLaunch,
  solveStack,
  type StackInput,
  type StackResult,
} from "./stack";
export { solveMission } from "./solve";
export { scaleBounds, type ScaleBounds } from "./scale";
export {
  divergedFields,
  effectiveParams,
  evaluatePreset,
  getPreset,
} from "./presets";
export {
  MISSION_LEGS,
  MODEL_ASSUMPTIONS,
  PRESETS,
  getLander,
  getStage,
  getVehicle,
  landers,
  stages,
  vehicles,
} from "./catalog";
export type {
  AsFlownSlots,
  ComparisonRow,
  CostBreakdown,
  CostLine,
  Feasible,
  Infeasible,
  LanderSpec,
  LegExecution,
  LegResult,
  LegSpec,
  MissionMode,
  MissionParams,
  MissionResult,
  MissingInput,
  ModelFigure,
  PresetEvaluation,
  PresetSpec,
  PresetState,
  RecordSlot,
  StageSpec,
  VehicleSpec,
} from "./types";
