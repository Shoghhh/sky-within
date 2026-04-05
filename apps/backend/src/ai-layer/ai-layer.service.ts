import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { RuleResult } from '../rule-engine/rule-engine.service';
import type { StructuredNatalInterpretation } from '../natal-interpretation/natal-interpretation.service';
import type { NatalChartDetail } from '../natal-chart-detail/natal-chart-detail.service';
import {
  NATAL_ENRICHMENT_SYSTEM_PROMPT,
  NATAL_PERSONALITY_SYSTEM_PROMPT,
  buildNatalBatchEnrichmentUserContent,
  buildPersonalityUserContent,
} from './natal-ai-prompts';
import {
  ASTROLOGY_BASICS_STATIC,
  resolveAstrologyBasicsLang,
} from './astrology-basics.static';
import type { AstrologyBasicsPayload } from './astrology-basics.types';
import { TRANSIT_EXPLAIN_SYSTEM_PROMPT } from './transit-explain-prompt';

function isOpenAIUnauthorized(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'status' in e &&
    (e as { status?: number }).status === 401
  );
}

function openAIErrorCode(e: unknown): string | undefined {
  if (typeof e !== 'object' || e === null) return undefined;
  const x = e as { code?: string; error?: { code?: string } };
  return x.code ?? x.error?.code;
}

/** 429 + insufficient_quota — add billing / credits at platform.openai.com (not the same as 401 bad key). */
function isOpenAIInsufficientQuota(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) return false;
  const status = (e as { status?: number }).status;
  return status === 429 && openAIErrorCode(e) === 'insufficient_quota';
}

function normalizeOpenAIApiKey(raw: string | undefined): string {
  if (!raw) return '';
  const t = raw.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1).trim();
  }
  return t;
}

/** Bullet list of contributing transits for daily-message prompts (facts only—model must not invent others). */
function formatContributingTransitsForPrompt(ruleResult: RuleResult): string {
  const list = ruleResult.contributingTransits;
  if (!list?.length) {
    return '(No ranked transit lines were supplied for today—describe only the thematic fields below; do not invent planets or aspects.)';
  }
  return list
    .map(
      (t, i) =>
        `${i + 1}. Transiting ${t.planet} — ${t.aspect} — natal ${t.target} — orb ${Number(t.orb).toFixed(1)}° — ${t.intensity ?? 'mixed'} emphasis`,
    )
    .join('\n');
}

@Injectable()
export class AiLayerService {
  private readonly logger = new Logger(AiLayerService.name);
  private openai: OpenAI | null = null;
  /** Avoid flooding logs when the key is wrong (e.g. polling natal detail). */
  private openAi401Warned = false;
  private openAiQuotaWarned = false;
  /** In-memory cache for transit explanations (24h TTL). */
  private readonly transitExplainCache = new Map<string, { text: string; expires: number }>();

