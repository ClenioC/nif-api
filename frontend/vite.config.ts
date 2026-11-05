import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Porta fixa: a origem do frontend tem de constar em CORS_ORIGINS na API.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
});
