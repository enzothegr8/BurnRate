import { ConfidenceDemo } from "@/components/styleguide/confidence-demo";
import { Figure } from "@/components/ui/figure";
import { TitleBlock } from "@/components/ui/title-block";
import { resolveFact, resolveLedgerRow } from "@/lib/facts/store";

/**
 * Internal reference page. The three underline states with real records, the
 * runtime confidence demo, the type scale, the palette, and a title block.
 * Nothing else ships on this route.
 */

export const metadata = {
  title: "Styleguide · Burn Rate",
};

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <header className="mb-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">{kicker}</p>
      <h2 className="mt-1 font-display text-4xl text-ink">{title}</h2>
    </header>
  );
}

const PALETTE = [
  { name: "Vellum", hex: "#EAEBE5", role: "Page background, always. The signature." },
  { name: "Card", hex: "#F5F6F2", role: "Raised surfaces, rare." },
  { name: "Rule", hex: "#D3D6CE", role: "Hairlines and dividers." },
  { name: "Muted", hex: "#8C9198", role: "Labels, metadata, the reported dash." },
  { name: "Secondary", hex: "#565A5F", role: "Supporting copy, links." },
  { name: "Ink", hex: "#16181B", role: "Body text, confirmed underline, hollow bar outlines." },
  { name: "Orange", hex: "#E8410A", role: "Emphasis only. Once per section, always means look here." },
  { name: "Ochre", hex: "#A8823C", role: "The derived dotted line only." },
];

const SERIES = ["#E8410A", "#37535F", "#A8823C", "#6E7F63", "#8C9198"];

