# Burn Rate — Data Model & Sources

**Doc** BR-DATA · **Rev** 03 · **Updated** 2026-07-17 · **Drawn** E. CARVALHO

---

## 1. The governing idea

**The notation is not a stylesheet. It is a schema.**

Solid, dashed, and dotted only render correctly if every number on the site is a record carrying its own provenance. Which means Burn Rate is not pages with numbers typed into them. It is a **fact table that renders itself**. The ledger, the counter, the charts, the gap modules, the article body copy: all views onto one store.

Three consequences, and they're the whole reason to build it this way:

1. **Provenance becomes structural.** You cannot forget to cite something, because an uncited record won't render.
2. **Agents get a contract.** Return facts in this shape or your output is unusable. Prose is not accepted.
3. **A figure is updated once.** Change the record, and the ledger, the homepage, and every article that referenced it all move together. Without this, revisions are unmaintainable by one person.

**Corollary, and it is not optional: no formula references a literal.** If a derived fact needs the program total, it points at `moonbase.program.total`, never at `20e9`. A literal in a formula is a number with no provenance, which is the one thing this store exists to make impossible.

**The one exception, and it is narrow: definitional constants.** `31536000` seconds in a year is not a claim about the world. It cannot be revised, cannot go stale, and has no source because it needs none. It may live in a formula.

**The test is not "is this number small or obvious." It is "could this number turn out to be wrong?"** If a figure could be restated, corrected, or contested by anyone, it is a claim and it needs a record, however trivial it looks. The seven in "$20 billion over seven years" looks like a unit. It is not. It came out of the same spoken sentence as the $20 billion, from the same person, at the same event, and it can be revised the same way. A number that arrived with provenance does not lose it by being small.

---

## 2. The fact record

```json
{
  "id": "moonbase.award.astrobotic.2026-06-30",
  "value": 297900000,
  "unit": "USD",
  "label": "Astrobotic, two lander missions",
  "as_of": "2026-06-30",
  "confidence": "reported",
  "sources": [
    {
      "name": "SpaceNews",
      "url": "https://...",
      "tier": 3,
      "retrieved_at": "2026-07-17"
    }
  ],
  "notes": "Trade press. Promote to confirmed only against the NASA release.",
  "stale_after": "2026-08-16",
  "supersedes": null
}
```

### Fields

| Field | Type | Notes |
|---|---|---|
| `id` | string | Dot-namespaced, stable, human-readable. Never reused. |
| `value` | number | Raw. Never pre-formatted. Formatting is a render concern. |
| `unit` | enum | `USD`, `USD_per_kg`, `count`, `percent`, `days`, `kg`, `years` |
| `label` | string | What it is, in plain language. |
| `as_of` | date | The date the figure describes, not the date it was fetched. |
| `confidence` | enum | `confirmed` · `reported` · `derived`. Drives the underline. Nothing else does. |
| `sources` | array | At least one. A record with zero sources is invalid and must not render. |
| `sources[].tier` | 1–5 | Per the source hierarchy in `editorial-standards.md` §4. |
| `notes` | string | Competing framings, ambiguities, denominator choices. Surfaces on hover and in the assumptions drawer. |
| `stale_after` | date or null | See §5. |
| `supersedes` | id or null | For revised figures. The old record is retained, never deleted. |

### Rendering rule

`confidence` maps to the underline automatically and by nothing else:

| `confidence` | Underline | Color |
|---|---|---|
| `confirmed` | solid 1.5px | `#16181B` |
| `reported` | dashed 1.5px | `#8C9198` |
| `derived` | dotted 1.5px | `#A8823C` |

**No component may override this.** If a number needs a different mark, its confidence is wrong; fix the record.

---

## 3. Derived facts

A derived fact is computed from other facts and is **dotted by construction**. It never carries a confidence field of its own, because it cannot be more confident than its inputs.

```json
{
  "id": "economy.burn_per_second",
  "derived_from": ["economy.global.2024"],
  "formula": "economy.global.2024 / 31536000",
  "unit": "USD",
  "label": "Global space spending per second, at 2024's rate",
  "notes": "Rate visualization, not a measurement. 2024 annual estimate divided into seconds."
}
```

