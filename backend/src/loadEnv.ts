import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// The .env file (Mapbox key, etc.) lives at the repo root, shared with the
// frontend — not inside backend/. Its location relative to this file differs
// between dev (ts-node running src/index.ts) and a compiled build
// (node running dist/src/index.js), so try both rather than assuming cwd.
const rootEnvCandidates = [
  path.resolve(__dirname, "../../.env"), // dev: backend/src -> backend -> root
  path.resolve(__dirname, "../../../.env"), // build: backend/dist/src -> backend/dist -> backend -> root
];
const rootEnvPath = rootEnvCandidates.find((p) => fs.existsSync(p));
dotenv.config(rootEnvPath ? { path: rootEnvPath } : undefined);
