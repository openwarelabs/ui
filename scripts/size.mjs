// Bundle-size check: what an app pays, minified and gzipped, for the library and the blocks — all of each, a
// single component imported alone, and the stylesheets — against the limits in size-limits.json.
//
//   npm run size        after npm run build and npm run blocks:build
//
// The "alone" entries check tree-shaking: importing Button mustn't bring the rest of the library. React is never
// counted. A limit that needs to grow is raised in size-limits.json, in the pull request that grows it, so the
// change is visible in review. Exits 1 when anything is over its limit.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const limits = JSON.parse(fs.readFileSync(path.join(root, "size-limits.json"), "utf8"));
const packages = { "@openwarelabs/ui": "dist/index.js", "@openwarelabs/blocks": "blocks/dist/index.js" };
for (const [name, file] of Object.entries(packages)) {
    if (!fs.existsSync(path.join(root, file))) throw new Error(`${file} is missing: build ${name} first (npm run build, npm run blocks:build).`);
}

const kilobytes = (text) => Number.parseFloat(text) * (text.trim().endsWith("MB") ? 1024 : 1);
const format = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const gzip = (contents) => zlib.gzipSync(contents, { level: 9 }).length;

async function measure(entry) {
    if (entry.file) return gzip(fs.readFileSync(path.join(root, entry.file)));
    const external = ["react", "react-dom", "react/jsx-runtime", ...(entry.external ?? [])];
    const result = await build({
        stdin: { contents: entry.code, resolveDir: root, loader: "js" },
        bundle: true,
        minify: true,
        write: false,
        format: "esm",
        platform: "browser",
        external,
        // The packages as published, from their builds here.
        alias: Object.fromEntries(
            Object.entries(packages)
                .filter(([name]) => !external.includes(name))
                .map(([name, file]) => [name, path.join(root, file)]),
        ),
        logLevel: "silent",
    });
    return gzip(result.outputFiles[0].contents);
}

const rows = [];
for (const entry of limits) {
    const size = await measure(entry);
    const limit = kilobytes(entry.limit) * 1024;
    rows.push({ ...entry, size, over: size > limit, limitBytes: limit });
}

const width = Math.max(...rows.map((row) => row.name.length));
console.log("Minified and gzipped:\n");
for (const row of rows) console.log(`${row.over ? "✗" : "✓"} ${row.name.padEnd(width)}  ${format(row.size).padStart(9)}  of ${format(row.limitBytes)}`);

const summary = [
    "### Bundle size",
    "",
    "| | Minified and gzipped | Limit |",
    "| --- | ---: | ---: |",
    ...rows.map((row) => `| ${row.over ? "✗ " : ""}${row.name} | ${format(row.size)} | ${format(row.limitBytes)} |`),
    "",
];
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary.join("\n")}\n`);

const over = rows.filter((row) => row.over);
if (over.length) {
    console.error(`\n✗ ${over.length} over the limit. If the growth is meant, raise the limit in size-limits.json in the same pull request.`);
    process.exit(1);
}
console.log("\n✓ Everything is within its limit.");
