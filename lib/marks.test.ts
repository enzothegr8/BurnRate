import { describe, expect, it } from "vitest";
import {
  BAND_GEOMETRY,
  COVERAGE,
  TYPE_BAND,
  dashArray,
  lineCap,
  offsetFor,
  strokeWidth,
} from "./marks";

describe("BAND_GEOMETRY", () => {
  it("transcribes the confidence rule table exactly", () => {
    expect(BAND_GEOMETRY["1"]).toEqual({
      solid: 1,
      dashed: 1,
      dotted: 1.5,
      offset: "0.14em",
    });
    expect(BAND_GEOMETRY["2"]).toEqual({
      solid: 2,
      dashed: 2,
      dotted: 2.5,
      offset: "0.12em",
    });
    expect(BAND_GEOMETRY["3"]).toEqual({
      solid: 3,
      dashed: 3,
      dotted: 4,
      offset: "0.10em",
    });
  });

  it("makes dotted heavier than solid at every band", () => {
    for (const band of Object.values(BAND_GEOMETRY)) {
      expect(band.dotted).toBeGreaterThan(band.solid);
    }
  });
});

describe("strokeWidth", () => {
  it("reads solid, dashed, or dotted by confidence", () => {
    expect(strokeWidth("confirmed", "2")).toBe(2);
    expect(strokeWidth("reported", "2")).toBe(2);
    expect(strokeWidth("derived", "2")).toBe(2.5);
  });
});

describe("offsetFor", () => {
  it("gets tighter as the band gets larger", () => {
    expect(offsetFor("1")).toBe("0.14em");
    expect(offsetFor("2")).toBe("0.12em");
    expect(offsetFor("3")).toBe("0.10em");
  });
});

describe("dashArray", () => {
  it("is undefined for confirmed, which is continuous", () => {
    expect(dashArray("confirmed", "1")).toBeUndefined();
  });

  it("is 3x stroke on, 2x off for reported", () => {
    expect(dashArray("reported", "1")).toEqual([3, 2]);
    expect(dashArray("reported", "2")).toEqual([6, 4]);
  });

  it("is zero-length dashes spaced 2x stroke for derived", () => {
    expect(dashArray("derived", "1")).toEqual([0, 3]);
  });
});

describe("lineCap", () => {
  it("is round only for derived", () => {
    expect(lineCap("confirmed")).toBe("butt");
    expect(lineCap("reported")).toBe("butt");
    expect(lineCap("derived")).toBe("round");
  });
});

describe("COVERAGE", () => {
  it("orders confirmed above reported above derived", () => {
    expect(COVERAGE.confirmed).toBeGreaterThan(COVERAGE.reported);
    expect(COVERAGE.reported).toBeGreaterThan(COVERAGE.derived);
  });
});

describe("TYPE_BAND", () => {
  it("bands stat-xl at its desktop size; the 760px crossing is a component concern", () => {
    expect(TYPE_BAND["stat-xl"]).toBe("3");
  });

  it("keeps body text in band 1", () => {
    expect(TYPE_BAND.body).toBe("1");
    expect(TYPE_BAND.small).toBe("1");
    expect(TYPE_BAND.figure).toBe("1");
  });
});
