// The confidence notation's geometry, in one place. Solid, dashed, and dotted
// only mean what they claim to mean if every rendering, CSS border or SVG
// stroke, draws the same dash and dot pattern at the same width. This is that
// single source, read by app/globals.css (via the --mark-* custom properties
// it sets per band) and by components/marks/MarkLine.tsx (via the exports
// below) so a chart and a paragraph draw the identical mark.
//
// docs/brand-foundation.md, section 3 "Type" (the confidence rule's three
// size bands) and section 3 "Motion, 3D, and other renderings" (the
// non-CSS geometry: dash arrays, caps, coverage).

import type { Confidence } from "./facts/types";

export type Band = "1" | "2" | "3";

// Type steps that carry a fixed size, banded by that size. `figure` has no
// fixed size of its own (0.94em, relative to whatever it sits inside) so it
// is not in the table above the type below; callers of the mark geometry that
// do not know their context default to band 1, since prose figures sit in the
// body/small size range regardless of what they scale from.
export type TypeToken =
  | "display"
  | "title"
  | "head"
  | "subhead"
  | "standfirst"
  | "body"
  | "small"
  | "ui"
  | "stat-xl"
  | "stat-l"
  | "stat-m"
  | "figure"
  | "meta"
  | "label";

// Band 1 up to 17px, band 2 from 18 to 34, band 3 from 35 and up. `stat-xl`
// is banded here at its desktop size (64px, band 3); it crosses to band 2 at
// 760px because the step itself drops to 40px there. That crossing is drawn
// in app/globals.css as a media query on the `.mark-stat-xl` class Figure
// applies, not as a second entry here, because TYPE_BAND describes the
// desktop scale and the doc is explicit that the crossing is a component
// concern, not a token one.
export const TYPE_BAND: Record<TypeToken, Band> = {
  display: "3",
  title: "3",
  head: "2",
  subhead: "2",
  standfirst: "2",
  body: "1",
  small: "1",
  ui: "1",
  "stat-xl": "3",
  "stat-l": "2",
  "stat-m": "2",
  figure: "1",
  meta: "1",
  label: "1",
};

type BandGeometry = {
  solid: number;
  dashed: number;
  dotted: number;
  /** The gap between the numeral's baseline and the rule, in em. */
  offset: string;
};

// Transcribed exactly from the confidence rule table. Dotted is heavier than
// solid at every band on purpose: a dot covers roughly half the length a
// solid rule does and would otherwise read as the faintest mark in the
// system. It is a kind, not a degree.
export const BAND_GEOMETRY: Record<Band, BandGeometry> = {
  "1": { solid: 1, dashed: 1, dotted: 1.5, offset: "0.14em" },
  "2": { solid: 2, dashed: 2, dotted: 2.5, offset: "0.12em" },
  "3": { solid: 3, dashed: 3, dotted: 4, offset: "0.10em" },
};

export function bandForToken(token: TypeToken): Band {
  return TYPE_BAND[token];
}

/** The rule's stroke width for a given confidence at a given band. */
export function strokeWidth(confidence: Confidence, band: Band): number {
  const g = BAND_GEOMETRY[band];
  switch (confidence) {
    case "confirmed":
      return g.solid;
    case "reported":
      return g.dashed;
    case "derived":
      return g.dotted;
  }
}

export function offsetFor(band: Band): string {
  return BAND_GEOMETRY[band].offset;
}

// ---------------------------------------------------------------------------
// Geometry for media without border-bottom: SVG, canvas, WebGL, video. The
// mark must be reproducible outside CSS, so stroke pattern and cap are
// specified rather than left to the renderer.
// ---------------------------------------------------------------------------

export type LineCap = "butt" | "round";

const CAP: Record<Confidence, LineCap> = {
  confirmed: "butt",
  reported: "butt",
  derived: "round",
};

export function lineCap(confidence: Confidence): LineCap {
  return CAP[confidence];
}

/**
 * SVG stroke-dasharray, in the same units as strokeWidth. Undefined for
 * confirmed, which is continuous. Reported is 3x stroke on, 2x off. Derived
 * is round-capped zero-length dashes spaced 2x stroke centre to centre: a
 * zero-length dash under a round cap draws a dot one stroke-width wide, and a
 * gap of 2x the width puts each dot's centre 2x apart.
 */
export function dashArray(
  confidence: Confidence,
  band: Band,
): [number, number] | undefined {
  const width = strokeWidth(confidence, band);
  switch (confidence) {
    case "confirmed":
      return undefined;
    case "reported":
      return [width * 3, width * 2];
    case "derived":
      return [0, width * 2];
  }
}

/** Fraction of the rule's length that is actually ink, band-independent. */
export const COVERAGE: Record<Confidence, number> = {
  confirmed: 1,
  reported: 0.6,
  derived: 0.5,
};
