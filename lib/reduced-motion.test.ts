import { describe, expect, it, vi } from "vitest";
import { motionAwareTicker } from "./reduced-motion";

function fakeMatchMedia(initialMatches: boolean) {
  const listeners: Array<(event: { matches: boolean }) => void> = [];
  const mql = {
    matches: initialMatches,
    addEventListener: vi.fn(
      (_: "change", fn: (event: { matches: boolean }) => void) => {
        listeners.push(fn);
      },
    ),
    removeEventListener: vi.fn(),
  };
  return {
    matchMedia: vi.fn(() => mql),
    mql,
    fire(matches: boolean) {
      mql.matches = matches;
      listeners.forEach((fn) => fn({ matches }));
    },
  };
}

function fakeClock() {
  let nextId = 1;
  const active = new Map<number, () => void>();
  return {
    setInterval: vi.fn((handler: () => void) => {
      const id = nextId++;
      active.set(id, handler);
      return id;
    }),
    clearInterval: vi.fn((id: number) => {
      active.delete(id);
    }),
    activeCount: () => active.size,
  };
}

describe("motionAwareTicker", () => {
  it("never schedules an interval when the query matches on subscribe", () => {
    const { matchMedia } = fakeMatchMedia(true);
    const clock = fakeClock();
    const onTick = vi.fn();

    motionAwareTicker({
      matchMedia,
      onTick,
      intervalMs: 90,
      setInterval: clock.setInterval,
      clearInterval: clock.clearInterval,
    });

    expect(clock.setInterval).not.toHaveBeenCalled();
    expect(clock.activeCount()).toBe(0);
  });

  it("still calls onTick once when reduced, so a value renders", () => {
    const { matchMedia } = fakeMatchMedia(true);
    const clock = fakeClock();
    const onTick = vi.fn();

    motionAwareTicker({
      matchMedia,
      onTick,
      intervalMs: 90,
      setInterval: clock.setInterval,
      clearInterval: clock.clearInterval,
    });

    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it("schedules an interval when motion is allowed", () => {
    const { matchMedia } = fakeMatchMedia(false);
    const clock = fakeClock();

    motionAwareTicker({
      matchMedia,
      onTick: vi.fn(),
      intervalMs: 90,
      setInterval: clock.setInterval,
      clearInterval: clock.clearInterval,
    });

    expect(clock.setInterval).toHaveBeenCalledTimes(1);
    expect(clock.setInterval).toHaveBeenCalledWith(expect.any(Function), 90);
    expect(clock.activeCount()).toBe(1);
  });

  it("clears the interval and stops scheduling when the preference toggles to reduced", () => {
    const { matchMedia, fire } = fakeMatchMedia(false);
    const clock = fakeClock();

    motionAwareTicker({
      matchMedia,
      onTick: vi.fn(),
      intervalMs: 90,
      setInterval: clock.setInterval,
      clearInterval: clock.clearInterval,
    });
    expect(clock.activeCount()).toBe(1);

    fire(true);

    expect(clock.activeCount()).toBe(0);
  });

  it("starts scheduling when the preference toggles from reduced to allowed", () => {
    const { matchMedia, fire } = fakeMatchMedia(true);
    const clock = fakeClock();

    motionAwareTicker({
      matchMedia,
      onTick: vi.fn(),
      intervalMs: 90,
      setInterval: clock.setInterval,
      clearInterval: clock.clearInterval,
    });
    expect(clock.activeCount()).toBe(0);

    fire(false);

    expect(clock.activeCount()).toBe(1);
  });

  it("unsubscribing clears any pending interval and removes the listener", () => {
    const { matchMedia, mql } = fakeMatchMedia(false);
    const clock = fakeClock();

    const unsubscribe = motionAwareTicker({
      matchMedia,
      onTick: vi.fn(),
      intervalMs: 90,
      setInterval: clock.setInterval,
      clearInterval: clock.clearInterval,
    });
    expect(clock.activeCount()).toBe(1);

    unsubscribe();

    expect(clock.activeCount()).toBe(0);
    expect(mql.removeEventListener).toHaveBeenCalledTimes(1);
  });
});
