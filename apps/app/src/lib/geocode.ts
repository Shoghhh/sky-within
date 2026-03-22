/**
 * Geocoding using OpenStreetMap Nominatim (free, no API key required)
 * Rate limit: 1 request per second
 */

export interface GeocodeResult {
  displayName: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1100;

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

export async function searchPlaces(query: string): Promise<GeocodeResult[]> {
  if (!query || query.trim().length < 2) return [];

  await rateLimit();

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: query.trim(),
          format: 'json',
          addressdetails: '1',
          limit: '5',
        }),
      {
        headers: {
          'User-Agent': 'SkyWithin/1.0 (Astrology App)',
        },
      }
    );
    const data = await res.json();

    if (!Array.isArray(data)) return [];

    return data.map((item: { display_name: string; lat: string; lon: string; place_id: number }) => ({
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      placeId: String(item.place_id),
    }));
  } catch {
    return [];
  }
}
