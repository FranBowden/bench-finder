import express from "express";
import cors from "cors";
import * as turf from "@turf/turf";
import { type Bench } from "../../frontend/src/types/bench";

const getBenchImage = (bench: {
  image?: string;
  tag?: { image?: string };
}): string | undefined => {
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

          if (bench.tags) {
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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint to fetch benches from Overpass
app.get("/api/benches", async (req, res) => {
  const lat = req.query.lat as string;
  const lng = req.query.lng as string;

  if (!lat || !lng)
    return res.status(400).json({ error: "Missing coordinates" });

  try {
    const benches: Bench[] = await fetchBenches(Number(lat), Number(lng));
    res.json(benches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch benches" });
  }
});

// Endpoint to get closest benches
app.get("/api/benches/closest", async (req, res) => {
  const lat = req.query.lat as string;
  const lng = req.query.lng as string;
  const count = Number(req.query.count) || 30;

  if (!lat || !lng)
    return res.status(400).json({ error: "Missing coordinates" });

  try {
    const benches: Bench[] = await fetchBenches(Number(lat), Number(lng));
    const closest = getClosestBenches(Number(lat), Number(lng), benches, count);
    res.json(closest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get closest benches" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
