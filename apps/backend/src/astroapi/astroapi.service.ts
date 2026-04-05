import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { find } from 'geo-tz';

const ASTROAPI_BASE = 'https://api.astroapi.cloud';

export interface AstroApiNatalRequest {
  dateTime: string; // ISO 8601
  latitude: number;
  longitude: number;
  timezone: string; // IANA e.g. Europe/London
  houseSystem?: string;
  language?: string;
  includeText?: boolean;
}

export interface AstroApiPoint {
  pointId: string;
  longitude: number;
  sign: string;
  signTitle?: string;
  degreesInSign: number;
  degreesInSignDms?: number[];
  houseNumber: number;
  houseId?: string;
  retrograde?: boolean;
  pointTitle?: string;
  houseTitle?: string;
  text?: string;
}

export interface AstroApiCusp {
  longitude: number;
  longitudeDms?: { degrees: number; minutes: number; seconds: number };
  sign: string;
}

export interface AstroApiAspect {
  pointA: string;
  pointB: string;
  aspect: string;
  angle: number;
  orb: number;
  applying?: boolean;
  pointATitle?: string;
  pointBTitle?: string;
  aspectTitle?: string;
  text?: string;
}

export interface AstroApiNatalResponse {
  dateTime: string;
  points: Record<string, AstroApiPoint>;
  houses: {
    cusps: AstroApiCusp[];
    ascmc?: AstroApiCusp[];
  };
  aspects: AstroApiAspect[];
  chart?: { url: string };
}

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
  quincunx: '⚻',
};

const POINT_TITLES: Record<string, string> = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto',
  'north-node': 'North Node',
  'south-node': 'South Node',
  chiron: 'Chiron',
  lilith: 'Lilith',
  'part-of-fortune': 'Part of Fortune',
};

@Injectable()
export class AstroapiService {
  private readonly logger = new Logger(AstroapiService.name);

  constructor(private config: ConfigService) {}

  private getApiKey(): string | null {
    return this.config.get<string>('ASTROAPI_KEY') ?? null;
  }

  isAvailable(): boolean {
    return !!this.getApiKey();
  }

  getTimezone(lat: number, lon: number): string {
    try {
      const zones = find(lat, lon);
      if (Array.isArray(zones) && zones.length > 0) {
        return zones[0];
      }
      if (typeof zones === 'string') {
        return zones;
      }
    } catch {
      // fallback
    }
    return 'UTC';
  }

  async calculateNatal(params: AstroApiNatalRequest): Promise<AstroApiNatalResponse | null> {
    const apiKey = this.getApiKey();
    // No ASTROAPI_KEY → caller (UserService) uses local buildDetail from DB longitudes.
    if (!apiKey) return null;

    try {
      const body = {
        dateTime: params.dateTime,
        location: {
          latitude: params.latitude,
          longitude: params.longitude,
          timezone: params.timezone,
        },
        houseSystem: params.houseSystem ?? 'placidus',
        language: params.language ?? 'en',
        includeText: params.includeText ?? true,
      };

      const res = await fetch(`${ASTROAPI_BASE}/api/calc/natal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.errors?.[0]?.detail ?? `AstroAPI error: ${res.status}`);
      }

      const data = await res.json();
      const attrs = data?.data?.attributes ?? data?.data ?? data;
      if (attrs?.chart?.url) {
        attrs.chart = { url: attrs.chart.url };
      }
      const typed = attrs as AstroApiNatalResponse;
      const nPoints = typed.points ? Object.keys(typed.points).length : 0;
      const nAspects = typed.aspects?.length ?? 0;
      const nCusps = typed.houses?.cusps?.length ?? 0;
      this.logger.log(
        `AstroAPI natal calc succeeded (${res.status}): ${nPoints} points, ${nCusps} house cusps, ${nAspects} aspects`,
      );
      return typed;
    } catch (e) {
      // HTTP/network/subscription errors → null → UserService falls back to local chart. Check this log to debug AstroAPI.
      console.error('AstroAPI natal calc error:', e);
      return null;
    }
  }

  getChartImageUrl(params: {
    dateTime: string;
    latitude: number;
    longitude: number;
    timezone: string;
    width?: number;
    height?: number;
    theme?: string;
  }): string | null {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    const search = new URLSearchParams({
      width: String(params.width ?? 600),
      height: String(params.height ?? 600),
      dateTime: params.dateTime,
      'location.latitude': String(params.latitude),
      'location.longitude': String(params.longitude),
      'location.timezone': params.timezone,
    });
    if (params.theme) {
      search.set('theme', params.theme);
    }
    return `${ASTROAPI_BASE}/api/chart2/natal.svg?${search.toString()}`;
  }

  getAspectSymbol(aspectName: string): string {
    return ASPECT_SYMBOLS[aspectName?.toLowerCase()] ?? '●';
  }

  getPointTitle(pointId: string): string {
    return POINT_TITLES[pointId?.toLowerCase()] ?? pointId;
  }

  async fetchChartImage(url: string): Promise<{ contentType: string; body: Buffer } | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;
    try {
      const res = await fetch(url, { headers: { 'X-Api-Key': apiKey } });
      if (!res.ok) return null;
      const body = Buffer.from(await res.arrayBuffer());
      this.logger.log(`AstroAPI chart image fetch succeeded (${res.status}, ${body.length} bytes)`);
      return { contentType: res.headers.get('content-type') ?? 'image/svg+xml', body };
    } catch {
      return null;
    }
  }
}
