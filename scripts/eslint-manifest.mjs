// What the ESLint plugin (@openwarelabs/eslint-plugin-ui) knows about the library, read from the same sources as
// the docs: every export of @openwarelabs/ui and @openwarelabs/blocks, each component's props (with the values
// of the ones that are a choice of strings) and the element whose attributes it also takes, every --ow- custom
// property, the colour tokens' values, and the classes an app may use. scripts/build-eslint.mjs writes it to
// eslint/build/manifest.json and scripts/build-mcp.mjs to mcp/build/manifest.json, for the server's check_code.
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

import { root } from "./css.mjs";
import { blocksDir, readProps } from "./docs-data.mjs";

/** The names a package's index.ts exports as values (not types). */
function readExports(file) {
    const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    const names = [];
    for (const statement of source.statements) {
        if (!ts.isExportDeclaration(statement) || statement.isTypeOnly || !statement.exportClause || !ts.isNamedExports(statement.exportClause)) continue;
        for (const element of statement.exportClause.elements) if (!element.isTypeOnly) names.push(element.name.text);
    }
    return names;
}

/** 'primary' | 'secondary' | boolean → ["primary", "secondary"]; anything else → null (any value goes). */
function literalValues(type) {
    const parts = type.split(" | ").map((part) => part.trim());
    const values = [];
    for (const part of parts) {
        const match = /^'(.*)'$/.exec(part);
        if (match) values.push(match[1]);
        else if (!["boolean", "true", "false", "number", "undefined", "null"].includes(part)) return null;
    }
    return values.length ? values : null;
}

const classesIn = (css) => [...css.matchAll(/\.(ow-[a-z0-9-]+)/g)].map((match) => match[1]);
const customPropertiesIn = (css) => [...css.matchAll(/(?:^|[\s;{])(--ow-[a-z0-9-]+)\s*:/g)].map((match) => match[1]);

function* cssFiles(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) yield* cssFiles(full);
        else if (entry.name.endsWith(".css")) yield full;
    }
}

export function buildManifest() {
    const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
    const props = readProps();
    const exports = readExports(path.join(root, "src/index.ts")).sort();
    const blocks = readExports(path.join(root, "blocks/src/index.ts")).sort();

    // A component's props are its <Name>Props interface, as the docs show them.
    const components = {};
    for (const name of [...exports, ...blocks]) {
        if (!/^[A-Z]/.test(name)) continue;
        const doc = props[`${name}Props`];
        if (!doc) continue;
        components[name] = {
            element: doc.element ?? null,
            props: Object.fromEntries(doc.props.map((prop) => [prop.name, literalValues(prop.type)])),
        };
    }

    // Custom properties: the tokens, and the ones components define for themselves (which an app may set too).
    const tokensCss = fs.readFileSync(path.join(root, "src/styles/tokens.css"), "utf8");
    const baseCss = fs.readFileSync(path.join(root, "src/styles/base.css"), "utf8");
    const properties = new Set([...customPropertiesIn(tokensCss), ...customPropertiesIn(baseCss)]);
    const internalClasses = {};
    for (const file of cssFiles(path.join(root, "src/components"))) {
        const css = fs.readFileSync(file, "utf8");
        for (const property of customPropertiesIn(css)) properties.add(property);
        const component = path.basename(path.dirname(file));
        for (const className of classesIn(css)) internalClasses[className] ??= component;
    }
    const chartSlots = [1, 2, 3, 4, 5, 6, 7, 8].map((slot) => `--ow-chart-${slot}`);
    for (const slot of chartSlots) properties.add(slot);

    // Classes an app may use: ow-app and the type styles from the stylesheets, and the blocks' own classes (an
    // app that copied a block has its CSS too). A block's CSS also styles the components inside it, so the
    // components' own classes are left out of it.
    const classes = new Set([...classesIn(tokensCss), ...classesIn(baseCss)]);
    for (const dir of [path.join(root, "blocks/src"), blocksDir]) {
        if (!fs.existsSync(dir)) continue;
        for (const file of cssFiles(dir)) {
            const css = fs.readFileSync(file, "utf8");
            for (const className of classesIn(css)) if (!(className in internalClasses)) classes.add(className);
            for (const property of customPropertiesIn(css)) properties.add(property);
        }
    }
    for (const className of classes) delete internalClasses[className];

    // Each colour token's value, so a hard-coded colour can be named by its token.
    const tokens = JSON.parse(fs.readFileSync(path.join(root, "tokens/tokens.json"), "utf8"));
    const colours = {};
    for (const token of tokens.color.tokens) {
        const values = typeof token.value === "string" ? [token.value] : Object.values(token.value);
        for (const value of values) {
            const key = value.trim().toLowerCase();
            if (/^#[0-9a-f]{3,8}$/.test(key)) colours[key] ??= `--${token.name}`;
        }
    }

    return {
        version,
        package: "@openwarelabs/ui",
        blocksPackage: "@openwarelabs/blocks",
        exports,
        blocks,
        components,
        properties: [...properties].sort(),
        colours,
        classes: [...classes].sort(),
        internalClasses,
    };
}
