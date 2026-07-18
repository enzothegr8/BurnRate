import { describe, expect, it } from "vitest";
import { deltaV, G0, massRatio, propellantForBurn } from "./physics";

/**
 * The rocket equation against known worked examples. Expected values are
 * computed independently (by hand, below), not read back from the code
 * under test.
 */
describe("rocket equation", () => {
  it("matches a hand-worked example: Isp 300 s, mass ratio 2", () => {
    // dv = 300 * 9.80665 * ln 2 = 2941.995 * 0.6931472 = 2039.24 m/s
    expect(deltaV(2000, 1000, 300)).toBeCloseTo(2039.24, 1);
  });

  it("matches a hand-worked example: Isp 450 s, mass ratio 5", () => {
    // dv = 450 * 9.80665 * ln 5 = 4412.9925 * 1.609438 = 7102.47 m/s
    expect(deltaV(500, 100, 450)).toBeCloseTo(7102.47, 1);
  });

  it("g0 is the definitional constant, exactly", () => {
    expect(G0).toBe(9.80665);
  });

  it("propellantForBurn inverts deltaV", () => {
    const finalMass = 5000;
    const prop = propellantForBurn(finalMass, 1900, 311);
    expect(deltaV(finalMass + prop, finalMass, 311)).toBeCloseTo(1900, 6);
  });

  it("massRatio of a zero-dv burn is 1 (no propellant)", () => {
    expect(massRatio(0, 300)).toBe(1);
    expect(propellantForBurn(1000, 0, 300)).toBe(0);
  });

  it("rejects nonphysical inputs loudly", () => {
    expect(() => massRatio(1000, 0)).toThrow();
    expect(() => deltaV(100, 200, 300)).toThrow();
    expect(() => propellantForBurn(-1, 100, 300)).toThrow();
  });
});
