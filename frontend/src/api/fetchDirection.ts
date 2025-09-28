import { type DirectionResult } from "../../../shared/types/directionResult";

export const fetchDirection = async (
  lat1: number, //user latitude
  lon1: number, //user longitude
  lat2: number, //bench latitude
  lon2: number, //bench longitude
  fetchGeojson: boolean //the route data (geojson) is only needed when the user clicks on a bench
): Promise<DirectionResult | undefined> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL; //Localhost

    const res = await fetch(
      `${API_URL}/api/direction?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`
    );

    //console.log("response from fetch Direction:" + res);

    if (!res.ok) {
      console.error("Failed to fetch direction:", res.status);
      return undefined;
    }

    const data = await res.json();

    // Make sure distance & duration exist
    if (
      !data.direction ||
      typeof data.direction.distanceMiles !== "number" ||
      typeof data.direction.durationMinutes !== "number"
    ) {
      console.error("Invalid direction data:", data);
      return undefined;
    }

    // Only include geojson if fetchGeojson is true
    const geojson = fetchGeojson ? data.direction.geojson : undefined;

    return {
      distanceMiles: data.direction.distanceMiles,
      durationMinutes: data.direction.durationMinutes,
      geojson,
    };
  } catch (err) {
    console.error("Error fetching direction:", err);
    return undefined;
  }
};