  constructor(private config: ConfigService) {
    const apiKey = normalizeOpenAIApiKey(this.config.get<string>('OPENAI_API_KEY'));
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log(
        'OpenAI client initialized (OPENAI_API_KEY set). 401 = bad key; 429 insufficient_quota = add billing/credits at https://platform.openai.com/account/billing',
      );
    } else {
      this.logger.log('OPENAI_API_KEY unset or empty — OpenAI calls skipped; use rule-based text only.');
    }
  }

  private warnOpenAI401Once(): void {
    if (this.openAi401Warned) return;
    this.openAi401Warned = true;
    this.logger.warn(
      'OpenAI returned 401 (invalid or unauthorized OPENAI_API_KEY). AI text uses fallbacks. Create a key at https://platform.openai.com/api-keys and set OPENAI_API_KEY in apps/backend/.env — then restart. Further 401s suppressed until restart.',
    );
  }

  private warnOpenAIQuotaOnce(): void {
    if (this.openAiQuotaWarned) return;
    this.openAiQuotaWarned = true;
    this.logger.warn(
      'OpenAI returned 429 insufficient_quota (no credits / billing required). AI text uses fallbacks. Add payment or credits: https://platform.openai.com/account/billing — further quota errors suppressed until restart.',
    );
  }

  async generateMessage(
    userName: string,
    ruleResult: RuleResult,
    language: string = 'en',
  ): Promise<string> {
    if (!this.openai) {
      return this.fallbackMessage(userName, ruleResult);
    }

    try {
      const transitBlock = formatContributingTransitsForPrompt(ruleResult);
      const response = await this.openai.chat.completions.create({
        model: this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a thoughtful astrology adviser. Write ONE daily message as 1-2 short paragraphs (about 10 sentences total).

Requirements:
- Ground the message in TODAY'S SKY: you MUST explain *why* the day feels as it does by naming specific transiting planets, aspects, and natal points using ONLY the numbered transit lines provided. Paraphrase in natural language (e.g. "with transiting Venus squaring your natal Mars…") but do not add planets, aspects, or chart points that are not in that list.
- If transit lines are missing, speak only from the thematic fields—never invent planetary contacts.
- Tie those transits to dominant theme, focus, opportunity, and (if relevant) risk—plainly, without doom or fortune-telling.
- Warm, clear, specific; avoid generic horoscope filler.`,
          },
          {
            role: 'user',
            content: `Write in ${language}.

User: ${userName}

Today's ranked transit contacts (facts—use these; do not invent others):
${transitBlock}

Structured themes:
- Dominant layer: ${ruleResult.dominantLayer}
- Overall intensity: ${ruleResult.intensity}
- Advice type: ${ruleResult.adviceType}
- Tone: ${ruleResult.tone}
- Focus: ${ruleResult.focus}
- Risk: ${ruleResult.risk}
- Opportunity: ${ruleResult.opportunity}

Compose the full message with clear links between the transit lines above and the day's guidance.`,
          },
        ],
        max_tokens: 400,
        temperature: 0.65,
      });

      const text = response.choices[0]?.message?.content?.trim();
      return text ?? this.fallbackMessage(userName, ruleResult);
    } catch (e) {
      if (isOpenAIUnauthorized(e)) {
        this.warnOpenAI401Once();
      } else if (isOpenAIInsufficientQuota(e)) {
        this.warnOpenAIQuotaOnce();
      } else {
        this.logger.error('OpenAI daily message failed', e);
      }
      return this.fallbackMessage(userName, ruleResult);
    }
  }

  private fallbackMessage(userName: string, ruleResult: RuleResult): string {
    const {
      focus,
      opportunity,
      risk,
      dominantLayer,
      intensity,
      adviceType,
      tone,
      contributingTransits,
    } = ruleResult;
    const riskBit =
      risk && risk !== 'none'
        ? ` One pattern to watch: ${risk}.`
        : '';

    const transitParagraph =
      contributingTransits?.length > 0
        ? ` Much of today’s tone comes from how moving planets touch your birth chart: ${contributingTransits
            .slice(0, 4)
            .map(
              (t) =>
                `transiting ${t.planet} in ${t.aspect} to your natal ${t.target} (orb about ${Number(t.orb).toFixed(1)}°, ${t.intensity ?? 'mixed'} emphasis)`,
            )
            .join('; ')}. Together, that steers the day toward ${dominantLayer} themes with ${intensity} overall intensity.`
        : ` Today’s emphasis falls on ${dominantLayer} themes (${intensity} overall intensity).`;

    return `${userName},${transitParagraph} In practical terms, the focus lands on ${focus}. A constructive angle is ${opportunity}.${riskBit} A useful stance is to ${adviceType} in a ${tone} way—observe what comes up rather than forcing outcomes.`;
  }

  async formatNatalInterpretation(
    detail: NatalChartDetail,
    structured: StructuredNatalInterpretation,
    language: string = 'en',
  ): Promise<string> {
    if (!this.openai) {
      return this.fallbackNatalProse(structured);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: NATAL_PERSONALITY_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: buildPersonalityUserContent(detail, structured, language),
          },
        ],
        max_tokens: 500,
        temperature: 0.65,
      });

      const text = response.choices[0]?.message?.content?.trim();
      if (text) {
        this.logger.log(`OpenAI natal personality prose OK (model=${response.model})`);
      }
      return text ?? this.fallbackNatalProse(structured);
    } catch (e) {
      if (isOpenAIUnauthorized(e)) {
        this.warnOpenAI401Once();
      } else if (isOpenAIInsufficientQuota(e)) {
        this.warnOpenAIQuotaOnce();
      } else {
        this.logger.error('OpenAI natal personality prose failed', e);
      }
      return this.fallbackNatalProse(structured);
    }
  }

  private fallbackNatalProse(structured: StructuredNatalInterpretation): string {
    const { identity, emotions, outerSelf } = structured.personalitySummary;
    const parts: string[] = [];
    if (identity) parts.push(`Your core identity is ${identity.toLowerCase()}.`);
    if (emotions) parts.push(`Emotionally, ${emotions.toLowerCase()}.`);
    if (outerSelf) parts.push(`You present yourself as ${outerSelf.toLowerCase()}.`);
    return parts.join(' ') || 'Your natal chart reveals a unique combination of planetary influences.';
  }

  /**
   * Replace rule-based interpretation strings on planets, houses, and aspects with
   * cohesive OpenAI prose.
   *
   * How to tell if OpenAI ran: interpretations read as polished prose vs. templated cookbook lines;
   * requires OPENAI_API_KEY. If missing, input is returned unchanged (rule-based + generic-meanings only).
   * On API/JSON errors, see console "OpenAI natal chart enrichment failed" — drafts are kept.
   */
  async enrichNatalChartDetailWithOpenAI(
    detail: NatalChartDetail,
    language: string = 'en',
  ): Promise<NatalChartDetail> {
    // No key → skip LLM; client still gets deterministic meanings from enrichDetailWithInterpretations.
    if (!this.openai) return detail;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: NATAL_ENRICHMENT_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: buildNatalBatchEnrichmentUserContent(detail, language),
          },
        ],
        temperature: 0.55,
        max_tokens: 14000,
      });

      const raw = response.choices[0]?.message?.content?.trim();
      if (!raw) return detail;

      const parsed = JSON.parse(raw) as {
        planets?: Array<{
          planet: string;
          sign: string;
          house: number;
          interpretation: string;
        }>;
        houses?: Array<{
          house: number;
          sign: string;
          interpretation: string;
        }>;
        aspects?: Array<{
          planetA: string;
          planetB: string;
          aspect: string;
          interpretation: string;
        }>;
      };

      const pk = (p: { planet: string; sign: string; house: number }) =>
        `${p.planet}\0${p.sign}\0${p.house}`;
      const hk = (h: { house: number; sign: string }) => `${h.house}\0${h.sign}`;
      const ak = (a: { planetA: string; planetB: string; aspect: string }) =>
        `${a.planetA}\0${a.planetB}\0${a.aspect}`;

      const planetMap = new Map<string, string>();
      for (const row of parsed.planets ?? []) {
        if (row?.interpretation?.trim()) {
          planetMap.set(pk(row), row.interpretation.trim());
        }
      }
      const houseMap = new Map<string, string>();
      for (const row of parsed.houses ?? []) {
        if (row?.interpretation?.trim()) {
          houseMap.set(hk(row), row.interpretation.trim());
        }
      }
      const aspectMap = new Map<string, string>();
      for (const row of parsed.aspects ?? []) {
        if (row?.interpretation?.trim()) {
          aspectMap.set(ak(row), row.interpretation.trim());
        }
      }

      const planets = detail.planets.map((p) => {
        const text = planetMap.get(pk(p));
        return text ? { ...p, interpretation: text } : p;
      });
      const houses = detail.houses.map((h) => {
        const text = houseMap.get(hk(h));
        return text ? { ...h, interpretation: text } : h;
      });
      const aspects = detail.aspects.map((a) => {
        const text = aspectMap.get(ak(a));
        return text ? { ...a, interpretation: text } : a;
      });

      this.logger.log(
        `OpenAI natal chart enrichment OK (model=${response.model}): applied ${planetMap.size}/${detail.planets.length} planet, ${houseMap.size}/${detail.houses.length} house, ${aspectMap.size}/${detail.aspects.length} aspect interpretations`,
      );

      return { ...detail, planets, houses, aspects };
    } catch (e) {
      if (isOpenAIUnauthorized(e)) {
        this.warnOpenAI401Once();
      } else if (isOpenAIInsufficientQuota(e)) {
        this.warnOpenAIQuotaOnce();
      } else {
        this.logger.error('OpenAI natal chart enrichment failed', e);
      }
      return detail;
    }
  }

  isOpenAiConfigured(): boolean {
    return this.openai !== null;
  }

  extractNatalInterpretationPatch(detail: NatalChartDetail): NatalInterpretationPatch {
    return {
      planets: detail.planets.map((p) => ({
        planet: p.planet,
        sign: p.sign,
        house: p.house,
        interpretation: p.interpretation ?? '',
      })),
      houses: detail.houses.map((h) => ({
        house: h.house,
        sign: h.sign,
        interpretation: h.interpretation ?? '',
      })),
      aspects: detail.aspects.map((a) => ({
        planetA: a.planetA,
        planetB: a.planetB,
        aspect: a.aspect,
        interpretation: a.interpretation ?? '',
      })),
    };
  }

  applyNatalInterpretationPatch(
    detail: NatalChartDetail,
    patch: NatalInterpretationPatch | null | undefined,
  ): NatalChartDetail {
    if (!patch?.planets?.length && !patch?.houses?.length && !patch?.aspects?.length) {
      return detail;
    }

    const pk = (p: { planet: string; sign: string; house: number }) =>
      `${p.planet}\0${p.sign}\0${p.house}`;
    const hk = (h: { house: number; sign: string }) => `${h.house}\0${h.sign}`;
    const ak = (a: { planetA: string; planetB: string; aspect: string }) =>
      `${a.planetA}\0${a.planetB}\0${a.aspect}`;

    const planetMap = new Map<string, string>();
    for (const row of patch.planets ?? []) {
      if (row?.interpretation?.trim()) {
        planetMap.set(pk(row), row.interpretation.trim());
      }
    }
    const houseMap = new Map<string, string>();
    for (const row of patch.houses ?? []) {
      if (row?.interpretation?.trim()) {
        houseMap.set(hk(row), row.interpretation.trim());
      }
    }
    const aspectMap = new Map<string, string>();
    for (const row of patch.aspects ?? []) {
      if (row?.interpretation?.trim()) {
        aspectMap.set(ak(row), row.interpretation.trim());
      }
    }

    const planets = detail.planets.map((p) => {
      const text = planetMap.get(pk(p));
      return text ? { ...p, interpretation: text } : p;
    });
    const houses = detail.houses.map((h) => {
      const text = houseMap.get(hk(h));
      return text ? { ...h, interpretation: text } : h;
    });
    const aspects = detail.aspects.map((a) => {
      const text = aspectMap.get(ak(a));
      return text ? { ...a, interpretation: text } : a;
    });

    return { ...detail, planets, houses, aspects };
  }

  /**
   * Beginner astrology glossary for onboarding / info screens (static copy, en / ru / hy).
   */
  getAstrologyBasics(language: string = 'en'): AstrologyBasicsPayload {
    const key = resolveAstrologyBasicsLang(language);
    return ASTROLOGY_BASICS_STATIC[key];
  }

  /**
   * Short AI paragraph for one strong transit. Returns null when OpenAI is off or on failure (client may use template).
   */
  async explainStrongTransit(
    params: {
      planet: string;
      target: string;
      aspect: string;
      orb: number;
      intensity: string;
    },
    language: string = 'en',
  ): Promise<{ explanation: string | null; source: 'ai' | 'unavailable' }> {
    if (params.intensity !== 'high') {
      return { explanation: null, source: 'unavailable' };
    }

    const lang = (language || 'en').trim().slice(0, 12) || 'en';
    const orbKey = Math.round(params.orb * 10) / 10;
    const cacheKey = `${lang}|${params.planet}|${params.target}|${params.aspect}|${orbKey}`;
    const cached = this.transitExplainCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return { explanation: cached.text, source: 'ai' };
    }

    if (!this.openai) {
      return { explanation: null, source: 'unavailable' };
    }

    try {
      const facts = {
        language: lang,
        transitingPlanet: params.planet,
        natalPoint: params.target,
        aspect: params.aspect,
        orbDegrees: params.orb,
        note: 'Orb is small, so this contact is relatively strong today.',
      };
      const response = await this.openai.chat.completions.create({
        model: this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini',
        messages: [
          { role: 'system', content: TRANSIT_EXPLAIN_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Write the explanation in the language matching this code: "${lang}".\n\nFacts (JSON):\n${JSON.stringify(facts)}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.55,
      });

      const text = response.choices[0]?.message?.content?.trim();
      if (text) {
        const ttlMs = 24 * 60 * 60 * 1000;
        this.transitExplainCache.set(cacheKey, { text, expires: Date.now() + ttlMs });
        return { explanation: text, source: 'ai' };
      }
    } catch (e) {
      if (isOpenAIUnauthorized(e)) {
        this.warnOpenAI401Once();
      } else if (isOpenAIInsufficientQuota(e)) {
        this.warnOpenAIQuotaOnce();
      } else {
        this.logger.error('OpenAI transit explain failed', e);
      }
    }

    return { explanation: null, source: 'unavailable' };
  }
}

export interface NatalInterpretationPatch {
  planets: Array<{
    planet: string;
    sign: string;
    house: number;
    interpretation: string;
  }>;
  houses: Array<{
    house: number;
    sign: string;
    interpretation: string;
  }>;
  aspects: Array<{
    planetA: string;
    planetB: string;
    aspect: string;
    interpretation: string;
  }>;
}
