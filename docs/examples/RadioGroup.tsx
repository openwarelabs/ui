import { useState } from "react";

import { Radio, RadioGroup } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "RadioGroup",
    category: "Primitives",
    description:
        "One choice from a few visible options. Each option is a native radio, so the arrow keys move between them.",
    source: "components/RadioGroup/RadioGroup.tsx",
    imports: ["RadioGroup", "Radio"],
    props: ["RadioGroupProps", "RadioProps"],
    keyboard: [
        ["Tab", "Moves into the group, onto the chosen option."],
        ["Up or Down or Left or Right", "Chooses the previous or next option."],
    ],
    notes: [
        "The group is a fieldset with its label as the legend.",
        "Use cards when each option needs a sentence to explain it.",
    ],
    related: ["SegmentedControl", "Select", "CheckboxGroup"],
};

/** A label and a few options. */
export function Basic() {
    const [frequency, setFrequency] = useState("weekly");
    return (
        <RadioGroup label="Back up" value={frequency} onChange={setFrequency}>
            <Radio value="daily">Every day</Radio>
            <Radio value="weekly">Every week</Radio>
            <Radio value="never">Never</Radio>
        </RadioGroup>
    );
}
Basic.layout = { align: "start" as const };

/** Side by side. */
export function Horizontal() {
    return (
        <RadioGroup label="Density" orientation="horizontal" defaultValue="comfortable">
            <Radio value="compact">Compact</Radio>
            <Radio value="comfortable">Comfortable</Radio>
            <Radio value="spacious" disabled>
                Spacious
            </Radio>
        </RadioGroup>
    );
}
Horizontal.layout = { align: "start" as const };

/** variant="cards" for choices that each need explaining; the chosen card is tinted. */
export function Cards() {
    const [kind, setKind] = useState("full");
    return (
        <div style={{ width: 420, maxWidth: "100%" }}>
            <RadioGroup label="What to build" variant="cards" value={kind} onChange={setKind}>
                <Radio value="full" description="Every agent, from scope to docs.">
                    A full app
                </Radio>
                <Radio value="frontend" description="Landing pages, sites and UI with no server.">
                    A frontend only
                </Radio>
                <Radio value="plan" description="Scope, screens, design and a plan. No code.">
                    Just a plan
                </Radio>
            </RadioGroup>
        </div>
    );
}
Cards.layout = { align: "start" as const };
