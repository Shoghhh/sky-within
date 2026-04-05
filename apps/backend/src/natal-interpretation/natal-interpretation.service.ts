import { Injectable } from '@nestjs/common';
import type {
  NatalChartDetail,
  PlanetPosition,
  HouseCusp,
  Aspect,
} from '../natal-chart-detail/natal-chart-detail.service';
import {
  getPlanetSignMeaning,
  type PlanetSignMeaning,
} from '../interpretation-data/planet-sign.data';
import { getAspectMeaning, type AspectMeaning } from '../interpretation-data/aspect.data';
import {
  getHouseSignMeaning,
  type HouseSignMeaning,
} from '../interpretation-data/house-sign.data';
import {
  getPlanetHouseMeaning,
  type PlanetHouseMeaning,
} from '../interpretation-data/planet-house.data';

export interface StructuredNatalInterpretation {
  personalitySummary: {
    identity: string;
    emotions: string;
    outerSelf: string;
  };
  blocks: {
    planetInSign: Array<{
      planet: string;
      sign: string;
      meaning: PlanetSignMeaning;
    }>;
    houseInSign: Array<{
      house: number;
      sign: string;
      meaning: HouseSignMeaning;
    }>;
    planetInHouse: Array<{
      planet: string;
      house: number;
      meaning: PlanetHouseMeaning;
    }>;
    aspects: Array<{
      planetA: string;
      planetB: string;
      aspect: string;
      meaning: AspectMeaning;
    }>;
  };
}

function planetToKey(planet: string): string {
  return planet.toLowerCase().replace(/\s+/g, '-');
}

function formatTraits(meaning: PlanetSignMeaning): string {
  const parts: string[] = [];
  if (meaning.traits.length) parts.push(meaning.traits.join(', '));
  if (meaning.strengths.length) parts.push(`Strengths: ${meaning.strengths.join(', ')}`);
  if (meaning.challenges.length) parts.push(`Challenges: ${meaning.challenges.join(', ')}`);
  return parts.join('. ') || '';
}

@Injectable()
export class NatalInterpretationService {
  buildStructured(detail: NatalChartDetail): StructuredNatalInterpretation {
    const blocks = {
      planetInSign: [] as StructuredNatalInterpretation['blocks']['planetInSign'],
      houseInSign: [] as StructuredNatalInterpretation['blocks']['houseInSign'],
      planetInHouse: [] as StructuredNatalInterpretation['blocks']['planetInHouse'],
      aspects: [] as StructuredNatalInterpretation['blocks']['aspects'],
    };

    // Main planets for personality summary (Sun, Moon, Ascendant)
    let identity = '';
    let emotions = '';
    let outerSelf = '';

    for (const p of detail.planets) {
      const planetKey = planetToKey(p.planet);
      const meaning = getPlanetSignMeaning(planetKey, p.sign);
      blocks.planetInSign.push({ planet: p.planet, sign: p.sign, meaning });

      if (meaning) {
        const desc = formatTraits(meaning);
        if (planetKey === 'sun') identity = desc || `${p.planet} in ${p.sign}`;
        if (planetKey === 'moon') emotions = desc || `${p.planet} in ${p.sign}`;
      }
    }

    // Ascendant = house 1 cusp
    const ascendantHouse = detail.houses.find((h) => h.house === 1);
    if (ascendantHouse) {
      const houseMeaning = getHouseSignMeaning(1, ascendantHouse.sign);
      blocks.houseInSign.push({
        house: 1,
        sign: ascendantHouse.sign,
        meaning: houseMeaning,
      });
      outerSelf = houseMeaning?.focus || `${ascendantHouse.sign} rising`;
    }

    for (const h of detail.houses) {
      if (h.house === 1) continue; // already processed
      const meaning = getHouseSignMeaning(h.house, h.sign);
      blocks.houseInSign.push({ house: h.house, sign: h.sign, meaning });
    }

    for (const p of detail.planets) {
      const planetKey = planetToKey(p.planet);
      const meaning = getPlanetHouseMeaning(planetKey, p.house);
      blocks.planetInHouse.push({ planet: p.planet, house: p.house, meaning });
    }

    for (const a of detail.aspects) {
      const meaning = getAspectMeaning(a.planetA, a.planetB, a.aspect);
      blocks.aspects.push({
        planetA: a.planetA,
        planetB: a.planetB,
        aspect: a.aspect,
        meaning,
      });
    }

    // Fallbacks for personality summary
    const sunPos = detail.planets.find((p) => planetToKey(p.planet) === 'sun');
    const moonPos = detail.planets.find((p) => planetToKey(p.planet) === 'moon');
    if (!identity && sunPos) identity = `Sun in ${sunPos.sign}`;
    if (!emotions && moonPos) emotions = `Moon in ${moonPos.sign}`;
    if (!outerSelf && ascendantHouse) outerSelf = `Ascendant in ${ascendantHouse.sign}`;

    return {
      personalitySummary: { identity, emotions, outerSelf },
      blocks,
    };
  }

  /** Format a single block's meaning for display (e.g. traits + strengths + challenges) */
  formatPlanetSignForDisplay(meaning: PlanetSignMeaning | null): string {
    if (!meaning) return '';
    return formatTraits(meaning);
  }

  formatAspectForDisplay(meaning: AspectMeaning | null): string {
    if (!meaning) return '';
    return meaning.effect;
  }

  formatHouseSignForDisplay(meaning: HouseSignMeaning | null): string {
    if (!meaning) return '';
    return [meaning.focus, meaning.traits.join(', ')].filter(Boolean).join('. ');
  }

  formatPlanetHouseForDisplay(meaning: PlanetHouseMeaning | null): string {
    if (!meaning) return '';
    return `${meaning.focus} (${meaning.keywords.join(', ')})`;
  }

  /** Enrich detail with interpretation strings from structured data (replaces AstroAPI text) */
  enrichDetailWithInterpretations<T extends NatalChartDetail>(
    detail: T,
    structured: StructuredNatalInterpretation,
  ): T {
    const result = { ...detail };

    result.planets = detail.planets.map((p) => {
      const block = structured.blocks.planetInSign.find(
        (b) => b.planet === p.planet && b.sign === p.sign,
      );
      const houseBlock = structured.blocks.planetInHouse.find(
        (b) => b.planet === p.planet && b.house === p.house,
      );
      const planetSignText = this.formatPlanetSignForDisplay(block?.meaning ?? null);
      const planetHouseText = this.formatPlanetHouseForDisplay(houseBlock?.meaning ?? null);
      const interpretation = [planetSignText, planetHouseText].filter(Boolean).join(' ') || undefined;
      return { ...p, interpretation };
    });

    result.houses = detail.houses.map((h) => {
      const block = structured.blocks.houseInSign.find(
        (b) => b.house === h.house && b.sign === h.sign,
      );
      const interpretation = this.formatHouseSignForDisplay(block?.meaning ?? null) || undefined;
      return { ...h, interpretation };
    });

    result.aspects = detail.aspects.map((a) => {
      const block = structured.blocks.aspects.find(
        (b) =>
          b.planetA === a.planetA &&
          b.planetB === a.planetB &&
          b.aspect === a.aspect,
      );
      const interpretation = this.formatAspectForDisplay(block?.meaning ?? null) || undefined;
      return { ...a, interpretation };
    });

    return result as T;
  }
}
