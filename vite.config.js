import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),     // main app
        print: resolve(__dirname, "print.html"),    // ✅ separate entry
      },
    },
  },
  server: {
    port: 5173,
  },
});
