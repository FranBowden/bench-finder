import * as turf from "@turf/turf";
import { useEffect, useState } from "react";

export type Bench = {
  id: number;
  lat: number;
  lng: number;
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
      out center;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
      overpassQuery
    )}`;
    const response = await fetch(url);
    const data = await response.json();

    const benches: Bench[] = data.elements
      .map((bench: any, index: number) => {
        let lat: number | undefined, lng: number | undefined;

        if (bench.type === "node") {
          lng = bench.lon;
          lat = bench.lat;
        } else if (bench.type === "way" || bench.type === "relation") {
          lng = bench.center?.lon;
          lat = bench.center?.lat;
        }

        if (typeof lat === "number" && typeof lng === "number") {
          return { id: index, lat, lng };
        }
        return null;
      })
      .filter(Boolean) as Bench[];

    return benches;
  } catch (error) {
    console.error("Failed to fetch benches:", error);
    return [];
  }
};

export function getClosestBenches(
  userLat: number,
  userLng: number,
  benches: Bench[],
  count: number = 10
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
