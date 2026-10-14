// Package smoke test: packs @openwarelabs/ui and @openwarelabs/blocks exactly as `npm publish` would, installs the
// tarballs in a new app with nothing else from this repository, and uses them the ways an app does:
//
//   - publint and arethetypeswrong on each tarball: package.json, exports and types for import, require and bundlers
//   - import (ESM) and require (CJS) in Node, with every export there in both, and a few components rendered
//   - a bundle of an app's entry, styles included, so every file the exports point at is in the package
//   - a TypeScript check of an app using them, against the published types
//
//   npm run smoke       after npm run build and npm run blocks:build
//
// It needs the npm registry for React, TypeScript and esbuild in the new app. Exits 1 on the first failure.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const work = path.join(root, ".tmp/smoke");
const packs = path.join(work, "packs");
const app = path.join(work, "app");
const bin = (name) => path.join(root, "node_modules/.bin", name);
const run = (command, args, cwd = root) => execFileSync(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
const step = (title) => console.log(`\n${title}`);

for (const file of ["dist/index.js", "blocks/dist/index.js"]) {
    if (!fs.existsSync(path.join(root, file))) throw new Error(`${file} is missing: run npm run build and npm run blocks:build first.`);
}
fs.rmSync(work, { recursive: true, force: true });
fs.mkdirSync(packs, { recursive: true });
fs.mkdirSync(app, { recursive: true });

try {
    step("Packing…");
    const tarballs = {};
    for (const [name, dir] of [
        ["@openwarelabs/ui", root],
        ["@openwarelabs/blocks", path.join(root, "blocks")],
    ]) {
        // npm 10 runs the library's prepare script (its build) even with --ignore-scripts; its log comes first.
        const output = run("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", packs], dir);
        const [info] = JSON.parse(output.slice(output.search(/^\[/m)));
        tarballs[name] = path.join(packs, info.filename);
        console.log(`  ${info.filename}: ${info.entryCount} files, ${(info.size / 1024).toFixed(0)} KB`);
    }

    step("publint and arethetypeswrong…");
    for (const [name, tarball] of Object.entries(tarballs)) {
        run(bin("publint"), [tarball]);
        // Only the JavaScript entry: the stylesheets have no types, by design.
        run(bin("attw"), [tarball, "--entrypoints", ".", "--format", "ascii"]);
        console.log(`  ${name}: ✓`);
    }

    step("Installing them in a new app…");
    const own = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    const version = (dependency) => own.devDependencies[dependency].replace(/^[\^~]/, "");
    fs.writeFileSync(path.join(app, "package.json"), JSON.stringify({ name: "smoke-app", private: true, type: "module" }, null, 2));
    run(
        "npm",
        [
            "install",
            "--no-audit",
            "--no-fund",
            "--loglevel=error",
            tarballs["@openwarelabs/ui"],
            tarballs["@openwarelabs/blocks"],
            ...["react", "react-dom", "@types/react", "@types/react-dom", "typescript", "esbuild"].map((dependency) => `${dependency}@${version(dependency)}`),
        ],
        app,
    );
    console.log("  ✓");

    step("Using them from Node, with import and with require…");
    fs.writeFileSync(
        path.join(app, "esm.mjs"),
        `import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import * as ui from "@openwarelabs/ui";
import * as blocks from "@openwarelabs/blocks";
const html = [
    renderToString(h(ui.Button, { variant: "primary" }, "Deploy")),
    renderToString(h(blocks.Hero01, { title: "Ship it", primaryAction: { label: "Start", href: "#" } })),
    renderToString(h(blocks.Faq01, { title: "Questions", questions: [{ question: "Why?", answer: "Because." }] })),
].join("");
if (!html.includes("Deploy") || !html.includes("Ship it") || !html.includes("Because.")) throw new Error("A component rendered without its content.");
console.log(JSON.stringify({ ui: Object.keys(ui).sort(), blocks: Object.keys(blocks).sort() }));
`,
    );
    fs.writeFileSync(
        path.join(app, "cjs.cjs"),
        `const ui = require("@openwarelabs/ui");
const blocks = require("@openwarelabs/blocks");
console.log(JSON.stringify({ ui: Object.keys(ui).filter((key) => key !== "__esModule").sort(), blocks: Object.keys(blocks).filter((key) => key !== "__esModule").sort() }));
`,
    );
    const esm = JSON.parse(run("node", ["esm.mjs"], app));
    const cjs = JSON.parse(run("node", ["cjs.cjs"], app));
    for (const name of ["ui", "blocks"]) {
        const missing = esm[name].filter((key) => !cjs[name].includes(key));
        if (missing.length || cjs[name].length !== esm[name].length)
            throw new Error(`@openwarelabs/${name}: import and require differ (${missing.join(", ") || "in count"}).`);
    }
    console.log(`  ✓ ${esm.ui.length} exports from the library and ${esm.blocks.length} from the blocks, the same both ways`);

    step("Bundling an app, styles and all…");
    fs.mkdirSync(path.join(app, "src"), { recursive: true });
    fs.writeFileSync(
        path.join(app, "src/main.tsx"),
        `import "@openwarelabs/ui/fonts.css";
import "@openwarelabs/ui/styles.css";
import "@openwarelabs/blocks/styles.css";

import { createRoot } from "react-dom/client";
import { Button, Toaster, toast } from "@openwarelabs/ui";
import { Hero01, type Hero01Props } from "@openwarelabs/blocks";

const hero: Hero01Props = {
    title: "The workspace for shipping software",
    primaryAction: { label: "Start for free", href: "/signup" },
    // @ts-expect-error: the published types must catch a wrong prop.
    secondaryAction: { href: "/demo" },
};

createRoot(document.getElementById("root")!).render(
    <>
        <Hero01 {...hero} />
        <Button onClick={() => toast("Saved")}>Save</Button>
        <Toaster />
    </>,
);
`,
    );
    run(
        path.join(app, "node_modules/.bin/esbuild"),
        ["src/main.tsx", "--bundle", "--outdir=out", "--loader:.woff2=file", "--jsx=automatic", "--log-level=error"],
        app,
    );
    console.log("  ✓");

    step("Type-checking it against the published types…");
    fs.writeFileSync(
        path.join(app, "tsconfig.json"),
        JSON.stringify(
            {
                compilerOptions: {
                    target: "es2022",
                    module: "esnext",
                    moduleResolution: "bundler",
                    jsx: "react-jsx",
                    strict: true,
                    noEmit: true,
                    skipLibCheck: false,
                    lib: ["es2022", "dom"],
                    types: [],
                },
                include: ["src"],
            },
            null,
            2,
        ),
    );
    run(path.join(app, "node_modules/.bin/tsc"), ["-p", "."], app);
    console.log("  ✓");
} catch (error) {
    const output = [error.stdout, error.stderr].filter(Boolean).join("\n").trim();
    console.error(`\n✗ ${error.message.split("\n")[0]}${output ? `\n\n${output}` : ""}`);
    process.exit(1);
}
console.log("\n✓ The packages install and work as published.");
