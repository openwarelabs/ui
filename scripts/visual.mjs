// Visual regression check: renders every block (at desktop and phone width) and every component example (at
// desktop width) in light and dark, in two builds of the docs, and compares them pixel by pixel.
//
//   npm run visual                          this working tree against main, built here (a worktree in .tmp/visual)
//   node scripts/visual.mjs --base <docs-dist> --head <docs-dist> [--out <dir>] [--allow]
//                                           two builds made elsewhere, as CI does
//
// Both sides render on the same machine in the same browser, so there are no stored baselines and no font or OS
// differences: anything that differs, changed. The report (<out>/index.html) shows each change before, after and
// with the differing pixels marked. It exits 1 when something changed or disappeared, unless --allow (CI passes it
// when a pull request has the "visual change" label). New blocks and examples are listed, and don't fail it.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pixelmatch from "pixelmatch";
import { chromium } from "playwright";
import { PNG } from "pngjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const option = (name) => {
    const index = args.indexOf(`--${name}`);
    return index === -1 ? undefined : args[index + 1];
};
const allow = args.includes("--allow");
const out = path.resolve(option("out") ?? path.join(root, ".tmp/visual/report"));
const workers = Number(option("workers") ?? Math.max(2, os.availableParallelism()));
/** Only blocks and component pages whose id contains this, for a quick look at a few. */
const filter = option("filter");
/** Pixels that may differ before a picture counts as changed: anti-aliasing noise, never a real change. */
const tolerance = Number(option("tolerance") ?? 8);

const run = (command, commandArgs, cwd) => execFileSync(command, commandArgs, { cwd, stdio: "inherit" });

// 1. The two builds of the docs.
let base = option("base") && path.resolve(option("base"));
let head = option("head") && path.resolve(option("head"));
if (!head) {
    console.log("Building the docs from this working tree…");
    run("npm", ["run", "docs:build", "--silent"], root);
    head = path.join(root, "docs-dist");
}
if (!base) {
    const ref = option("ref") ?? "main";
    const tree = path.join(root, ".tmp/visual/base");
    console.log(`Building the docs from ${ref}…`);
    fs.rmSync(tree, { recursive: true, force: true });
    execFileSync("git", ["worktree", "prune"], { cwd: root });
    execFileSync("git", ["worktree", "add", "--detach", "--force", tree, ref], { cwd: root, stdio: "ignore" });
    // The same dependencies as here; a branch that changes them is best compared in CI, which installs each side.
    fs.symlinkSync(path.join(root, "node_modules"), path.join(tree, "node_modules"), "dir");
    run("npm", ["run", "build", "--silent"], tree);
    if (fs.existsSync(path.join(tree, "blocks/package.json"))) run("npm", ["run", "blocks:build", "--silent"], tree);
    run("npm", ["run", "docs:build", "--silent"], tree);
    base = path.join(tree, "docs-dist");
}

