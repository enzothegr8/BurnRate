# Burn Rate · Design system statement

**For** burnrate.news · **Rev** 01 · **Drawn** E. Carvalho, 2026-08-01 · **Derived from** BR-FOUND Rev 15

Burn Rate is a publication about money in space, AI, robotics, and energy. Its defining feature is that every number it prints declares how it came to exist, visibly, in the type. That notation is the product. Everything below serves it.

---

## Three closed scales

**Closed means closed.** A new color, a new type step, or a new spacing value is a revision to this specification, not a decision made while designing a screen. If something appears not to fit, the layout is wrong, not the scale.

### Color, nine values

| Role | Value | Job |
|---|---|---|
| Page | `#FBFBFC` | The reading surface. White, never warm. |
| Panel | `#EFEFF1` | Raised blocks. Always bordered. |
| Rule | `#D8D8DC` | Hairlines. Never text. |
| Muted | `#67676E` | Metadata. |
| Body | `#35353B` | Running copy. |
| Jet | `#08080A` | Headlines, every confidence rule, Robotics. |
| Blue deep | `#101F52` | Structure, chart outlines, Space. |
| Blue bright | `#1F5FE0` | Links, AI. |
| Crimson | `#B3122B` | Emphasis, kickers, Energy. |

**These colors are not a primary, a secondary, and an accent.** They carry meaning, not hierarchy. Blue deep is Space. Blue bright is AI and links. Jet is Robotics and headlines. Crimson is Energy and emphasis. A color doing two jobs is intentional and is not a conflict to resolve. Any framing that ranks them destroys the system.

Domain tags are filled rectangles in the domain color with white uppercase mono type. Never outlined, never a dot and a label, never uncolored.

Charts about the domains use the domain colors and need no legend. Otherwise the series order is `#101F52` · `#1F5FE0` · `#B3122B` · `#08080A` · `#67676E`, and it stops at five. Beyond five categories the chart is wrong, not the palette.

Blue bright is the tightest value in the system at 4.85 on panel. Links only, never long copy, never below 12px.

### Type, fourteen steps, three families

Serif for headlines, display, and standfirsts. Sans for running copy and UI. Mono for every figure, unit, label, tag, timestamp, source line, and navigation.

| Token | Family | Size | Line | Weight | Tracking | Job |
|---|---|---|---|---|---|---|
| `display` | serif | 56 | 1.04 | 400 | -.020 | Domain titles, Home hero |
| `title` | serif | 40 | 1.10 | 400 | -.018 | Article title, Articles lead |
| `head` | serif | 28 | 1.20 | 400 | -.010 | Section heads, list items |
| `subhead` | serif | 21 | 1.30 | 400 | 0 | In-article subheads |
| `standfirst` | serif | 20 | 1.50 | 400 | 0 | Standfirst, in body color |
| `body` | sans | 17 | 1.65 | 400 | 0 | Running copy |
| `small` | sans | 15 | 1.55 | 400 | 0 | Captions, secondary UI |
| `ui` | sans | 14 | 1.40 | 600 | 0 | Controls, form labels |
| `stat-xl` | mono | 64 | 1.00 | 400 | -.010 | Home running statistics |
| `stat-l` | mono | 34 | 1.05 | 400 | 0 | Domain statistics, callouts |
| `stat-m` | mono | 22 | 1.15 | 400 | 0 | Panel figures, table totals |
| `figure` | mono | .94em | inherit | 400 | 0 | Any figure inside prose |
| `meta` | mono | 12.5 | 1.45 | 400 | .010 | Source lines, timestamps |
| `label` | mono | 11 | 1.20 | 600 | .080 | Tags, kickers, navigation |

**Serif is weight 400 at every size.** Hierarchy comes from size alone, never from weight. Sans carries 400 and 600. Mono carries 400, with 600 reserved for labels and tags. No other weight is in the system.

**Tabular figures always. Ligatures never.** A number must not shift position when it updates, and a publication about numbers must never render a programming ligature.

An article's own title is `title`. A heading dividing an article body is `head`. A division inside a section is `subhead`. Nothing goes below `subhead`.

Body never shrinks on mobile. Only the display steps compress at 760px: `display` 36, `title` 29, `head` 23, `stat-xl` 40, `stat-l` 26.

### Space, ten steps

`4` · `8` · `12` · `16` · `24` · `32` · `48` · `64` · `96` · `144`

