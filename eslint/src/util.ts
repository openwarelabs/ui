import type { Rule, Scope } from "eslint";
import type { Node } from "estree";
import type { JSXAttribute, JSXIdentifier, JSXMemberExpression, JSXNamespacedName, JSXOpeningElement, JSXSpreadAttribute } from "estree-jsx";

import { manifest } from "./manifest";
import type { ImportedName, Imports } from "./util.types";

const ourPackages = new Set([manifest.package, manifest.blocksPackage]);

/** The element's name as written: "Button", "Dialog.Title" or "svg:rect". */
export function jsxName(name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName): string {
    if (name.type === "JSXIdentifier") return name.name;
    if (name.type === "JSXNamespacedName") return `${name.namespace.name}:${name.name.name}`;
    return `${jsxName(name.object)}.${name.property.name}`;
}

/** An attribute's name as written ("variant", "aria-label"), or null for a spread. */
export function attributeName(attribute: JSXAttribute | JSXSpreadAttribute): string | null {
    if (attribute.type !== "JSXAttribute") return null;
    return attribute.name.type === "JSXIdentifier" ? attribute.name.name : `${attribute.name.namespace.name}:${attribute.name.name.name}`;
}

/** The attribute with this name on an element, if any. */
export function findAttribute(node: JSXOpeningElement, name: string): JSXAttribute | undefined {
    return node.attributes.find((attribute): attribute is JSXAttribute => attributeName(attribute) === name);
}

export const hasSpread = (node: JSXOpeningElement) => node.attributes.some((attribute) => attribute.type === "JSXSpreadAttribute");

const cache = new WeakMap<object, Imports>();

/** The names this file imports from @openwarelabs/ui and @openwarelabs/blocks, by their local name. */
export function libraryImports(context: Rule.RuleContext): Imports {
    const program = context.sourceCode.ast;
    const cached = cache.get(program);
    if (cached) return cached;
    const imports: Imports = new Map();
    for (const statement of program.body) {
        if (statement.type !== "ImportDeclaration" || typeof statement.source.value !== "string" || !ourPackages.has(statement.source.value)) continue;
        for (const specifier of statement.specifiers) {
            if (specifier.type === "ImportSpecifier") {
                const imported = specifier.imported.type === "Identifier" ? specifier.imported.name : String(specifier.imported.value);
                imports.set(specifier.local.name, { source: statement.source.value, imported });
            } else if (specifier.type === "ImportNamespaceSpecifier") {
                imports.set(specifier.local.name, { source: statement.source.value, imported: "*" });
            }
        }
    }
    cache.set(program, imports);
    return imports;
}

/** The library component an element renders, if its name comes from the library: `Button`, or `UI.Button`. */
export function libraryComponent(context: Rule.RuleContext, node: JSXOpeningElement): (ImportedName & { name: string }) | null {
    const imports = libraryImports(context);
    if (node.name.type === "JSXIdentifier") {
        const found = imports.get(node.name.name);
        return found && found.imported !== "*" ? { ...found, name: found.imported } : null;
    }
    if (node.name.type === "JSXMemberExpression" && node.name.object.type === "JSXIdentifier") {
        const found = imports.get(node.name.object.name);
        return found && found.imported === "*" ? { ...found, name: node.name.property.name } : null;
    }
    return null;
}

/** Whether a name is declared or imported somewhere this node can see it. */
export function isBound(context: Rule.RuleContext, node: Node, name: string): boolean {
    let scope: Scope.Scope | null = context.sourceCode.getScope(node);
    while (scope) {
        if (scope.set.has(name)) return true;
        scope = scope.upper;
    }
    return false;
}

/** The edit distance between two strings, for "did you mean". */
export function distance(a: string, b: string): number {
    const rows = a.length + 1;
    const cols = b.length + 1;
    const table = new Array<number>(rows * cols);
    for (let i = 0; i < rows; i++) table[i * cols] = i;
    for (let j = 0; j < cols; j++) table[j] = j;
    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            table[i * cols + j] = Math.min(table[(i - 1) * cols + j]! + 1, table[i * cols + j - 1]! + 1, table[(i - 1) * cols + j - 1]! + cost);
        }
    }
    return table[rows * cols - 1]!;
}

/**
 * The candidate nearest to a name, when it's near enough to be what was meant: a few letters off, or one
 * starting with the other ("DataTable" → "DataGrid" by its "Data", "col" → "columns").
 */
export function closest(name: string, candidates: Iterable<string>, limit = 2): string | null {
    const lower = name.toLowerCase();
    let best: string | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    let prefixed: string | null = null;
    for (const candidate of candidates) {
        const other = candidate.toLowerCase();
        if (other === lower) return candidate;
        const allowed = Math.max(limit, Math.floor(Math.min(name.length, candidate.length) / 4));
        const value = distance(lower, other);
        if (value <= allowed && value < bestDistance) {
            best = candidate;
            bestDistance = value;
        }
        const shorter = Math.min(lower.length, other.length);
        if (shorter >= 3 && (other.startsWith(lower) || lower.startsWith(other)) && (!prefixed || candidate.length < prefixed.length)) prefixed = candidate;
    }
    if (best) return best;
    if (prefixed) return prefixed;
    // The same first word: "DataTable" and "DataGrid".
    const head = /^[a-z]+|^[A-Z][a-z]+/.exec(name)?.[0]?.toLowerCase();
    if (head && head.length >= 4) {
        for (const candidate of candidates) if (candidate.toLowerCase().startsWith(head) && (!prefixed || candidate.length < prefixed.length)) prefixed = candidate;
    }
    return prefixed;
}

/** "a, b or c". */
export function list(values: readonly string[], join = "or"): string {
    if (values.length <= 1) return values.join("");
    return `${values.slice(0, -1).join(", ")} ${join} ${values[values.length - 1]}`;
}