// 2. A static server for each, on a free port.
const types = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".svg": "image/svg+xml",
};
function serve(dir) {
    const server = http.createServer((request, response) => {
        const file = path.join(dir, decodeURIComponent(new URL(request.url, "http://x").pathname));
        if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
            response.writeHead(404).end();
            return;
        }
        response.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
        fs.createReadStream(file).pipe(response);
    });
    return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` })));
}

// 3. What to look at: the blocks and component pages either build has.
const blockIds = (dir) => {
    const blocks = path.join(dir, "build/blocks");
    return fs.existsSync(blocks)
        ? fs
              .readdirSync(blocks, { recursive: true })
              .map(String)
              .filter((file) => file.endsWith(".json"))
              .map((file) =>
                  file
                      .replace(/\.json$/, "")
                      .split(path.sep)
                      .join("/"),
              )
        : [];
};
const componentSlugs = (dir) => {
    const pages = path.join(dir, "ai/components");
    return fs.existsSync(pages) ? fs.readdirSync(pages).map((file) => file.replace(/\.md$/, "")) : [];
};
const union = (a, b) => [...new Set([...a, ...b])].sort();
const matches = (id) => !filter || id.includes(filter);
const blocks = union(blockIds(base), blockIds(head)).filter(matches);
const components = union(componentSlugs(base), componentSlugs(head)).filter(matches);

const variants = [
    { name: "desktop-light", width: 1280, colorScheme: "light" },
    { name: "desktop-dark", width: 1280, colorScheme: "dark" },
    { name: "phone-light", width: 390, colorScheme: "light", blocksOnly: true },
    { name: "phone-dark", width: 390, colorScheme: "dark", blocksOnly: true },
];

const allJobs = [];
for (const variant of variants) {
    for (const id of blocks) allJobs.push({ kind: "block", id, variant });
    if (!variant.blocksOnly) for (const slug of components) allJobs.push({ kind: "component", id: slug, variant });
}
/** The page a picture's key came from, to capture it again. */
const jobOf = (key) => {
    const parts = key.split("/");
    const variant = variants.find((item) => item.name === parts.at(-1));
    return parts[0] === "blocks" ? { kind: "block", id: parts.slice(1, -1).join("/"), variant } : { kind: "component", id: parts[1], variant };
};

/** Every picture of the given pages on one side: key → PNG buffer. */
async function capture(browser, url, label, list) {
    const shots = new Map();
    const jobs = [...list];
    let done = 0;
    // A context for each page: the fake clock belongs to the context, so pages sharing one would move each other's.
    const pageFor = async (variant) => {
        const context = await browser.newContext({
            viewport: { width: variant.width, height: 900 },
            colorScheme: variant.colorScheme,
            reducedMotion: "reduce",
        });
        const page = await context.newPage();
        page.on("crash", () => console.warn(`  ${label}: a page crashed`));
        // Timers, animation frames and the date are fake and paused, so a streaming message or a shimmer is at the
        // same moment on both sides, whatever the machine's speed. CSS animations are stopped by the screenshot.
        await page.clock.install({ time: new Date("2026-01-01T09:00:00Z") });
        await page.clock.pauseAt(new Date("2026-01-01T09:00:01Z"));
        return page;
    };
    const settle = async (page) => {
        await page.evaluate(() => document.fonts.ready);
        await page.clock.runFor(10_000);
    };
    const work = async () => {
        for (let job = jobs.shift(); job; job = jobs.shift()) {
            const page = await pageFor(job.variant);
            try {
                if (job.kind === "block") {
                    await page.goto(`${url}/frame.html?block=${job.id}`, { waitUntil: "load" });
                    await settle(page);
                    shots.set(`blocks/${job.id}/${job.variant.name}`, await page.screenshot({ fullPage: true, animations: "disabled", caret: "hide" }));
                } else {
                    await page.goto(`${url}/index.html#/components/${job.id}`, { waitUntil: "load" });
                    await settle(page);
                    const previews = await page.locator(".docs-example__preview").all();
                    const seen = new Map();
                    for (const preview of previews) {
                        const section = await preview.evaluate((element) => element.closest("section[id]")?.id ?? "example");
                        const count = seen.get(section) ?? 0;
                        seen.set(section, count + 1);
                        // Alone at the top: everything before it is hidden, so an example that only moved (because
                        // something above it on the page grew by a fraction of a pixel) doesn't come out a hair different.
                        await preview.evaluate((element) => {
                            for (const [hidden, display] of window.__visualHidden ?? []) hidden.style.display = display;
                            window.__visualHidden = [];
                            for (let node = element; node && node !== document.body; node = node.parentElement) {
                                for (let sibling = node.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
                                    window.__visualHidden.push([sibling, sibling.style.display]);
                                    sibling.style.display = "none";
                                }
                            }
                            window.scrollTo(0, 0);
                        });
                        const key = `components/${job.id}/${section}${count ? `-${count + 1}` : ""}/${job.variant.name}`;
                        shots.set(key, await preview.screenshot({ animations: "disabled", caret: "hide" }));
                    }
                }
            } catch (error) {
                console.warn(`  ${label}: couldn't capture ${job.kind} ${job.id} (${job.variant.name}): ${error.message.split("\n")[0]}`);
            } finally {
                await page.context().close();
                done += 1;
                if (done % 100 === 0) console.log(`  ${label}: ${done} pages`);
            }
        }
    };
    await Promise.all(Array.from({ length: workers }, work));
    return shots;
}

function compare(before, after) {
    const a = PNG.sync.read(before);
    const b = PNG.sync.read(after);
    if (a.width !== b.width || a.height !== b.height) return { changed: true, pixels: null, size: `${a.width}×${a.height} → ${b.width}×${b.height}` };
    const diff = new PNG({ width: a.width, height: a.height });
    const pixels = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
    return { changed: pixels > tolerance, pixels, diff: PNG.sync.write(diff) };
}

const launch = { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined };
const browser = await chromium.launch(launch);
const [baseServer, headServer] = await Promise.all([serve(base), serve(head)]);
console.log(`Comparing ${blocks.length} blocks and ${components.length} component pages, in light and dark…`);
const before = await capture(browser, baseServer.url, "before", allJobs);
const after = await capture(browser, headServer.url, "after", allJobs);