**Rules:**

- The formula is stored, not the result. Recompute on render.
- A derived fact inherits the *lowest* confidence among its inputs, and then drops to `derived` regardless. There is no path back up.
- `notes` must state the choice that was made, and `notes` may not be empty. Every derived number contains a judgment: a denominator, a method, a rate assumption. Name it.
- Inflation adjustments must record the index used. Apollo at $257B (New Start Index) is a different claim from Apollo at $152B (CPI). Method is part of the number.
- Formulas reference record ids only, except for definitional constants. See §1.

**Current derived facts:**

| id | Formula | Note |
|---|---|---|
| `economy.burn_per_second` | `economy.global.2024 / 31536000` | ≈ $19,438/sec. The hero counter. |
| `moonbase.committed.total` | sum of ledger awards incl. Blue Origin option | ≈ $1.573B. See §4 warning. |
| `moonbase.committed.base` | sum of ledger awards excl. options | ≈ $1.292B. The defensible total. |
| `moonbase.committed.share` | `moonbase.committed.total / moonbase.program.total` | ≈ 0.079. Stored as a fraction; the unit converts at render. The burn bar. |
| `moonbase.days_since_award` | `today - max(ledger.date)` | Live by definition. |
| `moonbase.cost_per_person` | `moonbase.program.total / population.us / moonbase.program.duration_years` | ≈ $8.36/yr. Denominator contested; must be named. |

**Supporting records these formulas depend on:**

| id | Value | Confidence | Note |
|---|---|---|---|
| `population.us` | 341,800,000 | reported | US Census Bureau release, Jan 27 2026. Rev 01's `342e6` was rounded and unsourced; the sourceable figure is 341.8M, which moves the per-person figure from $8.35 to $8.36. |
| `moonbase.program.total` | $20,000,000,000 | reported | Spoken, not published. See §4. |
| `moonbase.program.duration_years` | 7 | reported | Spoken, not published. See below. |

### The program duration

`moonbase.program.duration_years` = 7 needs a record for the same reason `moonbase.program.total` does, and it needs it more urgently, because it is easy to mistake for a unit.

**It came out of the same sentence.** "About $20 billion over seven years," Isaacman, Ignition, March 24, 2026. One spoken claim, two numbers. Rev 02 gave the dollar figure a first-class record with spoken-not-published provenance and left the seven sitting naked inside a formula. That is the same figure marked two different ways depending on which half of the sentence it came from, which is incoherent. It carries the same source, the same tier, the same `reported` mark, and the same notes as the total.

**The consequence, concretely:** if NASA restates the program as eight years, `moonbase.program.total` flags stale and `cost_per_person` would have gone on silently dividing by seven. A stale record next to a live wrong answer is worse than either alone.

**Put in `notes`, because it is a real tension:** the phase dates and the spoken duration do not obviously reconcile. Phase 1 runs 2026 to 2028/29 and Phase 2 runs 2029 to 2031, which is roughly six years, not seven. It may be fiscal years, it may be inclusive counting, it may be loose speech. Do not resolve it and do not correct it. Record that it does not add up cleanly and let the note carry the disagreement, per `editorial-standards.md` §8.

---

## 4. The Moon Base ledger

**This is the asset.** Nobody else has assembled a complete, current, sourced ledger of Moon Base contract awards. It is public data that is genuinely tedious to gather, which is exactly why it's worth owning. It is citable. A dashboard of other people's annual estimates is not.

Its update cadence matches yours: awards land every few weeks, you publish every two weeks. The natural rate of the data equals the natural rate of the operator. That is the only kind of tracker one person can keep alive.

### Schema

