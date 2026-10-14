// Builds @openwarelabs/blocks into blocks/dist: ESM and CJS (with react and @openwarelabs/ui left as imports),
// styles.css from every block's stylesheet, and the types, with the @blocks/ alias made relative.
// It reads the library's types from dist/, so `npm run build` comes first.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";

import { readBlockStyles, root } from "./css.mjs";
import { pureCalls } from "./pure-calls.mjs";

const blocks = path.join(root, "blocks");
const dist = path.join(blocks, "dist");
if (!fs.existsSync(path.join(root, "dist/index.d.ts"))) throw new Error("Build the library first (npm run build): the blocks' types read dist/index.d.ts.");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const shared = {
    entryPoints: [path.join(blocks, "src/index.ts")],
    bundle: true,
    target: "es2020",
    jsx: "automatic",
    external: ["react", "react-dom", "react/jsx-runtime", "@openwarelabs/ui"],
    tsconfig: path.join(blocks, "tsconfig.json"),
    logLevel: "warning",
    sourcemap: true,
    plugins: [pureCalls],
};
await build({ ...shared, format: "esm", outfile: path.join(dist, "index.js") });
await build({ ...shared, format: "cjs", outfile: path.join(dist, "index.cjs") });

const css = readBlockStyles();
fs.writeFileSync(path.join(dist, "styles.css"), `/* @openwarelabs/blocks: import after @openwarelabs/ui/styles.css. */\n${css}`);

execFileSync(path.join(root, "node_modules/.bin/tsc"), ["-p", path.join(blocks, "tsconfig.build.json")], { stdio: "inherit" });
execFileSync(process.execPath, [path.join(root, "scripts/build-types.mjs"), "blocks/dist", "@blocks/"], { stdio: "inherit" });

const size = (file) => `${(fs.statSync(path.join(dist, file)).size / 1024).toFixed(1)} KB`;
console.log(`blocks/dist: index.js ${size("index.js")}, styles.css ${size("styles.css")}`);
