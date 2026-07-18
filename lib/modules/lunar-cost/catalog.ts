/**
 * The lunar cost engine catalog: legs, stages, vehicles, landers, presets.
 * Every parameter is a fact id resolved from the store, or null when the
 * figure does not exist in any fetched source. A null slot is not a gap to
 * paper over; it is a result the engine reports (editorial-standards.md
 * section 8: build the slot, render it visibly empty).
 *
 * The destination is hardcoded here (Earth to Moon) via MISSION_LEGS. The
 * structure is generic: a mission is a sequence of delta-v legs executed by
 * a vehicle stack, so a later destination is a different leg list, not a
 * refactor.
 */

import type { LanderSpec, LegSpec, PresetSpec, StageSpec, VehicleSpec } from "./types";

export const MISSION_LEGS: LegSpec[] = [
  {
    id: "leo-insertion",
    name: "LEO insertion",
    dvFactId: "dv.leo-insertion",
    execution: "launch",
    landingOnly: false,
  },
  { id: "tli", name: "Trans-lunar injection", dvFactId: "dv.tli", execution: "stage", landingOnly: false },
  { id: "loi", name: "Lunar orbit insertion", dvFactId: "dv.loi", execution: "stage", landingOnly: false },
  { id: "descent", name: "Powered descent", dvFactId: "dv.descent", execution: "lander", landingOnly: true },
];

const STAGES: StageSpec[] = [
  {
    id: "s-ivb",
    name: "S-IVB",
    ispFactId: "stage.s-ivb.isp",
    dryMassFactId: "stage.s-ivb.dry-mass",
    propellantCapacityFactId: "stage.s-ivb.propellant",
    costFactId: null,
    notes:
      "Flew only as the third stage of a Saturn V; the launch price record prices the whole vehicle and no fetched source prints a separate S-IVB unit cost. Historically the S-IVB performed TLI only, with the Apollo SM doing LOI; this model has it do both, and the published Apollo deltas carry that structural difference.",
  },
  {
    id: "falcon-upper",
    name: "Falcon second stage",
    ispFactId: "stage.falcon-upper.isp",
    dryMassFactId: "stage.falcon-upper.dry-mass",
    propellantCapacityFactId: "stage.falcon-upper.propellant",
    costFactId: null,
    notes:
      "Integrated upper stage, priced within the launch. The model launches it fueled as cargo, which no real Falcon Heavy does; the README states this inconsistency rather than hiding it.",
  },
  {
    id: "starship",
    name: "Starship (ship as stage)",
    ispFactId: "stage.starship.isp",
    dryMassFactId: "stage.starship.dry-mass",
    propellantCapacityFactId: "stage.starship.propellant",
    costFactId: null,
    notes:
      "The ship is the transfer stage, priced within the launch. Its records mix a 2021 Musk aspiration (dry mass), a 2021 interview figure (Isp), and current V3 marketing (propellant capacity); the outputs inherit all three vintages.",
  },
  {
    id: "new-glenn-gs2",
    name: "New Glenn second stage (GS-2)",
    ispFactId: null,
    dryMassFactId: null,
    propellantCapacityFactId: null,
    costFactId: null,
    notes:
      "Blue Origin publishes no Isp, dry mass, or propellant load for GS-2; the one credible Isp figure (445 s, Bezos) exists only in video and is not citable text. Every physics slot is empty, so New Glenn missions return a missing-input result naming them. That absence is the honest output.",
  },
];

const VEHICLES: VehicleSpec[] = [
  {
    id: "saturn-v",
    name: "Saturn V",
    leoCapacityFactId: "vehicle.saturn-v.leo-capacity",
    priceFactId: "vehicle.saturn-v.price.2026",
    defaultStageId: "s-ivb",
    notes:
      "Price is the Apollo 11 vehicle cost CPI-converted to 2025 dollars, a derived record; The Planetary Society's aerospace-index program total tells a much larger story and is linked from that record. Capacity is NASA's rounded educational figure.",
  },
  {
    id: "falcon-heavy",
    name: "Falcon Heavy",
    leoCapacityFactId: "vehicle.falcon-heavy.leo-capacity",
    priceFactId: "vehicle.falcon-heavy.price",
    defaultStageId: "falcon-upper",
    notes:
      "List price (2022, booster-recovery profile) paired with expendable capacity; the pairing overstates the bargain and both records say so.",
  },
  {
    id: "starship",
    name: "Starship",
    leoCapacityFactId: "vehicle.starship.leo-capacity",
    priceFactId: "vehicle.starship.price",
    defaultStageId: "starship",
    notes:
      "Capacity is a design target for a vehicle in flight test; price is a founder's aspiration for a future variant. Starship outputs are the weakest on the board and the notation shows it.",
  },
  {
    id: "new-glenn",
    name: "New Glenn",
    leoCapacityFactId: "vehicle.new-glenn.leo-capacity",
    priceFactId: "vehicle.new-glenn.price",
    defaultStageId: "new-glenn-gs2",
    notes:
      "Price is an unnamed rival's estimate relayed by a retail-investing outlet; Blue Origin prints none. Physics slots for its stage are empty, so New Glenn currently prices launches it cannot model.",
  },
];

