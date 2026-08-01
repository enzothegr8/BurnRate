# Burn Rate — Foundation

**Doc** BR-FOUND · **Rev** 11 · **Updated** 2026-08-01 · **Drawn** E. CARVALHO

**This is the single source of truth.** As of Rev 09 it absorbs everything worth keeping from `editorial-standards.md` and `data-model.md`, both of which are retired. If those files still exist anywhere, they are stale copies and this document wins.

It contains only what Enzo has actually decided, plus rules and findings that were paid for with real work. It contains no positioning invented on his behalf.

**Everything not in this document is open.** If a future doc asserts something that does not trace back to a line here, it is an assumption and it should be challenged.

---

## 1. The description

In Enzo's words, unedited:

> Burn Rate: the intersection of Space, AI, Robotics, and Energy, through the lens of science, economics, politics. A veritable interdisciplinary approach, since all of these industries are inter-connected, and affect us all.
>
> By Enzo Carvalho. This brand is my instant proof of expertise in these domains. I am an interdisciplinary student of the world, always learning. Through its mediums, I show the world my perspective on the most important industries of humanity.

---

## 2. The brand

### The spine is money

Economics is the main focus. Science and politics are discussed because they are needed to make sense of the money and to draw out its implications, not as separate subjects of equal weight. The money side of space, AI, robotics, and energy is the main event.

### The name and the domain

Burn Rate holds. burnrate.news holds. Not revisited unless a real reason appears.

**"Burn rate" is the masthead, not a label for figures.** In finance the term means depletion of a cash reserve against a runway. Most of what the site counts is capital deployment, which is a different thing. Some of it genuinely is burn: pre-revenue AI labs, humanoid companies, fusion. Let the name carry the metaphor and keep the numbers literal. Do not label a spend-rate figure a burn rate.

### Register: modest confidence

The proof of expertise is **gradual**, not claimed up front. It accumulates as the body of work grows. It stays bounded by constant curiosity and an open acknowledgment that there is always more to learn.

At the start, the range of subjects will be narrow. That is fine. Narrow scope is not the same as shallow work, and the writing should read as though the author knows what he is talking about within whatever he has chosen to cover that week.

Two failure modes this rules out: posturing as an established authority on day one, and performing so much humility that a reader cannot tell whether to trust the work.

### Audience: wide, with depth available

Written for a general audience, because these topics are genuinely relevant to everyone. But the content goes deep enough to hold the attention of people already invested in these industries.

**Depth layering is deliberately not decided.** Make initial content first, see what it wants to be, then decide. Do not build a two-tier reading system into the architecture before there is anything to tier.

### Mediums: the website is the home, and it should think big

burnrate.news only, for now. But the site is intended to become a home for many ways of conveying information, not a blog with posts on it. Named by Enzo: animations, charts, interactive modules, video, images, articles, a newsletter, forums.

Not all at first. But **the brand system, the architecture, and the technical foundation should be built as though all of it is coming**, because retrofitting a publication into a platform is much harder than the reverse.

Everything is either made by Enzo or embedded in a way that fits the site's own visual system. Nothing arrives looking like it came from somewhere else.

### The domains and the tag system

**The four domains are Space, AI, Robotics, and Energy, in that order.** The order is a fixed presentation convention, not a ranking. All four sit at the same level of visibility and presentation, and each has its own domain page.

Space will probably develop fastest, because that is where Enzo's existing interest and work already are. That is a natural consequence, not an editorial priority, and it must not be encoded into the design as one.

**The intersections are the main point of the site.** Pieces carry tags for every domain they touch, and multi-domain tagging is the normal case rather than the exception. Datacenters in space is Space and AI, and Energy once the power system is part of the story. An autonomous robotic sport is Robotics and AI.

### The slogan

**Burn Rate's slogan is Truth in numbers.** Confirmed by Enzo, 2026-08-01.

In the lockup it renders as `[Truth in numbers].`, bracketed, with the final period in crimson. That is a typographic treatment of the logotype, not the text of the slogan itself. Quoted anywhere else, it is plain: Truth in numbers.

It may be cited as the brand's slogan wherever the brand is being described: an about page, a bio, a meta description. It does not become a recurring device inside headlines, kickers, or captions, and it does not get a sibling. This is the one slogan. Inventing a second because some document felt like it needed one is the failure mode this section exists to prevent.

---

## 3. The visual system

### Light mode

The site is light. Dark is not under consideration.

### Color

Full specification in `BR-COLOR` Rev 02.

| Role | Value | Job |
|---|---|---|
| Page | `#FBFBFC` | The reading surface. White, never warm. |
| Panel | `#EFEFF1` | Raised blocks sitting on the page. Always bordered. |
| Rule | `#D8D8DC` | Hairlines. Never text. |
| Muted | `#67676E` | Metadata. |
| Body | `#35353B` | Running copy. |
| Jet | `#08080A` | Headlines, every confidence rule, Robotics. |
| Blue deep | `#101F52` | Structure, chart outlines, Space. |
| Blue bright | `#1F5FE0` | Links, AI. |
| Crimson | `#B3122B` | Emphasis, kickers, revision numbers, Energy. |

