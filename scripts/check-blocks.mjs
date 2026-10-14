// Checks docs/blocks against docs/app/blocks.tsx and the rules in docs/blocks/README.md:
//   every block in the list has its two files, and every file is in the list
//   <Name>.tsx exports one function, <Name>, and imports nothing local but ./<Name>.css
//   every selector in <Name>.css starts with the block's own class, so blocks can't touch each other
//   colours come from tokens, and only blocks with a fixed preview height use viewport units
// and the components in blocks/src (@openwarelabs/blocks) follow the same rules for their styles, under .ow-<name>.
// `node scripts/check-blocks.mjs` prints what's wrong and exits 1, or says how many blocks passed.
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

import { root } from "./css.mjs";

const blocksDir = path.join(root, "docs/blocks");
const listFile = path.join(root, "docs/app/blocks.tsx");

/** "HeroCentred" → "hero-centred", "SettingsApiKeys" → "settings-api-keys". */
const kebab = (name) =>
    name
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .toLowerCase();

// The list: each category's slug, and each block's id and whether it has a fixed height.
const list = fs.readFileSync(listFile, "utf8");
const expected = new Map();
const componentHeights = new Map();
// Blocks whose docs file is an example of their component, which may need no stylesheet of its own.
const componentBlocks = new Set();
let category = null;
for (const line of list.split("\n")) {
    const slug = /^\s+slug: "([^"]+)",/.exec(line);
    if (slug) category = slug[1];
    const block = /\{ id: "([^"]+)",.*?(height: (\d+))?\s*\},?\s*$/.exec(line);
    if (block && category) expected.set(`${category}/${block[1]}`, { fixedHeight: Boolean(block[3]) });
    // A block that's a component in @openwarelabs/blocks: its styles may use viewport units when its preview does.
    const component = /component: "([^"]+)"/.exec(line);
    if (block && component) componentHeights.set(component[1], Boolean(block[3]));
    if (block && component && category) componentBlocks.add(`${category}/${block[1]}`);
}

/** Splits a selector list on its top-level commas, leaving those inside :is(), :where() and the like alone. */
function splitSelectors(list) {
    const parts = [];
    let depth = 0;
    let current = "";
    for (const character of list) {
        if (character === "(") depth += 1;
        if (character === ")") depth -= 1;
        if (character === "," && depth === 0) {
            parts.push(current.trim());
            current = "";
        } else current += character;
    }
    parts.push(current.trim());
    return parts.filter(Boolean);
}

/** The library's component for each element a block shouldn't build by hand. */
const componentFor = {
    h1: "<Text variant=…>",
    h2: "<Text variant=…>",
    h3: "<Text variant=…>",
    h4: "<Text variant=…>",
    h5: "<Text variant=…>",
    h6: "<Text variant=…>",
    p: "<Text variant=…>",
    button: "Button (or CloseButton, CopyButton, ToggleButton)",
    a: "Link, or buttonClassName() / linkClassName() on the <a>",
    kbd: "Kbd",
    code: "Code",
    input: "Input, Checkbox, Switch or another field",
    textarea: "Textarea",
    select: "Select",
};

/**
 * Headings, paragraphs and controls written as plain elements, where the library has a component for them. Drawn
 * product visuals are exempt: anything inside an element with role="img" or aria-hidden is a picture, not page text.
 */
