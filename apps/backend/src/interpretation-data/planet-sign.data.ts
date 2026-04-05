/**
 * Rule-based planet-in-sign meanings.
 * Explicit entries override; any missing planet×sign pair uses generic-meanings.
 */

import { getGenericPlanetSignMeaning } from './generic-meanings';

export type PlanetLayer =
  | 'identity'
  | 'emotional'
  | 'mental'
  | 'relational'
  | 'energy'
  | 'expansion'
  | 'structure'
  | 'change'
  | 'spiritual'
  | 'transformation';

export interface PlanetSignMeaning {
  traits: string[];
  strengths: string[];
  challenges: string[];
  layer: PlanetLayer;
}

const MEANINGS: Record<string, PlanetSignMeaning> = {
  sun_pisces: {
    traits: ['sensitive', 'compassionate', 'receptive', 'imaginative'],
    strengths: ['empathy', 'creativity', 'intuition'],
    challenges: ['over-idealization', 'escape into fantasy', 'need for boundaries'],
    layer: 'identity',
  },
  sun_cancer: {
    traits: ['emotional', 'protective', 'intuitive', 'nurturing'],
    strengths: ['loyalty', 'empathy', 'emotional depth'],
    challenges: ['mood swings', 'over-sensitivity', 'clinginess'],
    layer: 'identity',
  },
  sun_leo: {
    traits: ['confident', 'expressive', 'warm', 'dramatic'],
    strengths: ['creativity', 'generosity', 'leadership'],
    challenges: ['pride', 'need for attention', 'stubbornness'],
    layer: 'identity',
  },
  moon_taurus: {
    traits: ['stable', 'grounded', 'sensual', 'patient'],
    strengths: ['loyalty', 'reliability', 'practicality'],
    challenges: ['stubbornness', 'resistance to change'],
    layer: 'emotional',
  },
  moon_leo: {
    traits: ['dramatic', 'warm', 'generous', 'proud'],
    strengths: ['loyalty', 'creativity', 'warmth'],
    challenges: ['need for admiration', 'dramatic reactions'],
    layer: 'emotional',
  },
  moon_cancer: {
    traits: ['nurturing', 'sensitive', 'protective', 'moody'],
    strengths: ['intuition', 'empathy', 'emotional memory'],
    challenges: ['over-attachment', 'mood swings'],
    layer: 'emotional',
  },
  mercury_pisces: {
    traits: ['intuitive', 'imaginative', 'abstract', 'dreamy'],
    strengths: ['creative writing', 'poetry', 'music', 'intuition'],
    challenges: ['vagueness', 'need for structure'],
    layer: 'mental',
  },
  mercury_gemini: {
    traits: ['curious', 'quick-minded', 'versatile', 'communicative'],
    strengths: ['adaptability', 'wit', 'learning speed'],
    challenges: ['scattered focus', 'restlessness'],
    layer: 'mental',
  },
  venus_aquarius: {
    traits: ['unconventional', 'intellectual', 'independent', 'friendly'],
    strengths: ['open-mindedness', 'friendship', 'originality'],
    challenges: ['emotional detachment', 'need for freedom'],
    layer: 'relational',
  },
  venus_taurus: {
    traits: ['sensual', 'steady', 'loyal', 'aesthetic'],
    strengths: ['reliability', 'appreciation of beauty', 'patience'],
    challenges: ['possessiveness', 'resistance to change'],
    layer: 'relational',
  },
  mars_capricorn: {
    traits: ['ambitious', 'disciplined', 'strategic', 'patient'],
    strengths: ['persistence', 'responsibility', 'achievement'],
    challenges: ['authoritarianism', 'rigidity'],
    layer: 'energy',
  },
  mars_aries: {
    traits: ['assertive', 'pioneering', 'energetic', 'direct'],
    strengths: ['courage', 'initiative', 'confidence'],
    challenges: ['impulsiveness', 'impatience'],
    layer: 'energy',
  },
  jupiter_leo: {
    traits: ['generous', 'warm', 'expansive', 'dramatic'],
    strengths: ['creativity', 'teaching', 'performance'],
    challenges: ['excess', 'pride', 'dramatics'],
    layer: 'expansion',
  },
  jupiter_sagittarius: {
    traits: ['philosophical', 'adventurous', 'optimistic', 'idealistic'],
    strengths: ['wisdom', 'open-mindedness', 'honesty'],
    challenges: ['overconfidence', 'exaggeration'],
    layer: 'expansion',
  },
  saturn_gemini: {
    traits: ['serious', 'disciplined', 'careful', 'structured'],
    strengths: ['thoroughness', 'focus', 'analytical mind'],
    challenges: ['communication blocks', 'over-caution'],
    layer: 'structure',
  },
  saturn_capricorn: {
    traits: ['ambitious', 'responsible', 'disciplined', 'traditional'],
    strengths: ['persistence', 'authority', 'reliability'],
    challenges: ['rigidity', 'fear of failure'],
    layer: 'structure',
  },
  uranus_aquarius: {
    traits: ['innovative', 'rebellious', 'humanitarian', 'original'],
    strengths: ['independence', 'vision', 'progressiveness'],
    challenges: ['detachment', 'unpredictability'],
    layer: 'change',
  },
  neptune_aquarius: {
    traits: ['idealistic', 'visionary', 'collective-minded', 'intuitive'],
    strengths: ['humanitarian vision', 'intuition', 'idealism'],
    challenges: ['grounding idealism', 'escapism'],
    layer: 'spiritual',
  },
  neptune_pisces: {
    traits: ['mystical', 'compassionate', 'sensitive', 'artistic'],
    strengths: ['intuition', 'creativity', 'empathy'],
    challenges: ['boundaries', 'illusion', 'escapism'],
    layer: 'spiritual',
  },
  pluto_sagittarius: {
    traits: ['philosophical', 'intense', 'truth-seeking', 'transformative'],
    strengths: ['depth of inquiry', 'rebirth through learning'],
    challenges: ['dogmatism', 'extremism'],
    layer: 'transformation',
  },
  pluto_scorpio: {
    traits: ['intense', 'penetrating', 'transformative', 'secretive'],
    strengths: ['depth', 'regeneration', 'psychological insight'],
    challenges: ['obsession', 'power struggles'],
    layer: 'transformation',
  },
  sun_aries: {
    traits: ['pioneering', 'assertive', 'enthusiastic', 'independent'],
    strengths: ['courage', 'leadership', 'initiative'],
    challenges: ['impatience', 'aggression'],
    layer: 'identity',
  },
  sun_taurus: {
    traits: ['steady', 'reliable', 'sensual', 'grounded'],
    strengths: ['patience', 'persistence', 'practicality'],
    challenges: ['stubbornness', 'materialism'],
    layer: 'identity',
  },
  sun_gemini: {
    traits: ['curious', 'versatile', 'communicative', 'witty'],
    strengths: ['adaptability', 'intelligence', 'social ease'],
    challenges: ['scattered energy', 'superficiality'],
    layer: 'identity',
  },
  moon_scorpio: {
    traits: ['intense', 'passionate', 'penetrating', 'loyal'],
    strengths: ['depth', 'transformation', 'loyalty'],
    challenges: ['possessiveness', 'jealousy'],
    layer: 'emotional',
  },
  mars_scorpio: {
    traits: ['intense', 'strategic', 'determined', 'passionate'],
    strengths: ['persistence', 'depth', 'resourcefulness'],
    challenges: ['obsession', 'secrecy'],
    layer: 'energy',
  },
};

export function getPlanetSignMeaning(planet: string, sign: string): PlanetSignMeaning {
  const key = `${planet.toLowerCase()}_${sign.toLowerCase()}`.replace(/\s+/g, '-');
  return MEANINGS[key] ?? getGenericPlanetSignMeaning(planet, sign);
}
