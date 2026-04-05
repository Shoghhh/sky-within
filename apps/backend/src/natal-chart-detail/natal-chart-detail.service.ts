import { Injectable } from '@nestjs/common';

const SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
] as const;

const SIGN_IDS: Record<string, number> = Object.fromEntries(
  SIGNS.map((s, i) => [s, i]),
);

const ELEMENTS: Record<string, string> = {
  aries: 'fire', taurus: 'earth', gemini: 'air', cancer: 'water',
  leo: 'fire', virgo: 'earth', libra: 'air', scorpio: 'water',
  sagittarius: 'fire', capricorn: 'earth', aquarius: 'air', pisces: 'water',
};

const QUALITIES: Record<string, string> = {
  aries: 'cardinal', taurus: 'fixed', gemini: 'mutable', cancer: 'cardinal',
  leo: 'fixed', virgo: 'mutable', libra: 'cardinal', scorpio: 'fixed',
  sagittarius: 'mutable', capricorn: 'cardinal', aquarius: 'fixed', pisces: 'mutable',
};

// Dignities: planet -> { domicile: sign[], exaltation: sign, detriment: sign[], fall: sign }
const DIGNITIES: Record<string, { domicile: string[]; exaltation: string; detriment: string[]; fall: string }> = {
  sun: { domicile: ['leo'], exaltation: 'aries', detriment: ['aquarius'], fall: 'libra' },
  moon: { domicile: ['cancer'], exaltation: 'taurus', detriment: ['capricorn'], fall: 'scorpio' },
  mercury: { domicile: ['gemini', 'virgo'], exaltation: 'virgo', detriment: ['sagittarius', 'pisces'], fall: 'pisces' },
  venus: { domicile: ['taurus', 'libra'], exaltation: 'pisces', detriment: ['scorpio', 'aries'], fall: 'virgo' },
  mars: { domicile: ['aries', 'scorpio'], exaltation: 'capricorn', detriment: ['libra', 'taurus'], fall: 'cancer' },
  jupiter: { domicile: ['sagittarius', 'pisces'], exaltation: 'cancer', detriment: ['gemini', 'virgo'], fall: 'capricorn' },
  saturn: { domicile: ['capricorn', 'aquarius'], exaltation: 'libra', detriment: ['cancer', 'leo'], fall: 'aries' },
  uranus: { domicile: ['aquarius'], exaltation: 'scorpio', detriment: ['leo'], fall: 'taurus' },
  neptune: { domicile: ['pisces'], exaltation: 'cancer', detriment: ['virgo'], fall: 'capricorn' },
  pluto: { domicile: ['scorpio'], exaltation: 'aries', detriment: ['taurus'], fall: 'libra' },
};

const ASPECT_LIST = [
  { name: 'conjunction', angle: 0, orb: 8, symbol: '☌' },
  { name: 'opposition', angle: 180, orb: 8, symbol: '☍' },
  { name: 'trine', angle: 120, orb: 8, symbol: '△' },
  { name: 'square', angle: 90, orb: 8, symbol: '□' },
  { name: 'sextile', angle: 60, orb: 6, symbol: '⚹' },
  { name: 'quincunx', angle: 150, orb: 3, symbol: '⚻' },
];

function longitudeToSign(lon: number): { sign: string; degreesInSign: number } {
  const idx = Math.floor((lon % 360) / 30) % 12;
  const sign = SIGNS[idx];
  const degreesInSign = (lon % 30 + 30) % 30;
  return { sign, degreesInSign };
}

/** Returns all applicable dignities (e.g. Mercury in Pisces = both detriment and fall) */
function getDignities(planet: string, sign: string): Array<'domicile' | 'exaltation' | 'detriment' | 'fall'> {
  const d = DIGNITIES[planet.toLowerCase()];
  if (!d) return [];
  const result: Array<'domicile' | 'exaltation' | 'detriment' | 'fall'> = [];
  if (d.domicile.includes(sign)) result.push('domicile');
  if (d.exaltation === sign) result.push('exaltation');
  if (d.detriment.includes(sign)) result.push('detriment');
  if (d.fall === sign) result.push('fall');
  return result;
}

function angularDistance(a: number, b: number): number {
  let d = Math.abs(a - b);
  if (d > 180) d = 360 - d;
  return d;
}

export interface PlanetPosition {
  planet: string;
  longitude: number;
  sign: string;
  degreesInSign: number;
  house: number;
  dignity: 'domicile' | 'exaltation' | 'detriment' | 'fall' | null;
  element: string;
  quality: string;
  interpretation?: string;
}

export interface Aspect {
  planetA: string;
  planetB: string;
  aspect: string;
  angle: number;
  orb: number;
  symbol: string;
  interpretation?: string;
}

