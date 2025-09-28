// src/utils/fetchBenches.ts
import { type Bench } from "../../../shared/types/bench";
import { type BenchWithDirection } from "../../../shared/types/BenchWithDirection";
import { fetchDirection } from "./fetchDirection";

export const fetchBenches = async (
  userLocation: { lat: number; lng: number },
  radius: number
): Promise<BenchWithDirection[]> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    //Fench Benches from backend
    const res = await fetch(
      `${API_URL}/api/benches?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radius}`
    );

    if (!res.ok) throw new Error(`Failed to fetch benches: ${res.statusText}`);

    const benchesData: Bench[] = (await res.json()).filter(
      (b: Bench) => typeof b.lat === "number" && typeof b.lng === "number"
    );

    /*
    //Debugging log fetched benches data
	console.log(
      "Bench Data test: " + benchesData.forEach((b) => console.log(b))
    );
	*/
    //Fetch the distance and duration for each bench

    console.log("userLocation: ", userLocation);

    const benchesWithInfo: BenchWithDirection[] = await Promise.all(
      benchesData.map(async (b, idx) => {
        try {
          const dir = await fetchDirection(
            userLocation.lat,
            userLocation.lng,
            b.lat,
            b.lng,
            false //Dont fetch the geojson data as I only need distance/duration for now
          );

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
                ? `${dir.durationMinutes.toFixed(0)} min`
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

    //sort benches by distance
    benchesWithInfo.sort((a, b) => {
      const distA = a.distanceMiles ?? Number.POSITIVE_INFINITY;
      const distB = b.distanceMiles ?? Number.POSITIVE_INFINITY;
      return distA - distB;
    });

    return benchesWithInfo;
  } catch (err) {
    console.error("Failed to fetch benches:", err);
    return [];
  }
};
