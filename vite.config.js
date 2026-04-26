import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/components/**", "src/context/**", "src/utils/**", "src/router/**"],
      exclude: ["src/main.jsx", "src/router/index.jsx"],
    },
  },
});
