import { useState } from "react";

import { Field, Select, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Select",
    category: "Choices",
    description:
        "A dropdown that opens a list of options in the top layer, so dialogs and scroll areas can't clip it.",
    source: "components/Select/Select.tsx",
    props: ["SelectProps", "SelectOption", "SelectGroup"],
    keyboard: [
        ["Enter or Space or Down", "Opens the list on the chosen option."],
        ["Up or Down", "Moves through the options, skipping disabled ones."],
        ["Home or End", "Goes to the first or last option."],
        ["Letters", "Jumps to the next option starting with what's typed."],
        ["Enter", "Picks the highlighted option and closes."],
        ["Escape or Tab", "Closes without changing."],
    ],
    notes: [
        "Focus stays on the trigger the whole time; the list follows it with aria-activedescendant.",
        "Use it for one choice among five or more. For two or three, show them all.",
    ],
    related: ["Combobox", "RadioGroup", "SegmentedControl"],
};

/** A value, options and onChange. */
export function Basic() {
    const [region, setRegion] = useState("eu-west");
    return (
        <div style={{ width: 280, maxWidth: "100%" }}>
            <Field label="Region">
                <Select
                    value={region}
                    onChange={setRegion}
                    options={[
                        { value: "eu-west", label: "Europe (Dublin)" },
                        { value: "eu-central", label: "Europe (Zürich)" },
                        { value: "us-east", label: "US East (Virginia)" },
                        { value: "ap-south", label: "Asia Pacific (Mumbai)" },
                    ]}
                />
            </Field>
        </div>
    );
}

/** Groups get an uppercase label; options can have a muted description, or be disabled. */
export function GroupsAndDescriptions() {
    const [model, setModel] = useState("sonnet");
    return (
        <div style={{ width: 300, maxWidth: "100%" }}>
            <Field label="Model">
                <Select
                    value={model}
                    onChange={setModel}
                    options={[
                        {
                            label: "Anthropic",
                            options: [
                                {
                                    value: "sonnet",
                                    label: "Claude Sonnet",
                                    description: "Balanced speed and quality",
                                },
                                {
                                    value: "opus",
                                    label: "Claude Opus",
                                    description: "Most capable",
                                },
                            ],
                        },
                        {
                            label: "On this computer",
                            options: [
                                {
                                    value: "llama",
                                    label: "Llama 3",
                                    description: "Free, through Ollama",
                                },
                                {
                                    value: "qwen",
                                    label: "Qwen 2.5",
                                    description: "Not downloaded yet",
                                    disabled: true,
                                },
                            ],
                        },
                    ]}
                />
            </Field>
        </div>
    );
}

/** The placeholder shows until something is chosen; small, invalid and disabled versions. */
export function States() {
    const [value, setValue] = useState("");
    return (
        <Stack direction="row" gap="sm" wrap>
            <Select
                aria-label="Status"
                value={value}
                onChange={setValue}
                placeholder="Choose a status…"
                options={[
                    { value: "open", label: "Open" },
                    { value: "done", label: "Done" },
                ]}
            />
            <Select
                aria-label="Size"
                size="sm"
                value="m"
                onChange={() => undefined}
                options={[
                    { value: "s", label: "Small" },
                    { value: "m", label: "Medium" },
                ]}
            />
            <Select
                aria-label="Owner"
                isInvalid
                value=""
                onChange={() => undefined}
                placeholder="Required"
                options={[{ value: "a", label: "Alex" }]}
            />
            <Select
                aria-label="Team"
                disabled
                value="core"
                onChange={() => undefined}
                options={[{ value: "core", label: "Core team" }]}
            />
        </Stack>
    );
}
