import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;

export async function getDirection(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  retries = 3,
  retryDelay = 1000
): Promise<number> {
  const coordinates = `${lon1},${lat1};${lon2},${lat2}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);

      if (!res.ok) {
        if (res.status === 429 && attempt < retries) {
          // Rate limit, wait and retry
          await delay(retryDelay);
          continue;
        }
        throw new Error(`Mapbox error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      // Check if routes exist
      if (Array.isArray(data.routes) && data.routes.length > 0 && typeof data.routes[0].distance === "number") {
        return data.routes[0].distance; // distance in meters
      } else {
        throw new Error("No valid route returned by Mapbox");
      }

    } catch (err) {
      if (attempt < retries) {
        await delay(retryDelay);
      } else {
        console.warn("Mapbox failed, falling back to Haversine distance:", err);
        return haversineDistanceMiles(lat1, lon1, lat2, lon2);
      }
    }
  }

  // fallback just in case
  return haversineDistanceMiles(lat1, lon1, lat2, lon2);
}

// --- Helpers ---
function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

function haversineDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 3958.8; // miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
