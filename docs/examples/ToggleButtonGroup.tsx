import { useState } from "react";

import { Stack, ToggleButtonGroup, type ToggleButtonGroupOption } from "@openwarelabs/ui";
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    Info,
    Italic,
    List,
    ListChecks,
    ListOrdered,
    OctagonX,
    TriangleAlert,
    Underline,
} from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ToggleButtonGroup",
    category: "Actions",
    description:
        "Toggle buttons joined into one control: several can be on, like bold and italic, or at most one, like a list style. Unlike a SegmentedControl, all can be off.",
    source: "components/ToggleButtonGroup/ToggleButtonGroup.tsx",
    imports: ["ToggleButtonGroup"],
    props: ["ToggleButtonGroupProps", "ToggleButtonGroupOption"],
    keyboard: [
        [
            "Tab",
            "Moves into the group, onto the button focused last (at first, the first that's on), and out again.",
        ],
        [
            "Left or Right",
            "Moves to the previous or next button, wrapping round. Up and Down do the same.",
        ],
        ["Home or End", "Moves to the first or last button."],
        ["Space or Enter", "Turns the focused button on or off."],
    ],
    notes: [
        'Each button is a toggle button with aria-pressed, in a role="group": give the group an aria-label that names it, like "Text style".',
        "Icon-only options need an aria-label; it shows as a tooltip too.",
        "Inside a Toolbar, the toolbar's arrow keys move across every control, these buttons included, and the group takes the toolbar's size and orientation.",
        "When one option must always be on and it switches a view, a SegmentedControl says so more clearly.",
    ],
    related: ["Toolbar", "ToggleButton", "SegmentedControl", "ButtonGroup"],
    since: "0.4.0",
};

const textStyles: ToggleButtonGroupOption[] = [
    { value: "bold", icon: <Bold size={16} />, "aria-label": "Bold" },
    { value: "italic", icon: <Italic size={16} />, "aria-label": "Italic" },
    { value: "underline", icon: <Underline size={16} />, "aria-label": "Underline" },
    { value: "code", icon: <Code size={16} />, "aria-label": "Code" },
];

const logLevels: ToggleButtonGroupOption[] = [
    { value: "errors", label: "Errors", icon: <OctagonX size={16} /> },
    { value: "warnings", label: "Warnings", icon: <TriangleAlert size={16} /> },
    { value: "info", label: "Info", icon: <Info size={16} /> },
];

/** selectionMode="multiple": any number can be on. The value is an array, in the options' order. */
export function Multiple() {
    const [marks, setMarks] = useState<string[]>(["bold"]);
    return (
        <Stack gap="lg" align="center">
            <ToggleButtonGroup
                selectionMode="multiple"
                aria-label="Text style"
                value={marks}
                onChange={setMarks}
                options={textStyles}
            />
            <p
                style={{
                    margin: 0,
                    fontWeight: marks.includes("bold") ? "var(--ow-weight-heavy)" : 400,
                    fontStyle: marks.includes("italic") ? "italic" : undefined,
                    textDecoration: marks.includes("underline") ? "underline" : undefined,
                    fontFamily: marks.includes("code") ? "var(--ow-font-mono)" : undefined,
                }}
            >
                Ready to merge once the agent's tests pass
            </p>
        </Stack>
    );
}

/** selectionMode="single": at most one is on, and pressing it again turns it off, leaving "" (a plain paragraph here). */
export function Single() {
    const [list, setList] = useState("");
    const names: Record<string, string> = {
        bulleted: "Bulleted list",
        numbered: "Numbered list",
        checklist: "Checklist",
    };
    return (
        <Stack gap="md" align="center">
            <ToggleButtonGroup
                aria-label="List style"
                value={list}
                onChange={setList}
                options={[
                    { value: "bulleted", label: "Bulleted", icon: <List size={16} /> },
                    { value: "numbered", label: "Numbered", icon: <ListOrdered size={16} /> },
                    { value: "checklist", label: "Checklist", icon: <ListChecks size={16} /> },
                ]}
            />
            <span style={{ color: "var(--ow-text-muted)", fontSize: 13 }}>
                {list ? names[list] : "Paragraph"}
            </span>
        </Stack>
    );
}

/** disallowEmptySelection keeps one on, as an alignment needs: pressing the one that's on leaves it on. */
export function OneAlwaysOn() {
    return (
        <ToggleButtonGroup
            aria-label="Alignment"
            defaultValue="left"
            disallowEmptySelection
            options={[
                { value: "left", icon: <AlignLeft size={16} />, "aria-label": "Align left" },
                { value: "center", icon: <AlignCenter size={16} />, "aria-label": "Align centre" },
                { value: "right", icon: <AlignRight size={16} />, "aria-label": "Align right" },
                { value: "justify", icon: <AlignJustify size={16} />, "aria-label": "Justify" },
            ]}
        />
    );
}

/** sm is 32px tall, for toolbars and dense headers; md is 40px, beside other md controls. */
export function Sizes() {
    return (
        <Stack gap="lg" align="center">
            <ToggleButtonGroup
                size="sm"
                selectionMode="multiple"
                aria-label="Log levels"
                defaultValue={["errors", "warnings"]}
                options={logLevels}
            />
            <ToggleButtonGroup
                selectionMode="multiple"
                aria-label="Log levels"
                defaultValue={["errors", "warnings"]}
                options={logLevels}
            />
        </Stack>
    );
}

/** disabled turns off the whole group and keeps what's on visible; an option can also be disabled on its own. */
export function Disabled() {
    return (
        <Stack direction="row" gap="2xl" align="center" justify="center" wrap>
            <ToggleButtonGroup
                disabled
                selectionMode="multiple"
                aria-label="Text style"
                defaultValue={["bold", "italic"]}
                options={textStyles}
            />
            <ToggleButtonGroup
                size="sm"
                selectionMode="multiple"
                aria-label="Log levels"
                defaultValue={["errors"]}
                options={[...logLevels, { value: "debug", label: "Debug", disabled: true }]}
            />
        </Stack>
    );
}
