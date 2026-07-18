# The lunar cost engine

**Doc** BR-ENG-LUNAR · **Rev** 01 · **Updated** 2026-07-17 · **Drawn** agent, unreviewed

Headless. No UI, no animation; Prompt 6 builds the page on this surface. Earth
to Moon is hardcoded via the leg list; everything else is generic: a mission is
a sequence of delta-v legs executed by a vehicle stack.

## What is modeled

- Tsiolkovsky only: `dv = Isp * g0 * ln(m0/mf)`, `g0 = 9.80665` (definitional).
- Legs: LEO insertion (executed by the launch vehicle, priced by capacity, not
  solved), TLI and LOI (executed by one transfer stage), powered descent
  (executed by the lander, landing missions only).
- IMLEO solved backwards from the payload. Launches = `ceil(IMLEO / vehicle
  LEO capacity)`. Cost = launches x per-launch price + stage cost + lander
  cost, where records exist.
- Infeasibility is a first-class result carrying required mass, capacity,
  ratio, and the binding constraint. Missing records are a first-class result
  naming the empty slot. Neither clamps, scales, nor throws.
- Presets load as-flown records; the model-vs-actual delta is a published
  first-class field (model, actual, absolute, percent). Any edit detaches the
  as-flown column (`pristine` / `divergedFields`).

## What is NOT modeled, stated per brief

Gravity losses, steering losses, plane changes, finite-burn effects,
propellant boil-off, reserves, margin, rendezvous and docking, the CSM or any
crew vehicle, ascent, return. There are no fudge factors, silent or
otherwise; if a margin is ever added it will be a named, dotted input record.

## Structural simplifications an editor must know

1. **The stack is cargo.** The model launches a fueled transfer stage as
   payload against the vehicle's LEO capacity figure. No real vehicle does
   this; Apollo's capacity figure already counts a fueled S-IVB doing the
   orbital insertion. This is the largest single distortion and it is stated
   on the face of every result (`assumptions`).
2. **One stage does TLI and LOI.** Apollo split them (S-IVB, then the SM).
   The published Apollo post-TLI delta (-45%) is mostly this structure plus
   the absent CSM, and the comparison rows say so.
3. **Multi-launch aggregation is free.** No boil-off, no docking cost. Stated.

## The published error bar (2026-07-17, pristine presets)

| Preset | Field | Model | Actual | Delta |
|---|---|---|---|---|
| Apollo 11 | IMLEO vs spacecraft-only EOI mass | 50,952 kg | 45,702 kg | +11.5% |
| Apollo 11 | post-TLI vs CSM/LM at docking | 23,978 kg | 43,893 kg | -45.4% |
| Apollo 11 | cost (2025 CPI $ vs then-year $) | $1.470B | $355M | +314% |
| Apollo 17 | IMLEO vs spacecraft-only EOI mass | 50,952 kg | 48,607 kg | +4.8% |
| Apollo 17 | post-TLI vs CSM/LM at docking | 23,978 kg | 46,796 kg | -48.8% |
| Blue Ghost M1 | all physics fields | missing-input | - | - |

These are asserted in `presets.test.ts` as fixtures. They are findings, not
failures; nothing was tuned to move them. Note the mass comparisons are
framing-crossed in a known direction: the as-flown records are spacecraft-only
(no S-IVB), the model's masses include its stage and no CSM. The cost delta
crosses dollar vintages AND an incomplete sum (no LM unit cost exists).

## Weaknesses, reported here instead of by stopping

- **Prices are the weak flank.** Saturn V per-launch is a CPI conversion of a
  Forbes-relayed 1971 Apollo 11 figure (Dreier prints only program totals,
  and his adjustments use the NASA New Start Index, which CPI cannot
  reproduce). Falcon Heavy is a 2022 list price, unadjusted, paired with
  expendable capacity. Starship's price is a Musk aspiration for an unbuilt
  variant ($2M, against an unfetched ~$90M current-cost estimate). New
  Glenn's is an unnamed rival's guess. Every record carries these caveats.
- **Falcon upper-stage physics are Ed Kyle's estimates**, question marks his,
  tier 5, because SpaceX publishes none of it.
- **Starship dry mass is a 2021 aspiration for Ship 20**; current ships are
  believed heavier. Propellant capacity is current V3 marketing (1,600 t)
  while flown ships are 1,200 t. Outputs inherit the mismatch.
- **New Glenn GS-2 and Blue Ghost physics are honestly absent** (missing-input
  results). The one Blue Ghost mass in print is a wet mass in trade press.
- **The LM descent Isp is a design requirement (305 s)**, not a flown vacuum
  figure; the popular 311 s was not found plainly printed anywhere fetchable.
- **Several NASA masses arrived via mirrors or unit conversion**: SP-4029
  tables print pounds (kg is exact-definition conversion, named per record);
  the S-IVB records came through a print-capture mirror because NASA's own
  copies now redirect or exceed fetch limits.
- **Apollo 17 has no citable per-mission cost** right now; the slot is empty.
- **CPI values come from a Minneapolis Fed mirror** (BLS blocks fetching), and
  the 2025 annual average rests on eleven months (October 2025 data gap).
- **"2026 dollars" means 2025 CPI-U dollars**, the latest full year, stated
  wherever the conversion renders.

## Promotion state

Every record proposed `reported` or built `derived`. Nothing is `confirmed`;
nothing can be until Enzo opens the primary URLs (editorial-standards.md
section 3). A guard test asserts no engine code path can mint a confirmed
output.

## Files

- `types.ts` - engine types; model outputs are derived ResolvedFacts, dotted forever
- `physics.ts` - the rocket equation, g0, nothing else
- `stack.ts` - numeric backward solver, launch rounding, orbit payload bound
- `solve.ts` - record-backed wrapper; missing slots and provenance collection
- `model.ts` - the only way outputs are minted (dotted, notes required)
- `catalog.ts` - legs, stages, vehicles, landers, presets, stated assumptions
- `presets.ts` - as-flown comparison, published delta, dirty state
- `scale.ts` - payload scale bounds for the input's side note, computed from records
- `*.test.ts` - 38 tests: worked examples, multi-leg IMLEO, rounding, every
  infeasible path, missing inputs, preset fixtures (deltas asserted and
  reported), dirty transitions, and the no-confirmed guard

## Revision log

| Rev | Date | Change |
|---|---|---|
| 01 | 2026-07-17 | First issue. Engine, records, presets, tests, error bar published. |