```json
{
  "id": "moonbase.award.firefly.moonfall.2026-05-26",
  "recipient": "Firefly Aerospace",
  "value": 75000000,
  "option_value": null,
  "date": "2026-05-26",
  "category": "delivery",
  "status": "award",
  "phase": 1,
  "vehicle": "Elytra",
  "payload": "JPL MoonFall drones",
  "confidence": "reported",
  "verified": null,
  "sources": [],
  "notes": "Excludes launch, which JPL acquires separately."
}
```

`category` ∈ `lander` · `rover` · `delivery` · `habitat` · `power` · `other`
`status` ∈ `award` · `solicitation`

### Seed data, as of 2026-07-17

Every row starts at `reported`. **A row is promoted to `confirmed` by filling the Verified column, and only Enzo may fill it** (`editorial-standards.md` §3). The column is not decoration; it is the promotion rule made into a field. An empty Verified cell on a `confirmed` row is a bug in the ledger and must fail the build.

| Recipient | Value | Option | Date | Category | Confidence | Primary source | Verified |
|---|---|---|---|---|---|---|---|
| Astrobotic | $297.9M | — | 2026-06-30 | lander | reported | *unfilled* | — |
| Lunar Outpost | $220.0M | — | 2026-05-26 | rover | reported | NASA release, 2026-05-26 | — |
| Astrolab | $219.0M | — | 2026-05-26 | rover | reported | NASA release, 2026-05-26 | — |
| Blue Origin | $188.0M | $280.4M | 2026-05-26 | delivery | reported | NASA release, 2026-05-26 | — |
| Intuitive Machines | $148.3M | — | 2026-06-30 | lander | reported | *unfilled* | — |
| Firefly Aerospace | $144.2M | — | 2026-06-30 | lander | reported | *unfilled* | — |
| Firefly Aerospace | $75.0M | — | 2026-05-26 | delivery | reported | JPL subcontract, via SpacePolicyOnline | — |

Base awards: **$1.292B**. With the Blue Origin option: **$1.573B**. Both `derived`.

**On the June 30 awards.** The article draft that generated these figures attributes them to SpaceNews, which is tier 3. They are `reported` until the NASA release is opened. A trade-press citation is not a confirmation, however good the outlet.

**On the Blue Origin row.** The $188M and $280.4M are both stated plainly in NASA's own release, so this row is the *easiest* on the table to promote, despite Rev 01 having described the award as irreducibly ambiguous. That was wrong. The award is clear; the press's totals are not. See `editorial-standards.md` §2, which now carries the corrected worked example.

> **Warning, and it must survive into the code.** The headline "$1.6B" includes Blue Origin's $280.4M option period, which has not been exercised. The base total is $1.29B. Publishing $1.6B without that note is the exact species of imprecision this publication exists to correct. The total is `derived`, dotted, and the note travels with it everywhere it renders. Enforce this structurally: a derived record with an empty `notes` field is invalid and must fail the build. A comment is not enforcement.

### The zero rows

Habitats and surface power are records too, with `value: 0` and `status: "solicitation"`. **The zero is the story.** NextSTEP-3 Appendix B opened its first directed call, on surface power, June 30, 2026. The day that award lands is the day the site's most important number changes, and Burn Rate should be first to know.

Render the zero rows at the same visual weight as the funded rows. They are not a footnote to the ledger; they are the argument the ledger is making.

### The program total

`moonbase.program.total` = $20B. It needs its own record because two formulas depend on it (§3), and because its provenance is more interesting than its value.

**The $20B was spoken, not published.** It comes from Isaacman's remarks at the March 24, 2026 Ignition event. NASA's own deck states the phases separately: $10B, $10B, and "$10B+". No NASA document prints "$20 billion." The figure is therefore `reported`, and it stays `reported` even though every outlet on earth repeats it, because repetition is not publication.

**The hollow bar on the homepage draws this record, dashed, at $20B.** Not a tidier in-house sum of the phase figures. The gap module's subject *is* the headline number, and substituting a corrected total would quietly remove the very thing the module indicts. A dashed marquee figure is not a weakness to be engineered around. It is the notation working in public on the most-viewed number the site has, which is the best demonstration Burn Rate will ever get to make.

The phase breakdown lives in `notes`. So does the duration tension; see §3.

