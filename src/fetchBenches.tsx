import * as turf from "@turf/turf";

export type Bench = {
  id: number;
  lat: number;
  lng: number;
  tags?: Record<string, string>;
  image?: string;
};

const getBenchImage = (bench: { image?: string; tag?: { image?: string } }): string | undefined => {
  return bench.image || bench.tag?.image;
};


export const fetchBenches = async (
  userLat: number,
  userLng: number
): Promise<Bench[]> => {
  const amount = 1000;
  try {
    const overpassQuery = `
      [out:json];
      (
        node["amenity"="bench"](around:${amount},${userLat},${userLng});
        way["amenity"="bench"](around:${amount},${userLat},${userLng});
        relation["amenity"="bench"](around:${amount},${userLat},${userLng});
      );
      out center tags;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
      overpassQuery
    )}`;
    const response = await fetch(url);
    const data = await response.json();

    const benches: Bench[] = await Promise.all(
      data.elements.map(async (bench: any, index: number) => {
        let lat: number | undefined, lng: number | undefined;

        if (bench.type === "node") {
          lat = bench.lat;
          lng = bench.lon;
        } else if (bench.type === "way" || bench.type === "relation") {
          lat = bench.center?.lat;
          lng = bench.center?.lon;
        }

        if (typeof lat === "number" && typeof lng === "number") {
          const imageUrl = getBenchImage(bench.tags);

         if(bench.tags) {
          console.log(bench);
         }

          return { id: index, lat, lng, tags: bench.tags, imageUrl };
        }
        return null;
      })
    );

    return benches.filter(Boolean) as Bench[];
  } catch (error) {
    console.error("Failed to fetch benches:", error);
    return [];
  }
};

// Turf helper for closest benches
export function getClosestBenches(
  userLat: number,
  userLng: number,
  benches: Bench[],
  count: number = 30
): Bench[] {
  const userPoint = turf.point([userLng, userLat]);

  return benches
    .map((bench) => ({
      ...bench,
      distance: turf.distance(userPoint, turf.point([bench.lng, bench.lat]), {
        units: "kilometers",
      }),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}
