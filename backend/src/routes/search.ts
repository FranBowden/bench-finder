import express from "express";
import { fetchSuggestions } from "../api/searchAPI";
import { logger } from "../logger";

const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  try {
    const suggestions = await fetchSuggestions(query);
    return res.json({ suggestions });
  } catch (error) {
    logger.error("Search route error:", error);
    return res.status(502).json({ error: "Failed to fetch suggestions" });
  }
});

export default router;
