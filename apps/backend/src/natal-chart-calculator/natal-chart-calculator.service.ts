import { Injectable } from '@nestjs/common';
import { EphemerisService } from '../ephemeris/ephemeris.service';
import * as Astronomy from 'astronomy-engine';

export interface NatalChartResult {
  sun: number;
  moon: number;
  ascendant: number;
  mercury: number;
  venus: number;
  mars: number;
  jupiter: number;
  saturn: number;
  uranus: number;
  neptune: number;
  pluto: number;
}

const OBLIQUITY_DEG = 23.436;

/**
 * Calculate ascendant from Local Sidereal Time and latitude.
 * Formula: tan(ASC) = sin(LST) / (cos(LST) * cos(obliquity) - sin(lat) * sin(obliquity))
 */
function ascendantFromLST(
  lstDeg: number,
  latDeg: number,
): number {
  const lat = (latDeg * Math.PI) / 180;
  const lst = (lstDeg * Math.PI) / 180;
  const obliquity = (OBLIQUITY_DEG * Math.PI) / 180;

  const cosLst = Math.cos(lst);
  const sinLst = Math.sin(lst);
  const cosObl = Math.cos(obliquity);
  const sinObl = Math.sin(obliquity);
  const tanLat = Math.tan(lat);

  const y = sinLst;
  const x = cosLst * cosObl - tanLat * sinObl;

  let asc = Math.atan2(y, x) * (180 / Math.PI);
  if (asc < 0) asc += 360;
  return asc;
}

@Injectable()
export class NatalChartCalculatorService {
  constructor(private ephemeris: EphemerisService) {}

  /**
   * Calculate natal chart from birth date, time, and optional coordinates.
   * If lat/lng provided, ascendant is calculated. Otherwise ascendant uses 0 (user must set manually).
   */
  calculate(
    birthDate: string,
    birthTime: string,
    latitude?: number,
    longitude?: number,
  ): NatalChartResult {
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hours, minutes] = birthTime.split(':').map((s) => parseInt(s, 10) || 0);

    // Build date in UTC - assume birth time is local; for accuracy, frontend should pass UTC or timezone
    const birthMoment = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));

    const positions = this.ephemeris.getPositionsForDateTime(birthMoment);

    let ascendant = 0;
    if (
      latitude != null &&
      longitude != null &&
      !Number.isNaN(latitude) &&
      !Number.isNaN(longitude)
    ) {
      const gst = Astronomy.SiderealTime(birthMoment);
      const lstHours = gst + longitude / 15;
      const lstDeg = ((lstHours % 24) * 360) / 24;
      ascendant = ascendantFromLST(lstDeg, latitude);
    }

    return {
      sun: positions.sun,
      moon: positions.moon,
      ascendant,
      mercury: positions.mercury,
      venus: positions.venus,
      mars: positions.mars,
      jupiter: positions.jupiter,
      saturn: positions.saturn,
      uranus: positions.uranus,
      neptune: positions.neptune,
      pluto: positions.pluto,
    };
  }
}
