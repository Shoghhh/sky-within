/**
 * Rule-based planet-in-house meanings.
 * Keys: planet_house (e.g. sun_3)
 */

import { getGenericPlanetHouseMeaning } from './generic-meanings';

export interface PlanetHouseMeaning {
  focus: string;
  keywords: string[];
}

const MEANINGS: Record<string, PlanetHouseMeaning> = {
  sun_1: {
    focus: 'Identity expressed through self and appearance. Strong sense of self.',
    keywords: ['identity', 'self', 'appearance', 'vitality'],
  },
  sun_3: {
    focus: 'Identity expressed through communication, curiosity, and local connections.',
    keywords: ['communication', 'curiosity', 'learning', 'siblings'],
  },
  sun_10: {
    focus: 'Identity expressed through career and public reputation.',
    keywords: ['career', 'authority', 'reputation', 'ambition'],
  },
  moon_6: {
    focus: 'Emotions invested in daily work, health, and routine.',
    keywords: ['work', 'health', 'routine', 'service'],
  },
  moon_4: {
    focus: 'Emotions centered on home, family, and roots.',
    keywords: ['home', 'family', 'roots', 'security'],
  },
  pluto_1: {
    focus: 'Intense personality with transformative presence. Capacity for rebirth.',
    keywords: ['intensity', 'transformation', 'identity', 'power'],
  },
  mercury_3: {
    focus: 'Mental energy in communication, learning, and local environment.',
    keywords: ['communication', 'learning', 'siblings', 'ideas'],
  },
  venus_7: {
    focus: 'Love and beauty expressed through partnership and marriage.',
    keywords: ['partnership', 'marriage', 'balance', 'attraction'],
  },
  mars_1: {
    focus: 'Energy and drive expressed through self and physical presence.',
    keywords: ['action', 'drive', 'initiative', 'body'],
  },
  jupiter_9: {
    focus: 'Expansion through philosophy, travel, and higher education.',
    keywords: ['philosophy', 'travel', 'wisdom', 'expansion'],
  },
  saturn_10: {
    focus: 'Structure and responsibility in career and public life.',
    keywords: ['career', 'authority', 'discipline', 'achievement'],
  },
};

export function getPlanetHouseMeaning(planet: string, house: number): PlanetHouseMeaning {
  const key = `${planet.toLowerCase()}_${house}`.replace(/\s+/g, '-');
  return MEANINGS[key] ?? getGenericPlanetHouseMeaning(planet, house);
}
