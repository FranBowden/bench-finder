import express from "express";
import cors from "cors";
import benchesRoutes from "./routes/benches";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/benches", benchesRoutes);

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