**White is the page and grey is the panel**, not the reverse. Panels always carry a hairline border; the tint alone is only 1.11 contrast and will not define an edge.

**The domains are color coded**, and tags are filled rectangles with white uppercase mono type. Space is blue deep, AI is blue bright, Robotics is jet, Energy is crimson. Outlined tags, dot-and-label, and uncolored labels are all rejected.

**Colors serve more than one job and that is fine.** A confidence underline and a filled tag are different enough objects that no reader confuses them.

**Charts.** When a chart is about the domains it uses the domain colors and needs no legend. Otherwise it uses the series order `#101F52` · `#1F5FE0` · `#B3122B` · `#08080A` · `#67676E` and stops at five. Beyond five categories the chart is wrong, not the palette.

**Blue bright is the tightest value in the system** at 4.85 on panel. Links and derived marks only, never long copy, never below 12px.

**The confidence marks carry no color.** The rule is jet in all three line styles and the numeral takes whatever color its context sets. See section 4.

Rejected and not to be revisited without reason: cream, orange, purple page tints, dark mode, tinted blue page, planetary palettes, Gargantua gold.

### Type

Full specification in `BR-TYPE` Rev 02.

**The three roles are settled.** Serif for headlines, display, and standfirsts. Sans for running copy, navigation, and UI. Mono for every figure, unit, label, tag, timestamp, and source line.

**Mono owning every figure decides more than it looks like it does.** The large running statistics on Home are not serif display type with numbers in it. They are mono, at display size, carrying confidence marks. This is the most distinctive typographic consequence in the system and it falls out of the numbers standard rather than out of a style preference.

**Sizes, weights, and line heights are settled as of Rev 11.** Fourteen steps.

| Token | Family | Size | Line | Weight | Tracking | Job |
|---|---|---|---|---|---|---|
| `display` | serif | 56 | 1.04 | 400 | -.020 | Domain page titles, Home hero |
| `title` | serif | 40 | 1.10 | 400 | -.018 | Article title, the Articles lead |
| `head` | serif | 28 | 1.20 | 400 | -.010 | Section heads, list items |
| `subhead` | serif | 21 | 1.30 | 400 | 0 | In-article subheads |
| `standfirst` | serif | 20 | 1.50 | 400 | 0 | Standfirst, set in body color |
| `body` | sans | 17 | 1.65 | 400 | 0 | Running copy |
| `small` | sans | 15 | 1.55 | 400 | 0 | Captions, secondary UI, navigation |
| `ui` | sans | 14 | 1.40 | 600 | 0 | Active nav, controls |
| `stat-xl` | mono | 64 | 1.00 | 400 | -.010 | Home running statistics |
| `stat-l` | mono | 34 | 1.05 | 400 | 0 | Domain statistics, chart callouts |
| `stat-m` | mono | 22 | 1.15 | 400 | 0 | Inset panel figures, table totals |
| `figure` | mono | .94em | inherit | 400 | 0 | Any figure inside prose |
| `meta` | mono | 12.5 | 1.45 | 400 | .010 | Source lines, timestamps, notes |
| `label` | mono | 11 | 1.20 | 600 | .080 | Domain tags, kickers, column heads |

**Serif is 400 at every size.** Hierarchy is carried by size alone, never by weight, which keeps the headline voice level with the logo. Sans carries 400 and 600. Mono carries 400, with 600 reserved for labels and tags. No other weight is in the system.

**Figures in prose are set at `0.94em`.** Cascadia sets larger on the body than Selawik at the same nominal size, so a figure dropped into a sentence at `1em` looks shouted. At `0.94em` the digits land near the sans x-height.

**Tabular figures always. Ligatures off always.** A number must not shift position when it updates, and a publication about numbers must never render a programming ligature.

**The confidence rule has three size bands.** Dotted carries more weight than solid at every band, because a dot covers roughly half the length a solid rule does and would otherwise read as the faintest mark in the system. It is a kind, not a degree, and it must not look like a weaker claim.

| Band | Confirmed | Reported | Derived | Offset |
|---|---|---|---|---|
| Up to 17px | 1px solid | 1px dashed | 1.5px dotted | .14em |
| 18 to 34px | 2px solid | 2px dashed | 2.5px dotted | .12em |
| 35px and up | 3px solid | 3px dashed | 4px dotted | .10em |

**Body never moves on mobile.** Seventeen pixels is already right on a phone and shrinking it is the most common way a reading site gets worse. Only the display steps compress, at 760px: `display` to 36, `title` to 29, `head` to 23, `stat-xl` to 40, `stat-l` to 26. Everything else is unchanged. Note that `stat-xl` crosses from band three to band two on mobile and its rule changes with it. Handle that in the component, never by hand.

