import { Stack, Text, Truncate } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Truncate",
    category: "Typography",
    description:
        "Text cut to the room it has: at the end, in the middle so a file name keeps its extension, or at the start so a path keeps its last folders. The full text shows in a Tooltip only when it's cut.",
    source: "components/Truncate/Truncate.tsx",
    imports: ["Truncate"],
    props: ["TruncateProps"],
    notes: [
        "The children must be one string, so it can be measured and split. Styles come from the element around it or a className, such as ow-type-code.",
        "An end cut is CSS: text-overflow for one line, line-clamp for several. Middle and start cuts are measured against the box, and measured again when it changes size, when the text changes and once web fonts have loaded.",
        "When a middle or start cut swaps the words on screen, the shown text is hidden from screen readers and the full text is kept in a visually hidden span, so it's read whole and found by find-in-page.",
        "The Tooltip opens on hover and wraps long text. It's for sighted users: the full text is already in the page for everyone else. Set tooltip to false to leave it out.",
        "Characters are counted as code points, so an emoji or an accented letter is never split in two.",
    ],
    related: ["Text", "Tooltip"],
    since: "0.18.0",
};

const files = [
    "Q3-board-deck-final-v7-with-Niamh's-comments.pdf",
    "aoife-brennan-passport-scan-2026-renewal.jpg",
    "openware-labs-dublin-office-lease-signed-countersigned.docx",
    "3f9c2a7e8b1d4c6f0a9e5b7d2c4f6a8e1b3d5f7a9c0e2b4d6f8a1c3e5b7d9f1a",
];

/** File names and a hash in a 240px list, cut in the middle so their endings stay. Hover one for the full name. */
export function FileNames() {
    return (
        <Stack gap="xs" style={{ width: 240 }}>
            {files.map((name) => (
                <Truncate key={name} position="middle" tail={name.includes(".") ? name.length - name.lastIndexOf(".") : undefined}>
                    {name}
                </Truncate>
            ))}
        </Stack>
    );
}
FileNames.layout = { align: "start" as const };

/** A paragraph clamped to three lines; the whole of it in the Tooltip. */
export function ThreeLines() {
    return (
        <Text variant="copy" as="div" style={{ maxWidth: 360 }}>
            <Truncate lines={3}>
                Cian's review of the pricing page covers the new annual toggle, the way the Team plan's limits are
                worded, the missing VAT note for Irish customers, and whether the comparison table should fold on
                phones or scroll sideways. He suggests shipping the toggle first and leaving the table for the next
                release, once Saoirse has the numbers from the trial.
            </Truncate>
        </Text>
    );
}
ThreeLines.layout = { align: "start" as const };

const paths = [
    "/Users/oisin/Projects/openware/ui/src/components/Truncate/Truncate.tsx",
    "/Users/oisin/Projects/openware/ui/docs/examples/Truncate.tsx",
    "/Users/oisin/Library/Application Support/Code/User/settings.json",
    "~/Documents/Eoin/tax/2025/receipts/september/dublin-bus-leap-card-top-up.pdf",
];

/** Paths in a 280px list, cut at the start so the file and its folder stay in view. */
export function Paths() {
    return (
        <Stack gap="xs" style={{ width: 280 }}>
            {paths.map((path) => (
                <Truncate key={path} position="start" className="ow-type-code">
                    {path}
                </Truncate>
            ))}
        </Stack>
    );
}
Paths.layout = { align: "start" as const };
