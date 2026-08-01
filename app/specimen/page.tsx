import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { Monogram } from "@/components/brand/monogram";
import { DomainTag, DomainTags } from "@/components/brand/domain-tag";
import { Figure } from "@/components/facts/figure";
import { MarkLine } from "@/components/marks/MarkLine";
import { Inset } from "@/components/articles/inset";
import { TitleBlock } from "@/components/articles/title-block";
import { ColorSwatch } from "@/components/specimen/ColorSwatch";
import { TypeSpecimenRow } from "@/components/specimen/TypeSpecimenRow";
import { ARTICLES } from "@/lib/articles";
import type { Confidence } from "@/lib/facts/types";
import type { Band, TypeToken } from "@/lib/marks";
import { DOMAINS, DOMAIN_LABEL } from "@/lib/site";

// WHY THIS PAGE EXISTS. This is the artifact a design system import reads,
// and it is the drift detector. Everything the brand contains sits on one
// screen, so a wrong token is visible instead of buried in a route. The
// article title rendered at 28px instead of 40px for as long as it did
// precisely because there was no page like this: the bug was two clicks deep
// on one route, not one glance away on this one.
//
// Every component below is imported from where the rest of the site imports
// it. Nothing here is a second copy of a token table, a repainted mark, or a
// stand-in for a real piece of content, with two narrow exceptions, both
// noted where they happen: the color hex and type-metric labels are read
// back from computed style after mount rather than typed in twice, and the
// domain nav pattern in section 4 reuses Masthead's own CSS classes with
// static labels rather than a second instance of Masthead, because Masthead
// derives its active item from the real pathname and can never show one
// active on this route.
//
// Every figure on this page is a placeholder, visibly fake, because this
// repo is public. Zeros are the harder test anyway: tabular figures should
// hold their column when every digit is the same width.

export const metadata: Metadata = {
  title: "Specimen",
  robots: { index: false, follow: false },
};

const COLOR_ROLES: Array<{ varName: string; label: string; job: string }> = [
  {
    varName: "--color-page",
    label: "Page",
    job: "The reading surface. White, never warm.",
  },
  {
    varName: "--color-panel",
    label: "Panel",
    job: "Raised blocks sitting on the page. Always bordered: the tint alone is 1.11 contrast against the page and will not define an edge on its own.",
  },
  {
    varName: "--color-rule",
    label: "Rule",
    job: "Hairlines. Never text.",
  },
  {
    varName: "--color-muted",
    label: "Muted",
    job: "Metadata.",
  },
  {
    varName: "--color-body",
    label: "Body",
    job: "Running copy.",
  },
  {
    varName: "--color-jet",
    label: "Jet",
    job: "Headlines and default prose ink, and Robotics. Also the confidence rule, in all three line styles, regardless of what color the numeral above it is set in.",
  },
  {
    varName: "--color-blue-deep",
    label: "Blue deep",
    job: "Structure and chart outlines, and Space.",
  },
  {
    varName: "--color-blue-bright",
    label: "Blue bright",
    job: "Links, and AI. The tightest value in the system at 4.85 on panel: never long copy, never below 12px.",
  },
  {
    varName: "--color-crimson",
    label: "Crimson",
    job: "Emphasis and kickers, and Energy.",
  },
];

const TYPE_STEPS: Array<{
  token: TypeToken;
  family: "serif" | "sans" | "mono";
  job: string;
  sample: string;
}> = [
  { token: "display", family: "serif", job: "Domain page titles, Home hero", sample: "Energy" },
  { token: "title", family: "serif", job: "Article title, the Articles lead", sample: "An article title" },
  { token: "head", family: "serif", job: "Section heads, list items", sample: "A section head" },
  { token: "subhead", family: "serif", job: "In-article subheads", sample: "A subhead" },
  { token: "standfirst", family: "serif", job: "Standfirst, set in body color", sample: "A standfirst sentence" },
  { token: "body", family: "sans", job: "Running copy", sample: "Running copy reads at this size." },
  { token: "small", family: "sans", job: "Captions, secondary UI", sample: "A caption or secondary line" },
  { token: "ui", family: "sans", job: "Controls, form labels", sample: "A control label" },
  { token: "stat-xl", family: "mono", job: "Home running statistics", sample: "$000.0B" },
  { token: "stat-l", family: "mono", job: "Domain statistics, chart callouts", sample: "$000B" },
  { token: "stat-m", family: "mono", job: "Inset panel figures, table totals", sample: "000" },
  { token: "figure", family: "mono", job: "Any figure inside prose", sample: "000" },
  { token: "meta", family: "mono", job: "Source lines, timestamps, notes", sample: "DOC BR-0000 · REV 00" },
  { token: "label", family: "mono", job: "Domain tags, kickers, column heads, navigation", sample: "COLUMN HEAD" },
];

