# Burn Rate — Editorial Standards & the Provenance Protocol

**Doc** BR-EDIT · **Rev** 02 · **Updated** 2026-07-17 · **Drawn** E. CARVALHO

The brand bible says what Burn Rate looks like. This says what it is allowed to claim. It governs humans and agents identically.

---

## 1. Why this document exists

Burn Rate makes a promise no competitor makes: **every number on the site declares how much it is trusted, visibly, in the type.** That promise is the entire product. It is what substitutes for the institutional authority Burn Rate does not have.

The day the notation lies, Burn Rate is worth *less* than a plain blog, because a plain blog never promised anything. There is no recovering from a fabricated figure under a solid underline. Everything below exists to prevent that one outcome.

---

## 2. The three confidence levels

### Solid — Confirmed

**Definition:** the figure appears in a primary source, is unambiguous, and is stated consistently.

**Tests, all of which must pass:**

1. It comes from the originating party: the agency, the contractor, the filing, the procurement record. Not an aggregator, not a summary of a summary.
2. The figure is stated once, plainly, and does not vary in framing across credible sources.
3. A URL exists and resolves.
4. Enzo has personally opened that URL and seen the number.

**Example:** NASA's May 26, 2026 release stating Blue Origin's award as `$188M` with an option period worth `$280.4M`. Originating party, single unambiguous figures, plainly stated.

**A figure cited to trade press is not confirmed, however reliable the outlet.** SpaceNews is tier 3. If SpaceNews reports a NASA award, the number is `reported` until the NASA release itself is opened. This is not a slight against SpaceNews. It is the difference between knowing a number and knowing where a number came from.

### Dashed — Reported

**Definition:** credible, but not verifiable to primary source, or stated inconsistently across sources.

**Triggers, any one of which is sufficient:**

- The only sources are secondary (trade press, aggregators).
- The figure varies by framing across otherwise credible sources.
- The primary source is paraphrased rather than published.
- It is a forward-looking figure someone else projected.
- **It was spoken, not published.** A number said aloud at a press event and never printed in an agency document is reported, no matter how often it is repeated afterward. See the `$20B` case below.

**Example, and it is the most important one in this document:** the Blue Origin LTV delivery award. The instructive part is not the one you would expect.

**The award itself is not ambiguous.** NASA's release states it plainly and once: `$188M` base, option period worth `$280.4M` for two task orders. SpaceNews adds the structure, that the base covers mission design and long-lead hardware while the options cover the lander missions themselves. Nothing about that is unclear.

What is ambiguous is every **total** the press built out of it:

| Figure | Where it came from | Mark |
|---|---|---|
| `$188M` base | NASA release. Primary, plain. | Solid, once Enzo opens it |
| `$280.4M` option | NASA release. Primary, plain. | Solid, once Enzo opens it |
| `$234M` per LTV | Spaceflight Now. **They divided and printed the result flat.** | Dashed |
| "up to `$468M` for two" | **No source prints this.** It is 188 + 280.4. | Dotted, or absent |
| Any single figure for "the award" | There isn't one. It is two numbers and a condition. | Dotted |

**The lesson: the trade press routinely publishes its own arithmetic without marking it.** Spaceflight Now did division and presented the output as reporting. That is not dishonesty; they have no notation, so they have no way to say it. Burn Rate does. Which means Burn Rate's job is not only to mark its own derivations but to notice when a "reported" figure is somebody else's derivation wearing a reporting costume. The laundering is usually upstream.

### Dotted — Derived or estimated

**Definition:** Burn Rate did arithmetic, or Burn Rate is making a judgment.

**Always dotted:**

- Any calculation performed in-house, however trivial. $613B ÷ 31,536,000 seconds = `$19,438/sec` is dotted.
- Any per-capita, per-taxpayer, or per-unit figure, because the denominator is a choice.
- Any inflation adjustment, and the method must be stated.
- Any projection, including other people's, when restated in Burn Rate's own framing.
- Any total assembled from separately reported components, including the Moon Base committed total.

