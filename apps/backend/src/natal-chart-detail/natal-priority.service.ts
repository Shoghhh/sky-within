import { Injectable } from '@nestjs/common';
import type {
  Aspect,
  HouseCusp,
  NatalChartDetail,
  PlanetPosition,
} from './natal-chart-detail.service';

export interface NatalChartLayoutDominant {
  element: 'fire' | 'earth' | 'air' | 'water' | null;
  quality: 'cardinal' | 'fixed' | 'mutable' | null;
  strongestSign: { sign: string; count: number } | null;
}

export interface ScoredAspect {
  aspect: Aspect;
  score: number;
}

export interface NatalChartLayout {
  dominant: NatalChartLayoutDominant;
  corePersonality: {
    sun: PlanetPosition | null;
    moon: PlanetPosition | null;
    ascendant: HouseCusp | null;
  };
  characterBehavior: PlanetPosition[];
  keyAspects: ScoredAspect[];
  deeperLayers: {
    planets: PlanetPosition[];
    houses: HouseCusp[];
    aspects: ScoredAspect[];
  };
}

function planetKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

/** Sun, Moon, Asc = 5; Mercury–Mars = 4; Jupiter–Saturn = 3; outers = 2; else 1 */
export function planetPriorityWeight(planet: string): number {
  const k = planetKey(planet);
  if (k === 'sun' || k === 'moon') return 5;
  if (k === 'mercury' || k === 'venus' || k === 'mars') return 4;
  if (k === 'jupiter' || k === 'saturn') return 3;
  if (k === 'uranus' || k === 'neptune' || k === 'pluto') return 2;
  return 1;
}

function aspectTypeWeight(aspectName: string): number {
  const a = aspectName.toLowerCase();
  if (a === 'conjunction') return 5;
  if (a === 'opposition') return 4;
  if (a === 'square') return 4;
  if (a === 'trine') return 3;
  if (a === 'sextile') return 2;
  if (a === 'quincunx') return 1;
  return 1;
}

function maxOrbForAspect(aspectName: string): number {
  const a = aspectName.toLowerCase();
  if (a === 'sextile') return 6;
  if (a === 'quincunx') return 3;
  return 8;
}

function houseForPlanet(detail: NatalChartDetail, planetName: string): number | undefined {
  return detail.planets.find((p) => p.planet === planetName)?.house;
}

/** Angular houses 1,4,7,10 → slight score boost */
function angularMultiplier(detail: NatalChartDetail, a: Aspect): number {
  const angular = [1, 4, 7, 10];
  const hA = houseForPlanet(detail, a.planetA);
  const hB = houseForPlanet(detail, a.planetB);
  let m = 1;
  if (hA != null && angular.includes(hA)) m += 0.15;
  if (hB != null && angular.includes(hB)) m += 0.15;
  return m;
}

export function scoreAspect(detail: NatalChartDetail, a: Aspect): number {
  const wA = planetPriorityWeight(a.planetA);
  const wB = planetPriorityWeight(a.planetB);
  const base = (wA + wB) / 2;
  const aw = aspectTypeWeight(a.aspect);
  const maxOrb = maxOrbForAspect(a.aspect);
  const orbFactor = Math.max(0, 1 - Math.min(1, a.orb / maxOrb));
  const raw = base * aw * orbFactor;
  return raw * angularMultiplier(detail, a);
}

function dominantElement(
  el: NatalChartDetail['elements'],
): NatalChartLayoutDominant['element'] {
  const entries = Object.entries(el) as Array<[NatalChartLayoutDominant['element'] & string, number]>;
  const sorted = entries.sort((x, y) => y[1] - x[1]);
  return sorted[0]?.[1] > 0 ? sorted[0][0] : null;
}

function dominantQuality(
  q: NatalChartDetail['qualities'],
): NatalChartLayoutDominant['quality'] {
  const entries = Object.entries(q) as Array<[NatalChartLayoutDominant['quality'] & string, number]>;
  const sorted = entries.sort((x, y) => y[1] - x[1]);
  return sorted[0]?.[1] > 0 ? sorted[0][0] : null;
}

function strongestSignByPlanets(detail: NatalChartDetail): { sign: string; count: number } | null {
  const counts = new Map<string, number>();
  for (const p of detail.planets) {
    counts.set(p.sign, (counts.get(p.sign) ?? 0) + 1);
  }
  let best: { sign: string; count: number } | null = null;
  for (const [sign, count] of counts) {
    if (!best || count > best.count) best = { sign, count };
  }
  if (!best || best.count < 2) return null;
  return best;
}

const CORE_NAMES = new Set(['Sun', 'Moon']);
const CHARACTER_NAMES = new Set(['Mercury', 'Venus', 'Mars']);

@Injectable()
export class NatalPriorityService {
  buildLayout(detail: NatalChartDetail): NatalChartLayout {
    const sun = detail.planets.find((p) => p.planet === 'Sun') ?? null;
    const moon = detail.planets.find((p) => p.planet === 'Moon') ?? null;
    const ascendant = detail.houses.find((h) => h.house === 1) ?? null;

    const characterBehavior = ['Mercury', 'Venus', 'Mars']
      .map((name) => detail.planets.find((p) => p.planet === name))
      .filter((p): p is PlanetPosition => p != null);

    const usedNames = new Set([...CORE_NAMES, ...CHARACTER_NAMES]);
    const deeperPlanets = detail.planets.filter((p) => !usedNames.has(p.planet));

    const scored = detail.aspects.map((aspect) => ({
      aspect,
      score: scoreAspect(detail, aspect),
    }));
    const sorted = [...scored].sort((x, y) => y.score - x.score);
    const KEY_N = 5;
    const keyAspects = sorted.slice(0, KEY_N);
    const keySet = new Set(
      keyAspects.map((x) => `${x.aspect.planetA}\0${x.aspect.planetB}\0${x.aspect.aspect}`),
    );
    const deeperAspects = sorted.filter(
      (x) => !keySet.has(`${x.aspect.planetA}\0${x.aspect.planetB}\0${x.aspect.aspect}`),
    );

    return {
      dominant: {
        element: dominantElement(detail.elements),
        quality: dominantQuality(detail.qualities),
        strongestSign: strongestSignByPlanets(detail),
      },
      corePersonality: { sun, moon, ascendant },
      characterBehavior,
      keyAspects,
      deeperLayers: {
        planets: deeperPlanets,
        houses: detail.houses,
        aspects: deeperAspects,
      },
    };
  }
}
