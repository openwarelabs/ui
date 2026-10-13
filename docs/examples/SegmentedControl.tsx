import { useState } from "react";

import { SegmentedControl } from "@openwarelabs/ui";
import { LayoutGrid, List, Monitor, Moon, Sun } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "SegmentedControl",
    category: "Actions",
    description:
        "Two to five options in a well, with the chosen one raised. It switches a view or a filter at once.",
    source: "components/SegmentedControl/SegmentedControl.tsx",
    keyboard: [
        ["Tab", "Moves into the control, onto the chosen option."],
        ["Left or Right", "Chooses the previous or next option."],
        ["Home or End", "Chooses the first or last option."],
    ],
    notes: [
        "It's a radio group to screen readers: give it an aria-label that names the choice.",
        "Use Tabs when each option shows a different panel of content.",
    ],
    related: ["Tabs", "RadioGroup", "ToggleButton"],
};

/** Commandr's journey switcher: a choice that changes what's shown below. */
export function Basic() {
    const [range, setRange] = useState("week");
    return (
        <SegmentedControl
            aria-label="Time range"
            value={range}
            onChange={setRange}
            options={[
                { value: "day", label: "Day" },
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
                { value: "year", label: "Year" },
            ]}
        />
    );
}

/** Icons with labels, or icons alone with an aria-label each. */
export function WithIcons() {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            <SegmentedControl
                aria-label="Layout"
                defaultValue="grid"
                options={[
                    { value: "grid", label: "Grid", icon: <LayoutGrid size={15} /> },
                    { value: "list", label: "List", icon: <List size={15} /> },
                ]}
            />
            <SegmentedControl
                size="sm"
                aria-label="Theme"
                defaultValue="system"
                options={[
                    { value: "light", label: null, icon: <Sun size={15} />, "aria-label": "Light" },
                    { value: "dark", label: null, icon: <Moon size={15} />, "aria-label": "Dark" },
                    {
                        value: "system",
                        label: null,
                        icon: <Monitor size={15} />,
                        "aria-label": "Match the system",
                    },
                ]}
            />
        </div>
    );
}

/** fullWidth splits the width evenly, for a control that spans a card or a phone screen. */
export function FullWidth() {
    return (
        <div style={{ width: 360, maxWidth: "100%" }}>
            <SegmentedControl
                fullWidth
                aria-label="Plan"
                defaultValue="monthly"
                options={[
                    { value: "monthly", label: "Monthly" },
                    { value: "yearly", label: "Yearly" },
                    { value: "lifetime", label: "Lifetime", disabled: true },
                ]}
            />
        </div>
    );
}