Equidistant values round up. The page gutter at 28 desktop and 20 mobile sits outside the scale and is the only exception.

| Relationship | Value |
|---|---|
| Figure to its own label | 8 |
| Paragraph to paragraph | 24 |
| Subhead above / below | 48 / 12 |
| Panel padding | 24 |
| Panel above / below | 32 |
| Section head above / below | 96 / 16 |
| Module to module | 144 |

---

## The confidence notation

Every number carries one of three marks, drawn as an underline.

- **Solid**, confirmed. Seen in the originating party's own document.
- **Dashed**, reported. Secondary, spoken, guided, or projected.
- **Dotted**, derived. Burn Rate did the arithmetic.

**Line style alone carries confidence. The rule is jet in all three styles.** The numeral takes whatever color its context sets: the domain color on a domain page, a series color in a chart, crimson where it is an emphasized kicker, jet by default in prose. Nothing about how a number came to exist determines what color it is printed in. **A figure is never blue for being derived and never grey for being reported.**

**Dotted is drawn heavier than solid at every size**, because a dot covers about half the length a solid rule does and would otherwise read as the weakest mark. The three marks are kinds, not degrees. None outranks another.

| Band | Confirmed | Reported | Derived | Offset |
|---|---|---|---|---|
| Up to 17px | 1px solid | 1px dashed | 1.5px dotted | .14em |
| 18 to 34px | 2px solid | 2px dashed | 2.5px dotted | .12em |
| 35px and up | 3px solid | 3px dashed | 4px dotted | .10em |

**The mark must survive any medium.** `border-bottom` does not exist in SVG, canvas, or WebGL, so the geometry is specified rather than left to the renderer: confirmed is continuous with butt caps at 100% coverage; reported is a dash of three times stroke on and two off, butt caps, 60%; derived is round dots at twice stroke centre to centre, 50%.

---

## What this system does not contain

No border radius. No shadows. No gradients. No dark mode. No cream, orange, or purple. No card grids. No icon set. No decorative imagery. No color outside the nine.

**No call-to-action buttons.** This is a publication, not a product. Blue bright means a link, never a fill.

Panels are panel grey with a one pixel rule-colored border, always. The tint alone is 1.11 contrast and will not define an edge on its own.

---

## Layout

Article body at a 64 character measure, centered. Article routes bound at 1120, which is also the widest a chart may break out to inside an article. Every other route bounds at 1180.

**Home is not a list of articles.** It carries four full-width running statistics, one per domain, hairline separated, then the latest article only, then interactive modules.

**Articles is one lead at large scale followed by hairline-separated rows.** Never a card grid: equal weight hides editorial judgment and the layout breaks at low volume.

**Domain pages** share one template distinguished by the domain color: large serif title, a thick color bar, three domain statistics, a module slot, then a filtered list.

---

## The mark

The lockup is a serif wordmark, a three-segment rule beneath it, and the line `[Truth in numbers].` in mono. "Burn" is blue bright, "Rate" is crimson, all three rule segments are jet, the tagline is blue deep, and the final period is crimson. The complete lockup uses every domain color exactly once.

**The rule beneath the wordmark is the confidence notation**: solid, dashed, dotted, left to right, in the same order as the marks. The order is load-bearing and must never be rearranged for visual balance.

Three sizes, `xl`, `md`, and `sm`. The masthead is `md`. Below `sm`, drop the tagline rather than shrinking it.

**On the jet surface used for social cards and video, the lockup is monochrome page white throughout.** The domain colors are not lifted or tinted to survive that surface, because a lifted color is a new color and the palette is closed.

The monogram is `B` and `R` at medium overlap, B in front, joined by a multiply blend. The overlap value is a product of the two colors and must never be set by hand.

---

## Motion

**Motion that encodes a value is a claim** and is marked like any other figure. A counter ticking at a rate asserts the rate. A bar growing to a height asserts the height. Motion that encodes nothing is decoration and does not ship.

**Reduced motion is respected everywhere and may never remove information.** If a value is only legible while something moves, the static state must state it in type.

Scope is otherwise open. Nothing here restricts what a rendering may depict or in what style. These rules govern how a rendering handles numbers and how it behaves.

---

## The one sentence to hold onto

**If a design decision would make an unmarked number look acceptable, the decision is wrong.**
