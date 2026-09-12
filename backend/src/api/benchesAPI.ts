import { type Bench } from "@shared/types/bench";
import { type Coordinate } from "@shared/types/coordinate";
import { logger } from "../logger";


// Overpass's server rejects requests with no User-Agent (406 Not
// Acceptable) — Node's fetch doesn't send one by default.
const OVERPASS_USER_AGENT = "bench-finder (github.com/FranBowden/bench-finder)";

// Dense urban areas can return thousands of benches for a single query —
// capping keeps the response fast and reduces load on Overpass's shared,
// rate-limited public instance.
const MAX_RESULTS = 1000;

// Overpass's public instance rate-limits by source IP (429) and times out
// requests under load (504)
const RETRYABLE_STATUSES = [429, 504];
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 300;

// Two independently-run fallbacks rather than one: community Overpass
// mirrors are small volunteer-run instances and can be slow/overloaded at
// any given moment, so a single fallback isn't reliable on its own.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
// Bounds how long we wait on an endpoint that's unreachable/slow before
// moving on to the next one — kept short since with 3 endpoints in the
// chain a slow timeout on each compounds fast.
const FETCH_TIMEOUT_MS = 6000;

const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_COORDINATE_PRECISION = 3;

type BenchCacheEntry = {
  benches: Bench[];
  expiresAt: number;
};

const benchCache = new Map<string, BenchCacheEntry>();

function roundForCache(value: number): number {
  return Number(value.toFixed(CACHE_COORDINATE_PRECISION));
}

function buildCacheKey(center: Coordinate, radius: number): string {
  return `${roundForCache(center.lat)},${roundForCache(center.lng)},${radius}`;
}

function getCachedBenches(key: string): Bench[] | undefined {
  const entry = benchCache.get(key);
  if (!entry) {
    return undefined;
  }

  if (entry.expiresAt < Date.now()) {
    benchCache.delete(key);
    return undefined;
  }

  return entry.benches;
}

function setCachedBenches(key: string, benches: Bench[]): void {
  benchCache.set(key, { benches, expiresAt: Date.now() + CACHE_TTL_MS });
}

// Exposed only for tests — the cache is otherwise an internal implementation
// detail, and tests need to reset it between cases to stay isolated.
export function resetBenchCache(): void {
  benchCache.clear();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type OverpassElement = {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

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

async function fetchOverpassElementsOnce(
  endpoint: string,
  query: string
): Promise<OverpassElement[]> {
  const response = await fetch(
    `${endpoint}?data=${encodeURIComponent(query)}`,
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

async function fetchFromEndpointWithRetry(
  endpoint: string,
  query: string,
  center: Coordinate,
  radius: number,
  attempt = 0
): Promise<OverpassElement[]> {
  try {
    return await fetchOverpassElementsOnce(endpoint, query);
  } catch (err) {
    const isRetryable =
      err instanceof OverpassError && RETRYABLE_STATUSES.includes(err.status);

    if (isRetryable && attempt < MAX_RETRIES) {
      logger.error(
        `Overpass returned ${(err as OverpassError).status} from ${endpoint} (lat=${center.lat}, lng=${center.lng}, radius=${radius}), retrying (attempt ${attempt + 1}/${MAX_RETRIES})`
      );
      await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
      return fetchFromEndpointWithRetry(endpoint, query, center, radius, attempt + 1);
    }

    throw err;
  }
}

async function fetchOverpassElements(
  center: Coordinate,
  radius: number
): Promise<OverpassElement[]> {
  const query = buildOverpassQuery(center, radius);
  let lastError: unknown;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      return await fetchFromEndpointWithRetry(endpoint, query, center, radius);
    } catch (err) {
      lastError = err;
      logger.error(
        `Overpass endpoint ${endpoint} failed (lat=${center.lat}, lng=${center.lng}, radius=${radius}):`,
        err
      );
    }
  }

  throw lastError;
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
  const cached = getCachedBenches(cacheKey);
  if (cached) {
    return cached;
  }

  const elements = await fetchOverpassElements(center, radius);
  const benches = parseBenches(elements);

  setCachedBenches(cacheKey, benches);
  return benches;
}
