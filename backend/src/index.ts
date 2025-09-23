import express from "express";
import cors from "cors"; //Cross-Origin Resource Sharing
import benchesRoutes from "./routes/benches";
import { getDirection } from "./utils/DistanceUtils";
//import searchRoutes from "./routes/search.ts";
const app = express();
const PORT = process.env.PORT || 3000; //port number

app.use(cors());
app.use(express.json());

app.use("/api/benches", benchesRoutes); //bench route
//app.use("/api/search", searchRoutes); //search route

//
app.get("/api/direction", async (req, res) => {
  //request and response
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
    console.log(direction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" }); //if response status is 500 -> error
  }
});

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
