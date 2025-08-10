import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";
import path from "path";

// Load .env file from the root folder
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase limit to 1000KB
  },
});
