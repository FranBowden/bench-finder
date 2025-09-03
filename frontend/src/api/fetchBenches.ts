import { type Bench } from "../../../shared/types/bench";
import { type BenchWithDirection } from "../../../shared/types/BenchWithDirection";
import { fetchDirection } from "./fetchDirection.js";

export const fetchBenches = async (
  userLocation: { lat: number; lng: number },
  setBenchesWithDirection: React.Dispatch<
    React.SetStateAction<BenchWithDirection[]>
  >
): Promise<void> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const res = await fetch(
      `${API_URL}/api/benches?lat=${userLocation.lat}&lng=${userLocation.lng}`
    );

    const benchesData: Bench[] = (await res.json()).filter(
      (b: Bench) => typeof b.lat === "number" && typeof b.lng === "number"
    );

    const benchesWithInfo: BenchWithDirection[] = await Promise.all(
      benchesData.map(async (b, idx) => {
        const dir = await fetchDirection(
          userLocation.lat,
          userLocation.lng,
          b.lat,
          b.lng
        );
        return {
          ...b,
          originalIndex: idx,
          distanceMiles: dir?.distanceMiles ?? NaN,
          durationMinutes: dir?.durationMinutes ?? NaN,
          distanceText:
            dir?.distanceMiles != null
              ? `${dir.distanceMiles.toFixed(1)} mi away`
              : "Distance unknown",
          durationText:
            dir?.durationMinutes != null
              ? `${dir.durationMinutes.toFixed(0)} min`
              : "Duration unknown",
          geojson: dir?.geojson,
        };
      })
    );

    benchesWithInfo.sort((a, b) => {
      const distA = a.distanceMiles ?? NaN;
      const distB = b.distanceMiles ?? NaN;

      if (isNaN(distA)) return 1;
      if (isNaN(distB)) return -1;

      return distA - distB;
    });

    setBenchesWithDirection(benchesWithInfo);
  } catch (err) {
    console.error("Failed to fetch benches:", err);
  }
};
