import type {
  NatalChartDetail,
  PlanetPosition,
  Aspect,
  HouseCusp,
} from '../natal-chart-detail/natal-chart-detail.service';
import type { StructuredNatalInterpretation } from '../natal-interpretation/natal-interpretation.service';

/** System prompt: astrologer + writer, not a prediction bot. */
export const NATAL_ENRICHMENT_SYSTEM_PROMPT = `
You are a professional astrologer and writer.

Your task is to write clear, elegant, and psychologically accurate interpretations of natal chart placements.

Rules:
- Do NOT make predictions about the future.
- Focus on personality, tendencies, strengths, and challenges.
- Write in a warm, human, and slightly poetic tone.
- Avoid generic phrases like "you may feel"; be specific and insightful.
- Each placement: about 3–5 sentences unless the section asks otherwise.
- You receive structured chart facts and optional rule-based draft text—use drafts as factual anchors; rewrite for voice and flow without inventing new chart facts.
- Return ONLY valid JSON matching the exact schema given in the user message (same row order as the input arrays).
`.trim();

export const NATAL_PERSONALITY_SYSTEM_PROMPT = `
You are a professional astrologer and writer (not a prediction bot).

Write a cohesive personality overview from the chart summary provided.

Rules:
- Do NOT predict future events.
- Cover general personality, emotional nature, strengths, and challenges.
- Warm, readable, slightly poetic; avoid filler and vague astrology clichés.
- Stay faithful to the given Sun, Moon, Ascendant, elements, and qualities—do not invent placements.
`.trim();

export function buildPlanetPrompt(p: PlanetPosition): string {
  return `
Write an interpretation for:

Planet: ${p.planet}
Sign: ${p.sign}
House: ${p.house}
Element: ${p.element}
Quality: ${p.quality}
Dignity: ${p.dignity ?? 'none'}

Focus on:
- Core personality expression (for luminaries/personal planets) or how this placement colors behavior (for other points)
- Emotional or behavioral tendencies where relevant
- Strengths and possible imbalances

Keep it natural and engaging.
`.trim();
}

export function buildAspectPrompt(a: Aspect): string {
  return `
Write an interpretation for an astrological aspect:

Planet A: ${a.planetA}
Planet B: ${a.planetB}
Aspect: ${a.aspect}
Orb: ${a.orb}

Explain:
- How these energies interact
- Internal tension or harmony
- Psychological patterns

Avoid unnecessary jargon. Make it readable.
`.trim();
}

export function buildHousePrompt(h: HouseCusp): string {
  return `
Write an interpretation for:

House: ${h.house}
Sign on cusp: ${h.sign}

Explain:
- What area of life this house represents
- How the sign on the cusp colors that area
`.trim();
}

export function buildElementsPrompt(elements: NatalChartDetail['elements']): string {
  return `
Element counts (relative weight in chart):
Fire: ${elements.fire}
Earth: ${elements.earth}
Air: ${elements.air}
Water: ${elements.water}

Briefly inform the tone of interpretations where useful: dominant element, very low element, and how that may show up in behavior (do not repeat this as a standalone essay in each planet—one line in your head is enough).
`.trim();
}

export function buildQualitiesPrompt(q: NatalChartDetail['qualities']): string {
  return `
Quality counts:
Cardinal: ${q.cardinal}
Fixed: ${q.fixed}
Mutable: ${q.mutable}

Use as context: how the person tends to act (initiate, stabilize, adapt). Do not restate counts in every interpretation.
`.trim();
}

export function buildFullSummaryPrompt(chart: NatalChartDetail): string {
  const sun = chart.planets.find((p) => p.planet === 'Sun');
  const moon = chart.planets.find((p) => p.planet === 'Moon');
  const asc = chart.houses.find((h) => h.house === 1);

  return `
Write context for a full personality summary (you will output separate JSON for placements; this block is background):

Key highlights:
- Sun: ${sun?.sign ?? 'n/a'}
- Moon: ${moon?.sign ?? 'n/a'}
- Ascendant (1st house cusp): ${asc?.sign ?? 'n/a'}

Elements:
Fire ${chart.elements.fire}, Earth ${chart.elements.earth}, Air ${chart.elements.air}, Water ${chart.elements.water}

Qualities:
Cardinal ${chart.qualities.cardinal}, Fixed ${chart.qualities.fixed}, Mutable ${chart.qualities.mutable}

Chart style: ${chart.houseSystem}
`.trim();
}

/**
 * Single user message for the batched natal JSON rewrite (one API call).
 */
export function buildNatalBatchEnrichmentUserContent(
  detail: NatalChartDetail,
  language: string,
): string {
  return `
Language for ALL interpretation strings: ${language}

${buildFullSummaryPrompt(detail)}

${buildElementsPrompt(detail.elements)}

${buildQualitiesPrompt(detail.qualities)}

---
For EACH planet below, rewrite the draft into polished prose following the planet prompt. Chart facts must stay identical.

## Planets
${detail.planets
  .map((p, i) => `### Row ${i + 1}\n${buildPlanetPrompt(p)}\nDraft (rewrite, do not contradict facts):\n${p.interpretation ?? '(none)'}\n`)
  .join('\n')}

## Houses
${detail.houses
  .map((h, i) => `### Row ${i + 1}\n${buildHousePrompt(h)}\nDraft:\n${h.interpretation ?? '(none)'}\n`)
  .join('\n')}

## Aspects
${detail.aspects
  .map((a, i) => `### Row ${i + 1}\n${buildAspectPrompt(a)}\nDraft:\n${a.interpretation ?? '(none)'}\n`)
  .join('\n')}

---
Return JSON with exactly this shape (one object per row, same order as above):
{"planets":[{"planet":string,"sign":string,"house":number,"interpretation":string}],"houses":[{"house":number,"sign":string,"interpretation":string}],"aspects":[{"planetA":string,"planetB":string,"aspect":string,"interpretation":string}]}

Include every planet, house, and aspect row; use the exact planet/sign/house/aspect keys from the chart (match the drafts' facts).
`.trim();
}


export function buildPersonalityUserContent(
  detail: NatalChartDetail,
  structured: StructuredNatalInterpretation,
  language: string,
): string {
  return `
${buildFullSummaryPrompt(detail)}

Structured notes (stay faithful—polish into one flowing paragraph):
- Identity (Sun): ${structured.personalitySummary.identity}
- Emotions (Moon): ${structured.personalitySummary.emotions}
- Outer self (Ascendant): ${structured.personalitySummary.outerSelf}

Write in ${language}.

Task: Write a professional natal personality summary (one short section, 4–7 sentences): general personality, emotional nature, strengths, challenges. No future predictions.
`.trim();
}
