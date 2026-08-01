"use client";

// A labeled swatch for the color specimen. The rendered color reads the real
// token via var(); the hex text beside it is not a second copy of the
// palette typed in by hand; it is read back from the swatch's own computed
// style after mount, converted from the rgb() the browser reports. If the
// token's value in app/globals.css ever changes, this label can only follow
// it, never drift from it, because there is nothing here to keep in step.

import { useEffect, useRef, useState } from "react";

function rgbToHex(rgb: string): string {
  const channels = rgb.match(/\d+/g);
  if (!channels) return rgb;
  return (
    "#" +
    channels
      .slice(0, 3)
      .map((c) => Number(c).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function ColorSwatch({
  varName,
  label,
  job,
}: {
  /** The custom property name, e.g. "--color-jet". */
  varName: string;
  label: string;
  job: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hex, setHex] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    setHex(rgbToHex(getComputedStyle(ref.current).backgroundColor));
  }, []);

  return (
    <div className="swatch">
      <div
        ref={ref}
        className="swatch-color"
        style={{ background: `var(${varName})` }}
      />
      <p className="swatch-label">{label}</p>
      <p className="meta">
        {hex ?? "…"} · <code>{varName}</code>
      </p>
      <p className="swatch-job">{job}</p>
    </div>
  );
}
