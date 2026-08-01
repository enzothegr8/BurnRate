// A counter ticking at a rate asserts the rate: "Motion, 3D, and other
// renderings" in docs/brand-foundation.md names this a claim, not decoration,
// and "reduced motion may never remove information" applies to it exactly the
// way it applies to a CSS transition. The rule constrains what the reader
// sees, not which API produced it, so a React interval has to honor it the
// same as an animation would.
//
// This is the scheduling decision pulled out of the component so it can be
// tested without rendering anything: given a media query and a clock, does a
// tick ever get scheduled while the reader has asked for less motion. The
// component supplies the real window.matchMedia, setInterval, and
// clearInterval; a test supplies fakes and asserts on calls.

type MediaQueryListLike = {
  matches: boolean;
  addEventListener(
    type: "change",
    listener: (event: { matches: boolean }) => void,
  ): void;
  removeEventListener(
    type: "change",
    listener: (event: { matches: boolean }) => void,
  ): void;
};

export type MotionAwareTickerConfig = {
  matchMedia: (query: string) => MediaQueryListLike;
  /** Called once immediately, and again on every tick while motion is allowed. */
  onTick: () => void;
  intervalMs: number;
  setInterval: (handler: () => void, timeout: number) => number;
  clearInterval: (id: number) => void;
};

/**
 * Subscribes to prefers-reduced-motion and schedules onTick on an interval
 * only while the reader has not asked for reduced motion. Always calls onTick
 * once synchronously, reduced or not, so the value renders rather than
 * sitting blank: reduced motion removes the whirl, never the number.
 *
 * Returns an unsubscribe function that also clears any pending interval.
 */
export function motionAwareTicker(config: MotionAwareTickerConfig): () => void {
  const mq = config.matchMedia("(prefers-reduced-motion: reduce)");
  let id: number | null = null;

  function apply(reduced: boolean) {
    if (id !== null) {
      config.clearInterval(id);
      id = null;
    }
    config.onTick();
    if (!reduced) {
      id = config.setInterval(config.onTick, config.intervalMs);
    }
  }

  apply(mq.matches);

  const listener = (event: { matches: boolean }) => apply(event.matches);
  mq.addEventListener("change", listener);

  return () => {
    if (id !== null) config.clearInterval(id);
    mq.removeEventListener("change", listener);
  };
}
