import "./loadEnv";
import express from "express";
import cors from "cors"; 
import benchesRoutes from "./routes/benches";
import distanceRoutes from "./routes/distance";
import { logger } from "./logger";

const app = express();
const PORT = process.env.PORT;

if (!PORT) {
  throw new Error("PORT environment variable is required");
}

app.use(cors());
app.use(express.json());
app.use("/api/benches", benchesRoutes);
app.use("/api/direction", distanceRoutes);  

app.listen(PORT, () => logger.info(`Backend running on http://localhost:${PORT}`));
