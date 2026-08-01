// Raw values in, formatted strings out. A record never stores a pre-formatted
// value, because the moment it does there are two numbers to keep in step and
// one of them is a string nobody validates.
//
// The prefix is chosen at render, per unit, so a figure reads the way a person
// would say it: 450MW rather than 0.45GW, $1.29B rather than $1290M.

import type { Unit } from "./types";

const MONEY_STEPS = [
  { at: 1e12, suffix: "T" },
  { at: 1e9, suffix: "B" },
  { at: 1e6, suffix: "M" },
  { at: 1e3, suffix: "K" },
] as const;

// SI, for quantities that are genuinely SI. Note that kg is absent: it already
// carries a prefix, and rescaling it into tonnes is a unit conversion, which is
// a derivation with a rate and a date rather than a formatting choice.
const SI_STEPS = [
  { at: 1e18, suffix: "E" },
  { at: 1e15, suffix: "P" },
  { at: 1e12, suffix: "T" },
  { at: 1e9, suffix: "G" },
  { at: 1e6, suffix: "M" },
  { at: 1e3, suffix: "k" },
] as const;

/** Three significant figures, trailing zeros dropped. 1.29, 45.6, 450. */
function mantissa(value: number): string {
  const abs = Math.abs(value);
  const decimals = abs < 10 ? 2 : abs < 100 ? 1 : 0;
  return String(Number(value.toFixed(decimals)));
}

function scale(
  value: number,
  steps: readonly { at: number; suffix: string }[],
): { text: string; suffix: string } | null {
  const abs = Math.abs(value);
  for (const step of steps) {
    if (abs >= step.at) {
      return { text: mantissa(value / step.at), suffix: step.suffix };
    }
  }
  return null;
}

function plain(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function money(value: number): string {
  const scaled = scale(value, MONEY_STEPS);
  const sign = value < 0 ? "-" : "";
  if (!scaled) return `${sign}$${plain(Math.abs(value))}`;
  return `${sign}$${scaled.text.replace("-", "")}${scaled.suffix}`;
}

function si(value: number, unit: string): string {
  const scaled = scale(value, SI_STEPS);
  if (!scaled) return `${plain(value)}${unit}`;
  return `${scaled.text}${scaled.suffix}${unit}`;
}

export function format(value: number, unit: Unit): string {
  switch (unit) {
    case "USD":
      return money(value);

    case "USD_per_kg":
      return `${money(value)}/kg`;
    case "USD_per_W":
      return `${money(value)}/W`;
    case "USD_per_MWh":
      return `${money(value)}/MWh`;

    case "W":
      return si(value, "W");
    case "Wh":
      return si(value, "Wh");
    case "FLOP":
      return si(value, "FLOP");
    case "tokens":
      return si(value, "tokens");

    // kg keeps its own prefix. See the note on SI_STEPS.
    case "kg":
      return `${plain(value)}kg`;

    case "count":
      return plain(value);

    case "percent":
      return `${plain(value)}%`;

    // A capacity factor is a ratio between zero and one, rendered the way the
    // industry says it. This is a presentation of the same quantity, not a
    // conversion, so it does not make the figure derived.
    case "capacity_factor":
      return `${Number((value * 100).toFixed(1))}%`;

    case "days":
      return `${plain(value)} days`;
    case "years":
      return `${plain(value)} years`;
  }
}
