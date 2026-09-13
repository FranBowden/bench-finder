import type { DirectionResult, Coordinate } from "@shared/types";
import { fetchJson } from "./apiClient";

type DirectionResponse = { direction?: DirectionResult };

function isValidDirection(
  direction: DirectionResult | undefined
): direction is DirectionResult {
  return (
    !!direction &&
    typeof direction.distanceMiles === "number" &&
    typeof direction.durationMinutes === "number"
  );
}

function toDirectionResult(
  direction: DirectionResult,
  includeGeojson: boolean
): DirectionResult {
  return {
    distanceMiles: direction.distanceMiles,
    durationMinutes: direction.durationMinutes,
    geojson: includeGeojson ? direction.geojson : undefined,
  };
}

export const fetchDirection = async (
  from: Coordinate,
  to: Coordinate,
  includeGeojson: boolean // the route geometry is only needed when the user clicks a bench
): Promise<DirectionResult> => {
  const data = await fetchJson<DirectionResponse>("/api/direction", {
    lat1: from.lat,
    lon1: from.lng,
    lat2: to.lat,
    lon2: to.lng,
  });

  if (!isValidDirection(data.direction)) {
    throw new Error("Mapbox returned invalid direction data");
  }

  return toDirectionResult(data.direction, includeGeojson);
};
