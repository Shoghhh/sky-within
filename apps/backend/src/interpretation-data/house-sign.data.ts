/**
 * Rule-based house-in-sign meanings.
 * Keys: house_N_sign (e.g. house_1_libra)
 */

import { getGenericHouseSignMeaning } from './generic-meanings';

export interface HouseSignMeaning {
  traits: string[];
  focus: string;
}

const MEANINGS: Record<string, HouseSignMeaning> = {
  house_1_scorpio: {
    traits: ['intense', 'perceptive', 'secretive', 'transformative'],
    focus: 'Self-expression through depth, intuition, and ability to see through surfaces.',
  },
  house_1_libra: {
    traits: ['diplomatic', 'balanced', 'aesthetic', 'relationship-oriented'],
    focus: 'Self-expression through harmony, partnership, and beauty.',
  },
  house_3_aquarius: {
    traits: ['original', 'unconventional', 'technological', 'group-oriented'],
    focus: 'Communication through innovation, technology, and unique ideas.',
  },
  house_6_taurus: {
    traits: ['practical', 'steady', 'comfort-seeking', 'methodical'],
    focus: 'Work and health approached through comfort, beauty, and material stability.',
  },
  house_7_taurus: {
    traits: ['stable', 'reliable', 'sensual', 'loyal'],
    focus: 'Partnerships characterized by loyalty, comfort, and material security.',
  },
  house_1_aries: {
    traits: ['assertive', 'pioneering', 'independent', 'energetic'],
    focus: 'Self-expression through direct action and initiative.',
  },
  house_4_cancer: {
    traits: ['nurturing', 'emotional', 'protective', 'domestic'],
    focus: 'Home and roots through emotional security and family ties.',
  },
  house_10_capricorn: {
    traits: ['ambitious', 'disciplined', 'authoritative', 'structured'],
    focus: 'Career and reputation through hard work and responsibility.',
  },
};

export function getHouseSignMeaning(house: number, sign: string): HouseSignMeaning {
  const key = `house_${house}_${sign.toLowerCase()}`;
  return MEANINGS[key] ?? getGenericHouseSignMeaning(house, sign);
}
