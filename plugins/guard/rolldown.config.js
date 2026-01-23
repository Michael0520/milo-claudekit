import { defineConfig } from "rolldown";

export default defineConfig([
  {
    input: "src/guard.ts",
    output: {
      file: "dist/guard.js",
    },
    platform: "node",
    tsconfig: "tsconfig.json",
  },
]);
