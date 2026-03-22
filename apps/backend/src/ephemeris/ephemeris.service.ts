import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Astronomy from 'astronomy-engine';

export interface PlanetaryPositions {
  date: string;
  sun: number;
  moon: number;
  mercury: number;
  venus: number;
  mars: number;
  jupiter: number;
  saturn: number;
  uranus: number;
  neptune: number;
  pluto: number;
}

// Get geocentric ecliptic longitude in degrees [0, 360)
// Uses GeoVector + Ecliptic (EclipticLongitude is heliocentric and fails for Sun)
function getEclipticLongitude(body: Astronomy.Body, date: Date): number {
  const vec = Astronomy.GeoVector(body, date, false);
  const ecliptic = Astronomy.Ecliptic(vec);
  let lon = ecliptic.elon;
  if (lon < 0) lon += 360;
  return lon;
}

@Injectable()
export class EphemerisService {
  constructor(private prisma: PrismaService) {}

  async getPositionsForDate(date: Date): Promise<PlanetaryPositions> {
    const dateStr = date.toISOString().split('T')[0];

    const cached = await this.prisma.ephemerisCache.findUnique({
      where: { date: new Date(dateStr) },
    });

    if (cached) {
      return cached.positions as unknown as PlanetaryPositions;
    }

    const positions: PlanetaryPositions = {
      date: dateStr,
      sun: getEclipticLongitude(Astronomy.Body.Sun, date),
      moon: getEclipticLongitude(Astronomy.Body.Moon, date),
      mercury: getEclipticLongitude(Astronomy.Body.Mercury, date),
      venus: getEclipticLongitude(Astronomy.Body.Venus, date),
      mars: getEclipticLongitude(Astronomy.Body.Mars, date),
      jupiter: getEclipticLongitude(Astronomy.Body.Jupiter, date),
      saturn: getEclipticLongitude(Astronomy.Body.Saturn, date),
      uranus: getEclipticLongitude(Astronomy.Body.Uranus, date),
      neptune: getEclipticLongitude(Astronomy.Body.Neptune, date),
      pluto: getEclipticLongitude(Astronomy.Body.Pluto, date),
    };

    await this.prisma.ephemerisCache.upsert({
      where: { date: new Date(dateStr) },
      create: {
        date: new Date(dateStr),
        positions: positions as object,
      },
      update: { positions: positions as object },
    });

    return positions;
  }

  /**
   * Get positions for exact datetime (no cache). Used for natal chart calculation.
   */
  getPositionsForDateTime(date: Date): PlanetaryPositions {
    const dateStr = date.toISOString().split('T')[0];
    return {
      date: dateStr,
      sun: getEclipticLongitude(Astronomy.Body.Sun, date),
      moon: getEclipticLongitude(Astronomy.Body.Moon, date),
      mercury: getEclipticLongitude(Astronomy.Body.Mercury, date),
      venus: getEclipticLongitude(Astronomy.Body.Venus, date),
      mars: getEclipticLongitude(Astronomy.Body.Mars, date),
      jupiter: getEclipticLongitude(Astronomy.Body.Jupiter, date),
      saturn: getEclipticLongitude(Astronomy.Body.Saturn, date),
      uranus: getEclipticLongitude(Astronomy.Body.Uranus, date),
      neptune: getEclipticLongitude(Astronomy.Body.Neptune, date),
      pluto: getEclipticLongitude(Astronomy.Body.Pluto, date),
    };
  }
}
