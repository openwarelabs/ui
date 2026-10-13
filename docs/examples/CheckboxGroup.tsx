import { useState } from "react";

import { Checkbox, CheckboxGroup } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "CheckboxGroup",
    category: "Choices",
    description:
        "Several options under one label, where any number can be chosen. It keeps the list of checked values.",
    source: "components/Checkbox/Checkbox.tsx",
    imports: ["CheckboxGroup", "Checkbox"],
    notes: [
        "The group is a fieldset and its label a legend, so screen readers read the question with each option.",
    ],
    related: ["Checkbox", "Fieldset", "RadioGroup"],
};

/** Give each Checkbox a value; the group's value is the checked ones. */
export function Basic() {
    const [agents, setAgents] = useState(["scope", "design"]);
    return (
        <CheckboxGroup
            label="Agents to run"
            description={`${agents.length} of 4 selected.`}
            value={agents}
            onChange={setAgents}
        >
            <Checkbox value="scope" description="Turns the idea into a build plan.">
                Scope
            </Checkbox>
            <Checkbox value="design" description="Makes the design system.">
                Design
            </Checkbox>
            <Checkbox value="frontend">Frontend</Checkbox>
            <Checkbox value="test">Test</Checkbox>
        </CheckboxGroup>
    );
}
Basic.layout = { align: "start" as const };

/** Side by side, with an error under the options. */
export function Horizontal() {
    const [days, setDays] = useState<string[]>([]);
    return (
        <CheckboxGroup
            label="Run on"
            orientation="horizontal"
            value={days}
            onChange={setDays}
            error={days.length ? undefined : "Pick at least one day."}
        >
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                <Checkbox key={day} value={day}>
                    {day}
                </Checkbox>
            ))}
        </CheckboxGroup>
    );
}
Horizontal.layout = { align: "start" as const };