function rawElements(source) {
    const found = [];
    const isPicture = (attributes) =>
        attributes.properties.some((attribute) => {
            if (!ts.isJsxAttribute(attribute)) return false;
            const name = attribute.name.getText(source);
            const value = attribute.initializer?.getText(source) ?? "true";
            return (name === "role" && value === '"img"') || (name === "aria-hidden" && !/false/.test(value));
        });
    const usesLinkOrButtonClass = (attributes) =>
        attributes.properties.some(
            (attribute) =>
                ts.isJsxAttribute(attribute) &&
                attribute.name.getText(source) === "className" &&
                /\b(buttonClassName|linkClassName)\(/.test(attribute.initializer?.getText(source) ?? ""),
        );
    const visit = (node, inPicture) => {
        let opening = null;
        if (ts.isJsxElement(node)) opening = node.openingElement;
        else if (ts.isJsxSelfClosingElement(node)) opening = node;
        let picture = inPicture;
        if (opening) {
            const tag = opening.tagName.getText(source);
            picture = inPicture || isPicture(opening.attributes);
            if (!picture && tag in componentFor && !(tag === "a" && usesLinkOrButtonClass(opening.attributes))) {
                found.push({ tag, line: source.getLineAndCharacterOfPosition(opening.getStart(source)).line + 1 });
            }
        }
        ts.forEachChild(node, (child) => visit(child, picture));
    };
    visit(source, false);
    return found;
}

/** A stylesheet's rules: every selector under its own class, colours from tokens, viewport heights only when fixed. */
function checkStyles(id, cssPath, className, fixedHeight) {
    const prefix = `.${className}`;
    const css = fs.readFileSync(cssPath, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    // Selectors: whatever comes before a { that isn't an at-rule or a keyframe step.
    const selectorPattern = /([^{};]+)\{/g;
    for (let match; (match = selectorPattern.exec(css));) {
        const selector = match[1].trim();
        if (!selector || selector.startsWith("@") || /^(from|to|\d+%)(\s*,\s*(from|to|\d+%))*$/.test(selector)) continue;
        for (const part of splitSelectors(selector)) {
            if (!part.startsWith(prefix) || /^([a-z0-9]|-(?!-)|_(?!_))/i.test(part.slice(prefix.length))) {
                problem(id, `selector "${part}" should start with ${prefix} (its own class, or ${prefix}__part / ${prefix}--modifier)`);
            }
        }
    }
    for (const keyframes of css.matchAll(/@keyframes\s+([\w-]+)/g)) {
        if (!keyframes[1].startsWith(className)) problem(id, `@keyframes ${keyframes[1]} should start with ${className}`);
    }
    for (const declaration of css.matchAll(/([\w-]+)\s*:\s*([^;{}]+);/g)) {
        const [, property, value] = declaration;
        if (property.startsWith("--")) continue;
        const masking = /mask/.test(property);
        if (!masking && /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/i.test(value))
            problem(id, `${property}: ${value.trim()} — use a colour token (var(--ow-…))`);
        if (!fixedHeight && /\d(dvh|svh|lvh|vh)\b/.test(value))
            problem(id, `${property} uses viewport height; the preview fits the block to its content, so only blocks with a fixed height may`);
    }
    if (/\banimation\s*:/.test(css) && !/prefers-reduced-motion/.test(css)) problem(id, "animates without a prefers-reduced-motion rule");
}

const problems = [];
const problem = (id, text) => problems.push(`${id}: ${text}`);

const found = new Set();
if (fs.existsSync(blocksDir)) {
    for (const dir of fs.readdirSync(blocksDir, { withFileTypes: true })) {
        if (!dir.isDirectory()) continue;
        for (const file of fs.readdirSync(path.join(blocksDir, dir.name))) {
            const ext = path.extname(file);
            if (ext !== ".tsx" && ext !== ".css") {
                problem(`${dir.name}/${file}`, "only .tsx and .css files belong in a block's folder");
                continue;
            }
            found.add(`${dir.name}/${path.basename(file, ext)}`);
        }
    }
}

for (const id of found) if (!expected.has(id)) problem(id, "isn't in docs/app/blocks.tsx");

let checked = 0;
for (const [id, { fixedHeight }] of expected) {
    const name = id.split("/")[1];
    const tsxPath = path.join(blocksDir, `${id}.tsx`);
    const cssPath = path.join(blocksDir, `${id}.css`);
    if (!fs.existsSync(tsxPath)) continue; // Not built yet: the docs show its sketch.
    checked += 1;

    // The component.
    const tsx = fs.readFileSync(tsxPath, "utf8");
    const source = ts.createSourceFile(tsxPath, tsx, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const exported = [];
    for (const statement of source.statements) {
        if (ts.isImportDeclaration(statement)) {
            const from = statement.moduleSpecifier.text;
            if (from.startsWith(".") && from !== `./${name}.css`) problem(id, `imports ${from}; a block is its two files and nothing else local`);
            if (!from.startsWith(".") && !["react", "@openwarelabs/ui", "@openwarelabs/blocks", "lucide-react"].includes(from))
                problem(id, `imports ${from}; use react, @openwarelabs/ui, @openwarelabs/blocks and lucide-react only`);
        }
        if (statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
            exported.push(ts.isFunctionDeclaration(statement) ? statement.name?.text : "(something other than a function)");
        }
    }
    if (exported.length !== 1 || exported[0] !== name)
        problem(id, `should export exactly one function, ${name}; it exports ${exported.join(", ") || "nothing"}`);
    const isExample = componentBlocks.has(id);
    if (!tsx.includes(`import "./${name}.css";`) && !(isExample && !fs.existsSync(cssPath))) problem(id, `should import "./${name}.css"`);
    for (const { tag, line } of rawElements(source)) problem(id, `line ${line}: <${tag}> by hand; use ${componentFor[tag]}`);
    if (/https?:\/\/(?!www\.w3\.org)/.test(tsx)) problem(id, "links to an outside address; use # for links and draw images with CSS or components");
    if (/lorem ipsum/i.test(tsx)) problem(id, "has placeholder Latin; write real copy");

    // Its styles.
    if (!fs.existsSync(cssPath)) {
        if (!isExample) problem(id, `has no ${name}.css`);
        continue;
    }
    checkStyles(id, cssPath, kebab(name), fixedHeight);
}

// The components in @openwarelabs/blocks: blocks/src/<category>/<Name>/<Name>.css, under .ow-<name>.
let components = 0;
const packageDir = path.join(root, "blocks/src");
if (fs.existsSync(packageDir)) {
    for (const file of fs
        .readdirSync(packageDir, { recursive: true })
        .map(String)
        .filter((entry) => entry.endsWith(".css"))) {
        const name = path.basename(file, ".css");
        const id = `blocks/src/${file}`;
        if (path.basename(path.dirname(file)) !== name) problem(id, `should sit in a folder named ${name}, beside ${name}.tsx`);
        const tsxPath = path.join(packageDir, path.dirname(file), `${name}.tsx`);
        if (!fs.existsSync(tsxPath)) problem(id, `has no ${name}.tsx beside it`);
        else
            for (const { tag, line } of rawElements(
                ts.createSourceFile(tsxPath, fs.readFileSync(tsxPath, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX),
            ))
                problem(`blocks/src/${path.dirname(file)}/${name}.tsx`, `line ${line}: <${tag}> by hand; use ${componentFor[tag]}`);
        checkStyles(id, path.join(packageDir, file), `ow-${kebab(name)}`, componentHeights.get(name) ?? false);
        components += 1;
    }
}

if (problems.length) {
    console.log(problems.join("\n"));
    console.log(`\n${problems.length} problem${problems.length === 1 ? "" : "s"} in ${checked} block${checked === 1 ? "" : "s"}.`);
    process.exit(1);
}
console.log(`${checked} of ${expected.size} blocks built, and ${components} block components; all follow the rules.`);
