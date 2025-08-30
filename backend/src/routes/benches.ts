// backend/src/routes/benches.ts
import { Router } from "express";
import { fetchBenches, getClosestBenches } from "../services/benchesService";
import { Bench } from "../../../shared/types/bench";

const router = Router();

router.get("/", async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng)
    return res.status(400).json({ error: "Missing coordinates" });

  const benches: Bench[] = await fetchBenches(Number(lat), Number(lng));
  res.json(benches);
});

router.get("/closest", async (req, res) => {
  const { lat, lng, count } = req.query;
  if (!lat || !lng)
    return res.status(400).json({ error: "Missing coordinates" });

  const benches: Bench[] = await fetchBenches(Number(lat), Number(lng));
  const closest = getClosestBenches(
    Number(lat),
    Number(lng),
    benches,
    Number(count) || 30
  );
  res.json(closest);
});

export default router;
