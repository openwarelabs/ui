import type { Rule } from "eslint";
import type { JSXAttribute, JSXOpeningElement } from "estree-jsx";

import { manifest } from "@plugin/manifest";
import { attributeName, closest, libraryComponent, list } from "@plugin/util";

/** Attributes every element takes, which a component that extends an element's attributes takes too. */
const globalAttributes = new Set(
    "id className style title role tabIndex hidden lang dir slot translate draggable spellCheck contentEditable autoFocus accessKey dangerouslySetInnerHTML suppressHydrationWarning suppressContentEditableWarning itemProp itemScope itemType itemID inputMode is nonce part popover popoverTarget popoverTargetAction autoCapitalize autoCorrect inert enterKeyHint form".split(
        " ",
    ),
);

/** What each element takes on top of the global attributes. */
const elementAttributes: Record<string, string[]> = {
    button: ["type", "disabled", "name", "value", "formAction", "formEncType", "formMethod", "formNoValidate", "formTarget"],
    input: "type value defaultValue placeholder name disabled required readOnly min max step pattern autoComplete maxLength minLength list multiple size accept checked defaultChecked capture alt src height width".split(" "),
    textarea: "value defaultValue placeholder name disabled required readOnly rows cols wrap maxLength minLength autoComplete".split(" "),
    select: "value defaultValue name disabled required multiple size autoComplete".split(" "),
    a: ["href", "target", "rel", "download", "hrefLang", "referrerPolicy", "ping", "type"],
    img: "alt src srcSet sizes loading decoding width height crossOrigin referrerPolicy fetchPriority useMap".split(" "),
    form: "action method encType target noValidate autoComplete name acceptCharset".split(" "),
    ol: ["start", "reversed", "type"],
    li: ["value"],
    time: ["dateTime"],
    svg: "width height viewBox fill stroke xmlns preserveAspectRatio focusable strokeWidth xmlnsXlink version x y".split(" "),
};

const always = new Set(["key", "ref", "children"]);

/** The value an attribute is given, when it's a plain string. */
function stringValue(attribute: JSXAttribute): string | null {
    const value = attribute.value;
    if (!value) return null;
    if (value.type === "Literal") return typeof value.value === "string" ? value.value : null;
    if (value.type === "JSXExpressionContainer" && value.expression.type === "Literal" && typeof value.expression.value === "string") return value.expression.value;
    if (value.type === "JSXExpressionContainer" && value.expression.type === "TemplateLiteral" && value.expression.expressions.length === 0) return value.expression.quasis[0]?.value.cooked ?? null;
    return null;
}

export const validProps: Rule.RuleModule = {
    meta: {
        type: "problem",
        docs: {
            description: "Every prop on a library component is one it has, and a prop that's a choice of strings gets one of its values.",
            url: "https://github.com/openwarelabs/ui/blob/main/eslint/README.md#valid-props",
        },
        schema: [],
        messages: {
            unknownNear: '"{{prop}}" isn\'t a prop of <{{component}}>. Did you mean "{{near}}"?',
            unknown: '"{{prop}}" isn\'t a prop of <{{component}}>. Its props: {{props}}{{element}}.',
            valueNear: '"{{value}}" isn\'t a value of <{{component}}>\'s {{prop}}. Did you mean "{{near}}"? It takes {{values}}.',
            value: '"{{value}}" isn\'t a value of <{{component}}>\'s {{prop}}: it takes {{values}}.',
        },
    },
    create(context) {
        return {
            JSXOpeningElement(node) {
                const element = node as unknown as JSXOpeningElement;
                const component = libraryComponent(context, element);
                if (!component) return;
                const known = manifest.components[component.name];
                if (!known) return;
                const names = Object.keys(known.props);
                const extra = known.element ? new Set([...globalAttributes, ...(elementAttributes[known.element] ?? [])]) : null;

                for (const attribute of element.attributes) {
                    const name = attributeName(attribute);
                    if (name === null || attribute.type !== "JSXAttribute" || name.includes(":")) continue;
                    if (name in known.props) {
                        const values = known.props[name];
                        const given = stringValue(attribute);
                        if (values && given !== null && !values.includes(given)) {
                            const near = closest(given, values);
                            context.report({
                                node: attribute as unknown as Rule.Node,
                                messageId: near ? "valueNear" : "value",
                                data: { value: given, component: component.name, prop: name, near: near ?? "", values: list(values.map((value) => `"${value}"`)) },
                            });
                        }
                        continue;
                    }
                    if (always.has(name) || name.startsWith("data-") || name.startsWith("aria-")) continue;
                    if (extra && (extra.has(name) || /^on[A-Z]/.test(name))) continue;
                    const near = closest(name, names);
                    context.report({
                        node: attribute as unknown as Rule.Node,
                        messageId: near ? "unknownNear" : "unknown",
                        data: {
                            prop: name,
                            component: component.name,
                            near: near ?? "",
                            props: names.length ? names.join(", ") : "none",
                            element: known.element ? ` (and ${known.element === "element" ? "an element's" : `a${/^[aeiou]/.test(known.element) ? "n" : ""} ${known.element}'s`} attributes)` : "",
                        },
                    });
                }
            },
        };
    },
};
