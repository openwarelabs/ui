import type { Rule } from "eslint";
import type { JSXOpeningElement } from "estree-jsx";

import { manifest } from "@plugin/manifest";
import { findAttribute, jsxName } from "@plugin/util";

/** The HTML controls the library has a component for. */
const defaults: Record<string, string> = {
    button: "Button",
    input: "Input",
    select: "Select",
    textarea: "Textarea",
    progress: "ProgressBar",
    meter: "Meter",
};

/** An <input>'s type picks a more specific component; null means the raw element is fine. */
const inputTypes: Record<string, string | null> = {
    hidden: null,
    image: null,
    checkbox: "Checkbox",
    radio: "RadioGroup",
    range: "Slider",
    file: "FileDropZone",
    color: "ColorField",
    date: "DateField",
    time: "TimeField",
    number: "NumberField",
    password: "PasswordInput",
    search: "SearchField",
    submit: "Button",
    reset: "Button",
    button: "Button",
};

export const noRawControls: Rule.RuleModule = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Use the library's Button, Input, Select, Textarea, ProgressBar and Meter instead of the raw HTML controls, so every control looks and behaves the same.",
            url: "https://github.com/openwarelabs/ui/blob/main/eslint/README.md#no-raw-controls",
        },
        schema: [
            {
                type: "object",
                properties: {
                    elements: {
                        type: "object",
                        description: 'More elements to flag, as element → component ("h2": "Text"), or false to allow one ("input": false).',
                        additionalProperties: { anyOf: [{ type: "string" }, { type: "boolean", enum: [false] }] },
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            raw: "Use <{{component}}> from {{package}} instead of <{{element}}>: it has the library's look, sizes, focus ring and states.",
            rawTyped: 'Use <{{component}}> from {{package}} instead of <input type="{{type}}">.',
        },
    },
    create(context) {
        const options = (context.options[0] ?? {}) as { elements?: Record<string, string | false> };
        const elements: Record<string, string | false> = { ...defaults, ...options.elements };
        return {
            JSXOpeningElement(node) {
                const element = node as unknown as JSXOpeningElement;
                if (element.name.type !== "JSXIdentifier") return;
                const name = jsxName(element.name);
                const component = elements[name];
                if (!component) return;
                if (name === "input") {
                    const type = findAttribute(element, "type");
                    const value = type?.value?.type === "Literal" && typeof type.value.value === "string" ? type.value.value : null;
                    if (value !== null && value in inputTypes) {
                        const specific = inputTypes[value];
                        if (specific === null) return;
                        context.report({ node, messageId: "rawTyped", data: { component: specific, type: value, package: manifest.package } });
                        return;
                    }
                }
                context.report({ node, messageId: "raw", data: { component, element: name, package: manifest.package } });
            },
        };
    },
};
