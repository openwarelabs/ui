import type { Rule } from "eslint";
import type { Expression, Literal, Property, SpreadElement, TemplateLiteral } from "estree";
import type { JSXAttribute } from "estree-jsx";

import { manifest } from "@plugin/manifest";

const hex = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi;
const functional = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)/i;
const colourProperty = /colou?r|background|border|outline|fill|stroke|shadow|caret|accent/i;
const named = new Set(
    "aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen".split(
        " ",
    ),
);
const namedHex: Record<string, string> = { white: "#ffffff", black: "#000000" };

/** Expands #abc and #abcd to six or eight digits, lower-case, to look it up. */
function normalise(colour: string) {
    const digits = colour.slice(1).toLowerCase();
    return digits.length <= 4 ? `#${[...digits].map((digit) => digit + digit).join("")}` : `#${digits}`;
}

/** The token with this exact colour, if there is one. */
function tokenFor(colour: string): string | null {
    const value = colour.startsWith("#") ? normalise(colour) : (namedHex[colour.toLowerCase()] ?? null);
    if (!value) return null;
    return manifest.colours[value] ?? manifest.colours[value.slice(0, 7)] ?? null;
}

/** The first hard-coded colour in a style value, if any. */
function findColour(property: string, value: string): string | null {
    const match = hex.exec(value);
    hex.lastIndex = 0;
    if (match) return match[0];
    const call = functional.exec(value);
    if (call) return call[0];
    const word = value.trim().toLowerCase();
    if (colourProperty.test(property) && named.has(word)) return word;
    return null;
}

const propertyName = (property: Property): string | null => {
    if (property.computed) return null;
    if (property.key.type === "Identifier") return property.key.name;
    if (property.key.type === "Literal") return String(property.key.value);
    return null;
};

export const noInlineColour: Rule.RuleModule = {
    meta: {
        type: "suggestion",
        docs: {
            description: "No hard-coded colours in style props: use the --ow- tokens, so the code follows the theme and the brand colour.",
            url: "https://github.com/openwarelabs/ui/blob/main/eslint/README.md#no-inline-colour",
        },
        fixable: "code",
        schema: [],
        messages: {
            token: 'Hard-coded colour "{{colour}}" in {{property}}: use var({{token}}) so it follows the theme.',
            colour: 'Hard-coded colour "{{colour}}" in {{property}}: use a token (var(--ow-surface), var(--ow-text-muted), var(--ow-primary)…) so it follows the theme and the brand colour.',
        },
    },
    create(context) {
        function checkValue(name: string, node: Literal | TemplateLiteral) {
            const text = node.type === "Literal" ? (typeof node.value === "string" ? node.value : null) : node.quasis.map((quasi) => quasi.value.cooked ?? "").join(" ");
            if (text === null) return;
            const colour = findColour(name, text);
            if (!colour) return;
            const token = tokenFor(colour);
            if (token) {
                context.report({
                    node,
                    messageId: "token",
                    data: { colour, property: name, token },
                    fix: node.type === "Literal" ? (fixer) => fixer.replaceText(node, JSON.stringify(text.replace(colour, `var(${token})`))) : null,
                });
            } else {
                context.report({ node, messageId: "colour", data: { colour, property: name } });
            }
        }

        function checkObject(properties: Array<Property | SpreadElement>) {
            for (const property of properties) {
                if (property.type !== "Property") continue;
                const name = propertyName(property);
                if (!name) continue;
                const value = property.value as Expression;
                if (value.type === "Literal" || value.type === "TemplateLiteral") checkValue(name, value);
            }
        }

        return {
            JSXAttribute(node) {
                const attribute = node as unknown as JSXAttribute;
                if (attribute.name.type !== "JSXIdentifier" || attribute.name.name !== "style") return;
                if (attribute.value?.type !== "JSXExpressionContainer" || attribute.value.expression.type !== "ObjectExpression") return;
                checkObject(attribute.value.expression.properties);
            },
        };
    },
};
