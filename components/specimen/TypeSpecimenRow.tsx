"use client";

// One row of the type scale specimen: a live sample set at the real token,
// with size, line height, weight, and tracking read back from its own
// computed style rather than typed in twice. A second, hand-maintained copy
// of the fourteen-step table is exactly the kind of drift this page exists
// to catch, so there isn't one; the numbers shown are whatever the browser
// actually resolved var(--text-<token>-*) to, on this page, right now.

import { useEffect, useRef, useState } from "react";
import type { TypeToken } from "@/lib/marks";

type Metrics = { size: string; line: string; weight: string; tracking: string };

export function TypeSpecimenRow({
  token,
  family,
  job,
  sample,
}: {
  token: TypeToken;
  family: "serif" | "sans" | "mono";
  job: string;
  sample: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const cs = getComputedStyle(ref.current);
    setMetrics({
      size: cs.fontSize,
      line: cs.lineHeight,
      weight: cs.fontWeight,
      tracking: cs.letterSpacing,
    });
  }, []);

  return (
    <div className="type-row">
      <span
        ref={ref}
        className="type-row-sample"
        style={{
          fontFamily: `var(--font-${family})`,
          fontSize: `var(--text-${token}-size)`,
          lineHeight: `var(--text-${token}-line)`,
          fontWeight: `var(--text-${token}-weight)`,
          letterSpacing: `var(--text-${token}-tracking)`,
        }}
      >
        {sample}
      </span>
      <p className="meta type-row-meta">
        <code>{token}</code> · {family} ·{" "}
        {metrics
          ? `${metrics.size} · ${metrics.line} · ${metrics.weight} · ${metrics.tracking}`
          : "…"}{" "}
        · {job}
      </p>
    </div>
  );
}
