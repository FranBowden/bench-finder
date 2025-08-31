import express from "express";
import "dotenv/config";

const router = express.Router();
const MAPBOX_API_KEY = process.env.VITE_MAPBOX_API_KEY;

router.get("/search", async (req, res) => {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  try {
    const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
      query
    )}&limit=5&access_token=${MAPBOX_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    return res.json(data.suggestions || []);
  } catch (error) {
    console.error("Search API error:", error);
    return res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

export default router;
