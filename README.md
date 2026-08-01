# Burn Rate

The economics of Space, AI, Robotics, and Energy, read through science, politics,
and money. By Enzo Carvalho, at [burnrate.news](https://burnrate.news).

Burn Rate makes a promise no competitor makes: **every number declares how much
it is trusted, visibly, in the type.** Solid means confirmed, dashed means
reported, dotted means Burn Rate did the arithmetic. That promise is the product.

## The one rule a contributor most needs to know

**Numbers in prose come from the fact store, through `<Figure />`, and the build
enforces it.**

Body copy is a view onto a fact table, not a place where numbers get typed in. A
bare digit sitting in a sentence is an unmarked claim, and an unmarked figure
reads as asserted. So `tools/lint-mdx-numerals.mjs` strips everything that
legitimately contains digits, then fails the build on any digit left in prose.

Two ways to satisfy it:

```mdx
The award was <Figure id="space.award.lander" />.

{/* numerals-ok: a section ordinal, typography rather than a claim */}
Part 2 of this piece.
```

The linter is a tripwire, not a verifier. It cannot see a spelled-out number,
and it cannot tell whether a `<Figure />` points at the right record. Both limits
are documented at the top of the script and have tests asserting it misses them.

Two more rules that get broken by habit:

- **Never mark a figure `confirmed`.** Contributors and agents propose `reported`
  or `derived`. Only Enzo promotes, after opening the primary URL himself.
- **Never add a color.** The palette is closed. A new color is a revision to
  `docs/brand-foundation.md`, not a decision made inside a component. There is a
  test that fails when a token appears that the spec does not name.

## Where the spec lives

[`docs/brand-foundation.md`](docs/brand-foundation.md) is the single source of
truth: the palette, the type roles, the layout, the numbers standard, the data
model, and the agent contract. It is spec, not suggestion. If a change conflicts
with it, that is a conversation and a revision, not a judgment call in a pull
request. [`AGENTS.md`](AGENTS.md) is the short form for anyone working in the repo.

The retired `brand-bible.md`, `editorial-standards.md`, and `data-model.md` were
folded into the foundation doc and deleted. The pre-rebuild codebase is preserved
at the tag `v0-archive`.

## Stack

- Next.js 16, App Router, TypeScript, Turbopack
- Tailwind CSS v4, CSS-first, no `tailwind.config.js`
- No component library. Every component is hand built.
- MDX articles via `@next/mdx`, with `remark-frontmatter` and
  `remark-mdx-frontmatter`
- Vitest

Type is pinned to open-licensed webfonts so it survives leaving one machine:
Gelasio for display, Selawik for running copy, Cascadia Mono for every figure.
Selawik is not on Google Fonts and its woff2 files are committed under
`app/fonts/` with the OFL license beside them.

## Running it

```bash
npm install
npm run dev
```

Other commands:

| Command | Does |
|---|---|
| `npm run build` | Numeral lint, then the test suite, then the production build |
| `npm test` | Vitest |
| `npm run lint` | ESLint |
| `npm run lint:numerals` | The numeral tripwire on its own |
| `npm run icons` | Regenerates the icons and the Open Graph image |

`npm run icons` derives every icon from the monogram and the lockup, reading the
palette out of `app/globals.css` so nothing carries a duplicate hex value. The
monogram overlap is produced by actually compositing the two letters with a
multiply, never by typing the resulting color in. It fetches two fonts on first
run and caches them under `.cache/`, which is ignored.

## Deploying

Vercel, with no `vercel.json`. Nothing about this project needs one.

**The numeral lint and the fact store validation both run as part of
`npm run build`**, so a bare digit in prose or a record without a source fails
the Vercel deploy exactly as it fails a local build. That is intended. A rule
that only runs when someone remembers to look is a rule that decays.

## The state of the thing

This build is scaffolding. Every headline, figure, and module on it is a
placeholder, the site says so in a banner at the top of every page, and the fact
store holds only fixtures. Placeholder figures are written to be visibly fake
(`$000B`, `$0.0T`, `000TWh`) because this repository is public, and a realistic
invented number in a publication whose whole premise is marking its numbers is
the worst thing it could ship.
