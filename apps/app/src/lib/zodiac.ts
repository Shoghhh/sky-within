/** Ecliptic longitude (0–360°) → tropical sign index and degree within sign. */

const SIGN_KEYS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

export type SignKey = (typeof SIGN_KEYS)[number];

export function longitudeToSignKey(longitude: number): SignKey {
  const x = ((longitude % 360) + 360) % 360;
  const idx = Math.floor(x / 30) % 12;
  return SIGN_KEYS[idx];
}

export function degreesInSign(longitude: number): number {
  const x = ((longitude % 360) + 360) % 360;
  return x % 30;
}
