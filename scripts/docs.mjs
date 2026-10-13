// The docs site: `node scripts/docs.mjs dev` serves it with live rebuilds, `node scripts/docs.mjs build` writes a
// static copy to docs-dist/ for any static host.
//
// Virtual modules feed it:
//   docs:examples     every docs/examples/*.tsx file: its module, plus each exported example's code, highlighted
//   docs:props        the props of every exported *Props interface, read from the TypeScript source
//   docs:styles       tokens.css and every component stylesheet, read fresh from src/ on each rebuild
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
import ts from "typescript";
import { createHighlighter } from "shiki";

import { buildTokens } from "./build-tokens.mjs";
import { cssOrder, readStyles, root } from "./css.mjs";

const mode = process.argv[2] ?? "dev";
const docs = path.join(root, "docs");
const examplesDir = path.join(docs, "examples");
const blocksDir = path.join(docs, "blocks");

const highlighter = await createHighlighter({ themes: ["github-dark-default"], langs: ["tsx", "ts", "bash", "css", "json", "html"] });

function highlight(code, lang) {
    const html = highlighter.codeToHtml(code, { lang, theme: "github-dark-default" });
    // Keep only what's inside <code>: CodeBlock supplies the frame.
    return html.replace(/^[\s\S]*?<code>/, "").replace(/<\/code>[\s\S]*$/, "");
}

const langOf = (file) => ({ ".tsx": "tsx", ".ts": "ts", ".sh": "bash", ".css": "css", ".json": "json", ".html": "html" })[path.extname(file)] ?? "tsx";

/** "WithIcons" → "With icons". */
const titleOf = (name) =>
    name
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
        .replace(/ ([A-Z])(?=[a-z]| |$)/g, (m) => m.toLowerCase())
        .replace(/^./, (c) => c.toUpperCase());

/** Reads an example file: its imports, and each exported function's own code with only the imports it uses. */
function readExamples(file) {
    const text = fs.readFileSync(file, "utf8");
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const imports = [];
    const examples = [];
    // Top-level helpers (sample data, small components, types) that examples use; shown with the examples that need them.
    const helpers = [];
    for (const statement of source.statements) {
        if (ts.isImportDeclaration(statement)) {
            const from = statement.moduleSpecifier.text;
            if (from.startsWith(".")) continue; // docs-only helpers stay out of the shown code
            const clause = statement.importClause;
            const names = [];
            if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
                for (const element of clause.namedBindings.elements) names.push({ local: element.name.text, text: element.getText(source), type: element.isTypeOnly || clause.isTypeOnly });
            }
            if (clause?.name) names.push({ local: clause.name.text, text: clause.name.text, default: true });
            imports.push({ from, names });
        }
        const exported = statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
        if (!exported && (ts.isVariableStatement(statement) || ts.isFunctionDeclaration(statement) || ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement))) {
            const names = ts.isVariableStatement(statement)
                ? statement.declarationList.declarations.map((d) => d.name.getText(source))
                : [statement.name?.text].filter(Boolean);
            helpers.push({ names, text: text.slice(statement.getStart(source, false), statement.end) });
        }
        if (ts.isFunctionDeclaration(statement) && statement.name && exported) {
            const name = statement.name.text;
            const jsDoc = ts.getJSDocCommentsAndTags(statement).find(ts.isJSDoc);
            const description = jsDoc ? ts.getTextOfJSDocComment(jsDoc.comment) ?? "" : "";
            const body = text.slice(statement.getStart(source, false), statement.end);
            examples.push({ name, title: titleOf(name), description, body });
        }
    }
    return examples.map((example) => {
        // The helpers this example uses, and the helpers those use, in file order.
        const needed = new Set();
        let scope = example.body;
        for (let grew = true; grew; ) {
            grew = false;
            for (const helper of helpers) {
                if (!needed.has(helper) && helper.names.some((name) => new RegExp(`\\b${name}\\b`).test(scope))) {
                    needed.add(helper);
                    scope += `\n${helper.text}`;
                    grew = true;
                }
            }
        }
        const helperText = helpers.filter((helper) => needed.has(helper)).map((helper) => helper.text).join("\n\n");
        const fullBody = helperText ? `${helperText}\n\n${example.body}` : example.body;
        const used = (identifier) => new RegExp(`\\b${identifier}\\b`).test(fullBody);
        const lines = imports
            .map(({ from, names }) => {
                const kept = names.filter((n) => used(n.local));
                if (!kept.length) return null;
                const fallback = kept.find((n) => n.default);
                const named = kept.filter((n) => !n.default).map((n) => n.text);
                const parts = [fallback?.text, named.length ? `{ ${named.join(", ")} }` : null].filter(Boolean).join(", ");
                return `import ${parts} from "${from}";`;
            })
            .filter(Boolean);
        const code = `${lines.join("\n")}${lines.length ? "\n\n" : ""}${fullBody}\n`;
        return { name: example.name, title: example.title, description: example.description, code, html: highlight(code, "tsx") };
    });
}

