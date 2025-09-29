// src/utils/fetchBenches.ts
import { type Bench } from "../../../shared/types/bench";
import { type BenchWithDirection } from "../../../shared/types/BenchWithDirection";
import { fetchDirection } from "./fetchDirection";

// In-memory cache for directions
const directionCache: Map<
  string,
  { distanceMiles?: number; durationMinutes?: number }
> = new Map();

// Helper to create a unique key per (from → to) pair
const getDirectionCacheKey = (
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
) => `${from.lat},${from.lng}->${to.lat},${to.lng}`;

export const fetchBenches = async (
  userLocation: { lat: number; lng: number },
  radius: number
): Promise<BenchWithDirection[]> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    console.log(
      `[DEBUG] Fetching benches from backend: ${API_URL}/api/benches?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radius}`
    );

    // Fetch benches from backend
    const res = await fetch(
      `${API_URL}/api/benches?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radius}`
    );

    if (!res.ok) {
      console.error(
        `[DEBUG] Backend returned status ${res.status}: ${res.statusText}`
      );
      throw new Error(`Failed to fetch benches: ${res.statusText}`);
    }

    const benchesDataRaw = await res.json();
    console.log("[DEBUG] Raw benches from backend:", benchesDataRaw);

    const benchesData: Bench[] = benchesDataRaw.filter(
      (b: Bench) => typeof b.lat === "number" && typeof b.lng === "number"
    );

    console.log(
      `[DEBUG] Valid benches after filtering lat/lng: ${benchesData.length}`
    );

    if (benchesData.length === 0) {
      console.warn(
        "[DEBUG] No benches found in this area or radius is too small."
      );
    }

    // Fetch the distance and duration for each bench (with caching)
    const benchesWithInfo: BenchWithDirection[] = await Promise.all(
      benchesData.map(async (b, idx) => {
        const cacheKey = getDirectionCacheKey(userLocation, {
          lat: b.lat,
          lng: b.lng,
        });

        if (directionCache.has(cacheKey)) {
          const dir = directionCache.get(cacheKey)!;
          return {
            ...b,
            originalIndex: idx,
            distanceMiles: dir.distanceMiles,
            durationMinutes: dir.durationMinutes,
            distanceText:
              dir.distanceMiles != null
                ? `${dir.distanceMiles.toFixed(1)} mi away`
                : "Distance unknown",
            durationText:
              dir.durationMinutes != null
                ? `${dir.durationMinutes.toFixed(0)} mins`
                : "Duration unknown",
            geojson: undefined,
          };
        }

        try {
          const dir = await fetchDirection(
            userLocation.lat,
            userLocation.lng,
            b.lat,
            b.lng,
            false
          );
          directionCache.set(cacheKey, {
            distanceMiles: dir?.distanceMiles,
            durationMinutes: dir?.durationMinutes,
          });

          return {
            ...b,
            originalIndex: idx,
            distanceMiles: dir?.distanceMiles,
            durationMinutes: dir?.durationMinutes,
            distanceText:
              dir?.distanceMiles != null
                ? `${dir.distanceMiles.toFixed(1)} mi away`
                : "Distance unknown",
            durationText:
              dir?.durationMinutes != null
                ? `${dir.durationMinutes.toFixed(0)} mins`
                : "Duration unknown",
            geojson: undefined,
          };
        } catch (err) {
          console.warn(`Failed to fetch direction for bench ${b.id}:`, err);
          return {
            ...b,
            originalIndex: idx,
            distanceMiles: undefined,
            durationMinutes: undefined,
            distanceText: "Distance unknown",
            durationText: "Duration unknown",
            geojson: undefined,
          };
        }
      })
    );

    console.log(
      `[DEBUG] Benches with directions computed: ${benchesWithInfo.length}`
    );

    benchesWithInfo.sort(
      (a, b) => (a.distanceMiles ?? Infinity) - (b.distanceMiles ?? Infinity)
    );

    return benchesWithInfo;
  } catch (err) {
    console.error("Failed to fetch benches:", err);
    return [];
  }
};
