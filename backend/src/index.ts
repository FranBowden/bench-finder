import express from "express";
import cors from "cors"; //Cross-Origin Resource Sharing
import benchesRoutes from "./routes/benches";
import distanceRoutes from "./routes/distance"
import searchRoutes from "./routes/search"

const app = express();
const PORT = process.env.PORT || 3000; //port number

app.use(cors());
app.use(express.json());

app.use("/api/benches", benchesRoutes); //bench route
app.use("/api/search", searchRoutes); //search route
app.use("/api/direction", distanceRoutes); //distance route

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
