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

async function fetchOverpassElements(
  center: Coordinate,
  radius: number
): Promise<OverpassElement[]> {
  const query = `
    [out:json];
    (
      node["amenity"="bench"](around:${radius},${center.lat},${center.lng});
      way["amenity"="bench"](around:${radius},${center.lat},${center.lng});
      relation["amenity"="bench"](around:${radius},${center.lat},${center.lng});
    );
    out center tags ${MAX_RESULTS};
  `;

  try {
    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        query
      )}`,
      {
        headers: {
          "User-Agent": OVERPASS_USER_AGENT,
        },
      }
    );

    if (!response.ok) {
      throw new OverpassError(response.status, response.statusText);
    }

    const data = await response.json();
    return data.elements as OverpassElement[];
  } catch (err) {
    logger.error(
      `Failed to fetch benches from Overpass (lat=${center.lat}, lng=${center.lng}, radius=${radius}):`,
      err
    );
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
  const elements = await fetchOverpassElements(center, radius);
  return parseBenches(elements);
}
