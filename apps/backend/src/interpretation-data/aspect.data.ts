/**
 * Rule-based aspect meanings.
 * Keys: planetA_planetB_aspect (e.g. venus_neptune_conjunction)
 */

import { getGenericAspectMeaning } from './generic-meanings';

export interface AspectMeaning {
  effect: string;
  keywords: string[];
  intensity: 'low' | 'medium' | 'high';
}

const MEANINGS: Record<string, AspectMeaning> = {
  venus_neptune_conjunction: {
    effect: 'Deep capacity for love and creativity; tendency to idealize or lack boundaries.',
    keywords: ['romantic', 'creative', 'idealistic', 'boundaries'],
    intensity: 'high',
  },
  sun_moon_sextile: {
    effect: 'Harmony between identity and emotions. Ease in self-expression and emotional balance.',
    keywords: ['harmony', 'balance', 'self-acceptance', 'parental relations'],
    intensity: 'medium',
  },
  mercury_mars_sextile: {
    effect: 'Quick mind with decisive action. Strong at debate, writing, and speaking under pressure.',
    keywords: ['mental agility', 'communication', 'courage', 'energy'],
    intensity: 'medium',
  },
  mars_uranus_sextile: {
    effect: 'Innovative action and sudden initiatives. Courage to break convention.',
    keywords: ['innovation', 'boldness', 'unpredictability', 'technology'],
    intensity: 'medium',
  },
  moon_uranus_square: {
    effect: 'Emotional restlessness; need for freedom in feelings. Sudden mood shifts.',
    keywords: ['restlessness', 'freedom', 'change', 'tension'],
    intensity: 'high',
  },
  saturn_uranus_trine: {
    effect: 'Balance between tradition and innovation. Ability to integrate discipline with originality.',
    keywords: ['balance', 'reform', 'structure', 'progress'],
    intensity: 'medium',
  },
  saturn_pluto_opposition: {
    effect: 'Tension between structure and transformation. May face power struggles or authority issues.',
    keywords: ['tension', 'power', 'transformation', 'control'],
    intensity: 'high',
  },
  sun_mars_square: {
    effect: 'Inner tension between identity and action. Conflict between will and drive.',
    keywords: ['conflict', 'drive', 'impulsiveness', 'courage'],
    intensity: 'high',
  },
  venus_jupiter_trine: {
    effect: 'Generous in love; luck and expansion in relationships. Warm, optimistic approach.',
    keywords: ['generosity', 'luck', 'optimism', 'abundance'],
    intensity: 'medium',
  },
  mercury_saturn_conjunction: {
    effect: 'Serious, disciplined thinking. Depth and responsibility in communication.',
    keywords: ['discipline', 'seriousness', 'patience', 'structure'],
    intensity: 'high',
  },
  moon_venus_conjunction: {
    effect: 'Emotional harmony and attraction to beauty. Warm, affectionate nature.',
    keywords: ['harmony', 'beauty', 'affection', 'comfort'],
    intensity: 'high',
  },
  jupiter_saturn_square: {
    effect: 'Tension between expansion and limitation. Balancing optimism with realism.',
    keywords: ['tension', 'reality', 'growth', 'restriction'],
    intensity: 'high',
  },
  sun_venus_conjunction: {
    effect: 'Charming, attractive presence. Love and beauty integrated with identity.',
    keywords: ['charm', 'attraction', 'harmony', 'aesthetics'],
    intensity: 'high',
  },
  mars_pluto_conjunction: {
    effect: 'Intense drive and transformative power. Capacity for profound action and regeneration.',
    keywords: ['intensity', 'power', 'transformation', 'determination'],
    intensity: 'high',
  },
  neptune_pluto_square: {
    effect: 'Tension between spiritual vision and deep transformation. Generational shifts.',
    keywords: ['vision', 'transformation', 'tension', 'collective'],
    intensity: 'high',
  },
};

export function getAspectMeaning(planetA: string, planetB: string, aspect: string): AspectMeaning {
  const a = planetA.toLowerCase().replace(/\s+/g, '-');
  const b = planetB.toLowerCase().replace(/\s+/g, '-');
  const asp = aspect.toLowerCase();
  const key1 = `${a}_${b}_${asp}`;
  const key2 = `${b}_${a}_${asp}`;
  return MEANINGS[key1] ?? MEANINGS[key2] ?? getGenericAspectMeaning(planetA, planetB, aspect);
}
