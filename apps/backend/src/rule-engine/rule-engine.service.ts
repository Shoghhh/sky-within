import { Injectable } from '@nestjs/common';
import type { TransitAspect } from '../transit-engine/transit-engine.service';

export interface ContributingTransit {
  planet: string;
  target: string;
  aspect: string;
  orb: number;
  /** Present for newly computed results; omit in older stored JSON. */
  intensity?: 'low' | 'medium' | 'high';
}

export interface RuleResult {
  dominantLayer: string;
  intensity: string;
  adviceType: string;
  tone: string;
  focus: string;
  risk: string;
  opportunity: string;
  contributingTransits: ContributingTransit[];
}

const PLANET_LAYERS: Record<string, string> = {
  Moon: 'emotional',
  Sun: 'identity',
  Venus: 'love',
  Mars: 'energy',
  Mercury: 'mental',
  Jupiter: 'expansion',
  Saturn: 'structure',
  Uranus: 'change',
  Neptune: 'spiritual',
  Pluto: 'transformation',
};

const ASPECT_WEIGHTS: Record<string, number> = {
  conjunction: 1.2,
  opposition: 1.0,
  square: 1.1,
  trine: 0.9,
  sextile: 0.7,
  quincunx: 0.8,
};

const INTENSITY_SCORES = { low: 1, medium: 2, high: 3 };

@Injectable()
export class RuleEngineService {
  interpret(transits: TransitAspect[]): RuleResult {
    if (transits.length === 0) {
      return {
        dominantLayer: 'general',
        intensity: 'low',
        adviceType: 'reflection',
        tone: 'calm',
        focus: 'general wellbeing',
        risk: 'none',
        opportunity: 'quiet reflection',
        contributingTransits: [],
      };
    }

    const layerScores: Record<string, number> = {};

    for (const t of transits) {
      const layer = PLANET_LAYERS[t.planet] ?? 'general';
      const weight = ASPECT_WEIGHTS[t.aspect] ?? 1;
      const intScore = INTENSITY_SCORES[t.intensity] ?? 1;
      const score = weight * intScore * (10 - t.orb);
      layerScores[layer] = (layerScores[layer] ?? 0) + score;
    }

    let dominantLayer = 'general';
    let maxScore = 0;
    for (const [layer, score] of Object.entries(layerScores)) {
      if (score > maxScore) {
        maxScore = score;
        dominantLayer = layer;
      }
    }

    const totalIntensityScore = transits.reduce(
      (acc, t) => acc + INTENSITY_SCORES[t.intensity],
      0,
    );
    const avgIntensity = totalIntensityScore / transits.length;
    let intensity: string;
    if (avgIntensity >= 2.5) intensity = 'high';
    else if (avgIntensity >= 1.5) intensity = 'medium';
    else intensity = 'low';

    const hasSquare = transits.some((t) => t.aspect === 'square');
    const hasConjunction = transits.some((t) => t.aspect === 'conjunction');
    const hasOpposition = transits.some((t) => t.aspect === 'opposition');
    const hasTrine = transits.some((t) => t.aspect === 'trine');
    const hasSextile = transits.some((t) => t.aspect === 'sextile');

    let adviceType = 'reflection';
    if (hasSquare || hasOpposition) adviceType = 'caution';
    else if (hasConjunction) adviceType = 'focus';
    else if (hasTrine) adviceType = 'opportunity';

    let tone = 'calm';
    if (dominantLayer === 'energy' || intensity === 'high') tone = 'energetic';
    else if (dominantLayer === 'emotional' && intensity === 'high')
      tone = 'nurturing';
    else if (dominantLayer === 'mental') tone = 'thoughtful';

    const FOCUS_BY_LAYER: Record<string, string> = {
      emotional: 'inner emotional awareness',
      identity: 'self-expression and core identity',
      love: 'relationships and connection',
      energy: 'action and motivation',
      mental: 'communication and thinking',
      expansion: 'growth and opportunity',
      structure: 'discipline and responsibility',
      change: 'innovation and freedom',
      spiritual: 'intuition and transcendence',
      transformation: 'deep change and renewal',
      general: 'overall balance',
    };
    const focus = FOCUS_BY_LAYER[dominantLayer] ?? 'general wellbeing';

    let risk = 'none';
    if (hasSquare || hasOpposition) {
      risk =
        dominantLayer === 'emotional'
          ? 'overreacting'
          : dominantLayer === 'energy'
            ? 'impulsiveness'
            : 'tension or conflict';
    }

    let opportunity = 'self-reflection';
    if (hasTrine) opportunity = 'natural flow and ease';
    else if (hasConjunction) opportunity = 'intensified focus and alignment';
    else if (hasSextile) opportunity = 'cooperative energy';

    const contributingTransits: ContributingTransit[] = transits
      .map((t) => ({
        transit: t,
        score: (ASPECT_WEIGHTS[t.aspect] ?? 1) * (INTENSITY_SCORES[t.intensity] ?? 1) * (10 - t.orb),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ transit }) => ({
        planet: transit.planet,
        target: transit.target,
        aspect: transit.aspect,
        orb: transit.orb,
        intensity: transit.intensity,
      }));

    return {
      dominantLayer,
      intensity,
      adviceType,
      tone,
      focus,
      risk,
      opportunity,
      contributingTransits,
    };
  }

  /** Same scoring as top contributing transits; higher = stronger felt influence. */
  transitPriorityScore(t: TransitAspect): number {
    const weight = ASPECT_WEIGHTS[t.aspect] ?? 1;
    const intScore = INTENSITY_SCORES[t.intensity] ?? 1;
    return weight * intScore * (10 - t.orb);
  }

  sortTransitsByPriority(transits: TransitAspect[]): TransitAspect[] {
    return [...transits].sort(
      (a, b) => this.transitPriorityScore(b) - this.transitPriorityScore(a),
    );
  }
}
