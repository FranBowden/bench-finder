import { type DirectionResult } from "../../../shared/types/directionResult";

export const fetchDirection = async (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<DirectionResult | undefined> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const res = await fetch(
      `${API_URL}/api/direction?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`
    );

    if (!res.ok) {
      console.error("Failed to fetch direction:", res.status);
      return undefined;
    }

    const data = await res.json();

    // Make sure data has distance & duration
    if (
      !data.direction ||
      typeof data.direction.distanceMiles !== "number" ||
      typeof data.direction.durationMinutes !== "number"
    ) {
      console.error("Invalid direction data:", data);
      return undefined;
    }

    return {
      distanceMiles: data.direction.distanceMiles,
      durationMinutes: data.direction.durationMinutes,
      geojson: data.direction.geojson.geometry,
    };
  } catch (err) {
    console.error(err);
    return undefined;
  }
};