**Example:** `$8` per American per year for the Moon Base. Arithmetic is trivial; the denominator is contested (total population vs. tax returns vs. net positive payers each give a different answer). Dotted, always, with the denominator named.

### The marks are kinds, not degrees

This is the failure the levels above do not obviously prevent, so it is stated separately.

**The notation is not a dial where lower is safer.** Each mark is a claim about *how a number came to exist*, not about how nervous you feel. Dotted asserts that Burn Rate did the arithmetic. If Burn Rate did not, dotted is a lie, just a self-deprecating one. Marking a reported figure as derived is as wrong as the reverse; it is simply wrong in a direction that feels humble.

When in doubt, ask what *kind* of thing the number is, not how much you trust it.

---

## 3. The promotion rule

**An agent may gather a number. An agent may propose a confidence level. Only Enzo may promote a number to solid.**

This is not a preference. The specific failure mode of a research-and-verify agent pipeline is two agents agreeing with each other and a fabricated contract value arriving under a solid underline at 2am. Agreement between agents is not verification. It is correlated error.

Promotion to solid requires that Enzo has opened the primary source and seen the figure. Not a summary of it. The figure.

**An agent's recollection is not a source.** Neither is a previous session's output, a research brief, or a prior article, however carefully it was written. If an agent reports that it believes a figure was sourced, that belief has no standing. The chain must terminate in a URL that Enzo opened.

Dashed and dotted may be set by agents, because both are honest admissions. Only the claim of certainty requires a human.

There is no deadline on promotion. An unpromoted figure is not an emergency; it is a dashed figure, which is a publishable state. The only rule is that it may not render solid before the source is opened.

---

## 4. Source hierarchy

Ranked. Always cite the highest available.

1. **Primary records.** SAM.gov, USAspending.gov, NASA releases and budget documents, SEC filings, contractor press releases, congressional appropriations text, agency OIG reports.
2. **Peer-reviewed and institutional.** Casey Dreier's Apollo cost analysis in *Space Policy*, The Planetary Society's budget work, NASA OIG.
3. **Trade press with named reporting.** SpaceNews, Spaceflight Now, Ars Technica, NASASpaceFlight, Reuters.
4. **General press.** CNN, CBS, NPR. Fine for quotes and events, weak for figures.
5. **Aggregators.** Corroboration only. Never the sole source for any published number.

**Wikipedia is never a source.** It is a finding aid. Follow its citations and cite those.

---

## 5. Prohibited

- **Never invent a figure to fill a gap.** If it isn't known, say it isn't known. The ILRS total budget does not exist in open sources. Do not estimate it. Do not imply it.
- **Never state a range as a point.** If sources disagree, the disagreement is the story.
- **Never launder a derived number as a reported one.** Doing your own math and citing the source of the inputs does not make the output confirmed.
- **Never mark a figure lower than its kind.** See §2. Under-marking is not caution, it is a different false claim.
- **Never publish an unmarked number.** There is no neutral state. Unmarked reads as asserted.
- **Never let an agent's output reach the page unreviewed.**
- **Never reproduce source text.** Paraphrase. Quotes under 15 words, one per source, only where exact wording carries meaning that paraphrase would lose (testimony, contract language, direct statements).
- **Never use awe as an argument.** If the case rests on the frontier being inspiring, there is no case.

---

## 6. Revisions

Articles are living documents. The beat moves fast enough that a piece goes stale in weeks.

- Every piece with numbers in it carries a **Rev** number and an **Updated** date in its title block.
- **Rev 01** is first publication.
- Bump the revision when a figure changes, a source is added, a confidence level moves, or a claim is materially revised. Do not bump for typos.
- The revision log at the foot of the piece states what changed, in one line, per revision. Readers who came back deserve to know what moved.
- Confidence levels can move in both directions. A dashed figure becoming confirmed is a revision worth logging, and it is quietly the best advertisement the notation has.

