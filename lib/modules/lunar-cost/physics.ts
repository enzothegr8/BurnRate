/**
 * The rocket equation and nothing else.
 *
 * dv = Isp * g0 * ln(m0 / mf)
 *
 * g0 is a definitional constant (standard gravity, by definition exactly
 * 9.80665 m/s^2) and may live in code per data-model.md section 1. Every
 * other number entering these functions comes from a record.
 *
 * What this file does NOT model, stated here and again in the README and on
 * the face of the module: gravity losses, steering losses, plane changes,
 * finite-burn effects, propellant boil-off, reserves or margin. There are
 * no fudge factors, silent or otherwise; if a margin is ever added it will
 * be a named, dotted input record.
 */

/** Standard gravity, m/s^2. Definitional, not a claim about the world. */
export const G0 = 9.80665;

/** Mass ratio m0/mf for a burn of dv at Isp. */
export function massRatio(dvMps: number, ispS: number): number {
  if (ispS <= 0) throw new Error(`Isp must be positive, got ${ispS}`);
  if (dvMps < 0) throw new Error(`dv must be non-negative, got ${dvMps}`);
  return Math.exp(dvMps / (ispS * G0));
}

/**
 * Propellant needed to give `finalMassKg` (everything that remains after
 * the burn: dry stage plus everything it carries) a delta-v of `dvMps`.
 * Solving backwards from the payload is this, applied leg by leg.
 */
export function propellantForBurn(finalMassKg: number, dvMps: number, ispS: number): number {
  if (finalMassKg < 0) throw new Error(`final mass must be non-negative, got ${finalMassKg}`);
  return finalMassKg * (massRatio(dvMps, ispS) - 1);
}

/** Delta-v achieved by a stack burning from m0 to mf at Isp. */
export function deltaV(m0Kg: number, mfKg: number, ispS: number): number {
  if (m0Kg <= 0 || mfKg <= 0) throw new Error("masses must be positive");
  if (mfKg > m0Kg) throw new Error("final mass cannot exceed initial mass");
  return ispS * G0 * Math.log(m0Kg / mfKg);
}