export interface HouseCusp {
  house: number;
  longitude: number;
  sign: string;
  degreesInSign: number;
  interpretation?: string;
}

export interface NatalChartDetail {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  houseSystem: string;
  planets: PlanetPosition[];
  houses: HouseCusp[];
  elements: { fire: number; earth: number; air: number; water: number };
  qualities: { cardinal: number; fixed: number; mutable: number };
  dignities: {
    domicile: string[];
    exaltation: string[];
    detriment: string[];
    fall: string[];
  };
  aspects: Aspect[];
  chartImageUrl?: string;
}

const PLANET_ORDER = ['Part of Fortune', 'Lilith', 'South Node', 'North Node', 'Chiron', 'Pluto', 'Neptune', 'Uranus', 'Saturn', 'Jupiter', 'Mars', 'Venus', 'Mercury', 'Moon', 'Sun'];
const PLANET_NAMES: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
  'north-node': 'North Node', 'south-node': 'South Node', chiron: 'Chiron', lilith: 'Lilith',
  'part-of-fortune': 'Part of Fortune',
};

@Injectable()
export class NatalChartDetailService {
  buildDetail(
    birthDate: Date,
    birthTime: string,
    birthPlace: string,
    latitude: number | null,
    longitude: number | null,
    chart: {
      sun: number;
      moon: number;
      ascendant: number;
      mercury?: number | null;
      venus?: number | null;
      mars?: number | null;
      jupiter?: number | null;
      saturn?: number | null;
      uranus?: number | null;
      neptune?: number | null;
      pluto?: number | null;
    },
  ): NatalChartDetail {
    const asc = chart.ascendant;
    const positions: Record<string, number> = {
      sun: chart.sun, moon: chart.moon,
      mercury: chart.mercury ?? 0, venus: chart.venus ?? 0, mars: chart.mars ?? 0,
      jupiter: chart.jupiter ?? 0, saturn: chart.saturn ?? 0,
      uranus: chart.uranus ?? 0, neptune: chart.neptune ?? 0, pluto: chart.pluto ?? 0,
    };

    const houses: HouseCusp[] = [];
    for (let i = 1; i <= 12; i++) {
      const lon = (asc + (i - 1) * 30) % 360;
      const { sign, degreesInSign } = longitudeToSign(lon);
      houses.push({ house: i, longitude: lon, sign, degreesInSign });
    }

    const planetPositions: PlanetPosition[] = [];
    const elements: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
    const qualities: Record<string, number> = { cardinal: 0, fixed: 0, mutable: 0 };
    const dignities: Record<string, string[]> = { domicile: [], exaltation: [], detriment: [], fall: [] };

    for (const [planet, lon] of Object.entries(positions)) {
      const { sign, degreesInSign } = longitudeToSign(lon);
      const houseNum = Math.floor(((lon - asc + 360) % 360) / 30) + 1;
      const house = houseNum > 12 ? 12 : houseNum < 1 ? 1 : houseNum;

      const dignityList = getDignities(planet, sign);
      for (const d of dignityList) {
        dignities[d].push(`${PLANET_NAMES[planet]} in ${sign}`);
      }

      elements[ELEMENTS[sign]]++;
      qualities[QUALITIES[sign]]++;

      planetPositions.push({
        planet: PLANET_NAMES[planet],
        longitude: lon,
        sign,
        degreesInSign,
        house,
        dignity: dignityList[0] ?? null,
        element: ELEMENTS[sign],
        quality: QUALITIES[sign],
      });
    }

    // Add Ascendant sign to elements/qualities - commonly counted on astro sites
    const { sign: ascSign } = longitudeToSign(asc);
    elements[ELEMENTS[ascSign]]++;
    qualities[QUALITIES[ascSign]]++;

    const aspects: Aspect[] = [];
    const planetKeys = Object.keys(positions).filter((p) => positions[p] != null);
    for (let i = 0; i < planetKeys.length; i++) {
      for (let j = i + 1; j < planetKeys.length; j++) {
        const a = positions[planetKeys[i]]!;
        const b = positions[planetKeys[j]]!;
        const dist = angularDistance(a, b);

        for (const asp of ASPECT_LIST) {
          const diff = Math.abs(dist - asp.angle);
          if (diff <= asp.orb) {
            aspects.push({
              planetA: PLANET_NAMES[planetKeys[i]],
              planetB: PLANET_NAMES[planetKeys[j]],
              aspect: asp.name,
              angle: asp.angle,
              orb: Math.round(diff * 100) / 100,
              symbol: asp.symbol,
            });
            break;
          }
        }
      }
    }

    const birthDateStr = birthDate.toISOString().split('T')[0];

    return {
      birthDate: birthDateStr,
      birthTime,
      birthPlace,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      houseSystem: 'equal',
      planets: planetPositions.sort((a, b) => PLANET_ORDER.indexOf(a.planet) - PLANET_ORDER.indexOf(b.planet)),
      houses,
      elements: elements as { fire: number; earth: number; air: number; water: number },
      qualities: qualities as { cardinal: number; fixed: number; mutable: number },
      dignities: dignities as NatalChartDetail['dignities'],
      aspects,
    };
  }

