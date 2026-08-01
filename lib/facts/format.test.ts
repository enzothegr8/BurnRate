import { describe, expect, it } from "vitest";
import { format } from "./format";

describe("the prefix is chosen at render", () => {
  it("says 450MW, not 0.45GW", () => {
    expect(format(450e6, "W")).toBe("450MW");
  });

  it("says $1.29B, not $1290M", () => {
    expect(format(1.29e9, "USD")).toBe("$1.29B");
  });

  it("climbs to the right step at each boundary", () => {
    expect(format(999, "USD")).toBe("$999");
    expect(format(1_000, "USD")).toBe("$1K");
    expect(format(1_000_000, "USD")).toBe("$1M");
    expect(format(2.5e12, "USD")).toBe("$2.5T");
  });

  it("keeps three significant figures", () => {
    expect(format(1.234e9, "USD")).toBe("$1.23B");
    expect(format(12.34e9, "USD")).toBe("$12.3B");
    expect(format(123.4e9, "USD")).toBe("$123B");
  });

  it("handles negatives", () => {
    expect(format(-1.5e9, "USD")).toBe("-$1.5B");
  });
});

describe("units that are not SI are left alone", () => {
  it("does not rescale kilograms into tonnes, because that is a conversion", () => {
    expect(format(1_000_000, "kg")).toBe("1,000,000kg");
  });

  it("separates counts", () => {
    expect(format(341_800_000, "count")).toBe("341,800,000");
  });

  it("renders a capacity factor the way the industry says it", () => {
    expect(format(0.42, "capacity_factor")).toBe("42%");
  });

  it("renders rates with their denominator", () => {
    expect(format(2_500, "USD_per_kg")).toBe("$2.5K/kg");
    expect(format(45, "USD_per_MWh")).toBe("$45/MWh");
  });

  it("renders compute at scale", () => {
    expect(format(1e18, "FLOP")).toBe("1EFLOP");
  });
});
