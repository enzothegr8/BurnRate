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

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="wm" aria-label="Burn Rate, home">
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