**Blue bright is never used below 12px.** This is a color rule, not a confidence rule, and it constrains any figure set in blue bright for contextual reasons, most often an AI-domain statistic or an AI series in a chart. `label` at 11px therefore cannot carry a blue bright figure; those move up to `meta`. If a figure will not fit at 12.5px, the layout is wrong, not the rule.

**Webfonts are not yet pinned.** The stack is currently a system stack, which resolves per platform. Before launch it should be pinned to open-licensed faces that reproduce the approved look: **Gelasio** (metric-compatible with Georgia), **Selawik** (Microsoft's open metric-compatible Segoe UI replacement), and **Cascadia Mono** (Microsoft's, SIL Open Font License, usable directly). Build task, not a design decision. Two of the three are metric-compatible with what the scale was set on, so the scale survives pinning. Cascadia is the exception, so `figure` at `0.94em` is the one value to re-check once the real face is loading.

### Space

Full specification in `BR-TYPE` Rev 02.

**A four-pixel base, ten steps.** Every margin, padding, and gap in the system is one of these values: `4` · `8` · `12` · `16` · `24` · `32` · `48` · `64` · `96` · `144`.

**The space scale is closed in the same way the palette is closed.** A new value is a revision to this document, not a decision made inside a component.

| Relationship | Value | Note |
|---|---|---|
| Figure to its own label | 8 | Tight enough that they read as one object |
| Paragraph to paragraph | 24 | |
| Subhead above / below | 48 / 12 | Asymmetric, so the head binds to what follows |
| Panel padding | 24 | Plus the hairline border, always |
| Panel above / below | 32 | |
| Section head above / below | 96 / 16 | |
| Module to module, Home | 144 | The only use of the top step |
| Page gutter | 28 / 20 | Desktop / mobile. The one value off the scale, carried from `BR-LOGO`. |

**Three column widths.** The article measure at `64ch`, already settled and centered. A `1120` breakout for full-width charts and modules inside an article. An `1180` page bound for Home, Articles, and the domain pages.

### Logo

Full specification in `BR-LOGO` Rev 03.

| Element | Color | Which is also |
|---|---|---|
| Burn | `#1F5FE0` blue bright | AI |
| Rate | `#B3122B` crimson | Energy |
| All three rule segments | `#08080A` jet | Robotics |
| `[Truth in numbers]` | `#101F52` blue deep | Space |
| The period | `#B3122B` crimson | Echoes the last word |

**The complete lockup uses every domain color exactly once.** Unplanned, and worth keeping.

**The rule is the confidence notation.** Solid, dashed, dotted, left to right, in the same order as the marks. The order is load-bearing and must never be rearranged for visual balance. All three segments are jet, so line style alone distinguishes them and the wordmark carries the color.

**The monogram** is `B` and `R` at medium overlap with the B in front, joined by a multiply blend. The overlap value is a product of the two colors, roughly `#160726`, and must never be set by hand.

**Below the small lockup size, drop the tagline rather than shrinking it.** At 16px the monogram's overlap fills in, so a jet-only version is the favicon fallback. Two-color at 32px and above. A technical fallback, not a second logo.

### Layout

Settled and built as a mock covering Home, Articles, four domain pages, an article page, and Contact.

- **Home** is not the articles page. It carries large running statistics, the latest article only, interactive modules, and slots for more.
- **Articles** is a single lead at large scale followed by a hairline-separated list. It looks correct with one piece and with two hundred, and it expresses judgment rather than inventory. Card grids were rejected: equal weight hides judgment and the layout visibly breaks at low volume.
- **Article pages** are a single centered measure at 64 characters. The measure is centered, so full-width breakout charts can be added later as a variant without restructuring.
- **Domain pages** share one template distinguished by the domain color: large serif title, a thick color bar, three domain statistics, a domain-specific module slot, then a filtered list.
- **Contact** is spare, with corrections given their own line.

### Motion, 3D, and other renderings

**Scope is deliberately open.** Section 2 names animations, charts, interactive modules, video, images, articles, a newsletter, and forums. Nothing here restricts what a rendering may depict or in what style. These rules govern how a rendering handles numbers and how it behaves, not what it is about. When a pattern earns repeating, record it here; until then the field is open on purpose, not by oversight.

**A number in a rendering is a number.** Whatever the medium, SVG, canvas, WebGL, video, an image, a slide, an exported PDF: every figure carries its mark. A scene containing no numbers carries no marks and needs none.

**Motion that encodes a value is a claim.** A counter ticking at a rate asserts the rate. A bar growing to a height asserts the height. Those are figures, and they are marked. Motion that encodes nothing asserts nothing, and is decoration.

**The mark must be reproducible outside CSS.** `border-bottom` does not exist in WebGL. The geometry is therefore specified, not left to the renderer.

