# Burn Rate — Data Model & Sources

**Doc** BR-DATA · **Rev** 01 · **Updated** 2026-07-15 · **Drawn** E. CARVALHO

---

## 1. The governing idea

**The notation is not a stylesheet. It is a schema.**

Solid, dashed, and dotted only render correctly if every number on the site is a record carrying its own provenance. Which means Burn Rate is not pages with numbers typed into them. It is a **fact table that renders itself**. The ledger, the counter, the charts, the gap modules, the article body copy: all views onto one store.

Three consequences, and they're the whole reason to build it this way:

1. **Provenance becomes structural.** You cannot forget to cite something, because an uncited record won't render.
2. **Agents get a contract.** Return facts in this shape or your output is unusable. Prose is not accepted.
3. **A figure is updated once.** Change the record, and the ledger, the homepage, and every article that referenced it all move together. Without this, revisions are unmaintainable by one person.

---

## 2. The fact record

```json
{
  "id": "moonbase.award.astrobotic.2026-06-30",
  "value": 297900000,
  "unit": "USD",
  "label": "Astrobotic, two lander missions",
  "as_of": "2026-06-30",
  "confidence": "confirmed",
  "sources": [
    {
      "name": "NASA",
      "url": "https://...",
      "tier": 1,
      "retrieved_at": "2026-07-06"
    }
  ],
  "notes": "",
  "stale_after": null,
  "supersedes": null
}
```

### Fields

| Field | Type | Notes |
|---|---|---|
| `id` | string | Dot-namespaced, stable, human-readable. Never reused. |
| `value` | number | Raw. Never pre-formatted. Formatting is a render concern. |
| `unit` | enum | `USD`, `USD_per_kg`, `count`, `percent`, `days`, `kg` |
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
- `notes` must state the choice that was made. Every derived number contains a judgment: a denominator, a method, a rate assumption. Name it.
- Inflation adjustments must record the index used. Apollo at $257B (New Start Index) is a different claim from Apollo at $152B (CPI). Method is part of the number.

**Current derived facts:**

| id | Formula | Note |
|---|---|---|
| `economy.burn_per_second` | `613e9 / 31536000` | ≈ $19,438/sec. The hero counter. |
| `moonbase.committed.total` | sum of ledger awards incl. Blue Origin option | ≈ $1.57B. See §4 warning. |
| `moonbase.committed.share` | `moonbase.committed.total / 20e9` | ≈ 7.9%. The burn bar. |
| `moonbase.days_since_award` | `today - max(ledger.date)` | Live by definition. |
| `moonbase.cost_per_person` | `20e9 / 342e6 / 7` | ≈ $8/yr. Denominator contested; must be named. |

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
  "phase": 1,
  "vehicle": "Elytra",
  "payload": "JPL MoonFall drones",
  "confidence": "confirmed",
  "sources": [],
  "notes": "Excludes launch, which JPL acquires separately."
}
```

`category` ∈ `lander` · `rover` · `delivery` · `habitat` · `power` · `other`

### Seed data, as of 2026-07-15

| Recipient | Value | Option | Date | Category | Confidence |
|---|---|---|---|---|---|
| Astrobotic | $297.9M | — | 2026-06-30 | lander | confirmed |
| Lunar Outpost | $220.0M | — | 2026-05-26 | rover | confirmed |
| Astrolab | $219.0M | — | 2026-05-26 | rover | confirmed |
| Blue Origin | $188.0M | $280.4M | 2026-05-26 | delivery | **reported** |
| Intuitive Machines | $148.3M | — | 2026-06-30 | lander | confirmed |
| Firefly Aerospace | $144.2M | — | 2026-06-30 | lander | confirmed |
| Firefly Aerospace | $75.0M | — | 2026-05-26 | delivery | confirmed |

Base awards: **$1.292B**. With the Blue Origin option: **$1.573B**.

> **Warning, and it must survive into the code.** The headline "$1.6B" includes Blue Origin's $280.4M option period, which has not been exercised. The base total is $1.29B. Publishing $1.6B without that note is the exact species of imprecision this publication exists to correct. The total is `derived`, dotted, and the note travels with it everywhere it renders.

### The zero rows

Habitats and surface power are records too, with `value: 0` and a status of `solicitation`. **The zero is the story.** NextSTEP-3 Appendix B opened its first directed call, on surface power, June 30, 2026. The day that award lands is the day the site's most important number changes, and Burn Rate should be first to know.

---

## 5. Staleness

Every fact declares when it goes off. If `today > stale_after`, the site flags it rather than hiding it.

| Class | `stale_after` | Examples |
|---|---|---|
| Live | fetch on load | Launches YTD, market caps, days since award |
| Fast | 30 days | Contract awards, obligations |
| Slow | 400 days | Global economy, commercial share |
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
| 01 | 2026-07-15 | First issue. Fact schema, derived facts, ledger seed data, staleness, live sources. |
