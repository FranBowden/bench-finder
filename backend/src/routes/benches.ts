import type { Bench } from "@shared/types/bench";

import { Router } from "express";
import { fetchBenches } from "../api/benchesService";

const router = Router();

//GET /api/benches
router.get("/", async (req, res) => {
  //request and response
  const { lat, lng, radius } = req.query;

  //if there are no latitude or Longitude -> Missing coordinates error
  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing coordinates" });
  }

  if (!radius) {
    return res.status(400).json({ error: "Missing Radius" });
  }

  try {
    const benches: Bench[] = await fetchBenches(
      Number(lat),
      Number(lng),
      Number(radius) || 3000
    );

    res.json(benches);
  } catch (err) {
    console.error("Error fetching benches in route:", err);
    // Return a 500 error instead of crashing
    res.status(500).json({ error: "Failed to fetch benches" });
  }
});

export default router;
