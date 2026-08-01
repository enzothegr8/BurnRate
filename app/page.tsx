import { LeadTeaser } from "@/components/home/lead-teaser";
import { MoneyBand } from "@/components/home/money-band";
import { ARTICLES } from "@/lib/articles";

// Home is not the articles page. It carries the running statistics, the latest
// piece only at full lead scale, and slots for the interactive work that is
// meant to live here once there is any.

export default function Home() {
  const lead = ARTICLES[0];

  return (
    <section className="view">
      <MoneyBand />

      <div className="split">
        <div>
          <p className="sechead">Latest</p>
          <div style={{ paddingTop: 22 }}>
            <LeadTeaser article={lead} />
          </div>
        </div>

        <div>
          <p className="sechead">Interactive</p>
          <div style={{ paddingTop: 22 }}>
            <div className="mod">
              <p className="lab">Module slot</p>
              <p className="desc">
                Interactive module. A tracker, a calculator, or an explorable
                chart the reader can manipulate.
              </p>
            </div>
            <div className="mod">
              <p className="lab">Module slot</p>
              <p className="desc">
                Animation or video, embedded to match the site rather than
                dropped in.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 52 }} />

      <p className="sechead">Elsewhere on the site</p>
      <div className="modgrid" style={{ paddingTop: 22 }}>
        <div className="mod">
          <p className="lab">Slot</p>
          <p className="desc">
            Standing tracker, updated on its own cadence rather than when
            something is published.
          </p>
        </div>
        <div className="mod">
          <p className="lab">Slot</p>
          <p className="desc">
            Newsletter, forum, or whatever earns the space once there is
            something to put here.
          </p>
        </div>
      </div>
    </section>
  );
}
