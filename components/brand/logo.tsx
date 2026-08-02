// The lockup: a serif wordmark, a three-segment rule beneath it, and the
// tagline in mono.
//
// The complete lockup uses every domain color exactly once. Burn is blue bright
// which is AI, Rate is crimson which is Energy, the rule segments are jet which
// is Robotics, and the tagline is blue deep which is Space. That was unplanned
// and it is worth keeping.
//
// The rule is the confidence notation: solid, dashed, dotted, left to right, in
// the same order as the marks. The order is load bearing and must never be
// rearranged for visual balance. The segments are spans with a border-bottom in
// the matching style, so they use the same CSS mechanism as the marks do.

import Link from "next/link";

// Named size variants from BR-LOGO Rev 03's own sizing table
// (docs/brand/logo-sheet.html). The masthead takes `md`; BR-LOGO names three
// sizes and a component-local fourth one is not one of them, per Rev 14.
//
// `inverted` is the jet-surface treatment Rev 14 settled on: monochrome page
// white throughout, wordmark and rule and tagline alike. Not a lifted or
// tinted color, because a lifted color is a new color and the palette is
// closed; the same reasoning as the jet-only monogram favicon, applied to
// the whole lockup. Social cards and video only. The site is light and the
// lockup on the site is never inverted.
export function Logo({
  href = "/",
  size,
  inverted = false,
}: {
  href?: string;
  size: "xl" | "md" | "sm";
  inverted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`wm wm-${size}${inverted ? " wm-inverted" : ""}`}
      aria-label="Burn Rate, home"
    >
      <span className="word">
        <span className="b">Burn</span> <span className="r">Rate</span>
      </span>
      <span className="lock">
        <span className="seg seg-s" />
        <span className="seg seg-d" />
        <span className="seg seg-t" />
        <span className="tl">
          [Truth in numbers]<b>.</b>
        </span>
      </span>
    </Link>
  );
}