function examplesModule() {
    const files = fs.readdirSync(examplesDir).filter((file) => file.endsWith(".tsx")).sort();
    const parts = files.map((file, index) => ({ file, index, slug: path.basename(file, ".tsx"), examples: readExamples(path.join(examplesDir, file)) }));
    return [
        ...parts.map(({ file, index }) => `import * as m${index} from ${JSON.stringify(path.join(examplesDir, file))};`),
        `export const pages = [`,
        ...parts.map(({ slug, index, examples }) => `  { slug: ${JSON.stringify(slug)}, module: m${index}, examples: ${JSON.stringify(examples)} },`),
        `];`,
    ].join("\n");
}

// Blocks: one folder per category, one <Name>.tsx (exporting the function <Name>) and <Name>.css per block.
function readBlocks() {
    if (!fs.existsSync(blocksDir)) return [];
    return fs
        .readdirSync(blocksDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .flatMap((dir) =>
            fs
                .readdirSync(path.join(blocksDir, dir.name))
                .filter((file) => file.endsWith(".tsx"))
                .sort()
                .map((file) => {
                    const name = path.basename(file, ".tsx");
                    const css = path.join(blocksDir, dir.name, `${name}.css`);
                    return { id: `${dir.name}/${name}`, name, tsx: path.join(blocksDir, dir.name, file), css: fs.existsSync(css) ? css : null };
                }),
        )
        .sort((a, b) => a.id.localeCompare(b.id));
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

// Props, from the source of truth: the exported interfaces in src/.
const elementNames = { HTMLButtonElement: "button", HTMLInputElement: "input", HTMLTextAreaElement: "textarea", HTMLAnchorElement: "a", HTMLDivElement: "div", HTMLSpanElement: "span", HTMLElement: "element" };

function propsModule() {
    const program = ts.createProgram([path.join(root, "src/index.ts")], { jsx: ts.JsxEmit.ReactJSX, strict: true, skipLibCheck: true, moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 });
    const checker = program.getTypeChecker();
    const srcDir = path.join(root, "src") + path.sep;
    const interfaces = new Map();
    for (const file of program.getSourceFiles()) {
        if (!file.fileName.startsWith(srcDir.split(path.sep).join("/")) && !file.fileName.startsWith(srcDir)) continue;
        ts.forEachChild(file, (node) => {
            if (ts.isInterfaceDeclaration(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) interfaces.set(node.name.text, node);
        });
    }

    /** Which HTML element's attributes an interface also takes, following `extends` through our own interfaces. */
    function elementOf(node, seen = new Set()) {
        for (const clause of node.heritageClauses ?? []) {
            for (const type of clause.types) {
                const text = type.getText();
                const match = /HTMLAttributes<(\w+)>/.exec(text);
                if (match) return elementNames[match[1]] ?? "element";
                for (const [name, other] of interfaces) {
                    if (!seen.has(name) && new RegExp(`\\b${name}\\b`).test(text)) {
                        seen.add(name);
                        const found = elementOf(other, seen);
                        if (found) return found;
                    }
                }
            }
        }
        return undefined;
    }

    const result = {};
    for (const [name, node] of interfaces) {
        const type = checker.getTypeAtLocation(node.name);
        const props = [];
        for (const symbol of checker.getPropertiesOfType(type)) {
            const declaration = symbol.declarations?.[0];
            if (!declaration) continue;
            const fileName = path.normalize(declaration.getSourceFile().fileName);
            if (!fileName.startsWith(srcDir)) continue;
            const tags = symbol.getJsDocTags(checker);
            if (tags.some((tag) => tag.name === "internal")) continue;
            const defaultTag = tags.find((tag) => tag.name === "default");
            const propType = checker.getTypeOfSymbolAtLocation(symbol, declaration);
            const flags = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType;
            let typeText = checker.typeToString(propType, declaration, flags);
            // A named union of literals ("ButtonVariant") reads better spelled out: 'primary' | 'secondary' | …
            const members = propType.isUnion() ? propType.types.filter((t) => !(t.flags & ts.TypeFlags.Undefined)) : [];
            if (members.length > 1 && members.every((t) => t.isLiteral() || t.flags & ts.TypeFlags.BooleanLiteral)) {
                const names = members.map((t) => checker.typeToString(t, declaration, flags));
                typeText = names.includes("true") && names.includes("false") ? [...names.filter((n) => n !== "true" && n !== "false"), "boolean"].join(" | ") : names.join(" | ");
            }
            typeText = typeText.replace(/ \| undefined$/, "").replace(/^undefined \| /, "");
            props.push({
                name: symbol.name,
                type: typeText,
                required: !(symbol.flags & ts.SymbolFlags.Optional),
                default: defaultTag ? ts.displayPartsToString(defaultTag.text).trim() : undefined,
                description: ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim(),
            });
        }
        result[name] = { props, element: elementOf(node), description: ts.displayPartsToString(checker.getSymbolAtLocation(node.name)?.getDocumentationComment(checker) ?? []) };
    }
    return `export const props = ${JSON.stringify(result)};`;
}

const watchFiles = () => [path.join(root, "tokens/tokens.json"), ...cssOrder.map((file) => path.join(root, "src", file))];

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
        build.onResolve({ filter: /\?highlight$/ }, (args) => ({ path: path.resolve(args.resolveDir, args.path.replace(/\?highlight$/, "")), namespace: "highlight" }));
        build.onResolve({ filter: /^@openwarelabs\/ui$/ }, () => ({ path: path.join(root, "src/index.ts") }));

        build.onLoad({ filter: /.*/, namespace: "highlight" }, (args) => {
            const code = fs.readFileSync(args.path, "utf8");
            return { contents: `export default ${JSON.stringify({ code, html: highlight(code.replace(/\n$/, ""), langOf(args.path)) })};`, loader: "js", watchFiles: [args.path] };
        });

        build.onLoad({ filter: /.*/, namespace: "docs" }, (args) => {
            if (args.path === "docs:examples") {
                return { contents: examplesModule(), loader: "js", resolveDir: examplesDir, watchDirs: [examplesDir], watchFiles: fs.readdirSync(examplesDir).map((f) => path.join(examplesDir, f)) };
            }
            if (args.path === "docs:props") {
                return { contents: propsModule(), loader: "js", watchDirs: [path.join(root, "src")], watchFiles: fs.readdirSync(path.join(root, "src"), { recursive: true }).filter((f) => /\.tsx?$/.test(String(f))).map((f) => path.join(root, "src", String(f))) };
            }
            if (args.path === "docs:styles") {
                buildTokens();
                const { tokens, components } = readStyles();
                return { contents: `${tokens}\n${components}`, loader: "css", watchFiles: watchFiles() };
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
    console.log("Docs written to docs-dist/. Open docs-dist/index.html through any static server.");
} else {
    const context = await esbuild.context(options);
    await context.watch();
    const { port } = await context.serve({ servedir: docs, port: Number(process.env.PORT ?? 5173) });
    console.log(`\n  Openware UI docs: http://localhost:${port}\n`);
}
