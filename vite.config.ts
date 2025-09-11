import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      // Proxy the VEDA STAC API (dev only)
      "/stac": {
        target: "https://openveda.cloud/api/stac",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/stac/, ""),
      },
      // Proxy TiTiler raster API (dev only)
      "/raster": {
        target: "https://openveda.cloud/api/raster",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/raster/, ""),
      },
    },
  },
});
