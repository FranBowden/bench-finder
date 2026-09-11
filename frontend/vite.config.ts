import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  // The Mapbox key, API URL, etc. live in a single .env at the repo root
  // (shared with the backend) rather than duplicated inside frontend/.
  envDir: "../",
  server: {
    hmr: {
      overlay: false,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    globals: true,
  },
});
