import express from "express";
import "dotenv/config";

const router = express.Router();
const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;

router.get("/", async (req, res) => {
  const query = req.query.q as string;
        const sessionToken = req.query.session_token;

  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  try {

  const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
      query
    )}&limit=5&access_token=${MAPBOX_API_KEY}&session_token=${sessionToken}`;

    const response = await fetch(url);

    if(!response.ok) {
      console.error(`searching error: ${response.status}: ${response.statusText}`)
    }
    const data = await response.json();

    console.log(data)
    return res.json(data)
  } catch (error) {
    console.error("Search API error:", error);
    return res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

export default router;
