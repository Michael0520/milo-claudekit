import { defineConfig } from "rolldown";

export default defineConfig([
  {
    input: "src/review.ts",
    output: {
      file: "dist/review.js",
    },
    platform: "node",
    tsconfig: "tsconfig.json",
  },
  {
    input: "src/format.ts",
    output: {
      file: "dist/format.js",
    },
    platform: "node",
    tsconfig: "tsconfig.json",
  },
]);
