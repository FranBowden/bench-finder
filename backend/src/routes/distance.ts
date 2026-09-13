import express from "express";
import type { Coordinate } from "@shared/types";
import { getDirection } from "../api/distanceAPI";
import { logger } from "../logger";

const router = express.Router();

router.get("/", async (req, res) => {
  const { lat1, lon1, lat2, lon2 } = req.query;

  const from: Coordinate = { lat: Number(lat1), lng: Number(lon1) };
  const to: Coordinate = { lat: Number(lat2), lng: Number(lon2) };

  if (isNaN(from.lat) || isNaN(from.lng) || isNaN(to.lat) || isNaN(to.lng)) {
    return res.status(400).json({ error: "Missing coordinates" });
  }

  try {
    const direction = await getDirection(from, to);

    res.json({ direction });æ
  } catch (error) {
    logger.error("Direction route error:", error);
    res.status(500).json({ error: "Internal Server Error" }); //if response status is 500 -> error
  }
});

export default router;
