import { defineConfig } from "rolldown";

export default defineConfig([
  {
    input: "src/learn.ts",
    output: {
      file: "dist/learn.js",
    },
    platform: "node",
    tsconfig: "tsconfig.json",
  },
]);
