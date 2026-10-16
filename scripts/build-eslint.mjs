// Builds the ESLint plugin, @openwarelabs/eslint-plugin-ui, into eslint/dist: ESM and CJS with the manifest
// (what the rules know about the library) bundled in, and the types. `npm run eslint:test` runs its tests on
// the result, and eslint.config.mjs uses it on docs/ and blocks/ once it's built.
import fs from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";

import { root } from "./css.mjs";
import { buildManifest } from "./eslint-manifest.mjs";

const dir = path.join(root, "eslint");
const manifest = buildManifest();
fs.mkdirSync(path.join(dir, "build"), { recursive: true });
fs.writeFileSync(path.join(dir, "build/manifest.json"), JSON.stringify(manifest));

fs.rmSync(path.join(dir, "dist"), { recursive: true, force: true });
const shared = {
    entryPoints: [path.join(dir, "src/index.ts")],
    bundle: true,
    platform: "node",
    target: "node18",
    tsconfig: path.join(dir, "tsconfig.json"),
    logLevel: "warning",
};
await esbuild.build({ ...shared, format: "esm", outfile: path.join(dir, "dist/index.js") });
await esbuild.build({ ...shared, format: "cjs", outfile: path.join(dir, "dist/index.cjs") });
fs.copyFileSync(path.join(dir, "types/index.d.ts"), path.join(dir, "dist/index.d.ts"));
fs.copyFileSync(path.join(dir, "types/index.d.ts"), path.join(dir, "dist/index.d.cts"));

// Keep its version at least the library's, like the MCP server's (scripts/build-mcp.mjs).
const manifestPath = path.join(dir, "package.json");
const pkg = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const parts = (version) => version.split(/[.-]/).slice(0, 3).map(Number);
const behind = (a, b) => {
    const [x, y] = [parts(a), parts(b)];
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i];
    return false;
};
if (behind(pkg.version, manifest.version)) {
    pkg.version = manifest.version;
    fs.writeFileSync(manifestPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

const size = (fs.statSync(path.join(dir, "dist/index.js")).size / 1024).toFixed(0);
console.log(`ESLint plugin ${manifest.version}: ${Object.keys(manifest.components).length} components, ${manifest.properties.length} properties, ${size} KB → eslint/dist/`);
