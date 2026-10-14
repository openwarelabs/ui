// Builds the MCP server, @openwarelabs/ui-mcp, into mcp/dist/server.mjs: one file with the docs' data and the
// MCP SDK bundled in, so `npx -y @openwarelabs/ui-mcp` starts without installing anything else.
import fs from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";

import { readAiData } from "./ai-data.mjs";
import { root } from "./css.mjs";

const mcp = path.join(root, "mcp");
const data = await readAiData();

// The package goes on npm, where the design's origin isn't named.
const json = JSON.stringify(data).replace(/Commandr['’]s/g, "Openware's").replace(/Commandr/g, "Openware");
fs.mkdirSync(path.join(mcp, "build"), { recursive: true });
fs.writeFileSync(path.join(mcp, "build/registry.json"), json);

await esbuild.build({
    entryPoints: [path.join(mcp, "src/server.ts")],
    outfile: path.join(mcp, "dist/server.mjs"),
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node18",
    minify: true,
    legalComments: "linked",
    banner: { js: '#!/usr/bin/env node\nimport { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);' },
    logLevel: "warning",
});
fs.chmodSync(path.join(mcp, "dist/server.mjs"), 0o755);

// Keep its version at least the library's, so the server's answers match the release. It can run ahead for a
// server-only fix (0.5.1 while the library is 0.5.0); a new library release brings it back in step.
const manifestPath = path.join(mcp, "package.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const parts = (version) => version.split(/[.-]/).slice(0, 3).map(Number);
const behind = (a, b) => {
    const [x, y] = [parts(a), parts(b)];
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i];
    return false;
};
if (behind(manifest.version, data.version)) {
    manifest.version = data.version;
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

const built = fs.readFileSync(path.join(mcp, "dist/server.mjs"), "utf8");
if (/Commandr/i.test(built)) throw new Error("mcp/dist/server.mjs mentions Commandr");
const size = (fs.statSync(path.join(mcp, "dist/server.mjs")).size / 1024).toFixed(0);
console.log(`MCP server ${data.version}: ${data.components.length} components, ${data.blocks.length} blocks, ${size} KB → mcp/dist/server.mjs`);