const LANDERS: LanderSpec[] = [
  {
    id: "apollo-lm",
    name: "Apollo Lunar Module",
    ispFactId: "lander.apollo-lm.descent-isp",
    dryMassFactId: "lander.apollo-lm.dry-mass",
    propellantCapacityFactId: "lander.apollo-lm.propellant-descent",
    maxPayloadFactId: null,
    costFactId: null,
    notes:
      "No source prints a cargo capacity for the LM (it was a crew lander), so the max-payload constraint is unchecked and the engine says so. No per-unit cost exists either; the $2.4B program total (lander.apollo-lm.program-total) gives the absence scale.",
  },
  {
    id: "blue-ghost",
    name: "Blue Ghost",
    ispFactId: null,
    dryMassFactId: null,
    propellantCapacityFactId: null,
    maxPayloadFactId: "lander.blue-ghost.max-payload",
    costFactId: null,
    notes:
      "Firefly publishes payload capacity but not dry mass, propellant, or Isp (only a 1,517 kg wet mass exists, in trade press), so Blue Ghost landings return a missing-input result naming the physics slots. Its mission price record is an end-to-end delivery service price, not a lander cost, so the cost slot is empty too.",
  },
];

/**
 * What the model does not include, stated on the face of the module. No
 * silent fudge factors; if a margin is ever added it will be a named,
 * dotted input record.
 */
export const MODEL_ASSUMPTIONS: string[] = [
  "Impulsive burns via the rocket equation only: no gravity losses, no steering losses, no plane changes, no finite-burn effects, no propellant boil-off, no reserves or margin.",
  "The transfer stage performs both TLI and LOI and stays attached until LOI ends. Apollo flew differently (S-IVB did TLI, the Service Module did LOI); the published Apollo deltas carry that structural difference.",
  "LEO insertion is executed by the launch vehicle and priced by capacity; the stack, including the fueled transfer stage, is treated as cargo mass against the vehicle's LEO capacity figure. No real vehicle launches its own upper stage as cargo; this is the model's largest structural simplification and it is stated, not hidden.",
  "Multi-launch missions assume the stack aggregates in LEO at no extra cost and no propellant loss.",
  "Mission cost is launches times per-launch price, plus stage and lander costs where a record exists. Price records carry mixed dollar vintages, named per record; only the Saturn V price is CPI-converted (to 2025, the latest full year).",
];

export function getVehicle(id: string): VehicleSpec {
  const vehicle = VEHICLES.find((v) => v.id === id);
  if (!vehicle) throw new Error(`[lunar-cost] Unknown vehicle '${id}'`);
  return vehicle;
}

export function getStage(id: string): StageSpec {
  const stage = STAGES.find((s) => s.id === id);
  if (!stage) throw new Error(`[lunar-cost] Unknown stage '${id}'`);
  return stage;
}

export function getLander(id?: string): LanderSpec {
  if (!id) throw new Error("[lunar-cost] A landing mission requires a landerId");
  const lander = LANDERS.find((l) => l.id === id);
  if (!lander) throw new Error(`[lunar-cost] Unknown lander '${id}'`);
  return lander;
}

export const vehicles = VEHICLES;
export const stages = STAGES;
export const landers = LANDERS;

export const PRESETS: PresetSpec[] = [
  {
    id: "apollo-11",
    label: "Apollo 11, July 1969",
    params: { payloadKg: 0, vehicleId: "saturn-v", mode: "land", landerId: "apollo-lm" },
    payloadFactId: null,
    asFlown: {
      leoMassFactId: "asflown.apollo11.leo-mass",
      tliMassFactId: "asflown.apollo11.tli-mass",
      costFactId: "asflown.apollo11.mission-cost",
    },
    notes:
      "Payload is zero because the LM itself is the delivered object and no LM cargo-capacity record exists; the model therefore computes the transport of the LM and stage alone. The as-flown mass records are spacecraft-only framings (they exclude the S-IVB) while the model's masses include its stage, and the model carries no CSM at all: a large share of the published deltas is structural, and the records' notes say exactly which share of the comparison is apples-to-oranges. The cost comparison additionally crosses dollar vintages (model 2025 CPI dollars, record then-year).",
  },
  {
    id: "apollo-17",
    label: "Apollo 17, December 1972",
    params: { payloadKg: 0, vehicleId: "saturn-v", mode: "land", landerId: "apollo-lm" },
    payloadFactId: null,
    asFlown: {
      leoMassFactId: "asflown.apollo17.leo-mass",
      tliMassFactId: "asflown.apollo17.tli-mass",
      costFactId: null,
    },
    notes:
      "Same framing caveats as Apollo 11, plus configuration drift: the engine's LM records are Apollo 11 as-flown, and the J-mission LM was heavier. No per-mission cost is printed in any fetched source (the widely repeated ~$450M lives in search snippets only), so the cost slot is empty rather than approximated.",
  },
  {
    id: "blue-ghost-m1",
    label: "Blue Ghost Mission 1, March 2025",
    params: { payloadKg: 94, vehicleId: "falcon-heavy", mode: "land", landerId: "blue-ghost" },
    payloadFactId: "asflown.bgm1.payload-mass",
    asFlown: {
      leoMassFactId: null,
      tliMassFactId: null,
      costFactId: "asflown.bgm1.price",
    },
    notes:
      "Two honest mismatches, carried openly: the mission flew on a Falcon 9, which is outside this engine's vehicle set (Falcon Heavy, which shares the upper stage, stands in and invalidates any launch-price comparison), and Blue Ghost's dry mass, propellant, and Isp are unpublished, so the engine returns a missing-input result naming those slots instead of a solution. The preset exists to render that absence and the as-flown price, not to reproduce the flight.",
  },
];
