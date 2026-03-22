import { Injectable } from '@nestjs/common';
import { EphemerisService, PlanetaryPositions } from '../ephemeris/ephemeris.service';

export interface TransitAspect {
  planet: string;
  target: string;
  aspect: string;
  orb: number;
  intensity: 'low' | 'medium' | 'high';
}

const PLANETS = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
] as const;

const NATAL_TARGETS = [...PLANETS, 'ascendant'] as const;

const ASPECT_ANGLES: Record<string, number> = {
  conjunction: 0,
  opposition: 180,
  trine: 120,
  square: 90,
  sextile: 60,
  quincunx: 150,
};

const ORB_TIGHT = 3;
const ORB_MEDIUM = 6;
const ORB_WIDE = 10;

function normalizeAngle(deg: number): number {
  while (deg < 0) deg += 360;
  while (deg >= 360) deg -= 360;
  return deg;
}

function angularDistance(a: number, b: number): number {
  let diff = Math.abs(a - b);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

@Injectable()
export class TransitEngineService {
  constructor(private ephemeris: EphemerisService) {}

  calculateTransits(
    ephemerisPositions: PlanetaryPositions,
    natalChart: Record<string, number>,
  ): TransitAspect[] {
    const transits: TransitAspect[] = [];

    for (const planet of PLANETS) {
      const transitingPos = ephemerisPositions[planet as keyof PlanetaryPositions];
      if (typeof transitingPos !== 'number') continue;

      for (const target of NATAL_TARGETS) {
        if (planet === target) continue;

        const natalPos = natalChart[target];
        if (natalPos === undefined || natalPos === null) continue;

        const distance = angularDistance(transitingPos, natalPos);

        for (const [aspectName, angle] of Object.entries(ASPECT_ANGLES)) {
          const orb = Math.abs(distance - angle);
          if (orb <= ORB_WIDE) {
            let intensity: TransitAspect['intensity'] = 'low';
            if (orb <= ORB_TIGHT) intensity = 'high';
            else if (orb <= ORB_MEDIUM) intensity = 'medium';

            transits.push({
              planet: planet.charAt(0).toUpperCase() + planet.slice(1),
              target: target.charAt(0).toUpperCase() + target.slice(1),
              aspect: aspectName,
              orb: Math.round(orb * 10) / 10,
              intensity,
            });
          }
        }
      }
    }

    return transits;
  }

  async getTransitsForUser(
    natalChart: Record<string, number>,
    date: Date,
  ): Promise<TransitAspect[]> {
    const positions = await this.ephemeris.getPositionsForDate(date);
    return this.calculateTransits(positions, natalChart);
  }
}