  /** Build detail from AstroAPI natal response */
  buildDetailFromAstroapi(
    astroData: {
      points: Record<string, { pointId: string; longitude: number; sign: string; degreesInSign: number; houseNumber: number; pointTitle?: string; text?: string }>;
      houses: { cusps: Array<{ longitude: number; sign: string }>; ascmc?: Array<{ longitude: number; sign: string }> };
      aspects: Array<{ pointA: string; pointB: string; aspect: string; angle: number; orb: number; pointATitle?: string; pointBTitle?: string; text?: string }>;
    },
    birthDateStr: string,
    birthTime: string,
    birthPlace: string,
    latitude?: number,
    longitude?: number,
    timezone?: string,
    chartImageUrl?: string,
  ): NatalChartDetail {
    const points = astroData.points;
    const cusps = astroData.houses.cusps;
    const elements: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
    const qualities: Record<string, number> = { cardinal: 0, fixed: 0, mutable: 0 };
    const dignities: Record<string, string[]> = { domicile: [], exaltation: [], detriment: [], fall: [] };

    const planetPositions: PlanetPosition[] = [];
    // Include ALL points from API (Sun, Moon, planets, Chiron, Nodes, Lilith, Part of Fortune, etc.)
    for (const pid of Object.keys(points)) {
      const p = points[pid];
      if (!p?.sign) continue;
      const sign = p.sign.toLowerCase();
      if (!ELEMENTS[sign] || !QUALITIES[sign]) continue;
      const planetName = p.pointTitle ?? PLANET_NAMES[pid] ?? pid.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      const dignityList = getDignities(pid, sign);
      for (const d of dignityList) {
        dignities[d].push(`${planetName} in ${sign}`);
      }
      elements[ELEMENTS[sign]]++;
      qualities[QUALITIES[sign]]++;

      planetPositions.push({
        planet: planetName,
        longitude: p.longitude,
        sign,
        degreesInSign: p.degreesInSign,
        house: p.houseNumber > 0 && p.houseNumber <= 12 ? p.houseNumber : 1,
        dignity: dignityList[0] ?? null,
        element: ELEMENTS[sign],
        quality: QUALITIES[sign],
        interpretation: undefined,
      });
    }

    const houses: HouseCusp[] = cusps.map((c, i) => ({
      house: i + 1,
      longitude: c.longitude,
      sign: c.sign.toLowerCase(),
      degreesInSign: (c.longitude % 30 + 30) % 30,
    }));

    // Add Ascendant (1st house cusp) and MC (Midheaven) to elements/qualities - commonly counted on astro sites
    if (cusps.length > 0) {
      const ascSign = cusps[0].sign.toLowerCase();
      if (ELEMENTS[ascSign] && QUALITIES[ascSign]) {
        elements[ELEMENTS[ascSign]]++;
        qualities[QUALITIES[ascSign]]++;
      }
    }
    const ascmc = astroData.houses.ascmc;
    if (ascmc && ascmc.length > 1) {
      const mcSign = ascmc[1].sign.toLowerCase();
      if (ELEMENTS[mcSign] && QUALITIES[mcSign]) {
        elements[ELEMENTS[mcSign]]++;
        qualities[QUALITIES[mcSign]]++;
      }
    }

    const aspects: Aspect[] = astroData.aspects.map((a) => ({
      planetA: a.pointATitle ?? PLANET_NAMES[a.pointA] ?? a.pointA,
      planetB: a.pointBTitle ?? PLANET_NAMES[a.pointB] ?? a.pointB,
      aspect: a.aspect,
      angle: a.angle,
      orb: Math.round(a.orb * 100) / 100,
      symbol: ASPECT_LIST.find((x) => x.name === a.aspect)?.symbol ?? '●',
      interpretation: undefined,
    }));

    return {
      birthDate: birthDateStr,
      birthTime,
      birthPlace,
      latitude,
      longitude,
      timezone,
      houseSystem: 'placidus',
      planets: planetPositions.sort((a, b) => PLANET_ORDER.indexOf(a.planet) - PLANET_ORDER.indexOf(b.planet)),
      houses,
      elements: elements as { fire: number; earth: number; air: number; water: number },
      qualities: qualities as { cardinal: number; fixed: number; mutable: number },
      dignities: dignities as NatalChartDetail['dignities'],
      aspects,
      chartImageUrl,
    };
  }
}