const SPACE_STEPS = [4, 8, 12, 16, 24, 32, 48, 64, 96, 144] as const;

const SPACE_ASSIGNMENTS: Array<{ relation: string; value: string }> = [
  { relation: "Figure to its own label", value: "8" },
  { relation: "Paragraph to paragraph", value: "24" },
  { relation: "Subhead above / below", value: "48 / 12" },
  { relation: "Panel padding", value: "24" },
  { relation: "Panel above / below", value: "32" },
  { relation: "Section head above / below", value: "96 / 16" },
  { relation: "Module to module, Home", value: "144" },
  { relation: "Page gutter", value: "28 / 20, desktop / mobile — the one value off the scale, carried from BR-LOGO" },
];

// Representative tokens for the three confidence-rule bands. Any token
// mapped to a given band in lib/marks.ts would do; these three were picked
// because they also appear in the type-scale section above.
const BAND_DEMOS: Array<{
  band: Band;
  token: TypeToken;
  family: "serif" | "sans" | "mono";
  label: string;
}> = [
  { band: "1", token: "meta", family: "mono", label: "Band 1, up to 17px — meta" },
  { band: "2", token: "stat-m", family: "mono", label: "Band 2, 18 to 34px — stat-m" },
  { band: "3", token: "title", family: "serif", label: "Band 3, 35px and up — title" },
];

const CONFIDENCES: Confidence[] = ["confirmed", "reported", "derived"];

