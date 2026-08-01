# Burn Rate, rules for anyone working in this repo

## The spec

`docs/brand-foundation.md` is the single source of truth. Read it before any
change. It is spec, not suggestion. If a request conflicts with it, stop and say
so rather than resolving the conflict yourself.

Everything not in that document is open. If a rule here or anywhere else does
not trace back to a line in it, treat it as an assumption and challenge it.

## This is not the Next.js you know

This project runs Next.js 16. APIs, conventions, and file structure may differ
from your training data. Read the relevant guide in `node_modules/next/dist/docs/`
before writing code against a framework API. Heed deprecation notices.

## The palette is closed

Page `#FBFBFC` · Panel `#EFEFF1` · Rule `#D8D8DC` · Muted `#67676E` ·
Body `#35353B` · Jet `#08080A` · Blue deep `#101F52` · Blue bright `#1F5FE0` ·
Crimson `#B3122B`.

A new color is a revision to `docs/brand-foundation.md`, not a decision made
inside a component. Never write a hex literal in a component; read the token.

White is the page and grey is the panel, not the reverse. Panels always carry a
hairline border, because the tint alone is 1.11 contrast and will not define an
edge. Light only. Dark mode is not under consideration.

Blue bright is the tightest value in the system at 4.85 on panel. Links and
derived marks only, never long copy, never below 12px.

## The type and space scales are closed too

Same rule as the palette. The fourteen type steps and the ten space steps in
`docs/brand-foundation.md` section 3 are the only sizes, line heights,
weights, tracking, and spacing values Burn Rate is allowed to use, transcribed
into `app/globals.css` as tokens. A new value in either scale is a revision to
the foundation doc, not a decision made inside a component. Never write a px
size or a spacing value in a component; read the token.

## Type

Serif is Gelasio: headlines, display, standfirsts. Sans is Selawik: running
copy, navigation, UI. Mono is Cascadia Mono: every figure, unit, label, tag,
timestamp, and source line. Never Inter. Ligatures stay off in mono, because a
publication about numbers must not render programming ligatures.

## The domains

Space, AI, Robotics, Energy, in that order, always. The order is a presentation
convention, not a ranking, and all four sit at equal visibility.

Space is blue deep, AI is blue bright, Robotics is jet, Energy is crimson. Tags
are filled rectangles with white uppercase mono type. Outlined tags,
dot-and-label, and uncolored labels are all rejected.

## The numbers standard

This is the core of the brand. Every number declares how much it is trusted,
visibly, in the type. The day the notation lies, Burn Rate is worth less than a
plain blog, because a plain blog never promised anything.

Confidence drives the underline and nothing else does:

- `confirmed` solid
- `reported` dashed
- `derived` dotted

The marks carry no color. The rule is jet in all three styles, and the
numeral takes whatever color its context sets, never a color chosen for what
the mark is. A figure is never set in blue bright for being derived, and
never in muted grey for being reported; that mapping was rejected in Rev 11
because it smuggled a hierarchy into a system that has none. Confidence maps
to line style and to nothing else.

The marks are kinds, not degrees. Marking a reported figure as derived is as
wrong as the reverse. Ask what kind of thing the number is, not how much you
trust it.

Every number renders through the fact store from a record carrying at least one
source that actually states the value. Never type a numeral into copy.

**Never mark anything `confirmed`.** An agent may gather a number and may
propose `reported` or `derived`. Only Enzo promotes, after opening the primary
URL himself. Agreement between agents is not verification, it is correlated
error. An agent that cannot supply a URL has not found a fact, it has found a
rumor.

Never sum across domains. The overlaps are real and unquantified. This is a
validator rule as well as an editorial one.

Never invent a figure to fill a gap, never state a range as a point, never
publish an unmarked number. There is no neutral state.

## Working with agents

Agents build. Agents do not assert. Three cases, one stops:

- A figure is weak, conflicting, or secondary. Build it, mark it to its kind at
  the lowest defensible level, put every competing framing in notes. Proceed.
- No figure exists. Do not invent one. Build the structure with the slot empty
  and render the emptiness visibly. Proceed.
- The instructions are missing or contradictory. Stop and ask. This is the only
  case that blocks.

Agents may not write claim sentences. The read is Enzo's and voice is not
delegable. Agents may not fit constants to close a gap; a fitted constant is a
fabricated number wearing a lab coat.

## This repository is public

Placeholder figures must be visibly fake: `$000B`, `$0.0T`, `000TWh`. Never
invent a plausible-looking number. A realistic fake figure in a public repo
belonging to a publication whose premise is marking its numbers is the worst
thing that could ship.

## Prose

No em dashes anywhere. Not in copy, not in comments, not in commit messages.
American English.

Confirmed by Enzo on 2026-08-01. It is the one rule from the retired
`editorial-standards.md` that Rev 09 of the foundation doc did not restate, so
it is recorded here instead.
