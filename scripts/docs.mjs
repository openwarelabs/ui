// The docs site: `node scripts/docs.mjs dev` serves it with live rebuilds, `node scripts/docs.mjs build` writes a
// static copy to docs-dist/ for any static host.
//
// Virtual modules feed it:
//   docs:examples     every docs/examples/*.tsx file: its module, plus each exported example's code, highlighted
//   docs:props        the props of every exported *Props interface, read from the TypeScript source
//   docs:styles       tokens.css, every component stylesheet and the blocks package's, read fresh on each rebuild
//   docs:blocks       every block in docs/blocks/<category>/<Name>.tsx, for the frame that previews them
//   docs:block-index  the ids of the blocks that exist, for the docs pages
// and any import ending in ?highlight returns that file's text and highlighted HTML.
//
// Blocks are previewed in an iframe (docs/frame.html, built from docs/frame.tsx) so their media queries answer
// to the frame's width and nothing in the docs' own styles reaches them. Their code is too big to bundle, so each
// block's files are written, highlighted, to build/blocks/<category>/<Name>.json and fetched when shown.
import fs from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";
import { createHighlighter } from "shiki";

import { buildTokens } from "./build-tokens.mjs";
import { blockStylesheets, cssOrder, readBlockStyles, readStyles, root } from "./css.mjs";
import { blocksDir, docs, examplesDir, readBlocks, readExamples, readProps } from "./docs-data.mjs";
import { writeAiFiles } from "./ai-data.mjs";

const mode = process.argv[2] ?? "dev";

const highlighter = await createHighlighter({ themes: ["github-dark-default"], langs: ["tsx", "ts", "bash", "css", "json", "html"] });

function highlight(code, lang) {
    const html = highlighter.codeToHtml(code, { lang, theme: "github-dark-default" });
    // Keep only what's inside <code>: CodeBlock supplies the frame.
    return html.replace(/^[\s\S]*?<code>/, "").replace(/<\/code>[\s\S]*$/, "");
}

const langOf = (file) => ({ ".tsx": "tsx", ".ts": "ts", ".sh": "bash", ".css": "css", ".json": "json", ".html": "html" })[path.extname(file)] ?? "tsx";

function examplesModule() {
    const files = fs.readdirSync(examplesDir).filter((file) => file.endsWith(".tsx")).sort();
    const parts = files.map((file, index) => ({ file, index, slug: path.basename(file, ".tsx"), examples: readExamples(path.join(examplesDir, file), highlight) }));
    return [
        ...parts.map(({ file, index }) => `import * as m${index} from ${JSON.stringify(path.join(examplesDir, file))};`),
        `export const pages = [`,
        ...parts.map(({ slug, index, examples }) => `  { slug: ${JSON.stringify(slug)}, module: m${index}, examples: ${JSON.stringify(examples)} },`),
        `];`,
    ].join("\n");
}

const blockWatch = () => {
    const blocks = readBlocks();
    return {
        watchDirs: fs.existsSync(blocksDir)
            ? [blocksDir, ...fs.readdirSync(blocksDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => path.join(blocksDir, entry.name))]
            : [docs],
        watchFiles: blocks.flatMap((block) => [block.tsx, ...(block.css ? [block.css] : [])]),
    };
};

function blocksModule() {
    const blocks = readBlocks();
    return [
        ...blocks.map((block, index) => `import { ${block.name} as b${index} } from ${JSON.stringify(block.tsx)};`),
        `export const blocks = {`,
        ...blocks.map((block, index) => `  ${JSON.stringify(block.id)}: b${index},`),
        `};`,
    ].join("\n");
}

// Each block's files, highlighted, as build/blocks/<category>/<Name>.json. Rewritten only when a file changes.
const written = new Map();

function writeBlockCode(outdir) {
    for (const block of readBlocks()) {
        const files = [block.tsx, block.css].filter(Boolean).map((file) => ({ file, text: fs.readFileSync(file, "utf8") }));
        const key = files.map((entry) => entry.text).join("\u0000");
        const target = path.join(outdir, "blocks", `${block.id}.json`);
        if (written.get(target) === key && fs.existsSync(target)) continue;
        const json = {
            id: block.id,
            files: files.map(({ file, text }) => {
                const code = text.replace(/\n$/, "");
                return { name: path.basename(file), language: langOf(file), code: `${code}\n`, html: highlight(code, langOf(file)) };
            }),
        };
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, JSON.stringify(json));
        written.set(target, key);
    }
}

function propsModule() {
    return `export const props = ${JSON.stringify(readProps())};`;
}

const watchFiles = () => [path.join(root, "tokens/tokens.json"), ...cssOrder.map((file) => path.join(root, "src", file)), ...blockStylesheets()];

