import { logger } from "../logger";

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;
const MAPBOX_GEOCODING_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

export type PlaceSuggestion = {
  id: string;
  name: string;
  place_name: string;
  lat: number;
  lng: number;
};

type MapboxGeocodingFeature = {
  id: string;
  text: string;
  place_name: string;
  geometry: { coordinates: [number, number] };
};

function buildGeocodingUrl(query: string): string {
  return `${MAPBOX_GEOCODING_URL}/${encodeURIComponent(
    query
  )}.json?access_token=${MAPBOX_API_KEY}&limit=5`;
}

function toSuggestion(feature: MapboxGeocodingFeature): PlaceSuggestion {
  return {
    id: feature.id,
    name: feature.text,
    place_name: feature.place_name,
    // GeoJSON coordinates are [lng, lat], the reverse of the usual order.
    lat: feature.geometry.coordinates[1],
    lng: feature.geometry.coordinates[0],
  };
}

export async function fetchSuggestions(query: string): Promise<PlaceSuggestion[]> {
  const url = buildGeocodingUrl(query);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Mapbox geocoding error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return (data.features as MapboxGeocodingFeature[]).map(toSuggestion);
  } catch (err) {
    logger.error("Failed to fetch suggestions from Mapbox:", err);
    throw err;
  }
}
