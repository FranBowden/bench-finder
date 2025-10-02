import express from "express";
import "dotenv/config";

const router = express.Router();
const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;

router.get("/", async (req, res) => {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  try {//geocoding
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?access_token=${MAPBOX_API_KEY}&limit=5`;

    const response = await fetch(url);

    if(!response.ok) {
      console.error(`searching error: ${response.status}: ${response.statusText}`)
    }
    const data = await response.json();

     const suggestions = data.features.map((f: { id: any; text: any; place_name: any; geometry: { coordinates: any[]; }; }) => ({
    id: f.id,
    name: f.text,
    place_name: f.place_name,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0]
  }));

    //console.log(suggestions)
return res.json({ suggestions });  } catch (error) {
    console.error("Search API error:", error);
    return res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

export default router;
