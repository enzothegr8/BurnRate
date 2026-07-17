# Burn Rate — Editorial Standards & the Provenance Protocol

**Doc** BR-EDIT · **Rev** 01 · **Updated** 2026-07-15 · **Drawn** E. CARVALHO

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

**Example:** Astrobotic's `$297.9M` for two lander missions, June 30, 2026. NASA release, single unambiguous figure, no competing framings.

### Dashed — Reported

**Definition:** credible, but not verifiable to primary source, or stated inconsistently across sources.

**Triggers, any one of which is sufficient:**

- The only sources are secondary (trade press, aggregators).
- The figure varies by framing across otherwise credible sources.
- The primary source is paraphrased rather than published.
- It is a forward-looking figure someone else projected.

**Example:** Blue Origin's LTV delivery award. Reported as `$188M` base, `$280.4M` option, "up to `$468M` for two missions," and "`$234M` per LTV." These are consistent framings of one award, but the site cannot state any single number as confirmed. **This is the most important worked example in this document.** Competitors state one of these flatly. Burn Rate dashes it.

### Dotted — Derived or estimated

**Definition:** Burn Rate did arithmetic, or Burn Rate is making a judgment.

**Always dotted:**

- Any calculation performed in-house, however trivial. $613B ÷ 31,536,000 seconds = `$19,438/sec` is dotted.
- Any per-capita, per-taxpayer, or per-unit figure, because the denominator is a choice.
- Any inflation adjustment, and the method must be stated.
- Any projection, including other people's, when restated in Burn Rate's own framing.

**Example:** `$8` per American per year for the Moon Base. Arithmetic is trivial; the denominator is contested (total population vs. tax returns vs. net positive payers each give a different answer). Dotted, always, with the denominator named.

---

## 3. The promotion rule

**An agent may gather a number. An agent may propose a confidence level. Only Enzo may promote a number to solid.**

This is not a preference. The specific failure mode of a research-and-verify agent pipeline is two agents agreeing with each other and a fabricated contract value arriving under a solid underline at 2am. Agreement between agents is not verification. It is correlated error.

Promotion to solid requires that Enzo has opened the primary source and seen the figure. Not a summary of it. The figure.

Dashed and dotted may be set by agents, because both are honest admissions. Only the claim of certainty requires a human.

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

---

## 7. Corrections

- Corrections are logged in the revision log, never silently patched.
- A wrong number under a solid underline is the most serious failure Burn Rate can make. It is corrected immediately, logged explicitly, and the reason it passed review is recorded.
- Corrections are not apologized for at length. State what was wrong, state what is right, move on.

---

## 8. The agent contract

Every research agent's output must return facts in the shape defined by `data-model.md`. Prose without records is unusable.

**Every agent returns, per figure:**

- `value`
- `unit`
- `source_name`
- `source_url`
- `source_tier` (1–5, per §4)
- `retrieved_at`
- `proposed_confidence` (`reported` or `derived` only, never `confirmed`)
- `notes` — competing framings, ambiguities, anything that would make Enzo hesitate

**An agent that cannot supply a URL has not found a fact.** It has found a rumor. Return it as a rumor or not at all.

**Agents must surface disagreement, not resolve it.** If two sources conflict, both go in `notes`. The pipeline's job is to bring Enzo the conflict, not to pick a winner.

**Agents may not write claim sentences.** The read is the product and the read is Enzo's. Agents supply the raw material and, at most, propose. Voice is not delegable, and a page of agent-written claims is a costume.

---

## 9. The standing test

Before anything publishes, one question:

> **Could I show this page to the person whose money it describes, and defend every line on it?**

If not, it isn't ready.

---

## Revision log

| Rev | Date | Change |
|---|---|---|
| 01 | 2026-07-15 | First issue. Confidence levels, promotion rule, source hierarchy, agent contract established. |