| Mark | Stroke, by band | Pattern | Cap | Coverage |
|---|---|---|---|---|
| Confirmed | 1 · 2 · 3 | continuous | butt | 100% |
| Reported | 1 · 2 · 3 | 3× stroke on, 2× stroke off | butt | 60% |
| Derived | 1.5 · 2.5 · 4 | dots at 2× stroke, centre to centre | round | 50% |

Bands are the type bands: up to 17px, 18 to 34px, 35px and up. A dot is round at every size, which is why the derived stroke does not scale in step with the other two.

**Reduced motion may never remove information.** `prefers-reduced-motion` is respected everywhere. If a value is only legible while something moves, the static state must state it in type.

**The palette, the type roles, and the space scale hold in every medium.** Labels, units, and figures are mono wherever they appear, including inside a scene. On the jet surface used for social cards and video, rules invert to white, as `BR-LOGO` already specifies for the logo segments.

**A rendering containing figures carries a source line and a Rev number**, on the same terms as an article. See *Revisions and corrections*.

**Awe is not an argument, in pictures either.** A rendering may not do argumentative work the numbers do not support. Scale, drama, and photorealism are not evidence. This constrains claims, not ambition.

**Never sum across domains** is a design law and it applies to renderings. Four things adjacent in a scene must not imply a total.

---

## 4. The numbers standard

This is the core of the brand and the only thing carried intact from the original work. It governs humans and agents identically.

Burn Rate makes a promise no competitor makes: **every number declares how much it is trusted, visibly, in the type.** That promise is the product. The day the notation lies, Burn Rate is worth less than a plain blog, because a plain blog never promised anything.

### Scope

**Every number carries a mark, in every domain, whatever it measures.** Dollars, watts, terawatt-hours, kilograms, FLOP, tokens, units, headcount, percentages, capacity factors, contested dates. The marks describe **how a number came to exist**, not what it is about. A physics figure and a contract value are graded by the same rules.

The notation applies to numbers, not to prose. Analysis is signed, not marked.

### The three levels

**Solid, confirmed.** All four tests must pass:

1. It comes from the originating party: the agency, the contractor, the filing, the procurement record, the operator, the regulator. Not an aggregator, not a summary of a summary.
2. The figure is stated once, plainly, and does not vary in framing across credible sources.
3. A URL exists and resolves.
4. Enzo has personally opened that URL and seen the number.

A figure cited to trade press is not confirmed, however reliable the outlet.

**Dashed, reported.** Any one of these triggers it:

- The only sources are secondary.
- The figure varies by framing across otherwise credible sources.
- The primary source is paraphrased rather than published.
- It is a forward-looking figure someone else projected.
- **It was spoken, not published.** A number said aloud at a press event, an earnings call, or a conference stage and never printed is reported, no matter how often it is repeated afterward.
- **It is guided or planned rather than spent or delivered.** Capex guidance, announced capacity, target production rates, and pledged investment are reported at best, even in a filing. The filing confirms the company *said* it. It does not confirm the money moved.

**Dotted, derived.** Always:

- Any calculation performed in-house, however trivial.
- Any per-capita, per-taxpayer, or per-unit figure, because the denominator is a choice.
- Any inflation adjustment, with the method stated.
- Any unit or currency conversion, with the rate and date stated.
- Any projection restated in Burn Rate's own framing.
- Any total assembled from separately reported components.
- **Any cross-domain ratio.** Dollars per watt, per kilogram to orbit, per token, per unit shipped.

### The marks are kinds, not degrees

**The notation is not a dial where lower is safer.** Dotted asserts that Burn Rate did the arithmetic. If it did not, dotted is a lie, just a self-deprecating one. Marking a reported figure as derived is as wrong as the reverse. When in doubt, ask what *kind* of thing the number is, not how much you trust it.

### The marks carry no color

**Line style alone carries confidence.** The rule is jet in all three styles, exactly as the three segments beneath the logo are jet.

**The numeral takes whatever color its context sets.** The domain color on a domain page, a series color in a chart, crimson where a figure is an emphasized kicker, jet by default in prose. Nothing about how a number came to exist determines what color it is printed in.

**A figure is never set in blue bright for being derived, and never in muted grey for being reported.** Color coding the marks smuggled a hierarchy into a system that explicitly has none: jet, then grey, then blue reads as strong, weak, weaker. It also made every derived figure look like a hyperlink, because blue bright is the link color. Supersedes Rev 05.

**Losing the color redundancy makes the line styles load-bearing.** When the marks were jet, grey, and blue, color did half the work of telling them apart. Now line style does all of it. Any rendering of a mark, in any medium, has to reproduce the dash and dot geometry faithfully or the notation silently stops working. See *Motion, 3D, and other renderings* in section 3.

### The laundering problem, with two worked examples

**The trade press routinely publishes its own arithmetic without marking it.**

*Blue Origin, lunar terrain vehicle.* NASA's release states the award plainly: `$188M` base, `$280.4M` option for two task orders. Those are clean. What is not clean is every total the press built from them. Spaceflight Now divided and printed `$234M` per vehicle as if it were reporting. "Up to `$468M`" appears in no source at all; it is 188 plus 280.4. There is no single figure for "the award." There are two numbers and a condition.

