import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  define: {
    // Vercel sets VERCEL=1 at build time. There, REST calls go through the
    // same-origin /api rewrite in vercel.json so the auth cookie is first-party.
    // eslint-disable-next-line no-undef
    __USE_API_PROXY__: JSON.stringify(process.env.VERCEL === "1"),
  },
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@": path.resolve(__dirname, "./src"),
    },
  },
});