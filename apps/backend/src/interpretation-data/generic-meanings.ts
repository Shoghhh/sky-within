/**
 * Fallback cookbook meanings for any planet×sign, house×sign, planet×house, or aspect
 * not present in the explicit MEANINGS tables.
 */

import type { PlanetLayer, PlanetSignMeaning } from './planet-sign.data';
import type { HouseSignMeaning } from './house-sign.data';
import type { PlanetHouseMeaning } from './planet-house.data';
import type { AspectMeaning } from './aspect.data';

const SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

type Sign = (typeof SIGNS)[number];

/** Per-sign flavor for generic blurbs */
const SIGN_FLAVOR: Record<
  Sign,
  { adj: string; tone: string; challenge: string }
> = {
  aries: { adj: 'direct and pioneering', tone: 'initiative and courage', challenge: 'impatience or rushing in' },
  taurus: { adj: 'steady and sensual', tone: 'patience and tangible results', challenge: 'stubbornness or resistance to change' },
  gemini: { adj: 'curious and versatile', tone: 'ideas and connection', challenge: 'scattered focus or overthinking' },
  cancer: { adj: 'nurturing and protective', tone: 'emotion and belonging', challenge: 'mood swings or defensiveness' },
  leo: { adj: 'expressive and warm', tone: 'creativity and heart', challenge: 'pride or need for validation' },
  virgo: { adj: 'analytical and refining', tone: 'skill and service', challenge: 'worry or overcritical habits' },
  libra: { adj: 'diplomatic and aesthetic', tone: 'balance and relationship', challenge: 'indecision or people-pleasing' },
  scorpio: { adj: 'intense and penetrating', tone: 'depth and transformation', challenge: 'control or secrecy' },
  sagittarius: { adj: 'exploratory and optimistic', tone: 'meaning and freedom', challenge: 'restlessness or bluntness' },
  capricorn: { adj: 'structured and ambitious', tone: 'discipline and mastery', challenge: 'rigidity or fear of failure' },
  aquarius: { adj: 'original and idealistic', tone: 'vision and community', challenge: 'detachment or contrarian streak' },
  pisces: { adj: 'imaginative and compassionate', tone: 'empathy and imagination', challenge: 'boundaries or escapism' },
};

const HOUSE_FOCUS: Record<number, { area: string; keywords: string[] }> = {
  1: { area: 'self-image, body, and how you begin things', keywords: ['identity', 'appearance', 'initiative'] },
  2: { area: 'money, values, possessions, and self-worth', keywords: ['resources', 'security', 'talents'] },
  3: { area: 'communication, learning, siblings, and local life', keywords: ['ideas', 'writing', 'neighborhood'] },
  4: { area: 'home, roots, family, and emotional foundation', keywords: ['home', 'parents', 'inner life'] },
  5: { area: 'creativity, romance, children, and self-expression', keywords: ['joy', 'play', 'heart'] },
  6: { area: 'work, health, routines, and service', keywords: ['habits', 'wellness', 'craft'] },
  7: { area: 'partnerships, marriage, and one-to-one bonds', keywords: ['contracts', 'balance', 'others'] },
  8: { area: 'shared resources, intimacy, and transformation', keywords: ['merging', 'crisis', 'depth'] },
  9: { area: 'beliefs, travel, higher learning, and meaning', keywords: ['philosophy', 'culture', 'faith'] },
  10: { area: 'career, reputation, and public role', keywords: ['ambition', 'authority', 'legacy'] },
  11: { area: 'friends, groups, hopes, and the future', keywords: ['community', 'ideals', 'networks'] },
  12: { area: 'solitude, the unconscious, and release', keywords: ['rest', 'spirit', 'closure'] },
};

const PLANET_VOICE: Record<
  string,
  { label: string; layer: PlanetLayer }
