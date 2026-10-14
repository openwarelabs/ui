// Accessibility check: runs axe (https://github.com/dequelabs/axe-core) over every block (at desktop and phone
// width) and every component example (at desktop width), in light and dark, against WCAG 2.2 A and AA.
//
//   npm run a11y                       builds the docs from this working tree, then checks them
//   node scripts/a11y.mjs --dir <docs-dist> [--filter <text>] [--out <dir>] [--update-known]
//
// Blocks are checked in their frame, alone; component examples inside their preview, so the docs' own pages
// aren't part of it. A few rules are about a whole page (a title, a lang, one main landmark) and don't apply to a
// section on its own; they're switched off. Every problem is listed with the element and how to fix it, in the
// terminal, in <out>/report.md and on the GitHub Actions run.
//
// a11y-known.json lists the problems there were when the check started, as how many of each rule each block or
// component page had: those are reported but don't fail it, so it fails only on new ones. Fix one and lower its
// count (or run with --update-known, which rewrites the file from this run); the list is the to-do list.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const option = (name) => {
    const index = args.indexOf(`--${name}`);
    return index === -1 ? undefined : args[index + 1];
};
const out = path.resolve(option("out") ?? path.join(root, ".tmp/a11y"));
const workers = Number(option("workers") ?? Math.max(2, os.availableParallelism()));
const filter = option("filter");
const updateKnown = args.includes("--update-known");
if (updateKnown && filter) throw new Error("--update-known rewrites the whole list, so it needs a run of everything: drop --filter.");
const knownFile = path.join(root, "a11y-known.json");
/** "block|heroes/HeroSplit|color-contrast" → how many such problems are known. */
const known = new Map(
    fs.existsSync(knownFile) ? JSON.parse(fs.readFileSync(knownFile, "utf8")).map((item) => [`${item.kind}|${item.id}|${item.rule}`, item.count]) : [],
);

let dir = option("dir") && path.resolve(option("dir"));
if (!dir) {
    console.log("Building the docs…");
    execFileSync("npm", ["run", "docs:build", "--silent"], { cwd: root, stdio: "inherit" });
    dir = path.join(root, "docs-dist");
}

/** WCAG 2.0, 2.1 and 2.2, levels A and AA. */
const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];
/** About a whole page, not a section shown on its own. */
const pageRules = ["document-title", "html-has-lang", "html-lang-valid", "landmark-one-main", "page-has-heading-one", "region", "bypass"];

const types = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".svg": "image/svg+xml",
};
const server = http.createServer((request, response) => {
    const file = path.join(dir, decodeURIComponent(new URL(request.url, "http://x").pathname));
    if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        response.writeHead(404).end();
        return;
    }
    response.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(response);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}`;

const matches = (id) => !filter || id.includes(filter);
const blocksDir = path.join(dir, "build/blocks");
const blocks = fs
    .readdirSync(blocksDir, { recursive: true })
    .map(String)
    .filter((file) => file.endsWith(".json"))
    .map((file) =>
        file
            .replace(/\.json$/, "")
            .split(path.sep)
            .join("/"),
    )
    .filter(matches)
    .sort();
const components = fs
    .readdirSync(path.join(dir, "ai/components"))
    .map((file) => file.replace(/\.md$/, ""))
    .filter(matches)
    .sort();

const variants = [
    { name: "desktop light", width: 1280, colorScheme: "light" },
    { name: "desktop dark", width: 1280, colorScheme: "dark" },
    { name: "phone light", width: 390, colorScheme: "light", blocksOnly: true },
    { name: "phone dark", width: 390, colorScheme: "dark", blocksOnly: true },
];
const jobs = [];
for (const variant of variants) {
    for (const id of blocks) jobs.push({ kind: "block", id, variant });
    if (!variant.blocksOnly) for (const id of components) jobs.push({ kind: "component", id, variant });
}

const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
console.log(`Checking ${blocks.length} blocks and ${components.length} component pages, in light and dark…`);

/** Problem key (where, rule, element) → the problem, with the variants it shows up in. */
const problems = new Map();
const failures = [];
let done = 0;
async function work() {
    for (let job = jobs.shift(); job; job = jobs.shift()) {
        const { kind, id, variant } = job;
        const context = await browser.newContext({
            viewport: { width: variant.width, height: 900 },
            colorScheme: variant.colorScheme,
            reducedMotion: "reduce",
        });
        const page = await context.newPage();
        try {
            await page.goto(kind === "block" ? `${url}/frame.html?block=${id}` : `${url}/index.html#/components/${id}`, { waitUntil: "load" });
            await page.evaluate(() => document.fonts.ready);
            await page.waitForTimeout(400);
            await page.addScriptTag({ content: axeSource });
            const violations = await page.evaluate(
                async ({ kind, tags, pageRules }) => {
                    const include = kind === "block" ? document.body : [...document.querySelectorAll(".docs-example__preview")];
                    if (Array.isArray(include) && include.length === 0) return [];
                    const result = await window.axe.run(Array.isArray(include) ? { include } : include, {
                        runOnly: { type: "tag", values: tags },
                        rules: Object.fromEntries(pageRules.map((rule) => [rule, { enabled: false }])),
                        resultTypes: ["violations"],
                    });
                    return result.violations.map((violation) => ({
                        rule: violation.id,
                        impact: violation.impact,
                        help: violation.help,
                        helpUrl: violation.helpUrl,
                        nodes: violation.nodes.map((node) => ({ target: node.target.join(" "), html: node.html, summary: node.failureSummary })),
                    }));
                },
                { kind, tags, pageRules },
            );
            for (const violation of violations) {
                for (const node of violation.nodes) {
                    const key = `${kind}|${id}|${violation.rule}|${node.target}`;
                    if (!problems.has(key)) problems.set(key, { kind, id, ...violation, node, variants: [] });
                    problems.get(key).variants.push(variant.name);
                }
            }
        } catch (error) {
            failures.push(`${kind} ${id} (${variant.name}): ${error.message.split("\n")[0]}`);
        } finally {
            await context.close();
            done += 1;
            if (done % 100 === 0) console.log(`  ${done} pages`);
        }
    }
}
await Promise.all(Array.from({ length: workers }, work));
await browser.close();
server.close();

