import type { Rule } from "eslint";
import type { Literal, Node, TemplateElement, TemplateLiteral } from "estree";
import type { JSXAttribute } from "estree-jsx";

import { classSet, manifest, propertySet } from "@plugin/manifest";
import { closest } from "@plugin/util";

const property = /--ow-[a-z0-9-]+/g;
const className = /^ow-[a-z0-9-]+$/;

/** The strings in an expression: literals and the fixed parts of templates, with where each sits in its template. */
function* strings(node: Node): Generator<{ node: Literal | TemplateElement; text: string; first: boolean; last: boolean }> {
    if (node.type === "Literal") {
        if (typeof node.value === "string") yield { node, text: node.value, first: true, last: true };
        return;
    }
    if (node.type === "TemplateLiteral") {
        for (const [index, quasi] of node.quasis.entries()) yield { node: quasi, text: quasi.value.cooked ?? "", first: index === 0, last: quasi.tail };
        return;
    }
    for (const key of Object.keys(node)) {
        if (key === "parent" || key === "loc" || key === "range") continue;
        const child = (node as unknown as Record<string, unknown>)[key];
        if (Array.isArray(child)) {
            for (const entry of child) if (entry && typeof entry === "object" && "type" in entry) yield* strings(entry as Node);
        } else if (child && typeof child === "object" && "type" in child) {
            yield* strings(child as Node);
        }
    }
}

export const validTokens: Rule.RuleModule = {
    meta: {
        type: "problem",
        docs: {
            description: "Every --ow- custom property and ow- class in the code is one the library has.",
            url: "https://github.com/openwarelabs/ui/blob/main/eslint/README.md#valid-tokens",
        },
        hasSuggestions: true,
        schema: [
            {
                type: "object",
                properties: {
                    allow: { type: "array", items: { type: "string" }, description: 'Your own ow- classes or --ow- properties to leave alone; a trailing * matches a prefix ("ow-app-*").' },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            propertyNear: "{{name}} isn't an Openware UI token. Did you mean {{near}}?",
            property: "{{name}} isn't an Openware UI token: call get_tokens, or see the Tokens page, for the --ow- variables.",
            internal: '"{{name}}" is {{component}}\'s own class: render <{{component}}> rather than styling an element with its class.',
            classNear: '"{{name}}" isn\'t a class Openware UI ships. Did you mean "{{near}}"?',
            class: '"{{name}}" isn\'t a class Openware UI ships: the classes for your own elements are ow-app, the ow-type-… text styles and a block\'s own classes.',
            replace: "Replace with {{near}}.",
        },
    },
    create(context) {
        const options = (context.options[0] ?? {}) as { allow?: string[] };
        const allowed = options.allow ?? [];
        const isAllowed = (name: string) => allowed.some((entry) => (entry.endsWith("*") ? name.startsWith(entry.slice(0, -1)) : name === entry));
        const seen = new WeakSet<object>();

        function checkProperties(node: Literal | TemplateElement, text: string, first: boolean, last: boolean) {
            for (const match of text.matchAll(property)) {
                const name = match[0];
                const start = match.index;
                const end = start + name.length;
                // A name cut by a ${…} isn't whole: `--ow-chart-${slot}`.
                if ((!last && end === text.length) || (!first && start === 0)) continue;
                if (propertySet.has(name) || isAllowed(name)) continue;
                const near = closest(name, propertySet, 3);
                context.report({
                    node,
                    messageId: near ? "propertyNear" : "property",
                    data: { name, near: near ?? "" },
                    suggest: near && node.type === "Literal" ? [{ messageId: "replace", data: { near }, fix: (fixer) => fixer.replaceText(node, context.sourceCode.getText(node).replace(name, near)) }] : [],
                });
            }
        }

        function checkClasses(node: Literal | TemplateElement, text: string, first: boolean, last: boolean) {
            const parts = text.split(/\s+/);
            for (const [index, part] of parts.entries()) {
                if (!className.test(part)) continue;
                // A class touching a ${…} may be cut: `ow-type-${variant}`.
                if ((!last && index === parts.length - 1 && !/\s$/.test(text)) || (!first && index === 0 && !/^\s/.test(text))) continue;
                if (classSet.has(part) || isAllowed(part)) continue;
                const component = manifest.internalClasses[part];
                if (component) {
                    context.report({ node, messageId: "internal", data: { name: part, component } });
                    continue;
                }
                const near = closest(part, classSet, 3);
                context.report({
                    node,
                    messageId: near ? "classNear" : "class",
                    data: { name: part, near: near ?? "" },
                    suggest: near && node.type === "Literal" ? [{ messageId: "replace", data: { near }, fix: (fixer) => fixer.replaceText(node, context.sourceCode.getText(node).replace(part, near)) }] : [],
                });
            }
        }

        return {
            Literal(node) {
                if (typeof node.value !== "string" || seen.has(node)) return;
                checkProperties(node, node.value, true, true);
            },
            TemplateElement(node) {
                if (seen.has(node)) return;
                const template = (node as TemplateElement & { parent: TemplateLiteral }).parent;
                const index = template.quasis.indexOf(node);
                checkProperties(node, node.value.cooked ?? "", index === 0, node.tail);
            },
            JSXAttribute(node) {
                const attribute = node as unknown as JSXAttribute;
                if (attribute.name.type !== "JSXIdentifier" || (attribute.name.name !== "className" && attribute.name.name !== "class") || !attribute.value) return;
                const value = attribute.value.type === "JSXExpressionContainer" ? attribute.value.expression : attribute.value;
                if (value.type === "JSXEmptyExpression") return;
                for (const entry of strings(value as Node)) {
                    seen.add(entry.node);
                    checkProperties(entry.node, entry.text, entry.first, entry.last);
                    checkClasses(entry.node, entry.text, entry.first, entry.last);
                }
            },
        };
    },
};
