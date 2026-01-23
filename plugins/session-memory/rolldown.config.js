import { defineConfig } from "rolldown";

export default defineConfig([
  {
    input: "src/save.ts",
    output: {
      file: "dist/save.js",
    },
    platform: "node",
    tsconfig: "tsconfig.json",
  },
  {
    input: "src/load.ts",
    output: {
      file: "dist/load.js",
    },
    platform: "node",
    tsconfig: "tsconfig.json",
  },
]);
