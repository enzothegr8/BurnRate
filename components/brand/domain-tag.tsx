// Filled rectangle, page-colored uppercase mono type, letterspaced, small.
// Outlined tags, dot-and-label, and uncolored labels are all rejected.

import { DOMAINS, DOMAIN_LABEL, type Domain } from "@/lib/site";

export function DomainTag({ domain }: { domain: Domain }) {
  return <span className={`tag t-${domain}`}>{DOMAIN_LABEL[domain]}</span>;
}

// Renders in the fixed order Space, AI, Robotics, Energy regardless of the
// order they arrive in. The order is a presentation convention and it is not
// the caller's to decide.
export function DomainTags({ domains }: { domains: readonly Domain[] }) {
  const shown = DOMAINS.filter((d) => domains.includes(d));
  return (
    <div className="tags">
      {shown.map((d) => (
        <DomainTag key={d} domain={d} />
      ))}
    </div>
  );
}
