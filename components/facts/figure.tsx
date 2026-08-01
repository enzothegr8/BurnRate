// The confidence mark. Solid is confirmed, dashed is reported, dotted is
// derived, and confidence is the only thing in this system that maps to an
// underline. The mark carries no color: see the numbers standard in section 4
// of the foundation doc. There is no color prop on this component and no path
// by which a caller sets the numeral's color through it; the numeral inherits
// whatever color its context sets, the domain color on a domain page, a
// series color in a chart, jet by default in prose.
//
// There are exactly two ways to render a number and both of them are named.
//
//   <Figure id="..." />                              a record in the store
//   <Figure placeholder="$000B" confidence="..." />  scaffolding, visibly fake
//
// The union below makes those mutually exclusive, so there is no third way that
// quietly accepts a raw value with a mark somebody typed. That third way is how
// an unmarked claim gets onto a page: not by anyone deciding to publish one, but
// by a component being accommodating.
//
// A caller cannot override the mark on a real record. The confidence comes from
// the store, and for a derived record it comes from the type system, which has
// no confidence field to read.
//
// `scale` names the type token this figure is set at, which selects the
// confidence rule's band (lib/marks.ts, TYPE_BAND). It defaults to `figure`,
// the token for a number sitting inline in prose. A caller inside a stat
// panel or a running statistic names its own token, e.g. `stat-m`, so the
// rule is drawn at the width and offset that size actually needs, band 1's
// hairline under a 22px figure reads as broken, not confident.

import { format } from "@/lib/facts/format";
import { resolveFact } from "@/lib/facts/store";
import type { Confidence } from "@/lib/facts/types";
import { TYPE_BAND, type TypeToken } from "@/lib/marks";

const MARK: Record<Confidence, string> = {
  confirmed: "cf",
  reported: "rp",
  derived: "dv",
};

type ScaleProps = { scale?: TypeToken };

type FigureProps = ScaleProps &
  (
    | { id: string; placeholder?: never; confidence?: never }
    | { placeholder: string; confidence: Confidence; id?: never }
  );

// stat-xl is the one step that crosses bands on its own: it drops from 64px
// to 40px at 760px, which moves its confidence rule from band 3 to band 2.
// app/globals.css carries the media query that redraws the rule at that
// width, keyed off this class; every other token stays in one band at every
// width, so no other scale needs it.
function bandClassName(scale: TypeToken): string {
  const band = `band-${TYPE_BAND[scale]}`;
  return scale === "stat-xl" ? `${band} mark-stat-xl` : band;
}

export function Figure({ scale = "figure", ...props }: FigureProps) {
  const bandClass = bandClassName(scale);

  if (props.id !== undefined) {
    const fact = resolveFact(props.id);
    // Failing loudly is the point. A figure whose record has gone missing is a
    // claim with no provenance, and rendering a blank or a dash would hide that
    // behind something that looks deliberate.
    if (!fact) {
      throw new Error(
        `<Figure id="${props.id}" /> has no record. Every number renders from the fact store, so a missing record is a build failure rather than an empty span.`,
      );
    }
    return (
      <span
        className={`num ${MARK[fact.confidence]} ${bandClass}`}
        title={fact.stale ? `${fact.label}. Verification has aged.` : fact.label}
        data-stale={fact.stale ? "true" : undefined}
      >
        {format(fact.value, fact.unit)}
        {/* Stale figures render flagged, never hidden. */}
        {fact.stale && <span className="stale-flag">*</span>}
      </span>
    );
  }

  return (
    <span className={`num ${MARK[props.confidence]} ${bandClass}`}>
      {props.placeholder}
    </span>
  );
}
