import { type DirectionResult, type Coordinate } from "@shared/types";
import { logger } from "../logger";

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;
const MAPBOX_DIRECTIONS_URL = "https://api.mapbox.com/directions/v5/mapbox/walking";

type MapboxRoute = {
  distance: number;
  duration: number;
  geometry: NonNullable<DirectionResult["geojson"]>["geometry"];
};

function isValidRoute(route: unknown): route is MapboxRoute {
  return (
    typeof route === "object" &&
    route !== null &&
    typeof (route as MapboxRoute).distance === "number"
  );
}

function buildDirectionsUrl(from: Coordinate, to: Coordinate): string {
  const coordinates = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  return `${MAPBOX_DIRECTIONS_URL}/${coordinates}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_API_KEY}`;
}

async function fetchMapboxRoute(url: string): Promise<MapboxRoute> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Mapbox error ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();

  if (Array.isArray(data.routes) && isValidRoute(data.routes[0])) {
    return data.routes[0];
  }

  throw new Error("No valid route returned by Mapbox");
}

function toDirectionResult(route: MapboxRoute): DirectionResult {
  //1 meter = 0.000621371 miles
  const mile = 0.000621371;

  return {
    distanceMiles: route.distance * mile,
    durationMinutes: route.duration / 60,
    geojson: {
      type: "Feature",
      properties: {},
      geometry: route.geometry,
    },
  };
}

export async function getDirection(
  from: Coordinate,
  to: Coordinate
): Promise<DirectionResult> {
  const url = buildDirectionsUrl(from, to);

  try {
    const route = await fetchMapboxRoute(url);
    return toDirectionResult(route);
  } catch (err) {
    logger.error("Failed to fetch direction from Mapbox:", err);
    throw err;
  }
}
