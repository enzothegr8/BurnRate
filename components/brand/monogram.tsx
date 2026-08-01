// The monogram: a serif B and R at medium overlap, joined by a multiply blend.
//
// Where the two letters cross, blue multiplied by crimson lands a hair off the
// site's ink. The intersection is the darkest part of the mark, which is the
// thesis rendered as geometry. That value is a product of the two colors and is
// never set by hand, here or in the icon generator.
//
// Note on stacking. R comes after B in the DOM and multiplies over it, and that
// order is what produces the overlap. Giving B a z-index to put it "in front"
// would make it paint over the intersection in flat blue and destroy the blend,
// so the front-ness of B is a reading of the shape rather than a paint order.
//
// The parent isolates, so the blend composites against the mark and the page
// rather than against whatever happens to sit behind it.
//
// The mono variant renders both letters in jet with no blend. At 16px the
// overlap fills in and the two-color version turns to mud, so the favicon falls
// back to this. It is a technical fallback, not a second logo.

export function Monogram({
  size = 48,
  variant = "color",
}: {
  size?: number;
  variant?: "color" | "mono";
}) {
  return (
    <span
      className={`monogram monogram-${variant}`}
      style={{ fontSize: size }}
      role="img"
      aria-label="Burn Rate"
    >
      <span className="mg-b" aria-hidden>
        B
      </span>
      <span className="mg-r" aria-hidden>
        R
      </span>
    </span>
  );
}