---

## 5. Staleness

Every fact declares when it goes off. If `today > stale_after`, the site flags it rather than hiding it.

**The anchor is the retrieval, not the event.** `stale_after` = `sources[].retrieved_at` + the class window. A figure goes stale because *your verification* has aged, not because the world has. An award from 2026 that you checked yesterday is fresh; the same award checked six months ago is not.

| Class | Window | Examples |
|---|---|---|
| Live | fetch on load | Launches YTD, market caps, days since award |
| Fast | 30 days | Contract awards, obligations |
| Slow | 400 days | Global economy, commercial share, population |
| Projection | none, restate vintage | $1.8T by 2035 |

**Why this exists:** the failure mode for a solo operator is not lying. It's decay. Twenty hand-maintained figures, six weeks into a semester, half of them three months old. Not wrong, just visibly abandoned, which on a site whose promise is currency reads worse than never having built it.

A site that flags its own stale figures is more trustworthy than one that pretends. Let the instrument report its own fault.

---

## 6. Live sources

| Source | Gives | Notes |
|---|---|---|
| **USAspending.gov API** | Federal contract obligations by agency, recipient, date | The highest-value item here. NASA's obligations from the government's own system of record. Almost nobody in space media uses it. |
| **The Space Devs / Launch Library 2** | Launch history and upcoming manifest | Free. Launches YTD, cadence by provider. |
| **SEC EDGAR** | Filings for listed space companies | Rocket Lab, Intuitive Machines, AST, Planet, Firefly. Free, no scraping. |
| **SAM.gov** | Solicitations and opportunities | Catches the surface-power award the day it posts rather than a week later. |
| **NASA** | Releases, budget documents, program pages | Primary. Manual. |

**Verify current terms and rate limits before building against any of them.** All are believed free and public; none should be assumed stable.

**Static site, client-side fetch.** No backend required. Facts live as JSON in the repo; live values fetch on load and fail gracefully to the last cached value with its `as_of` shown.

---

## 7. The three tiers on the homepage

| Tier | What | Honest because |
|---|---|---|
| **Live** | Launches YTD, NASA obligations, market caps, days since award | Fetched. Cannot rot. |
| **Vintage** | $613B economy, $20B program, $1.8T projection | Annual by nature. The notation states what they are. |
| **Owned** | The Moon Base ledger | Hand-verified. Which is precisely why it's worth more than the automated tiers. |

The live tier keeps the page alive. The vintage tier gives a stranger the scale. The owned tier is why anyone comes back, and why anyone links to you.

---

## Revision log

| Rev | Date | Change |
|---|---|---|
| 03 | 2026-07-17 | Added `moonbase.program.duration_years` = 7 as a first-class `reported` record. Rev 02 gave the $20B a record and left the seven from the same spoken sentence as a literal in `cost_per_person`, marking one claim two ways. Sharpened the §1 corollary: definitional constants may live in formulas, world claims may not, and the test is whether the number could turn out to be wrong rather than whether it looks trivial. Logged the phase-date vs. seven-year tension in notes rather than resolving it. Added `population.us`, `moonbase.program.total`, and `moonbase.program.duration_years` to §3 as named supporting records. Added `verified` to the ledger schema. Added `years` to the unit enum. |
| 02 | 2026-07-17 | Seed rows reset from `confirmed` to `reported`: Rev 01 asserted confidence with no source column, and the June 30 figures trace to trade press, not NASA. Added Primary source and Verified columns to §4, making the promotion rule a field. Added `status` to the ledger schema. Added `moonbase.program.total` with its spoken-not-published provenance and the hollow-bar decision. Added `moonbase.committed.base`. Formulas now reference records, never literals (§1 corollary). Defined the `stale_after` anchor as retrieved_at plus window. Corrected the Rev 01 claim that the Blue Origin award was irreducibly ambiguous. Required non-empty `notes` on derived records as a build-time check. |
| 01 | 2026-07-15 | First issue. Fact schema, derived facts, ledger seed data, staleness, live sources. |
