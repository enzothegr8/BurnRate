// Structure and placeholder scaffolding for the site shell.
//
// Articles no longer live here. They are MDX files read by lib/articles.ts, so
// there is one place a piece exists and one place it is validated.
//
// The domain list is re-exported from the fact store types rather than declared
// again, because a second copy of an enum is a second thing to keep in step.

import { DOMAINS, type Domain } from "@/lib/facts/types";
import type { Confidence } from "@/lib/facts/types";

export { DOMAINS };
export type { Domain };

// Fixed presentation order, not a ranking. All four sit at equal visibility.
export const DOMAIN_LABEL: Record<Domain, string> = {
  space: "Space",
  ai: "AI",
  robotics: "Robotics",
  energy: "Energy",
};

// Placeholder domain statistics. Deliberately unreadable as claims: this repo
// is public and a plausible fake figure in a publication built on marking its
// numbers is the worst thing it could ship. These carry an explicit placeholder
// prop rather than a value, so nothing here can be mistaken for a record.
export const DOMAIN_STATS: Record<
  Domain,
  { value: string; confidence: Confidence; caption: string }[]
> = {
  space: [
    { value: "$000B", confidence: "reported", caption: "Placeholder statistic" },
    { value: "00", confidence: "confirmed", caption: "Placeholder statistic" },
    { value: "$0.00/kg", confidence: "derived", caption: "Placeholder derived figure" },
  ],
  ai: [
    { value: "$000B", confidence: "reported", caption: "Placeholder statistic" },
    { value: "000TWh", confidence: "reported", caption: "Placeholder statistic" },
    { value: "$00.0/W", confidence: "derived", caption: "Placeholder derived figure" },
  ],
  robotics: [
    { value: "$00B", confidence: "derived", caption: "Placeholder derived figure" },
    { value: "000,000", confidence: "reported", caption: "Placeholder statistic" },
    { value: "00", confidence: "confirmed", caption: "Placeholder statistic" },
  ],
  energy: [
    { value: "$0.0T", confidence: "reported", caption: "Placeholder statistic" },
    { value: "0,000GW", confidence: "reported", caption: "Placeholder statistic" },
    { value: "$00/MWh", confidence: "derived", caption: "Placeholder derived figure" },
  ],
};

export const DOMAIN_MODULE_DESC: Record<Domain, string> = {
  space:
    "Something specific to this domain. A launch manifest, a contract ledger, an interactive the other three pages do not have.",
  ai: "Something specific to this domain. A capex tracker, a cluster map, an explorable model of announced against delivered.",
  robotics:
    "Something specific to this domain. A deployment ledger, a unit economics model, a funding record.",
  energy:
    "Something specific to this domain. An interconnection queue view, a PPA ledger, a cost-per-watt explorer.",
};
