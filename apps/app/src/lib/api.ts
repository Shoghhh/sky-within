import { API_BASE_URL } from '../config';

const API_BASE = API_BASE_URL;

let authToken: string | null = null;

function logAuthTokenDev(token: string | null, reason: string) {
  if (!__DEV__) return;
  if (token == null) {
    console.log(`[SkyWithin][Auth] ${reason}: token cleared`);
    return;
  }
  console.log(`[SkyWithin][Auth] ${reason} — paste as: Bearer <token>`);
  console.log(token);
}

/** @param reason - shown in dev logs only (e.g. "restored", "login", "logout") */
export function setAuthToken(token: string | null, reason: string = 'token') {
  authToken = token;
  logAuthTokenDev(token, reason);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isNetworkError =
      msg === 'Network request failed' ||
      msg.toLowerCase().includes('network') ||
      msg.toLowerCase().includes('failed to fetch');
    if (isNetworkError) {
      throw new Error(
        'Cannot reach server. Check that the backend is running and that ' +
          (__DEV__ ? 'EXPO_PUBLIC_API_HOST in .env is your machine IP when using a physical device.' : 'you have a working connection.')
      );
    }
    throw e;
  }
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; user: { id: string; email: string; name: string } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    register: (data: {
      email: string;
      password: string;
      name: string;
      birthDate: string;
      birthTime: string;
      birthPlace: string;
      birthLatitude?: number;
      birthLongitude?: number;
      preferences?: object;
    }) => request('/user/register', { method: 'POST', body: JSON.stringify(data) }),
  },

  user: {
    getProfile: () => request<Profile>('/user/profile'),
    updateProfile: (data: Partial<Profile>) =>
      request('/user/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    updateNatalChart: (chart: NatalChart) =>
      request('/user/natal-chart', { method: 'PATCH', body: JSON.stringify(chart) }),
    calculateNatalChart: () => request('/user/natal-chart/calculate', { method: 'POST' }),
    getNatalChartDetail: (options?: { refresh?: boolean; language?: string }) => {
      const params = new URLSearchParams();
      if (options?.refresh) params.set('refresh', '1');
      if (options?.language) params.set('lang', options.language);
      const qs = params.toString();
      return request<NatalChartDetail>(
        `/user/natal-chart/detail${qs ? `?${qs}` : ''}`,
      );
    },
    getNatalChartImageUrl: () =>
      `${API_BASE.replace(/\/$/, '')}/user/natal-chart/chart-image`,
    exportData: () => request('/user/export'),
    reset: () => request<{ message: string }>('/user/reset', { method: 'POST' }),
    deleteAccount: () => request<{ message: string }>('/user/account', { method: 'DELETE' }),
  },

  dailyMessage: {
    get: (date?: string, opts?: { refresh?: boolean }) => {
      const params = new URLSearchParams();
      if (date) params.set('date', date);
      if (opts?.refresh) params.set('refresh', '1');
      const q = params.toString();
      return request<DailyMessage>(q ? `/daily-message?${q}` : '/daily-message');
    },
    generate: (date?: string) =>
      request<DailyMessage>(
        date ? `/daily-message/generate?date=${date}` : '/daily-message/generate',
        { method: 'POST' }
      ),
    getTransits: (date?: string) =>
      request<TransitAspect[]>(
        date ? `/daily-message/transits?date=${date}` : '/daily-message/transits'
      ),
    explainTransit: (body: TransitExplainRequest) =>
      request<TransitExplainResponse>('/daily-message/transit-explain', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  education: {
    getAstrologyBasics: (lang: string) =>
      request<AstrologyBasicsPayload>(
        `/education/astrology-basics?lang=${encodeURIComponent(lang)}`,
      ),
  },

  journal: {
    get: (date?: string) =>
      request<JournalEntry | null>(date ? `/journal?date=${date}` : '/journal'),
    list: () => request<JournalEntry[]>('/journal/entries'),
    create: (data: { text: string; mood?: string; date?: string }) =>
      request<JournalEntry>('/journal', { method: 'POST', body: JSON.stringify(data) }),
    update: (date: string, data: { text?: string; mood?: string }) =>
      request<JournalEntry>(`/journal?date=${date}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (date: string) =>
      request<{ success: boolean }>(`/journal?date=${date}`, { method: 'DELETE' }),
  },
};

export interface Profile {
  id: string;
  email: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  birthLatitude?: number;
  birthLongitude?: number;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: {
      enabled: boolean;
      time: string;
      type: string;
    };
  };
  fcmToken?: string;
  natalChart?: NatalChart;
}

export interface NatalChart {
  sun: number;
  moon: number;
  ascendant: number;
  mercury?: number;
  venus?: number;
  mars?: number;
  jupiter?: number;
  saturn?: number;
  uranus?: number;
  neptune?: number;
  pluto?: number;
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

export interface StructuredNatalInterpretation {
  personalitySummary: {
    identity: string;
    emotions: string;
    outerSelf: string;
  };
  blocks: {
    planetInSign: Array<{ planet: string; sign: string; meaning: unknown }>;
    houseInSign: Array<{ house: number; sign: string; meaning: unknown }>;
    planetInHouse: Array<{ planet: string; house: number; meaning: unknown }>;
    aspects: Array<{ planetA: string; planetB: string; aspect: string; meaning: unknown }>;
  };
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
  structuredInterpretation?: StructuredNatalInterpretation;
  personalityProse?: string;
  /** Priority-grouped data for UX (Big 3, personal planets, top aspects, deeper). */
  layout?: NatalChartLayout;
}

export interface ContributingTransit {
  planet: string;
  target: string;
  aspect: string;
  orb: number;
  intensity?: 'low' | 'medium' | 'high';
}

export interface DailyMessage {
  id: string;
  date: string;
  message: string;
  dominantLayer: string;
  intensity: string;
  adviceType: string;
  tone: string;
  ruleResult?: {
    focus?: string;
    risk?: string;
    opportunity?: string;
    contributingTransits?: ContributingTransit[];
  };
  transitData?: TransitAspect[];
}

export interface TransitAspect {
  planet: string;
  target: string;
  aspect: string;
  orb: number;
  intensity: 'low' | 'medium' | 'high';
}

export interface TransitExplainRequest {
  planet: string;
  target: string;
  aspect: string;
  orb: number;
  intensity: 'high';
  language: string;
}

export interface TransitExplainResponse {
  explanation: string | null;
  source: 'ai' | 'unavailable';
}

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  mood: string | null;
}

/** Backend static astrology glossary (en / ru / hy). */
export interface AstrologyBasicsAspectTypes {
  conjunction: string;
  trine: string;
  square: string;
  opposition: string;
}

export interface AstrologyBasicsConcept {
  id: string;
  title: string;
  definition: string;
  explanation: string;
  example: string;
  summary: string;
  aspectTypes?: AstrologyBasicsAspectTypes;
}

export interface AstrologyBasicsPayload {
  concepts: AstrologyBasicsConcept[];
}

/** Map app locale to backend `lang` (only en, ru, hy have dedicated copy). */
export function mapLanguageForAstrologyBasicsApi(appLanguage: string): string {
  const l = (appLanguage || 'en').trim().toLowerCase();
  if (l === 'ru' || l.startsWith('ru-')) return 'ru';
  if (l === 'hy' || l.startsWith('hy-') || l === 'am') return 'hy';
  return 'en';
}
