<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Burn Rate rules, read before any change

The spec lives in three files in the repo root and wins over any instinct you have:
`brand-bible.md`, `editorial-standards.md`, `data-model.md`. If a request conflicts
with them, stop and say so.

Non-negotiables that get violated by default habits:

- Vellum background `#EAEBE5`, never white. Light only, no dark mode.
- Instrument Serif for display (no bold exists, never fake it), IBM Plex Sans for
  body, IBM Plex Mono with tabular-nums for every number. Never Inter.
- Hairlines, not cards. No shadows, no rounded floating boxes, no gradients.
- Links are never underlined. Underlines belong to the notation only:
  solid = confirmed, dashed = reported, dotted = derived. Rendered by
  `components/ui/figure.tsx`, driven by `confidence` on records in `/data`.
- Every number renders through `<Figure />` from a fact record with at least one
  sourced URL. Never type a numeral into copy. Never mark anything `confirmed`;
  only Enzo promotes.
- Orange `#E8410A` at most once per section. Forbidden colors: `#F4EFE1`,
  `#E9B84C`, `#E5544C`, `#FFFFFF` backgrounds.
- American English. No em dashes anywhere, including code comments.
