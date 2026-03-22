import { Injectable } from '@nestjs/common';
import type { TransitAspect } from '../transit-engine/transit-engine.service';

export interface RuleResult {
  dominantLayer: string;
  intensity: string;
  adviceType: string;
  tone: string;
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

    let adviceType = 'reflection';
    if (hasSquare || hasOpposition) adviceType = 'caution';
    else if (hasConjunction) adviceType = 'focus';
    else if (hasTrine) adviceType = 'opportunity';

    let tone = 'calm';
    if (dominantLayer === 'energy' || intensity === 'high') tone = 'energetic';
    else if (dominantLayer === 'emotional' && intensity === 'high')
      tone = 'nurturing';
    else if (dominantLayer === 'mental') tone = 'thoughtful';

    return {
      dominantLayer,
      intensity,
      adviceType,
      tone,
    };
  }
}