export default function Styleguide() {
  const astrobotic = resolveLedgerRow("moonbase.award.astrobotic.2026-06-30");
  const blueOrigin = resolveLedgerRow("moonbase.award.blue-origin.2026-05-26");
  const burnPerSecond = resolveFact("economy.burn_per_second");

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <header className="mb-16 border-b border-rule pb-8">
        <h1 className="font-display text-6xl text-ink">Burn Rate</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted">
          BR-STYLE · Internal reference · Not a public page
        </p>
      </header>

      <section className="mb-16 border-b border-rule pb-16">
        <SectionHeading kicker="Section 01" title="The notation" />
        <p className="mb-8 max-w-prose font-sans text-sm leading-relaxed text-secondary">
          Confidence maps to the underline and nothing else does. Hover or focus any figure
          to read its notes, which travel with the record to every render site.
        </p>
        <dl className="space-y-6">
          <div className="flex items-baseline justify-between gap-6 border-b border-rule pb-4">
            <dt className="font-sans text-sm text-secondary">
              Confirmed. Primary source, verifiable, unambiguous. Astrobotic, two lander
              missions, June 30, 2026.
            </dt>
            <dd className="font-mono text-2xl text-ink">
              <Figure fact={astrobotic} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6 border-b border-rule pb-4">
            <dt className="font-sans text-sm text-secondary">
              Reported. Credible but not verifiable to a single primary framing. Blue
              Origin&apos;s LTV delivery award, stated four ways across credible sources.
            </dt>
            <dd className="font-mono text-2xl text-ink">
              <Figure fact={blueOrigin} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6 border-b border-rule pb-4">
            <dt className="font-sans text-sm text-secondary">
              Derived. Burn Rate&apos;s own arithmetic, dotted by construction, recomputed
              from the stored formula on every render. 2024&apos;s annual figure divided
              into seconds.
            </dt>
            <dd className="font-mono text-2xl text-ink">
              <Figure fact={burnPerSecond} format="full" suffix="/sec" />
            </dd>
          </div>
        </dl>
      </section>

      <section className="mb-16 border-b border-rule pb-16">
        <SectionHeading kicker="Section 02" title="Confidence is runtime state" />
        <p className="mb-8 max-w-prose font-sans text-sm leading-relaxed text-secondary">
          The underline follows the record&apos;s confidence at render time. Nothing bakes
          it in and nothing memoizes it away, because a later module needs numbers to
          visibly lose confidence the moment a user edits them.
        </p>
        <ConfidenceDemo initial={astrobotic} />
      </section>

      <section className="mb-16 border-b border-rule pb-16">
        <SectionHeading kicker="Section 03" title="Type" />
        <div className="space-y-8">
          <div className="border-b border-rule pb-6">
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
              Instrument Serif · display · regular and italic only, there is no bold
            </p>
            <p className="mt-2 font-display text-6xl text-ink">Money is propellant.</p>
            <p className="mt-2 font-display text-3xl italic text-ink">
              A budget is a promise, and promises are not receipts.
            </p>
          </div>
          <div className="border-b border-rule pb-6">
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
              IBM Plex Sans · body and UI · subheads take weight from Plex Sans
            </p>
            <p className="mt-2 max-w-prose font-sans text-base leading-relaxed text-ink">
              The register is cold and clear, not awed and not snide. The interesting
              number is almost never the published one.
            </p>
            <p className="mt-2 font-sans text-sm font-semibold text-ink">
              A subhead that needs weight, set in Plex Sans semibold.
            </p>
          </div>
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
              IBM Plex Mono · every number, label, timestamp, and source line ·
              tabular-nums by base rule
            </p>
            <div className="mt-2 space-y-0.5 font-mono text-sm text-ink">
              <p>1,111,111.00</p>
              <p>2,468,024.68</p>
              <p>297,900,000.00</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16 border-b border-rule pb-16">
        <SectionHeading kicker="Section 04" title="Color" />
        <ul>
          {PALETTE.map((swatch) => (
            <li
              key={swatch.hex}
              className="flex items-center gap-4 border-b border-rule py-3"
            >
              <span
                className="h-8 w-16 shrink-0 border border-rule"
                style={{ backgroundColor: swatch.hex }}
              />
              <span className="w-24 font-mono text-xs text-ink">{swatch.name}</span>
              <span className="w-20 font-mono text-xs text-muted">{swatch.hex}</span>
              <span className="font-sans text-xs text-secondary">{swatch.role}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-widest text-muted">
          Series palette · charts with genuinely real categories only
        </p>
        <div className="mt-2 flex gap-px">
          {SERIES.map((hex) => (
            <span key={hex} className="h-8 w-16 border border-rule" style={{ backgroundColor: hex }} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading kicker="Section 05" title="The title block" />
        <p className="mb-8 max-w-prose font-sans text-sm leading-relaxed text-secondary">
          Engineering drawing convention at the foot of anything with numbers in it. The
          revision number is orange, because the revision is the thing that changed.
        </p>
        <TitleBlock
          doc="BR-STYLE"
          rev="01"
          updated="2026-07-17"
          sources={[
            {
              name: "NASA, NASA Provides Update on Moon Base Rovers, Landers, Missions",
              url: "https://www.nasa.gov/news-release/nasa-provides-update-on-moon-base-rovers-landers-missions/",
              tier: 1,
              retrieved_at: "2026-07-17",
            },
            {
              name: "NASA, NASA Awards More Moon Base Science, Previews New Opportunities",
              url: "https://www.nasa.gov/news-release/nasa-awards-more-moon-base-science-previews-new-opportunities/",
              tier: 1,
              retrieved_at: "2026-07-17",
            },
            {
              name: "Firefly Aerospace, $75M NASA JPL MoonFall subcontract release",
              url: "https://fireflyspace.com/news/firefly-aerospace-wins-75-million-nasa-jpl-moonfall-subcontract-to-deliver-drones-to-the-moons-south-pole/",
              tier: 1,
              retrieved_at: "2026-07-17",
            },
            {
              name: "NASA, NextSTEP-3 B: Moon Base Demonstrations",
              url: "https://www.nasa.gov/general/nextstep-3-b-moon-base-demonstrations/",
              tier: 1,
              retrieved_at: "2026-07-17",
            },
            {
              name: "NASA, Building the Moon Base presentation, Ignition event",
              url: "https://www.nasa.gov/wp-content/uploads/2026/03/2-building-the-moon-base.pdf",
              tier: 1,
              retrieved_at: "2026-07-17",
            },
            {
              name: "Space Foundation, The Space Report 2025 Q2 press release",
              url: "https://www.spacefoundation.org/2025/07/22/the-space-report-2025-q2/",
              tier: 1,
              retrieved_at: "2026-07-17",
            },
          ]}
        />
      </section>
    </main>
  );
}
