/** Localized labels for API English planet / sign / aspect strings. */

export type TranslateFn = (key: string) => string;

export function translatePlanet(name: string, tr: TranslateFn): string {
  const key = `planet.${name}`;
  const v = tr(key);
  return v === key ? name : v;
}

export function translateSign(raw: string, tr: TranslateFn): string {
  const k = raw.trim().toLowerCase();
  const key = `sign.${k}`;
  const v = tr(key);
  if (v !== key) return v;
  if (!raw) return raw;
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

export function translateAspect(raw: string, tr: TranslateFn): string {
  const k = raw.trim().toLowerCase();
  const key = `aspect.${k}`;
  const v = tr(key);
  if (v !== key) return v;
  if (!raw) return raw;
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

/** e.g. API "Mercury in Pisces" → localized planet + connector + sign */
export function translateDignityLine(line: string, tr: TranslateFn): string {
  const m = line.match(/^(.+?)\s+in\s+(.+)$/i);
  if (!m) return line;
  return `${translatePlanet(m[1].trim(), tr)} ${tr('natal.in')} ${translateSign(m[2].trim(), tr)}`;
}
