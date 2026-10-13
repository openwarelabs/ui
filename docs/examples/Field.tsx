import { useState } from "react";

import { Field, Input, Select, Stack, Textarea } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Field",
    category: "Forms",
    description:
        "A label above a control, with a hint and an error below, wired together for screen readers.",
    source: "components/Field/Field.tsx",
    notes: [
        "Field gives its control an id, points aria-describedby at the hint and error, and marks it invalid when there's an error.",
        'Errors use role="alert", so they\'re read out when they appear.',
        "Show an error after the person leaves the field or submits, not while they're typing.",
    ],
    related: ["Input", "Fieldset", "Select"],
};

/** A label, a control and a hint. */
export function Basic() {
    return (
        <div style={{ width: 340, maxWidth: "100%" }}>
            <Field label="Project name" hint="Letters, numbers and dashes.">
                <Input placeholder="recipe-app" />
            </Field>
        </div>
    );
}

/** The error replaces nothing: it's added under the control, which turns red. */
export function WithError() {
    const [folder, setFolder] = useState("~/Projects/nope");
    const error =
        folder.startsWith("~/Projects/") && folder !== "~/Projects/nope"
            ? undefined
            : "That folder doesn't exist.";
    return (
        <div style={{ width: 340, maxWidth: "100%" }}>
            <Field label="Folder" error={error}>
                <Input value={folder} onChange={(event) => setFolder(event.target.value)} />
            </Field>
        </div>
    );
}

/** Any control works: Select and Textarea get the same wiring. */
export function AForm() {
    const [model, setModel] = useState("sonnet");
    return (
        <Stack gap="xl" style={{ width: 360, maxWidth: "100%" }}>
            <Field label="Name">
                <Input defaultValue="Recipe planner" />
            </Field>
            <Field label="Model" hint="Each agent can use a different one later.">
                <Select
                    value={model}
                    onChange={setModel}
                    options={[
                        { value: "sonnet", label: "Claude Sonnet" },
                        { value: "opus", label: "Claude Opus" },
                    ]}
                />
            </Field>
            <Field label="What should it do?">
                <Textarea placeholder="Plans the week's meals from what's in the fridge." />
            </Field>
        </Stack>
    );
}
AForm.layout = { minHeight: 360 };
