import { useState } from "react";

import { JsonViewer, Text } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "JsonViewer",
    category: "Data display",
    description:
        "A JSON document as a tree of rows that open and close, coloured by type: an API response, a config file, an event's payload. Search finds keys and values, and each row copies its value or its path.",
    source: "components/JsonViewer/JsonViewer.tsx",
    imports: ["JsonViewer"],
    props: ["JsonViewerProps", "JsonViewerLabels"],
    keyboard: [
        ["Up or Down", "Moves between the visible rows."],
        ["Right", "Opens a row, or moves to its first child. Left in right-to-left text."],
        ["Left", "Closes a row, or moves to its parent. Right in right-to-left text."],
        ["Home or End", "Goes to the first or last visible row."],
        ["*", "Opens every row at the same level."],
        ["Enter or Space", "Opens or closes the row, shows the rest of a cut string, and calls onSelect."],
        ["C", "Copies the row's value as JSON; with Shift, its path."],
    ],
    notes: [
        "It's a WAI-ARIA tree with one tab stop: each row is a treeitem with its level, position and size, and the rows under it are a group. A row's key and value are its name.",
        "A string prop is parsed as JSON text. When it isn't valid, the parse error shows in place of the tree, with the text under it.",
        "Strings are green, numbers the brand colour, booleans amber, null and undefined muted and italic; keys are bold. Each is a token, so the colours follow the theme.",
        "A closed row says how much it holds, {3} or [12]; showCounts={false} shows {…} instead. showTypes adds the type after each value.",
        "While searching, the rows above a match stay open and rows without one hide; the count beside the box is read out. Clear the box to see everything again.",
        "The per-row copy buttons appear when the pointer rests on a row or it has focus; they aren't tab stops, so keyboard users press C or Shift+C on the row. Copies are read out.",
        "Paths read a.b[2].c, and that's also what expanded holds; the root is an empty string.",
    ],
    related: ["TreeView", "CodeBlock", "FileTree"],
    since: "0.18.0",
};

const order = {
    id: "ord_8Hq2vL",
    status: "shipped",
    placedAt: "2026-09-28T14:03:22Z",
    total: 184.5,
    currency: "EUR",
    giftMessage: null,
    customer: {
        id: "cus_41",
        name: "Aoife Brennan",
        email: "aoife@example.ie",
        marketingOptIn: false,
        address: { line1: "12 Harcourt Street", city: "Dublin", postcode: "D02 YF44", country: "IE" },
    },
    items: [
        { sku: "PAN-28-CI", name: "Cast iron pan, 28 cm", quantity: 1, price: 89 },
        { sku: "KNF-20-CH", name: "Chef's knife, 20 cm", quantity: 1, price: 72 },
        { sku: "TWL-LIN-3", name: "Linen tea towels", quantity: 3, price: 7.83 },
    ],
    shipments: [
        {
            carrier: "An Post",
            tracking: "RR123456789IE",
            events: [
                { at: "2026-09-29T08:12:00Z", status: "collected" },
                { at: "2026-09-30T17:40:00Z", status: "out for delivery" },
                { at: "2026-09-30T19:05:00Z", status: "delivered", signedBy: "Cian" },
            ],
        },
    ],
    tags: ["priority", "repeat customer"],
};

/** An order from an API, two levels open. Search for a key or a value, and copy a row's value or path from its buttons, or with C and Shift+C. */
export function Response() {
    return <JsonViewer data={order} rootName="order" defaultExpanded={2} searchable label="Order response" />;
}
Response.layout = { align: "start" as const, fill: true };

/** Everything open, keys in alphabetical order, with the type after each value, in a box that scrolls. */
export function SortedAndTyped() {
    const [selected, setSelected] = useState("");
    return (
        <div style={{ display: "grid", gap: 12 }}>
            <JsonViewer data={order.customer} defaultExpanded sortKeys showTypes maxHeight={260} onSelect={(path) => setSelected(path)} label="Customer" />
            <Text variant="caption" tone="muted">
                {selected ? `Selected ${selected}` : "Click or press Enter on a row to select it."}
            </Text>
        </div>
    );
}
SortedAndTyped.layout = { align: "start" as const, fill: true };

const settings = `{
  "theme": "dark",
  "fontSize": 14,
  "editor": { "wordWrap": true, "rulers": [80, 120], },
  "owner": "Niamh Ó Sé"
}`;

/** A JSON string is parsed first. This one has a trailing comma, so the error shows in place with the text under it. */
export function ParseError() {
    return <JsonViewer data={settings} label="Settings" />;
}
ParseError.layout = { align: "start" as const, fill: true };

const log = {
    level: "error",
    message:
        "Request to /api/orders/ord_8Hq2vL failed after 3 retries: upstream returned 503 Service Unavailable while the payment provider was rotating certificates; the order was queued for a later attempt and the customer was told to expect a delay.",
    service: "checkout",
    requestId: "req_01J9Z6F8V5",
    retries: 3,
    ok: false,
};

/** Long strings cut at 60 characters with a toggle for the rest, no counts beside closed rows, and no copying. */
export function LongStrings() {
    return <JsonViewer data={log} maxStringLength={60} showCounts={false} copyable={false} label="Log entry" />;
}
LongStrings.layout = { align: "start" as const, fill: true };