*Hyperscaler capex.* Aggregate 2026 figures have been published anywhere from roughly `$630B` to `$725B`. These are not competing measurements of one thing. They are different sums of different company sets over different periods, each assembled by the outlet that printed it, and almost none say so. Every one is dashed at best, and the spread between them is a better story than any single value in it.

**Burn Rate's job is not only to mark its own derivations but to notice when a reported figure is somebody else's derivation wearing a reporting costume.** The laundering is usually upstream.

### The promotion rule

**An agent may gather a number. An agent may propose a confidence level. Only Enzo may promote a number to confirmed.**

The specific failure mode of a research pipeline is two agents agreeing with each other and a fabricated value arriving under a solid underline at 2am. Agreement between agents is not verification. It is correlated error.

**An agent's recollection is not a source.** Neither is a previous session's output, a research brief, or a prior article. The chain must terminate in a URL that Enzo opened.

There is no deadline on promotion. A dashed figure is a publishable state.

### Source hierarchy

Ranked. Always cite the highest available.

**Tier 1, primary records.** The originating party's own document.

| Domain | Tier 1 sources |
|---|---|
| **Space** | NASA releases and budget documents, SAM.gov, USAspending.gov, congressional appropriations text, agency OIG reports, FCC and ITU filings, contractor releases |
| **AI** | SEC filings for capex and commitments, company-published earnings transcripts, company infrastructure disclosures, chip vendor filings, county permit and tax-abatement filings, utility special-contract filings |
| **Robotics** | SEC filings where public, company production and shipment disclosures, customer disclosures naming deployments, tariff and trade filings, safety filings |
| **Energy** | FERC filings and dockets, EIA-860 and EIA-923, ISO and RTO interconnection queues, state PUC dockets, NRC filings, DOE loan announcements, utility integrated resource plans, published PPA terms |

**Tier 2, peer-reviewed and institutional.** Named methodology, published, not selling the thing it measures. Casey Dreier's Apollo cost work in *Space Policy*. The Planetary Society's budget analysis. NASA OIG. LBNL *Queued Up*. IEA and EIA outlooks. NREL benchmarks. GAO. CBO. National lab reports.

**Tier 3, trade press with named reporting.** SpaceNews, Spaceflight Now, Ars Technica, NASASpaceFlight, Reuters, Bloomberg, The Information, SemiAnalysis, Heatmap, Latitude Media, Canary Media, Utility Dive, The Robot Report.

**Tier 4, general press.** Fine for quotes and events, weak for figures.

**Tier 5, aggregators, vendor research, sell-side notes.** Corroboration only. Never the sole source for a published number.

**Tier is a property of the claim, not the outlet.** This correction cost real work. The Planetary Society is a tier 2 outlet because it does peer-reviewed budget analysis. On the `$20B` Moon Base figure it did none: it repeated a remark from a podium and attributed it to documents nobody has produced. The outlet was tier 2. The claim was tier 4. When the assigned tier departs from an outlet's usual rank, say why.

### Domain cautions

- **Wikipedia is never a source.** It is a finding aid. Follow its citations.
- **Paywalled analyst research is tier 3 at best.** A model output is a derived figure whoever computed it. Cite it as their derivation, never as measurement.
- **Market-size reports from firms selling the report are tier 5.** A "$38B by 2030" from a company whose business is the PDF is evidence only that the PDF exists.
- **Announced capacity is not contracted capacity is not energized capacity.** Three numbers, one word. Say which one you mean, every time.
- **Funding rounds are self-reported** until a Form D or equivalent confirms them.

### Prohibited

- Never invent a figure to fill a gap. If it is not known, say so.
- Never state a range as a point. If sources disagree, the disagreement is the story.
- Never launder a derived number as a reported one. Citing the sources of the inputs does not make the output confirmed.
- Never mark a figure lower than its kind. Under-marking is a different false claim.
- Never publish an unmarked number. There is no neutral state.
- Never let agent output reach the page unreviewed.
- Never reproduce source text. Paraphrase. Quotes under 15 words, one per source, only where exact wording carries meaning.
- Never use awe as an argument.
- **Never compare capacity to capacity without stating the capacity factor.** A `1GW` solar farm and a `1GW` gas plant are not the same object.
- **Never treat a compute figure as stable.** State generation, precision, and whether it is peak or achieved. Without those three it is not comparable to anything.
- **Never sum across domains.** Datacenter capex contains energy spend, energy investment contains datacenter-driven generation, space budgets contain compute. The overlaps are real and unquantified. Report the four separately and say why they are not added. This is a design law as well as an editorial one.

### Revisions and corrections

Articles are living documents. The beat moves fast enough that pieces go stale in weeks.