export default async function SpecimenPage() {
  const lead = ARTICLES[0];
  const { default: Body } = await import(
    `@/content/articles/${lead.slug}.mdx`
  );

  return (
    <div className="specimen view">
      {/* 1. THE LOCKUP */}
      <section className="specimen-section">
        <p className="sechead">01 · The lockup</p>
        <p className="meta">
          xl, md, sm — BR-LOGO Rev 03&apos;s own sizing table. The masthead
          you are looking at right now uses none of these three: its wordmark
          is fixed at 30px, between md&apos;s 36 and sm&apos;s 22, a fourth
          size this table does not name. See the note under this section.
        </p>
        <div className="specimen-surface specimen-surface-page">
          <Logo href="/specimen" size="xl" />
          <Logo href="/specimen" size="md" />
          <Logo href="/specimen" size="sm" />
        </div>
        <div className="specimen-surface specimen-surface-panel">
          <Logo href="/specimen" size="xl" />
          <Logo href="/specimen" size="md" />
          <Logo href="/specimen" size="sm" />
        </div>
        <div className="specimen-surface specimen-surface-jet">
          <Logo href="/specimen" size="xl" />
          <Logo href="/specimen" size="md" />
          <Logo href="/specimen" size="sm" />
        </div>
        <p className="meta">
          On jet, the rule segments and the tagline invert to page white, per
          the foundation doc&apos;s Motion subsection. The wordmark&apos;s
          own domain colors are not confidence marks and stay put. BR-LOGO
          Rev 03&apos;s standalone sheet also shows the wordmark and tagline
          switching to tinted colors on dark (#5B8CFF, #E4586E, #8FA3D6) that
          are not in the closed nine-color palette and are not mentioned in
          the foundation doc. That sheet predates Rev 09&apos;s consolidation
          into a single source of truth; this page follows the doc, not the
          sheet, and does not render those colors. Flagging the conflict
          rather than picking a side.
        </p>
      </section>

      {/* 2. THE MONOGRAM */}
      <section className="specimen-section">
        <p className="sechead">02 · The monogram</p>
        <div className="specimen-surface specimen-surface-page">
          <Monogram size={128} />
          <Monogram size={64} />
          <Monogram size={48} />
          <Monogram size={32} />
          <Monogram size={16} />
        </div>
        <p className="meta">
          Below 32px the two-color overlap fills in and reads as one shape;
          the jet-only variant is the favicon fallback, not a second logo.
        </p>
        <div className="specimen-surface specimen-surface-page">
          <Monogram size={32} variant="mono" />
          <Monogram size={16} variant="mono" />
        </div>
      </section>

      {/* 3. COLOR ROLES */}
      <section className="specimen-section">
        <p className="sechead">03 · Color roles</p>
        <p className="meta">
          Not grouped as primary, secondary, accent: these colors carry
          meaning, not hierarchy. Hex and the custom property name are read
          back from each swatch&apos;s own computed style, not typed in
          twice.
        </p>
        <div className="swatch-row">
          {COLOR_ROLES.map((c) => (
            <ColorSwatch
              key={c.varName}
              varName={c.varName}
              label={c.label}
              job={c.job}
            />
          ))}
        </div>
      </section>

      {/* 4. DOMAIN TAGS AND NAVIGATION */}
      <section className="specimen-section">
        <p className="sechead">04 · Domain tags and navigation</p>
        <DomainTags domains={DOMAINS} />
        <p className="meta">
          The masthead nav pattern, in mono at `label`, one item active in
          jet. This reuses the real `.nav` classes Masthead itself renders
          with, rather than a second Masthead instance: Masthead derives its
          active item from the real page path, which is never one of these
          links on this route, so a second instance here would show nothing
          active and fail to demonstrate the state at all.
        </p>
        <nav className="nav" aria-label="Navigation pattern specimen">
          <a href="/specimen" className="on" aria-current="page">
            Home
          </a>
          <a href="/specimen">Articles</a>
          <span className="sep" />
          {DOMAINS.map((d) => (
            <a key={d} href="/specimen">
              {DOMAIN_LABEL[d]}
            </a>
          ))}
          <span className="sep" />
          <a href="/specimen">Contact</a>
        </nav>
      </section>

      {/* 5. THE TYPE SCALE */}
      <section className="specimen-section">
        <p className="sechead">05 · The type scale</p>
        <p className="meta">
          Fourteen steps. Size, line height, weight, and tracking beside each
          sample are read back from the sample&apos;s own computed style.
        </p>
        <div>
          {TYPE_STEPS.map((t) => (
            <TypeSpecimenRow
              key={t.token}
              token={t.token}
              family={t.family}
              job={t.job}
              sample={t.sample}
            />
          ))}
        </div>
      </section>

      {/* 6. THE HEADING MAP */}
      <section className="specimen-section">
        <p className="sechead">06 · The heading map</p>
        <p className="meta">
          Demonstrated, not described: this is the section that would have
          caught the article title bug. Labels name what each element is set
          in rather than making an editorial claim, because voice is not
          delegable and this is a token demonstration, not a piece.
        </p>
        <div className="art measure">
          <h1 className="article-title">
            An article title, set in `title`, the same step as the Articles
            lead.
          </h1>
          <p>
            Body copy immediately under the title, set in `body`, running
            copy at seventeen pixels.
          </p>
          <h2>A section head, set in `head`, dividing the piece.</h2>
          <p>Body copy under a section head, still `body`.</p>
          <h3>A subhead, set in `subhead`, dividing the section.</h3>
          <p>
            Body copy under a subhead. Nothing in an article body goes below
            `subhead`; a piece that needs a fourth level is structured
            wrong.
          </p>
        </div>
      </section>

      {/* 7. THE CONFIDENCE MARKS */}
      <section className="specimen-section">
        <p className="sechead">07 · The confidence marks</p>

        <p className="meta">All three marks, at all three bands, in CSS.</p>
        {BAND_DEMOS.map((b) => (
          <div key={b.band} className="mark-demo-row">
            <span className="meta">{b.label}</span>
            <span
              className="mark-demo-figures"
              style={{
                fontFamily: `var(--font-${b.family})`,
                fontSize: `var(--text-${b.token}-size)`,
                lineHeight: `var(--text-${b.token}-line)`,
              }}
            >
              {CONFIDENCES.map((c) => (
                <Figure key={c} placeholder="00" confidence={c} scale={b.token} />
              ))}
            </span>
          </div>
        ))}

        <p className="meta">
          The same three, at the same three bands, drawn with MarkLine in
          SVG, directly beneath the CSS versions above for comparison.
        </p>
        {BAND_DEMOS.map((b) => (
          <div key={b.band} className="mark-demo-svg-row">
            <span className="meta">{b.label}</span>
            {CONFIDENCES.map((c) => (
              <MarkLine key={c} confidence={c} band={b.band} length={72} />
            ))}
          </div>
        ))}

        <p className="meta">
          One confirmed figure, repeated in four context colors. All four
          are correct: color is not part of the mark.
        </p>
        <div className="context-color-row">
          <span style={{ color: "var(--color-jet)" }}>
            <Figure placeholder="00" confidence="confirmed" scale="stat-m" />
          </span>
          <span style={{ color: "var(--color-blue-deep)" }}>
            <Figure placeholder="00" confidence="confirmed" scale="stat-m" />
          </span>
          <span style={{ color: "var(--color-crimson)" }}>
            <Figure placeholder="00" confidence="confirmed" scale="stat-m" />
          </span>
          <span style={{ color: "var(--color-blue-bright)" }}>
            <Figure placeholder="00" confidence="confirmed" scale="stat-m" />
          </span>
        </div>

        <p className="meta">A figure at meta, the 12.5px floor.</p>
        <Figure placeholder="00.0" confidence="reported" scale="meta" />

        <p className="meta">
          A stale figure. The flag says the verification aged, not that the
          number is wrong: <Figure id="fixture.energy.grid.capacity_factor" />
          .
        </p>

        <p className="meta">
          The stat-xl band crossing. Below, at desktop width, this renders at
          64px with a band-3 mark. Below 760px it steps to stat-l at 26px
          with a band-2 mark, the same crossing the money band uses. A static
          page cannot show both sides of a media query at once without
          faking a second viewport in an iframe, which would not be a real
          demonstration of the crossing, so: resize the window to see it.
        </p>
        <Figure placeholder="$000.0B" confidence="derived" scale="stat-xl" />
      </section>

      {/* 8. THE SPACE SCALE */}
      <section className="specimen-section">
        <p className="sechead">08 · The space scale</p>
        <p className="meta">
          Equidistant values round up: a value falling exactly between two
          steps takes the larger, so the same input always produces the same
          output. Each bar&apos;s own width is its value; the number beside
          it names the token, not a separately measured fact.
        </p>
        <div className="space-bars">
          {SPACE_STEPS.map((s) => (
            <div key={s} className="space-bar-row">
              <div
                className="space-bar"
                style={{ width: `var(--space-${s})` }}
              />
              <span className="meta">{s}px</span>
            </div>
          ))}
        </div>
        <table className="specimen-table">
          <tbody>
            {SPACE_ASSIGNMENTS.map((a) => (
              <tr key={a.relation}>
                <td className="meta">{a.relation}</td>
                <td className="meta">{a.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 9. THE THREE COLUMN WIDTHS */}
      <section className="specimen-section">
        <p className="sechead">09 · Column widths</p>
        <p className="column-demo-label meta">
          measure — var(--measure-article), 64ch — the article column
        </p>
        <div className="column-demo" style={{ width: "var(--measure-article)" }}>
          <div className="column-demo-inner" />
        </div>
        <p className="column-demo-label meta">
          breakout — var(--width-breakout), 1120px — full-width charts and
          modules inside an article
        </p>
        <div className="column-demo" style={{ width: "var(--width-breakout)" }}>
          <div className="column-demo-inner" />
        </div>
        <p className="column-demo-label meta">
          page bound — var(--width-page), 1180px — Home, Articles, and the
          domain pages. Not yet wired into the shared .shell every route
          actually uses, which reads --width-breakout for all of them; see
          the note at the top of this file.
        </p>
        <div className="column-demo" style={{ width: "var(--width-page)" }}>
          <div className="column-demo-inner" />
        </div>
        <p className="meta">
          The 64ch measure, filled with the real seed article&apos;s real
          body, rendered through the same MDX pipeline the article route
          uses, so the line breaks below are the ones a reader actually
          gets.
        </p>
        <div className="art measure">
          <Body />
        </div>
      </section>

      {/* 10. PANELS, SOURCE LINE, STALE FLAG, TITLE BLOCK */}
      <section className="specimen-section">
        <p className="sechead">10 · Panels and the title block</p>
        <div className="specimen-surface specimen-surface-panel">
          <p className="meta">
            A plain panel: panel background, hairline border.
          </p>
        </div>
        <Inset>
          <p>
            An inset panel, via the real Inset component. Assumptions,
            denominators, and anything a reader can skip without losing the
            argument.
          </p>
        </Inset>
        <p className="meta">
          A source line, set in meta: DOC BR-0000 · REV 00 · UPDATED
          2026-01-01
        </p>
        <p className="meta">
          The real TitleBlock component carries doc id, Rev, updated date,
          and drawn by. It does not carry a source count: the real component
          deliberately omits one until it can be computed from resolved
          records rather than typed in as a plausible integer, per its own
          comment. Shown as-is, not extended for this page.
        </p>
        <TitleBlock article={lead} />
      </section>
    </div>
  );
}
