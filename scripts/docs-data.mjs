// What the docs, the AI files and the MCP server read from the repository: the examples, the props, the blocks
// and the block catalogue. The docs build (scripts/docs.mjs) highlights the code; the others don't need to.
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

import { root } from "./css.mjs";

export const docs = path.join(root, "docs");
export const examplesDir = path.join(docs, "examples");
export const blocksDir = path.join(docs, "blocks");

/** "ButtonGroup" → "button-group", as the docs' content.ts does. */
export const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** "WithIcons" → "With icons". */
const titleOf = (name) =>
    name
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
        .replace(/ ([A-Z])(?=[a-z]| |$)/g, (m) => m.toLowerCase())
        .replace(/^./, (c) => c.toUpperCase());

/** Reads an example file: its imports, and each exported function's own code with only the imports it uses. */
export function readExamples(file, highlight) {
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
        return { name: example.name, title: example.title, description: example.description, code, html: highlight ? highlight(code, "tsx") : undefined };
    });
}


// Blocks: one folder per category, one <Name>.tsx (exporting the function <Name>) and <Name>.css per block.
export function readBlocks() {
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


// Props, from the source of truth: the exported interfaces in src/.
const elementNames = { HTMLButtonElement: "button", HTMLInputElement: "input", HTMLTextAreaElement: "textarea", HTMLAnchorElement: "a", HTMLDivElement: "div", HTMLSpanElement: "span", HTMLElement: "element" };

export function readProps() {
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
    return result;
}

/** Evaluates an object or array literal from a source file: plain data, no references to other names. */
function evaluateLiteral(node, file) {
    const js = ts.transpileModule(`module.exports = (${node.getText()});`, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const module = { exports: undefined };
    try {
        new Function("module", js)(module);
    } catch (error) {
        throw new Error(`${path.relative(root, file)}: couldn't read a literal (${error.message})`);
    }
    return module.exports;
}

/** The value of each exported `const` in a file whose initializer is a plain literal, by name. */
function readConsts(file, names) {
    const text = fs.readFileSync(file, "utf8");
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const found = {};
    for (const statement of source.statements) {
        if (!ts.isVariableStatement(statement)) continue;
        for (const declaration of statement.declarationList.declarations) {
            const name = declaration.name.getText(source);
            if (names.includes(name) && declaration.initializer) found[name] = evaluateLiteral(declaration.initializer, file);
        }
    }
    return found;
}

/** An example file's `meta` export. */
export function readMeta(file) {
    const { meta } = readConsts(file, ["meta"]);
    if (!meta) throw new Error(`${path.relative(root, file)} has no meta export`);
    return meta;
}

/** The block groups and categories listed in docs/app/blocks.tsx. */
export function readBlockCatalog() {
    const { blockGroups, blockCategories } = readConsts(path.join(docs, "app/blocks.tsx"), ["blockGroups", "blockCategories"]);
    return { blockGroups, blockCategories };
}

/** The component categories, in the docs' order, from docs/app/types.ts. */
export function readCategories() {
    return readConsts(path.join(docs, "app/types.ts"), ["categories"]).categories;
}
