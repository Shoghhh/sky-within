import { createHash } from 'crypto';
import type { NatalChartDetail } from '../natal-chart-detail/natal-chart-detail.service';
import type { NatalChart, User } from '@prisma/client';

const roundLon = (n: number) => Math.round(n * 10000) / 10000;

/** Hash birth + chart geometry only (no language) — used to key cache rows per language. */
export function computeNatalChartInputHash(
  user: User & { natalChart: NatalChart },
  detail: NatalChartDetail,
): string {
  const payload = {
    birthDate: user.birthDate.toISOString(),
    birthTime: user.birthTime,
    birthPlace: user.birthPlace,
    lat: user.birthLatitude,
    lon: user.birthLongitude,
    houseSystem: detail.houseSystem,
    chartImageUrl: detail.chartImageUrl ?? null,
    planets: detail.planets.map((p) => ({
      planet: p.planet,
      sign: p.sign,
      house: p.house,
      longitude: roundLon(p.longitude),
    })),
    houses: detail.houses.map((h) => ({
      house: h.house,
      sign: h.sign,
      longitude: roundLon(h.longitude),
    })),
    aspects: detail.aspects.map((a) => ({
      planetA: a.planetA,
      planetB: a.planetB,
      aspect: a.aspect,
      angle: Math.round(a.angle * 100) / 100,
    })),
  };
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}
