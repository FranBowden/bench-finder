import type { Bench } from "@shared/types/bench";

import { Router } from "express";
import { fetchBenches } from "../services/benchesService";

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

  //fetchBenches returns a Promise that will eventually give an array of Bench objects
  //await pauses execution until the Promise finishes
  //the resulting array of benches is stored in the variable benches
  const benches: Bench[] = await fetchBenches(
    Number(lat),
    Number(lng),
    Number(radius) || 3000
  ); //default radius is 3000 meters if not provided
  res.json(benches); //sends JSON response (converts javascript object/array into JSON and returns back to client)
});

export default router;
