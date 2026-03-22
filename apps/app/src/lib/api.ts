import { API_BASE_URL } from '../config';

const API_BASE = API_BASE_URL;

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
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

  const res = await fetch(url, { ...options, headers });
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
    exportData: () => request('/user/export'),
    reset: () => request<{ message: string }>('/user/reset', { method: 'POST' }),
    deleteAccount: () => request<{ message: string }>('/user/account', { method: 'DELETE' }),
  },

  dailyMessage: {
    get: (date?: string) =>
      request<DailyMessage>(date ? `/daily-message?date=${date}` : '/daily-message'),
    generate: (date?: string) =>
      request<DailyMessage>(
        date ? `/daily-message/generate?date=${date}` : '/daily-message/generate',
        { method: 'POST' }
      ),
    getTransits: (date?: string) =>
      request<TransitAspect[]>(
        date ? `/daily-message/transits?date=${date}` : '/daily-message/transits'
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

export interface DailyMessage {
  id: string;
  date: string;
  message: string;
  dominantLayer: string;
  intensity: string;
  adviceType: string;
  tone: string;
}

export interface TransitAspect {
  planet: string;
  target: string;
  aspect: string;
  orb: number;
  intensity: 'low' | 'medium' | 'high';
}

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  mood: string | null;
}
