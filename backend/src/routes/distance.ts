import express from "express";
import "dotenv/config";
import { getDirection } from "../api/DistanceUtils";

const router = express.Router();

router.get("/", async (req, res) => {
  const { lat1, lon1, lat2, lon2 } = req.query;
  
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return res.status(400).json({ error: "Missing coordinates" });
    }
  
    try {
      const direction = await getDirection(
        Number(lat1),
        Number(lon1),
        Number(lat2),
        Number(lon2)
      );
  
      if (direction === undefined) {
        return res.status(500).json({ error: "Could not calculate distance" });
      }
  
      res.json({ direction });
      // console.log(direction);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" }); //if response status is 500 -> error
    }
});

export default router;
