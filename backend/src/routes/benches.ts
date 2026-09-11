import type { Bench } from "@shared/types/bench";
import type { Coordinate } from "@shared/types/coordinate";

import express from "express";
import { fetchBenches, OverpassError } from "../api/benchesAPI";
import { logger } from "../logger";

const router = express.Router();

//GET /api/benches
router.get("/", async (req, res) => {
  //request and response
  const { lat, lng, radius } = req.query;

  const center: Coordinate = { lat: Number(lat), lng: Number(lng) };
  const searchRadius = Number(radius);

  //if latitude or longitude are missing/invalid -> Missing coordinates error
  if (isNaN(center.lat) || isNaN(center.lng)) {
    return res.status(400).json({ error: "Missing coordinates" });
  }

  if (isNaN(searchRadius)) {
    return res.status(400).json({ error: "Missing Radius" });
  }

  try {
    const benches: Bench[] = await fetchBenches(center, searchRadius);

    res.json(benches);
  } catch (err) {
    logger.error("Error fetching benches in route:", err);

    if (err instanceof OverpassError && err.status === 429) {
      return res
        .status(429)
        .json({ error: "Too many requests — please try again in a moment" });
    }

    res.status(500).json({ error: "Failed to fetch benches" });
  }
});

export default router;
