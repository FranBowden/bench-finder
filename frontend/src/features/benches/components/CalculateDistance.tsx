import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;

export async function getDirection(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  retries = 3,
  retryDelay = 1000
): Promise<number | undefined> {
  const coordinates = `${lon1},${lat1};${lon2},${lat2}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);

      if (!res.ok) {
        if (res.status === 429 && attempt < retries) {
          await delay(retryDelay);
          continue;
        }
        throw new Error(`Mapbox error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (
        Array.isArray(data.routes) &&
        data.routes.length > 0 &&
        typeof data.routes[0].distance === "number"
      ) {
        //convert metres to miles
        const distanceMiles = data.routes[0].distance * 0.000621371;
        return distanceMiles;
      } else {
        throw new Error("No valid route returned by Mapbox");
      }
    } catch (err) {
      if (attempt < retries) {
        await delay(retryDelay);
      } else {
        console.warn("Mapbox failed, falling back to Haversine distance:", err);
      }

      // If all retries fail, return undefined
      return undefined;
    }
  }
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
