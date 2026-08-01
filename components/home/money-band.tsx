"use client";

import { useEffect, useState } from "react";
import band from "@/data/money-band.json";
import { Figure } from "@/components/facts/figure";
import { DOMAINS, DOMAIN_LABEL, type Domain } from "@/lib/site";

// The running total is year to date: the annual figure multiplied by the
// fraction of the calendar year elapsed, recomputed often enough that the last
// digits visibly whirl.
//
// Everything on this band except the annual figure is Burn Rate's own
// arithmetic, so the running total and the rate are dotted and the annual
// figure is dashed. That is not decoration. A reader who cannot tell which of
// these numbers somebody published and which one we computed is being misled by
// the design.
//
// Four full-width rows, one per domain, per Rev 13 of the foundation doc: a
// visibly whirling running total needs about twelve significant digits, and
// eighteen characters at stat-xl is wider than half the page bound, so no
// column count above one fits it. Two by two, tried first, did not. Rows also
// keep the four domains from reading as a set the way one line would. The
// four are never summed regardless of arrangement. The categories overlap,
// the overlap is not quantified, and the caption under the band says so to
// the reader while a validator says so to the code.
//
// The running total renders through <Figure scale="stat-xl" />. Below 760px
// it steps to stat-l instead of just compressing stat-xl's own size, which
// app/globals.css handles via the same .mark-stat-xl class Figure already
// applies for the confidence rule's band crossing, so the token swap and the
// mark's band both key off one class instead of two mechanisms drifting
// apart.

const ANNUAL = band.annual_usd as Record<Domain, number>;
const SHARE = band.regional_share as Record<string, Record<Domain, number>>;

function boundsFor(timestamp: number) {
  const year = new Date(timestamp).getFullYear();
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();
  return { year, start, seconds: (end - start) / 1000 };
}

function money(n: number) {
  return `$${Math.floor(n).toLocaleString("en-US")}`;
}

function annualLabel(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1).replace(/\.0$/, "")}T`;
  return `$${Math.round(n / 1e9)}B`;
}

function rateLabel(n: number) {
  if (n >= 100) return `$${Math.round(n).toLocaleString("en-US")}/sec`;
  return `$${n.toFixed(2)}/sec`;
}

export function MoneyBand() {
  const [region, setRegion] = useState("global");
  // Null until the first tick on the client. The counter depends on the current
  // time, so there is no honest value to render on the server, and inventing
  // one produces a hydration mismatch on a number that is supposed to be exact.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 90);
    return () => clearInterval(id);
  }, []);

  const bounds = now === null ? null : boundsFor(now);
  const elapsedFraction =
    bounds && now !== null
      ? (now - bounds.start) / 1000 / bounds.seconds
      : 0;

  return (
    <>
      <div className="moneybar">
        <p className="h">
          Where the money is · spent so far in {bounds?.year ?? "this year"}
        </p>
        <div className="filters">
          {band.regions.map((r) => (
            <span
              key={r.id}
              className={`fchip${region === r.id ? " on" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => setRegion(r.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setRegion(r.id);
              }}
            >
              {r.label}
            </span>
          ))}
        </div>
      </div>

      <div className="money-rows">
        {DOMAINS.map((d) => {
          const annual = ANNUAL[d] * SHARE[region][d];
          return (
            <div key={d} className={`money-row d-${d}`}>
              <p className="dom">{DOMAIN_LABEL[d]}</p>
              <div className="money-figures">
                <span className="ticker">
                  <Figure
                    placeholder={money(annual * elapsedFraction)}
                    confidence="derived"
                    scale="stat-xl"
                  />
                </span>
                <span className="rate band-2">
                  {bounds ? rateLabel(annual / bounds.seconds) : "$0/sec"}
                </span>
                <p className="src">
                  of <span className="an rp">{annualLabel(annual)}</span> for
                  the year
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Required, and not optional. The band would otherwise imply both that
          the annual figures are ours and that the four can be added. */}
      <p
        className="meta"
        style={{ margin: "var(--space-16) 0 var(--space-48)" }}
      >
        Annual figures are <span className="rp">reported</span>, placeholder in
        this build. Rates and running totals are Burn Rate&apos;s own arithmetic
        and are therefore <span className="dv">derived</span>, always.
        <br />
        These four are not added together. The categories overlap and the
        overlap is not quantified.
      </p>
    </>
  );
}