> = {
  sun: { label: 'Core identity and life purpose', layer: 'identity' },
  moon: { label: 'Emotional needs and instincts', layer: 'emotional' },
  mercury: { label: 'Mind, speech, and learning style', layer: 'mental' },
  venus: { label: 'Love, pleasure, and values', layer: 'relational' },
  mars: { label: 'Drive, desire, and how you assert yourself', layer: 'energy' },
  jupiter: { label: 'Growth, faith, and opportunity', layer: 'expansion' },
  saturn: { label: 'Structure, limits, and maturity', layer: 'structure' },
  uranus: { label: 'Freedom, originality, and change', layer: 'change' },
  neptune: { label: 'Dreams, ideals, and dissolution of boundaries', layer: 'spiritual' },
  pluto: { label: 'Power, depth, and transformation', layer: 'transformation' },
  meannode: { label: 'Life path and karmic direction (mean node)', layer: 'identity' },
  truenode: { label: 'Life path and growth edge (true node)', layer: 'identity' },
  northnode: { label: 'Growth and destiny (north node)', layer: 'identity' },
  southnode: { label: 'Past patterns and comfort (south node)', layer: 'identity' },
  meanapogee: { label: 'Raw instinct and shadow desires (Black Moon / Lilith)', layer: 'transformation' },
  lilith: { label: 'Raw instinct and autonomy (Lilith)', layer: 'transformation' },
  chiron: { label: 'Wound, healing, and teaching', layer: 'spiritual' },
  'part-of-fortune': { label: 'Ease and natural luck', layer: 'expansion' },
  partoffortune: { label: 'Ease and natural luck', layer: 'expansion' },
};

function normSign(sign: string): Sign {
  const s = sign.toLowerCase() as Sign;
  return SIGNS.includes(s) ? s : 'aries';
}

export function normalizePlanetKey(planet: string): string {
  return planet.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
}

function planetVoice(planet: string) {
  const k = normalizePlanetKey(planet);
  return (
    PLANET_VOICE[k] ?? {
      label: `Themes of ${planet}`,
      layer: 'identity' as PlanetLayer,
    }
  );
}

export function getGenericPlanetSignMeaning(planet: string, sign: string): PlanetSignMeaning {
  const s = normSign(sign);
  const f = SIGN_FLAVOR[s];
  const v = planetVoice(planet);
  return {
    traits: [f.adj, f.tone],
    strengths: [`Expresses ${v.label.toLowerCase()} through ${s} qualities`],
    challenges: [f.challenge],
    layer: v.layer,
  };
}

export function getGenericHouseSignMeaning(house: number, sign: string): HouseSignMeaning {
  const h = Math.min(12, Math.max(1, Math.floor(house)));
  const s = normSign(sign);
  const f = SIGN_FLAVOR[s];
  const hf = HOUSE_FOCUS[h];
  return {
    traits: [f.adj, `Themes of ${hf.area}`],
    focus: `House ${h} (${hf.area}) with ${s} on the cusp: ${f.tone}; watch for ${f.challenge}.`,
  };
}

export function getGenericPlanetHouseMeaning(planet: string, house: number): PlanetHouseMeaning {
  const h = Math.min(12, Math.max(1, Math.floor(house)));
  const hf = HOUSE_FOCUS[h];
  const v = planetVoice(planet);
  return {
    focus: `${v.label} shows up strongly in the ${h}${ordinal(h)} house (${hf.area}).`,
    keywords: [...hf.keywords, v.layer],
  };
}

function ordinal(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

export function getGenericAspectMeaning(
  planetA: string,
  planetB: string,
  aspect: string,
): AspectMeaning {
  const asp = aspect.toLowerCase();
  const major = ['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(asp);
  return {
    effect: `${planetA} and ${planetB} form a ${aspect}: their themes combine in a ${asp} pattern—integrate ${planetA}'s story with ${planetB}'s rather than treating them separately.`,
    keywords: [aspect, 'integration', planetA, planetB],
    intensity: major ? 'high' : 'medium',
  };
}