// The report: grouped by block or component page, then rule. Up to the known count of a rule on a page is known.
const list = [...problems.values()].sort((a, b) => `${a.kind}${a.id}${a.rule}`.localeCompare(`${b.kind}${b.id}${b.rule}`));
const counts = new Map();
for (const problem of list) {
    const key = `${problem.kind}|${problem.id}|${problem.rule}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    problem.known = counts.get(key) <= (known.get(key) ?? 0);
}
const fresh = list.filter((problem) => !problem.known);
/** Known problems that are gone: their counts can come down. */
const fixed = filter ? [] : [...known].filter(([key, count]) => (counts.get(key) ?? 0) < count);
if (updateKnown) {
    const items = [...counts].map(([key, count]) => {
        const [kind, id, rule] = key.split("|");
        return { kind, id, rule, count };
    });
    fs.writeFileSync(knownFile, `${JSON.stringify(items, null, 4)}\n`);
    console.log(`Wrote ${items.length} entries to a11y-known.json.`);
}
const lines = [`### Accessibility`, ""];
const scope = `${blocks.length} blocks and ${components.length} component pages, in light and dark (WCAG 2.2 A and AA)`;
if (list.length === 0) lines.push(`No problems in ${scope}.`);
else lines.push(`${fresh.length} new problems and ${list.length - fresh.length} known ones (a11y-known.json) in ${scope}:`, "");
let heading = "";
for (const problem of list) {
    const where = problem.kind === "block" ? `Block ${problem.id}` : `Component page ${problem.id}`;
    if (where !== heading) {
        lines.push("", `**${where}**`, "");
        heading = where;
    }
    const everywhere = problem.variants.length === (problem.kind === "block" ? 4 : 2);
    const seen = everywhere ? "" : ` (${problem.variants.join(", ")})`;
    lines.push(
        `- ${problem.known ? "known, " : "**new**, "}${problem.impact}: ${problem.help} ([${problem.rule}](${problem.helpUrl}))${seen}`,
        `  \`${problem.node.target}\`: \`${problem.node.html.replace(/\s+/g, " ").slice(0, 160)}\``,
        `  ${problem.node.summary.replace(/\s*\n\s*/g, " ")}`,
    );
}
if (fixed.length)
    lines.push(
        "",
        "Fewer than a11y-known.json expects (lower these counts):",
        ...fixed.map(([key, count]) => `- ${key.replaceAll("|", " ")}: ${counts.get(key) ?? 0}, not ${count}`),
    );
if (failures.length) lines.push("", "Couldn't check:", ...failures.map((failure) => `- ${failure}`));
const report = `${lines.join("\n")}\n`;
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "report.md"), report);
fs.writeFileSync(path.join(out, "results.json"), JSON.stringify(list, null, 2));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
console.log(`\n${report}`);
if ((fresh.length || failures.length) && !updateKnown) {
    console.error(
        `✗ ${fresh.length} new accessibility problems${failures.length ? `, ${failures.length} pages not checked` : ""}. Report: ${path.join(out, "report.md")}`,
    );
    process.exit(1);
}
console.log(list.length ? `✓ No new accessibility problems (${list.length} known).` : "✓ No accessibility problems.");
