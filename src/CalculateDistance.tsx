/*
export function calculateDistanceMiles(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const earthRadiusMiles = 3958.8;

  const deltaLatitude = toRadians(latitude2 - latitude1);
  const deltaLongitude = toRadians(longitude2 - longitude1);

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(deltaLongitude / 2) ** 2;

  const angularDistance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceMiles = earthRadiusMiles * angularDistance;

  return distanceMiles;
}*/
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;

export async function getDirection(  
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
): Promise<number> {
  const coordinates = `${longitude1},${latitude1};${longitude2},${latitude2}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Mapbox Directions API error: ${response.statusText}`);
  }

  const data = await response.json();
  const distanceInMeters = data.routes[0]?.distance || 0;

  return distanceInMeters;
}
