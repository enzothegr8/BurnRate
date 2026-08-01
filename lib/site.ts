// Structure and placeholder content for the mock build.
//
// Nothing in here is a claim. The headlines, ledes, and dates exist to prove the
// layout holds at real proportions, and every one of them is replaced when Enzo
// writes. Figures live as marked placeholders in the pages themselves rather
// than here, because there is no fact store yet and a number without a record
// has nowhere legitimate to live.

export const DOMAINS = ["space", "ai", "robotics", "energy"] as const;

export type Domain = (typeof DOMAINS)[number];

// Fixed presentation order, not a ranking. All four sit at equal visibility.
export const DOMAIN_LABEL: Record<Domain, string> = {
  space: "Space",
  ai: "AI",
  robotics: "Robotics",
  energy: "Energy",
};

export type Article = {
  slug: string;
  title: string;
  standfirst: string;
  dek: string;
  kicker: string;
  domains: Domain[];
  date: string;
  rev: string;
  sources: string;
};

// Newest first. The first entry is the lead everywhere it appears.
export const ARTICLES: Article[] = [
  {
    slug: "orbital-datacenters-energy-bet",
    title:
      "Orbital datacenters are an energy bet wearing a space costume.",
    standfirst:
      "Launch mass is priced in joules, which makes this an energy question that happens to take place in orbit.",
    dek: "The pitch is free cooling and uninterrupted sun. The bill is launch mass, and launch mass is priced in joules. Until someone publishes delivered watts per kilogram on orbit, every projection in this category is an argument about physics dressed as a financial model.",
    kicker: "Analysis",
    domains: ["space", "ai", "energy"],
    date: "2026-07-31",
    rev: "01",
    sources: "4",
  },
  {
    slug: "interconnection-queue-binding-constraint",
    title:
      "The interconnection queue is now the binding constraint on training",
    standfirst:
      "Compute budgets clear faster than the grid can physically deliver, and the gap is measured in years.",
    dek: "Compute budgets are approved faster than the grid can physically deliver, and the gap is measured in years rather than percent.",
    kicker: "Analysis",
    domains: ["ai", "energy"],
    date: "2026-07-28",
    rev: "02",
    sources: "6",
  },
  {
    slug: "humanoid-unit-economics-labor-number",
    title:
      "Humanoid unit economics depend on a labor number nobody publishes",
    standfirst:
      "Every deployment case rests on a fully loaded hourly cost that no operator discloses.",
    dek: "Every deployment case rests on a fully loaded hourly cost that no operator discloses and no analyst can verify.",
    kicker: "Analysis",
    domains: ["robotics"],
    date: "2026-07-24",
    rev: "01",
    sources: "3",
  },
  {
    slug: "three-providers-one-engine-supplier",
    title: "Three launch providers, one engine supplier, one point of failure",
    standfirst:
      "Supplier concentration is the risk nobody prices, because it sits on nobody's balance sheet.",
    dek: "Supplier concentration is the risk nobody prices, because it does not appear on anybody's balance sheet until it does.",
    kicker: "Analysis",
    domains: ["space"],
    date: "2026-07-21",
    rev: "01",
    sources: "5",
  },
  {
    slug: "manipulation-models-robotics-story-ai-budget",
    title: "Manipulation models are a robotics story with an AI budget",
    standfirst:
      "The capital is raised on model performance and spent on hardware that has to survive a floor.",
    dek: "The capital is raised on model performance and spent on hardware that has to survive a warehouse floor.",
    kicker: "Analysis",
    domains: ["ai", "robotics"],
    date: "2026-07-17",
    rev: "03",
    sources: "4",
  },
  {
    slug: "what-a-gigawatt-costs",
    title: "What a gigawatt actually costs, and who signed for it",
    standfirst:
      "Announced, contracted, and energized are three different numbers wearing one word.",
    dek: "Announced capacity, contracted capacity, and energized capacity are three different numbers wearing one word.",
    kicker: "Analysis",
    domains: ["energy"],
    date: "2026-07-14",
    rev: "01",
    sources: "7",
  },
  {
    slug: "lunar-surface-power-solicitation-no-award",
    title: "Lunar surface power has a solicitation and no award",
    standfirst:
      "The absence is the finding. Nobody publishes a zero, so the zero has to be counted.",
    dek: "The absence is the finding. Nobody publishes a zero, so the zero has to be counted rather than cited.",
    kicker: "Analysis",
    domains: ["space", "energy"],
    date: "2026-07-10",
    rev: "02",
    sources: "4",
  },
  {
    slug: "four-industries-eleven-suppliers",
    title: "The four industries are buying from the same eleven suppliers",
    standfirst:
      "Concentration that looks manageable inside one sector looks different counted across four.",
    dek: "Concentration that looks manageable inside one sector looks different once you count across all four.",
    kicker: "Analysis",
    domains: ["space", "ai", "robotics", "energy"],
    date: "2026-07-06",
    rev: "01",
    sources: "9",
  },
];

export function articlesInDomain(domain: Domain): Article[] {
  return ARTICLES.filter((a) => a.domains.includes(domain));
}

export function articleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

// Placeholder domain statistics. Deliberately unreadable as claims: this repo
// is public and a plausible fake figure in a publication built on marking its
// numbers is the worst thing it could ship.
export const DOMAIN_STATS: Record<
  Domain,
  { value: string; confidence: "confirmed" | "reported" | "derived"; caption: string }[]
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