// 4. The differences, and a report.
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const results = { changed: [], added: [], removed: [], same: 0 };
const save = (key, kind, buffer) => {
    const file = `${key.replace(/[^\w-]+/g, "_")}.${kind}.png`;
    fs.writeFileSync(path.join(out, file), buffer);
    return file;
};
// A picture that differs is captured again on both sides, up to twice: a real change differs every time, while a
// page that settled a frame late (rare, but it happens) doesn't.
const compared = new Map();
const differing = () => [...compared].filter(([, result]) => result.changed).map(([key]) => key);
for (const key of before.keys()) if (after.has(key)) compared.set(key, compare(before.get(key), after.get(key)));
for (let attempt = 1; attempt <= 2 && differing().length; attempt++) {
    const keys = differing();
    const jobs = [...new Map(keys.map((key) => [JSON.stringify(jobOf(key)), jobOf(key)])).values()];
    console.log(`Capturing ${keys.length} differing pictures again (${attempt} of 2)…`);
    const [again, againAfter] = [await capture(browser, baseServer.url, "before", jobs), await capture(browser, headServer.url, "after", jobs)];
    for (const key of keys) {
        if (!again.has(key) || !againAfter.has(key)) continue;
        const result = compare(again.get(key), againAfter.get(key));
        if (!result.changed) compared.set(key, result);
    }
}
await browser.close();
baseServer.server.close();
headServer.server.close();

for (const key of union([...before.keys()], [...after.keys()])) {
    if (!after.has(key)) {
        results.removed.push({ key, before: save(key, "before", before.get(key)) });
        continue;
    }
    if (!before.has(key)) {
        results.added.push({ key, after: save(key, "after", after.get(key)) });
        continue;
    }
    const result = compared.get(key);
    if (!result.changed) {
        results.same += 1;
        continue;
    }
    results.changed.push({
        key,
        pixels: result.pixels,
        size: result.size,
        before: save(key, "before", before.get(key)),
        after: save(key, "after", after.get(key)),
        diff: result.diff ? save(key, "diff", result.diff) : null,
    });
}
fs.writeFileSync(path.join(out, "results.json"), JSON.stringify(results, null, 2));

const escape = (text) => String(text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const figure = (title, file) =>
    file ? `<figure><figcaption>${title}</figcaption><a href="${file}"><img src="${file}" loading="lazy" alt="${title}"></a></figure>` : "";
const section = (title, list, render) => (list.length ? `<h2>${title} (${list.length})</h2>${list.map(render).join("")}` : "");
fs.writeFileSync(
    path.join(out, "index.html"),
    `<!doctype html><meta charset="utf-8"><title>Visual changes</title><style>
body{font:14px/1.5 system-ui,sans-serif;margin:32px;color:#1c2333;background:#f6f7f9}h1{font-size:22px}h2{margin-top:40px;font-size:17px}
.item{background:#fff;border:1px solid #dde1e8;border-radius:10px;padding:16px;margin:16px 0}.item h3{margin:0 0 12px;font:600 13px ui-monospace,monospace}
.row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}figure{margin:0}figcaption{color:#5d6679;font-size:12px;margin-bottom:4px}
img{max-width:100%;border:1px solid #dde1e8;border-radius:6px;background:repeating-conic-gradient(#eee 0 25%,#fff 0 50%) 0 0/16px 16px}
@media (prefers-color-scheme:dark){body{background:#12151b;color:#e3e7ee}.item{background:#1a1e26;border-color:#2b313c}}</style>
<h1>Visual changes</h1><p>${results.changed.length} changed, ${results.added.length} new, ${results.removed.length} gone, ${results.same} the same.</p>
${section("Changed", results.changed, (item) => `<div class="item"><h3>${escape(item.key)} · ${item.size ?? `${item.pixels} pixels`}</h3><div class="row">${figure("Before", item.before)}${figure("After", item.after)}${figure("Difference", item.diff)}</div></div>`)}
${section("Gone", results.removed, (item) => `<div class="item"><h3>${escape(item.key)}</h3><div class="row">${figure("Before", item.before)}</div></div>`)}
${section("New", results.added, (item) => `<div class="item"><h3>${escape(item.key)}</h3><div class="row">${figure("After", item.after)}</div></div>`)}`,
);

// 5. A summary, here and on the GitHub Actions run.
const lines = [
    `### Visual changes`,
    "",
    `${results.changed.length} changed · ${results.added.length} new · ${results.removed.length} gone · ${results.same} the same`,
    "",
    ...results.changed.slice(0, 40).map((item) => `- changed: \`${item.key}\` (${item.size ?? `${item.pixels} px`})`),
    ...results.removed.slice(0, 20).map((item) => `- gone: \`${item.key}\``),
    ...(results.added.length ? [`- new: ${results.added.length} pictures`] : []),
];
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`);
console.log(`\n${lines.slice(2).join("\n")}\n\nReport: ${path.join(out, "index.html")}`);

const failed = results.changed.length + results.removed.length > 0;
if (failed && !allow) {
    console.error(
        `\n✗ The pages look different. If that's intended, look over the report and add the "visual change" label to the pull request (in CI), or run with --allow.`,
    );
    process.exit(1);
}
if (failed) console.log("\nChanges allowed (--allow).");
else console.log("✓ Everything looks the same.");
