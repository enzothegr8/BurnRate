"use client";

import { useEffect, useRef, useState } from "react";
import { Figure } from "@/components/ui/figure";
import type { ResolvedFact } from "@/lib/facts/types";

/**
 * The counter (brand-bible.md section 9). An annual figure divided into
 * seconds, ticking. It is a rate visualization, not a measurement, and the
 * page says so in type, not in a tooltip. The rate is recomputed from the
 * stored formula at render time and arrives here as a resolved derived fact;
 * nothing in this file knows the number 19438.
 *
 * prefers-reduced-motion freezes the ticker and shows the rate as a static
 * figure. The static view is also the server-rendered default, so no motion
 * ever flashes before the preference is known.
 */

interface CounterProps {
  /** economy.burn_per_second, resolved. Derived, dotted. */
  rate: Extract<ResolvedFact, { kind: "derived" }>;
  /** economy.global.2024, resolved. Carries its own mark. */
  source: ResolvedFact;
}

const TICK_MS = 100;

export function Counter({ rate, source }: CounterProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [ticking, setTicking] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    setTicking(true);
    startRef.current = performance.now();
    const id = window.setInterval(() => {
      if (startRef.current !== null) {
        setElapsedMs(performance.now() - startRef.current);
      }
    }, TICK_MS);
    const onChange = () => {
      if (media.matches) {
        setTicking(false);
        window.clearInterval(id);
      }
    };
    media.addEventListener("change", onChange);
    return () => {
      window.clearInterval(id);
      media.removeEventListener("change", onChange);
    };
  }, []);

  const accumulated: ResolvedFact = {
    kind: "derived",
    id: "economy.burn_since_open",
    value: rate.value * (elapsedMs / 1000),
    unit: "USD",
    label: "Global space spending since you opened this page, at 2024's rate",
    formula: "economy.burn_per_second * seconds_since_page_open",
    derived_from: ["economy.burn_per_second"],
    lowestInputConfidence: rate.lowestInputConfidence,
    notes:
      "Rate visualization, not a measurement. 2024's annual estimate divided into seconds and multiplied by the time this page has been open. Nothing is being metered.",
    stale: rate.stale,
  };

  return (
    <div>
      {/* TODO(Enzo): claim sentence slot for the counter. Proposal: "$613
          billion a year only looks abstract until you watch it move." Slot
          stays empty until you write or approve one; voice is not delegable. */}
      <div className="font-mono text-6xl text-ink sm:text-7xl md:text-8xl">
        {ticking ? (
          <Figure fact={accumulated} format="full" />
        ) : (
          <Figure fact={rate} format="full" suffix="/sec" />
        )}
      </div>
      <div className="mt-6 space-y-1">
        {ticking && (
          <p className="font-sans text-sm text-secondary">
            spent on space since you opened this page, at a rate of{" "}
            <Figure fact={rate} format="full" suffix="/sec" />
          </p>
        )}
        <p className="font-sans text-sm text-secondary">
          Rate visualization, not a measurement: the <Figure fact={source} />{" "}
          global space economy, 2024&apos;s annual figure divided into seconds.
        </p>
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
          Source vintage 2024 · Space Foundation, The Space Report 2025 Q2
        </p>
      </div>
    </div>
  );
}