- Every piece with numbers carries a **Rev** number and an **Updated** date.
- Rev 01 is first publication. Bump when a figure changes, a source is added, a confidence level moves, or a claim is materially revised. Not for typos.
- A revision log at the foot states what changed, one line per revision.
- Confidence levels move in both directions. A dashed figure becoming confirmed is worth logging, and it is quietly the best advertisement the notation has.
- Corrections are logged, never silently patched. A wrong number under a solid underline is the most serious failure possible: correct immediately, log explicitly, record why it passed review. State what was wrong, state what is right, move on. Do not apologize at length.

### The standing test

> **Could I show this page to the person whose money it describes, and defend every line on it?**

If not, it is not ready.

---

## 5. The data model

**The notation is not a stylesheet. It is a schema.** Solid, dashed, and dotted only render correctly if every number is a record carrying its own provenance. Burn Rate is not pages with numbers typed into them. It is a fact table that renders itself.

Three consequences:

1. **Provenance becomes structural.** You cannot forget to cite something, because an uncited record will not render.
2. **Agents get a contract.** Return facts in this shape or the output is unusable.
3. **A figure is updated once.** Change the record and every view moves together. Without this, revisions are unmaintainable by one person.

**No formula references a literal.** A derived fact points at a record id, never at a raw number. The one exception is definitional constants: `31536000` seconds in a year is not a claim about the world and may live in a formula. **The test is not whether a number looks trivial. It is whether it could turn out to be wrong.**

### The fact record

| Field | Notes |
|---|---|
| `id` | Dot-namespaced, stable, human-readable. Never reused. |
| `domain` | `space` · `ai` · `robotics` · `energy`. Required. |
| `value` | Raw. Never pre-formatted. Formatting is a render concern. |
| `unit` | Enum. `USD`, `USD_per_kg`, `USD_per_W`, `USD_per_MWh`, `W`, `Wh`, `kg`, `count`, `percent`, `days`, `years`, `FLOP`, `tokens`, `capacity_factor`. |
| `label` | What it is, in plain language. |
| `as_of` | The date the figure describes, not the date it was fetched. |
| `confidence` | `confirmed` · `reported` · `derived`. Drives the line style of the underline and nothing else. Not the color, not the weight of the claim. |
| `sources[]` | At least one. Zero sources is invalid and must not render. |
| `sources[].tier` | 1 to 5, **per claim, not per outlet**. |
| `sources[].tier_note` | Required when tier departs from the outlet's default. |
| `sources[].states_value` | Does this source print this value? If false it is not a source for it. Build-time check. |
| `sources[].traces_to` | Id of the underlying event when a source is relaying rather than originating. |
| `notes` | Competing framings, ambiguities, denominator choices. |
| `stale_after` | See below. |
| `supersedes` | For revised figures. The old record is retained, never deleted. |

**`FLOP` records are invalid without notes stating precision, generation, and peak versus achieved.**

**A source must state the value.** `states_value` exists because NASA's Ignition deck once sat in a sources array carrying a tier 1 badge for a number it does not contain. A source cited for a figure it does not print is laundering, whether an outlet does it or you do. Corroboration for something adjacent belongs in `notes`.

**Two sources repeating one sentence are one source.** `traces_to` records the underlying utterance. Spaceflight Now quoting a remark and The Planetary Society printing the same figure reads as two sources across two tiers. It is one spoken sentence printed twice. The canonical new-domain case is the earnings call: a capex figure spoken once and printed by six outlets is one source with six repetitions. If it also appears in the 10-Q, that is genuinely a second and higher source.

### Derived facts

Dotted by construction. Never carry their own confidence, because they cannot be more confident than their inputs.

- The formula is stored, not the result. Recompute on render.
- A derived fact inherits the lowest confidence among its inputs and then drops to derived regardless. There is no path back up.
- `notes` may not be empty. Every derived number contains a judgment: a denominator, a method, a rate assumption. Name it.
- Cross-domain ratios carry a `cross_domain` array and must state in notes what the two inputs do and do not have in common. The failure mode is dividing a figure covering one company set by a figure covering another and printing the quotient as if it described one object.
- **No derived fact may sum across domains.** Validator rule, not a guideline.

**Absence is a derived fact.** Nobody publishes a zero. When a category has no entries, the zero is Burn Rate's own count of an empty set: dotted, no sources array, self-updating the day something lands. This is frequently the most interesting number on a page, and it is the one figure for which Burn Rate is the primary source.

### Staleness

Every fact declares when it goes off. If today is past `stale_after`, the site flags it rather than hiding it. **The anchor is the retrieval, not the event.** A figure goes stale because the verification aged, not because the world did.

| Class | Window | Examples |
|---|---|---|
| Live | fetch on load | Launches YTD, market caps, days since award |
| Fast | 30 days | Contract awards, obligations, funding rounds, queue positions |
| Quarterly | 100 days | Capex guidance and actuals, shipments, anything on an earnings cycle |
| Slow | 400 days | Global economy figures, installed base, population |
| Projection | none, restate vintage | Long-dated forecasts |

