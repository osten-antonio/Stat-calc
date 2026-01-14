import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    include: ["app/lib/math/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"]
  }
});