**This applies to the spec documents themselves.** They exist in two places, this repo and Enzo's working project, and they do not sync. The Rev number is what catches a stale copy. Bump it as part of the edit, not afterward.

---

## 7. Corrections

- Corrections are logged in the revision log, never silently patched.
- A wrong number under a solid underline is the most serious failure Burn Rate can make. It is corrected immediately, logged explicitly, and the reason it passed review is recorded.
- Corrections are not apologized for at length. State what was wrong, state what is right, move on.

---

## 8. The agent contract

Every research agent's output must return facts in the shape defined by `data-model.md`. Prose without records is unusable.

### Agents build. Agents do not assert.

An agent must never stop work because a figure is weak. **The notation exists so that uncertainty ships marked rather than not shipping at all.** A publication with no way to say "we are not sure" has exactly two options, assert or drop. Burn Rate has a third, and it cost three documents to buy. An agent that drops a weakly-sourced figure is throwing away the only thing that makes this publication different, and doing it out of a caution that looks like rigor and isn't.

Three cases, and only one of them stops:

**A figure exists but is weak, conflicting, or secondary.** Build it. Mark it to its kind at the lowest defensible level. Put every competing framing in `notes`. Tell Enzo what you think and why, as a second opinion, not as a request for permission. Then proceed. Do not wait for a ruling.

**No figure exists.** Do not invent one. Build the structure with the slot empty, and render the emptiness visibly rather than hiding the component. An absent number is a fact about the world and it is frequently the most interesting thing on the page. The habitat and surface power rows are worth more at zero than most publications' figures are at any value. Tell Enzo. Then proceed.

**The instructions themselves are missing or contradictory.** Stop and ask. This is the only case that blocks. An agent guessing at spec is not producing weak output, it is producing fiction, and fiction cannot be marked because it has no kind.

Editorial judgment is Enzo's. Execution is the agent's. An agent that stops to ask permission to build is failing at its job. An agent that marks something confirmed is failing at something worse.

### Every agent returns, per figure

- `value`
- `unit`
- `source_name`
- `source_url`
- `source_tier` (1–5, per §4)
- `retrieved_at`
- `proposed_confidence` (`reported` or `derived` only, never `confirmed`)
- `notes` — competing framings, ambiguities, anything that would make Enzo hesitate

**An agent that cannot supply a URL has not found a fact.** It has found a rumor. Return it as a rumor, marked as one, and keep going. Do not return it as a fact and do not silently drop it.

**Agents must surface disagreement, not resolve it.** If two sources conflict, both go in `notes`. The pipeline's job is to bring Enzo the conflict, not to pick a winner.

**Agents may not write claim sentences.** The read is the product and the read is Enzo's. Agents supply the raw material and, at most, propose. Voice is not delegable, and a page of agent-written claims is a costume.

**Agents may not fit constants to close a gap.** If a model disagrees with reality, that is a finding to report, not an error to tune away. A fitted constant is a fabricated number wearing a lab coat.

---

## 9. The standing test

Before anything publishes, one question:

> **Could I show this page to the person whose money it describes, and defend every line on it?**

If not, it isn't ready.

---

## Revision log

| Rev | Date | Change |
|---|---|---|
| 02 | 2026-07-17 | Corrected the Blue Origin worked example in §2: the award is unambiguous, the press totals are not, and `$468M` appears in no source. Added spoken-not-published trigger. Added "the marks are kinds, not degrees" and the matching prohibition on under-marking. Added the no-recollection-as-source rule and the no-deadline note to §3. Rewrote §8 around build-vs-assert: agents proceed on weak figures and stop only on missing spec. Added the fitted-constant prohibition. Noted in §6 that spec docs carry Rev numbers for the same reason articles do. |
| 01 | 2026-07-15 | First issue. Confidence levels, promotion rule, source hierarchy, agent contract established. |