The failure mode for a solo operator is not lying, it is decay. A site that flags its own stale figures is more trustworthy than one that pretends.

### Live sources worth building against

| Source | Gives |
|---|---|
| **USAspending.gov API** | Federal obligations by agency, recipient, date. The government's own system of record, and almost nobody in this space uses it. |
| **SEC EDGAR full-text search** | Filings for every listed company in all four domains. Capex lines, segment disclosures, Form Ds. |
| **EIA open data API** | Generation, capacity, fuel prices, by plant and state. The closest thing to USAspending on the energy side. |
| **ISO and RTO interconnection queues** | Who requested a grid connection, for how much, when. Each publishes separately in a different format. Tedious, public, unassembled. |
| **FERC eLibrary** | Dockets and rate cases, where datacenter power deals surface months before they are reported. |
| **SAM.gov** | Solicitations, caught the day they post. |
| **The Space Devs / Launch Library 2** | Launch history and manifest. |
| **County and municipal filings** | Datacenter permits, abatements, water and power agreements. Where a campus becomes real, in public, before any press release. |

Verify terms and rate limits before building. Static site with client-side fetch is sufficient: facts live as JSON in the repo, live values fetch on load and fail gracefully to the last cached value with its `as_of` shown.

### Trackers

A tracker is a maintained ledger of who committed what, in one domain, assembled from primary records. Three questions before starting one, all must pass:

1. **Is there a primary, public record of the commitments?** If the answer is "companies announce these in press releases," it will be a rumor table.
2. **Does the data arrive at a rate one person can absorb?** Weekly is fine. Daily is not, and a tracker that falls behind is worse than none, because the promise is currency.
3. **Does anyone else maintain it well?** If yes, link to theirs. The advantage is the unmaintained ledger, not the better-designed one.

`status` must be richer than award-or-not: announced, contracted, delivered. That distinction is the gap, and the gap is the publication. A tracker recording only "award" cannot show what it exists to show.

**Design a tracker around its absences first.** Every domain has one: the campus with no announced power source, the robotics roadmap with no unit economics, the buildout with no disclosed financing.

---

## 6. Working with agents

**Agents build. Agents do not assert.**

An agent must never stop work because a figure is weak. The notation exists so uncertainty ships marked rather than not shipping at all. A publication with no way to say "we are not sure" has two options, assert or drop. Burn Rate has a third, and an agent that drops a weakly-sourced figure is throwing away the only thing that makes this publication different, out of a caution that looks like rigor and is not.

Three cases, one stops:

- **A figure is weak, conflicting, or secondary.** Build it. Mark it to its kind at the lowest defensible level. Put every competing framing in notes. Say what you think and why, as a second opinion rather than a request for permission. Proceed.
- **No figure exists.** Do not invent one. Build the structure with the slot empty and render the emptiness visibly. Proceed.
- **The instructions are missing or contradictory.** Stop and ask. This is the only case that blocks. An agent guessing at spec produces fiction, and fiction cannot be marked because it has no kind.

### Every agent returns, per figure

`value` · `unit` · `domain` · `source_name` · `source_url` · `source_tier` · `retrieved_at` · `proposed_confidence` (`reported` or `derived` only, never `confirmed`) · `notes`

**An agent that cannot supply a URL has not found a fact.** It has found a rumor. Return it as a rumor, marked, and keep going.

**Agents surface disagreement, they do not resolve it.** Both sides go in notes. In AI and energy this is the normal case; a pass that returns no conflicts on a contested figure has probably searched one source and stopped.

**Agents may not write claim sentences.** The read is the product and the read is Enzo's. Voice is not delegable, and a page of agent-written claims is a costume.

**Agents may not fit constants to close a gap.** If a model disagrees with reality, that is a finding to report, not an error to tune away. A fitted constant is a fabricated number wearing a lab coat.

---

## 7. Open

**Active**
- Deployment: GitHub repo, Vercel, burnrate.news pointed at it.
- The first few pieces of content.

**Editorial**
- What makes something a Burn Rate story and what does not.
- Cadence.
- Whether trackers are part of the plan, and which domain gets the first one.

**Design**
- Pinning the webfonts so type survives leaving Enzo's machine.
- Image and illustration doctrine.
- Chart system beyond the color assignments.
- Ambient motion: page-load sequences, scroll reveals, hover states. Open by decision, judged case by case. Record a pattern here once it earns repeating.
- The component specimen page, for design system import into Claude Design.

**Identity**
- Descriptor and short form.
- Voice and tone beyond "modest confidence."
- What the brand is explicitly not.

---

## Appendix · Research carried over

Verified work from the retired documents, preserved so it is not re-researched. Space-specific, from when the publication was space-only.

**NASA's written record prices the Moon Base nowhere.** Two fact sheets dated March 24, 2026 were opened on 2026-07-17. The *Ignition* fact sheet names all three phases with no dates and **no dollar figures**. The *Building the Moon Base* fact sheet gives phase dates and **no dollar figures**:

