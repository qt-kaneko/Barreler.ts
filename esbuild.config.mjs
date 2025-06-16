#!/usr/bin/env node

import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/activate.ts"],
  bundle: true,
  outdir: "dist",
  external: [
    "vscode",
  ],
  platform: "node",
  format: "cjs",
  minifyWhitespace: true,
  // sourcemap: "linked",
});