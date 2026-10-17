import type { Rule } from "eslint";
import type { Node } from "estree";
import type { JSXOpeningElement } from "estree-jsx";

import { findAttribute, hasSpread, libraryComponent } from "@plugin/util";

/** The inputs that need a label from a Field around them. SearchField and InputOTP name themselves. */
const defaults = [
    "Input",
    "Textarea",
    "Select",
    "Combobox",
    "NumberField",
    "PasswordInput",
    "DateField",
    "TimeField",
    "TimeRangeField",
    "DurationField",
    "ColorField",
    "TagInput",
    "MentionInput",
    "MarkdownEditor",
    "SignaturePad",
];

/** Attributes that label the input themselves. */
const labels = ["aria-label", "aria-labelledby", "label", "id"];

export const inputNeedsField: Rule.RuleModule = {
    meta: {
        type: "problem",
        docs: {
            description: "Every input is inside a Field (or labelled with aria-label), so it has a visible label, a hint and a place for its error.",
            url: "https://github.com/openwarelabs/ui/blob/main/eslint/README.md#input-needs-field",
        },
        schema: [
            {
                type: "object",
                properties: {
                    components: { type: "array", items: { type: "string" }, description: "The components to check, instead of the default list." },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unlabelled: '<{{component}}> has no label: wrap it in <Field label="…"> (hint and error go there too), or give it aria-label when the label is elsewhere.',
        },
    },
    create(context) {
        const options = (context.options[0] ?? {}) as { components?: string[] };
        const components = new Set(options.components ?? defaults);

        function insideField(node: Node): boolean {
            let current: (Node & { parent?: Node }) | undefined = (node as Node & { parent?: Node }).parent;
            while (current) {
                if (current.type === "JSXElement") {
                    const opening = (current as unknown as { openingElement: JSXOpeningElement }).openingElement;
                    if (libraryComponent(context, opening)?.name === "Field") return true;
                }
                current = current.parent;
            }
            return false;
        }

        return {
            JSXOpeningElement(node) {
                const element = node as unknown as JSXOpeningElement;
                const component = libraryComponent(context, element);
                if (!component || !components.has(component.name)) return;
                if (hasSpread(element) || labels.some((label) => findAttribute(element, label))) return;
                // A hidden input (a username for password managers, say) has nothing to label.
                const type = findAttribute(element, "type");
                if (findAttribute(element, "hidden") || (type?.value?.type === "Literal" && type.value.value === "hidden")) return;
                if (insideField(node as Node)) return;
                context.report({ node, messageId: "unlabelled", data: { component: component.name } });
            },
        };
    },
};
