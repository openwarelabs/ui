import { useState } from "react";

import { Button, Field, Form, TagInput, toast } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "TagInput",
    category: "Inputs",
    description:
        "Several values in one field, each shown as a tag you can remove: recipients, labels, keywords. Type a value and press Enter or a comma, or pick from suggestions.",
    source: "components/TagInput/TagInput.tsx",
    props: ["TagInputProps", "TagInputOption"],
    keyboard: [
        ["Enter or ,", "Adds what's typed, or the highlighted suggestion."],
        ["Backspace", "In an empty field, selects the last tag; again, removes it."],
        ["Left and Right", "Move between the tags and the text box."],
        ["Delete", "Removes the selected tag."],
        ["Down and Up", "With options, open the suggestions and move through them."],
        ["Escape", "Closes the suggestions, then clears what's typed."],
    ],
    notes: [
        "The text box is the field's one tab stop. Each tag's remove button is named, such as \"Remove design\", and reached with the arrow keys.",
        "Adding and removing a tag is read out. Pasting a list split by commas or new lines adds each value.",
        "With options, the text box is a combobox over a listbox, as in Combobox; values already chosen leave the list.",
        "Give it a name and it submits each value in a hidden input, so a Form gets a string[] (or a string, when there is one).",
        "Leaving the field adds what's typed. A value validate refuses, or one that's already there, stays in the text box; onReject says why.",
    ],
    related: ["Combobox", "Tag", "Field", "Form"],
    since: "0.14.0",
};

/** Type a keyword and press Enter or a comma. Paste a list to add several at once. */
export function Basic() {
    const [keywords, setKeywords] = useState(["design", "tokens"]);
    return (
        <div style={{ width: 380, maxWidth: "100%" }}>
            <Field label="Keywords" hint="Press Enter or a comma after each one.">
                <TagInput value={keywords} onChange={setKeywords} placeholder="Add a keyword" />
            </Field>
        </div>
    );
}

const people = [
    { value: "ana", label: "Ana Ferreira", description: "ana@acme.io" },
    { value: "ben", label: "Ben Okafor", description: "ben@acme.io" },
    { value: "chloe", label: "Chloé Martin", description: "chloe@acme.io" },
    { value: "dara", label: "Dara Byrne", description: "dara@acme.io" },
    { value: "emil", label: "Emil Lund", description: "emil@acme.io" },
    { value: "farah", label: "Farah Haddad", description: "farah@acme.io", disabled: true },
];

/** With options, it suggests values as you type and only takes those. Emails are matched too. */
export function Suggestions() {
    return (
        <div style={{ width: 380, maxWidth: "100%" }}>
            <Field label="Reviewers" hint="Up to three.">
                <TagInput options={people} defaultValue={["ana"]} max={3} placeholder="Search people" />
            </Field>
        </div>
    );
}

const labels = ["bug", "feature", "design", "docs", "performance", "accessibility"].map((label) => ({
    value: label,
    label,
}));

/** allowCustom takes new values too: the last suggestion adds what's typed. */
export function CustomValues() {
    const [chosen, setChosen] = useState(["bug"]);
    return (
        <div style={{ width: 380, maxWidth: "100%" }}>
            <Field label="Labels">
                <TagInput options={labels} allowCustom value={chosen} onChange={setChosen} placeholder="Add a label" size="sm" />
            </Field>
        </div>
    );
}

const isEmail = (text: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);

/** validate refuses what isn't an email; onReject shows why. Inside a Form, a name submits the values. */
export function InAForm() {
    const [error, setError] = useState<string>();
    return (
        <Form
            style={{ width: 380, maxWidth: "100%" }}
            validate={(values) => (values.invite ? undefined : { invite: "Add at least one email." })}
            onSubmit={(values) => {
                const invited = ([] as string[]).concat(values.invite ?? []);
                toast.success(`Invited ${invited.length} ${invited.length === 1 ? "person" : "people"}`);
            }}
        >
            <Field label="Invite by email" error={error}>
                <TagInput
                    name="invite"
                    placeholder="name@company.com"
                    validate={isEmail}
                    onReject={(text, reason) =>
                        setError(reason === "duplicate" ? `${text} is already on the list.` : `${text} isn't an email address.`)
                    }
                    onInputChange={() => setError(undefined)}
                />
            </Field>
            <Button type="submit">Send invites</Button>
        </Form>
    );
}
InAForm.layout = { align: "start" as const };

/** Disabled, and invalid. */
export function States() {
    return (
        <div style={{ display: "grid", gap: 16, width: 380, maxWidth: "100%" }}>
            <Field label="Topics">
                <TagInput defaultValue={["react", "css"]} disabled />
            </Field>
            <Field label="Tags" error="Add at most five tags.">
                <TagInput defaultValue={["one", "two", "three", "four", "five", "six"]} />
            </Field>
        </div>
    );
}
