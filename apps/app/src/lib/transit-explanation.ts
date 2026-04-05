import type { TransitAspect } from './api';
import { translatePlanet } from './astro-labels';

/**
 * Localized sentence for high-intensity transits (tight orb).
 * Uses theme keys per planet / natal point and aspect; falls back to defaults.
 */
export function buildHighTransitExplanation(
  item: TransitAspect,
  t: (key: string) => string,
): string | null {
  if (item.intensity !== 'high') return null;

  const p = item.planet.toLowerCase();
  const n = item.target.toLowerCase();
  const a = item.aspect;

  const transitTheme = pickTheme(t, `transits.transitTheme.${p}`, 'transits.transitTheme.default');
  const natalTheme = pickTheme(t, `transits.natalTheme.${n}`, 'transits.natalTheme.default');
  const aspectVerb = pickTheme(t, `transits.aspectVerb.${a}`, 'transits.aspectVerb.default');
  const aspectNote = pickTheme(t, `transits.aspectNote.${a}`, 'transits.aspectNote.default');

  return t('transits.explainCompose')
    .replace(/\{planet\}/g, translatePlanet(item.planet, t))
    .replace(/\{target\}/g, translatePlanet(item.target, t))
    .replace(/\{aspect\}/g, item.aspect)
    .replace(/\{transitTheme\}/g, transitTheme)
    .replace(/\{natalTheme\}/g, natalTheme)
    .replace(/\{aspectVerb\}/g, aspectVerb)
    .replace(/\{aspectNote\}/g, aspectNote);
}

function pickTheme(t: (key: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? t(fallback) : v;
}
