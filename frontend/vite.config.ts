import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API requests during development to the backend server.
    // Override target by setting VITE_API_PROXY in your .env (e.g. VITE_API_PROXY=http://localhost:4020)
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY || "http://localhost:4020",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