const outdir = mode === "build" ? path.join(root, "docs-dist/build") : path.join(docs, "build");

const docsPlugin = {
    name: "openware-docs",
    setup(build) {
        build.onStart(() => {
            try {
                writeBlockCode(outdir);
            } catch (error) {
                return { errors: [{ text: `Couldn't write the blocks' code: ${error.message}` }] };
            }
            return undefined;
        });
        build.onResolve({ filter: /^docs:/ }, (args) => ({ path: args.path, namespace: "docs" }));
        build.onResolve({ filter: /\?highlight$/ }, (args) => {
            const file = args.path.replace(/\?highlight$/, "");
            // "@docs/snippets/x.tsx?highlight", the alias in docs/tsconfig.json, or a relative path.
            return { path: file.startsWith("@docs/") ? path.join(docs, file.slice("@docs/".length)) : path.resolve(args.resolveDir, file), namespace: "highlight" };
        });
        build.onResolve({ filter: /^@openwarelabs\/ui$/ }, () => ({ path: path.join(root, "src/index.ts") }));
        build.onResolve({ filter: /^@openwarelabs\/blocks$/ }, () => ({ path: path.join(root, "blocks/src/index.ts") }));

        build.onLoad({ filter: /.*/, namespace: "highlight" }, (args) => {
            const code = fs.readFileSync(args.path, "utf8");
            return { contents: `export default ${JSON.stringify({ code, html: highlight(code.replace(/\n$/, ""), langOf(args.path)) })};`, loader: "js", watchFiles: [args.path] };
        });

        build.onLoad({ filter: /.*/, namespace: "docs" }, (args) => {
            if (args.path === "docs:examples") {
                return { contents: examplesModule(), loader: "js", resolveDir: examplesDir, watchDirs: [examplesDir], watchFiles: fs.readdirSync(examplesDir).map((f) => path.join(examplesDir, f)) };
            }
            if (args.path === "docs:props") {
                return {
                    contents: propsModule(),
                    loader: "js",
                    watchDirs: [path.join(root, "src"), path.join(root, "blocks/src")],
                    watchFiles: ["src", "blocks/src"].flatMap((dir) =>
                        fs
                            .readdirSync(path.join(root, dir), { recursive: true })
                            .filter((f) => /\.tsx?$/.test(String(f)))
                            .map((f) => path.join(root, dir, String(f))),
                    ),
                };
            }
            if (args.path === "docs:styles") {
                buildTokens();
                const { tokens, components } = readStyles();
                return { contents: `${tokens}\n${components}\n${readBlockStyles()}`, loader: "css", watchFiles: watchFiles() };
            }
            if (args.path === "docs:blocks") {
                return { contents: blocksModule(), loader: "js", resolveDir: blocksDir, ...blockWatch() };
            }
            if (args.path === "docs:block-index") {
                return { contents: `export const builtBlocks = ${JSON.stringify(readBlocks().map((block) => block.id))};`, loader: "js", ...blockWatch() };
            }
            if (args.path === "docs:tokens") {
                return { contents: fs.readFileSync(path.join(root, "tokens/tokens.json"), "utf8"), loader: "json", watchFiles: [path.join(root, "tokens/tokens.json")] };
            }
            return undefined;
        });
    },
};

const options = {
    entryPoints: { app: path.join(docs, "main.tsx"), frame: path.join(docs, "frame.tsx") },
    bundle: true,
    outdir,
    format: "iife",
    jsx: "automatic",
    target: "es2020",
    loader: { ".woff2": "file", ".woff": "file" },
    plugins: [docsPlugin],
    logLevel: "info",
    minify: mode === "build",
    sourcemap: mode !== "build",
    define: { "process.env.NODE_ENV": JSON.stringify(mode === "build" ? "production" : "development") },
};

if (mode === "build") {
    fs.rmSync(path.join(root, "docs-dist"), { recursive: true, force: true });
    await esbuild.build(options);
    fs.copyFileSync(path.join(docs, "index.html"), path.join(root, "docs-dist/index.html"));
    fs.copyFileSync(path.join(docs, "frame.html"), path.join(root, "docs-dist/frame.html"));
    // llms.txt, llms-full.txt and a Markdown copy of every page under ai/, for AI tools to read.
    await writeAiFiles(path.join(root, "docs-dist"));
    console.log("Docs written to docs-dist/. Open docs-dist/index.html through any static server.");
} else {
    const context = await esbuild.context(options);
    await context.watch();
    const { port } = await context.serve({ servedir: docs, port: Number(process.env.PORT ?? 5173) });
    console.log(`\n  Openware UI docs: http://localhost:${port}\n`);
}
