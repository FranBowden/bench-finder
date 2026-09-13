import { distance, point } from "@turf/turf";
import type { Feature, Point } from "geojson";
import type { Bench, BenchWithDirection, Coordinate } from "@shared/types";
import { fetchJson } from "./apiClient";

// Straight-line estimate only — see handleBenchClick for the real routed
// distance/duration, fetched on demand per selected bench, not per list.
const AVERAGE_WALKING_MPH = 3;

function hasCoordinates(bench: Bench): boolean {
  return typeof bench.lat === "number" && typeof bench.lng === "number";
}

function toBenchWithDirection(
  bench: Bench,
  index: number,
  userPoint: Feature<Point>
): BenchWithDirection {
  const benchPoint = point([bench.lng, bench.lat]);
  const distanceMiles = distance(userPoint, benchPoint, { units: "miles" });
  const durationMinutes = (distanceMiles / AVERAGE_WALKING_MPH) * 60;

  return {
    ...bench,
    originalIndex: index,
    distanceMiles,
    durationMinutes,
    geojson: undefined,
  };
}

function byDistanceAscending(a: BenchWithDirection, b: BenchWithDirection): number {
  // Every bench here just had its distance computed above, so this fallback
  // should never actually trigger — it only exists to satisfy the type,
  // which allows distanceMiles to be missing in other contexts.
  const distanceA = a.distanceMiles ?? Infinity;
  const distanceB = b.distanceMiles ?? Infinity;
  return distanceA - distanceB;
}

export const fetchBenches = async (
  userLocation: Coordinate,
  radius: number
): Promise<BenchWithDirection[]> => {
  const rawBenches = await fetchJson<Bench[]>("/api/benches", {
    lat: userLocation.lat,
    lng: userLocation.lng,
    radius,
  });

  const validBenches = rawBenches.filter(hasCoordinates);
  const userPoint = point([userLocation.lng, userLocation.lat]);

  const benchesWithDirection = validBenches.map((bench, index) =>
    toBenchWithDirection(bench, index, userPoint)
  );

  return benchesWithDirection.sort(byDistanceAscending);
};