- Phase 1 (Now–2029): Experiment, Learn
- Phase 2 (2029–2032): Early Habitation
- Phase 3 (2032 and beyond): Sustained Human Presence

**The `$20B` program total was spoken, not published.** It traces to Isaacman's remarks at Ignition, March 24, 2026: "about $20 billion over seven years." One spoken sentence, two numbers, and the seven is as much a claim as the twenty. Both are reported and stay reported however many outlets repeat them. Spaceflight Now and The Planetary Society are **one source, not two**: both trace to that sentence.

**Open item, blocking any NASA-sourced dollar claim:** the 31MB *Building the Moon Base* presentation is the only NASA artifact that may print per-phase figures. It has not been opened.

**Award ledger, as of 2026-07-17.** All reported, none promoted.

| Recipient | Value | Option | Date | Category |
|---|---|---|---|---|
| Astrobotic | $297.9M | | 2026-06-30 | lander |
| Lunar Outpost | $220.0M | | 2026-05-26 | rover |
| Astrolab | $219.0M | | 2026-05-26 | rover |
| Blue Origin | $188.0M | $280.4M | 2026-05-26 | delivery |
| Intuitive Machines | $148.3M | | 2026-06-30 | lander |
| Firefly Aerospace | $144.2M | | 2026-06-30 | lander |
| Firefly Aerospace | $75.0M | | 2026-05-26 | delivery |

Base awards total `$1.292B`. With the unexercised Blue Origin option, `$1.573B`. Both derived. **Publishing `$1.6B` without noting the option is unexercised is the exact imprecision this publication exists to correct.**

**Habitats and surface power sit at zero.** NextSTEP-3 Appendix B opened its first directed call on surface power, June 30, 2026, with no award. The zero is derived, not reported, because nobody prints a zero.

**Supporting record:** US population 341,800,000, Census Bureau, January 27 2026, reported.

---

## Revision log

| Rev | Date | Change |
|---|---|---|
| 11 | 2026-08-01 | **Type, space, and the mark color correction.** Type scale settled: fourteen steps, serif at 400 only, body at 17, figures in prose at `0.94em`, tabular figures and no ligatures, three confidence bands with dotted heavier than solid, mobile compression on the display steps only. Space scale added: four-pixel base, ten steps, closed, with assignments and the three column widths. **The confidence marks no longer carry color.** Line style alone carries confidence, the rule is jet in all three styles, and the numeral takes its color from context. Supersedes the color assignments in Rev 05: color coding the marks smuggled a hierarchy into a system that has none, and made every derived figure look like a link. Motion, 3D, and other renderings added: scope deliberately open, mark geometry specified for non-CSS media, motion that encodes a value is a claim, reduced motion may not remove information. Issued as `BR-TYPE` Rev 02. |
| 10 | 2026-08-01 | Confirmed Truth in numbers. as Burn Rate's slogan, replacing the "no slogans" framing. Recorded the lockup's bracketed rendering as a typographic treatment of the logotype rather than the text of the slogan itself. |
| 09 | 2026-07-31 | **Consolidation.** Absorbed everything worth keeping from `editorial-standards.md` and `data-model.md`, both now retired: the confidence levels and their tests, the promotion rule, the per-domain source hierarchy, tier-per-claim, the laundering examples, all prohibitions, the revision and correction policy, the fact-record schema, derived-fact rules, staleness, live sources, the tracker test, and the agent contract. Preserved the verified Moon Base research as an appendix. Restructured into brand, visual system, numbers standard, data model, agents, open. Added the note that "burn rate" is the masthead and not a label for figures. Recorded layout as settled and built. Deployment added as active work. |
| 08 | 2026-07-31 | Logo settled: Burn in bright blue, Rate in crimson, rule segments jet, tagline in deep blue, monogram at medium overlap with B in front. Noted the lockup uses every domain color exactly once. Issued as `BR-LOGO` Rev 03. |
| 07 | 2026-07-31 | Logo adopted from Enzo's design and rebuilt in live type. Tagline recorded as the single sanctioned line, scoped to the mark. |
| 06 | 2026-07-31 | Type added provisionally: three roles settled, system stack approved, pinning to Gelasio, Selawik, and Cascadia Mono flagged for launch. |
| 05 | 2026-07-31 | Page and panel corrected: white is the reading surface, grey is the raised panel. Crimson shape rule removed. Confidence marks settled. Color closed. |
| 04 | 2026-07-31 | Color locked. Jet, two blues, crimson, no orange. Domains color coded with filled white-type tags. |
| 03 | 2026-07-31 | Palette family settled. Filled tags settled. No-slogans rule added. |
| 02 | 2026-07-31 | Light mode, the four domains at equal visibility, the multi-domain tag system, mock ships first, logo and depth layering deferred. |
| 01 | 2026-07-31 | First issue after a full reset. Retained only Enzo's description, his direct answers, and the truth-of-numbers philosophy. |
