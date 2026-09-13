import { type Bench, type Coordinate } from "@shared/types";
import { logger } from "../logger";

type OverpassElement = {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const OVERPASS_USER_AGENT = "bench-finder (github.com/FranBowden/bench-finder)";
const MAX_RESULTS = 1000;
const RETRYABLE_STATUSES = [429, 504];
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 300;
const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
const FETCH_TIMEOUT_MS = 6000;
const CACHE_COORDINATE_PRECISION = 3;
const benchCache = new Map<string, Bench[]>();

function roundForCache(value: number): number {
  return Number(value.toFixed(CACHE_COORDINATE_PRECISION));
}

function buildCacheKey(center: Coordinate, radius: number): string {
  return `${roundForCache(center.lat)},${roundForCache(center.lng)},${radius}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function resetBenchCache(): void {
  benchCache.clear();
}

export class OverpassError extends Error {
  constructor(public readonly status: number, statusText: string) {
    super(`Overpass API request failed with ${status} ${statusText}`);
    this.name = "OverpassError";
  }
}

function buildOverpassQuery(center: Coordinate, radius: number): string {
  return `
    [out:json];
    (
      node["amenity"="bench"](around:${radius},${center.lat},${center.lng});
      way["amenity"="bench"](around:${radius},${center.lat},${center.lng});
      relation["amenity"="bench"](around:${radius},${center.lat},${center.lng});
    );
    out center tags ${MAX_RESULTS};
  `;
}

async function fetchOverpassElementsOnce(query: string): Promise<OverpassElement[]> {
  const response = await fetch(
    `${OVERPASS_ENDPOINT}?data=${encodeURIComponent(query)}`,
    {
      headers: {
        "User-Agent": OVERPASS_USER_AGENT,
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    }
  );

  if (!response.ok) {
    throw new OverpassError(response.status, response.statusText);
  }

  const data = await response.json();
  return data.elements as OverpassElement[];
}

async function fetchOverpassElements(
  center: Coordinate,
  radius: number,
  query: string,
  attempt = 0
): Promise<OverpassElement[]> {
  try {
    return await fetchOverpassElementsOnce(query);
  } catch (err) {
    const isRetryable =
      err instanceof OverpassError && RETRYABLE_STATUSES.includes(err.status);

    if (isRetryable && attempt < MAX_RETRIES) {
      logger.error(
        `Overpass returned ${(err as OverpassError).status} (lat=${center.lat}, lng=${center.lng}, radius=${radius}), retrying (attempt ${attempt + 1}/${MAX_RETRIES})`
      );
      await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
      return fetchOverpassElements(center, radius, query, attempt + 1);
    }

    throw err;
  }
}

function parseBenches(elements: OverpassElement[]): Bench[] {
  const benches: Bench[] = [];

  elements.forEach((element, index) => {
    const lat = element.lat ?? element.center?.lat;
    const lng = element.lon ?? element.center?.lon;

    if (!lat || !lng) {
      return;
    }

    benches.push({ id: index, lat, lng, tags: element.tags });
  });

  return benches;
}

export async function fetchBenches(
  center: Coordinate,
  radius: number
): Promise<Bench[]> {
  const cacheKey = buildCacheKey(center, radius);
  const cached = benchCache.get(cacheKey);
  if (cached) {
    logger.info(`Cache hit for ${cacheKey} (${cached.length} benches)`);
    return cached;
  }

  logger.info(`Cache miss for ${cacheKey}, calling Overpass API`);
  const query = buildOverpassQuery(center, radius);
  const elements = await fetchOverpassElements(center, radius, query);
  const benches = parseBenches(elements);

  benchCache.set(cacheKey, benches);
  return benches;
}
