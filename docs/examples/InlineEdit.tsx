import { useState } from "react";

import {
    Card,
    DescriptionItem,
    DescriptionList,
    InlineEdit,
    SettingsRow,
    Text,
    toast,
} from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "InlineEdit",
    category: "Inputs",
    description:
        "Text that people click, or focus and press Enter, to edit where it is, then save or cancel: a project's name, a title on a dashboard, a value in a settings row or a list of details.",
    source: "components/InlineEdit/InlineEdit.tsx",
    props: ["InlineEditProps", "InlineEditLabels"],
    keyboard: [
        ["Enter or Space", "On the text, opens the editor."],
        ["Enter", "Saves. With multiline, adds a line instead."],
        ["Ctrl+Enter or ⌘Enter", "Saves, with multiline."],
        ["Escape", "Cancels and puts the text back."],
        ["Tab", "Leaves the editor, which saves it (or cancels it, with saveOnBlur={false})."],
    ],
    notes: [
        'The text is a button named from label and then its text, such as "Edit project name Apollo redesign"; the editor is named by label.',
        "After saving or cancelling, focus goes back to the text, so keyboard users don't lose their place.",
        "A message from validate, required or a failed onSave marks the editor invalid, is tied to it with aria-describedby, and is read out.",
        "While a Promise from onSave runs, the editor stays open and can't be changed, and \"Saving\" is read out. Saving the text unchanged doesn't call onSave.",
        "The text box takes the text's own font and is as wide as the text, so opening it doesn't shift the layout. textVariant matches a Text style; left out, it takes the font around it.",
        "Use it for a value people change now and then, where they see it. For a form with several fields and one Submit, use Field with Input instead.",
    ],
    related: ["Input", "Textarea", "Text", "Card", "DescriptionList"],
    since: "0.15.0",
};

/** Click the name, or Tab to it and press Enter. Enter saves, Escape cancels. */
export function Basic() {
    const [name, setName] = useState("Apollo redesign");
    return (
        <Text>
            Project:{" "}
            <InlineEdit
                label="Project name"
                value={name}
                onSave={setName}
                required
                maxLength={60}
            />
        </Text>
    );
}
Basic.layout = { align: "start" as const };

/** textVariant makes it a page title; wrapped in a heading, it keeps the page's outline. selectOnFocus selects the old title to type over. */
export function PageHeading() {
    const [title, setTitle] = useState("Quarterly report");
    return (
        <Text as="h1" variant="section-title">
            <InlineEdit
                label="Report title"
                value={title}
                onSave={setTitle}
                textVariant="section-title"
                selectOnFocus
                required
            />
        </Text>
    );
}
PageHeading.layout = { align: "start" as const, fill: true };

/** multiline edits in a Textarea that grows: Enter adds a line, Ctrl+Enter or ⌘Enter saves. showActions adds Save and Cancel. */
export function Multiline() {
    const [description, setDescription] = useState(
        "A fresh look for the customer portal: new navigation, darker theme, faster search.",
    );
    return (
        <div style={{ width: 440, maxWidth: "100%" }}>
            <InlineEdit
                label="Description"
                value={description}
                onSave={setDescription}
                multiline
                showActions
                placeholder="Add a description"
                textVariant="copy"
            />
        </div>
    );
}
Multiline.layout = { align: "start" as const };

/** onSave returns a Promise: the editor waits for it. Any name with "taken" in it fails, and the error shows under the box. */
export function AsyncSave() {
    const [handle, setHandle] = useState("ada");
    return (
        <InlineEdit
            label="Username"
            value={handle}
            validate={(text) =>
                /^[a-z0-9-]+$/.test(text)
                    ? undefined
                    : "Use lowercase letters, numbers and hyphens."
            }
            onSave={(next) =>
                new Promise<void>((resolve, reject) =>
                    setTimeout(() => {
                        if (next.includes("taken"))
                            reject(new Error(`"${next}" is taken. Try another.`));
                        else {
                            setHandle(next);
                            toast.success("Username saved");
                            resolve();
                        }
                    }, 1000),
                )
            }
            showActions
        />
    );
}
AsyncSave.layout = { align: "start" as const };

/** In a SettingsRow and in a DescriptionList, a value people can change without opening a form. */
export function InSettings() {
    const [workspace, setWorkspace] = useState("Acme Inc.");
    const [site, setSite] = useState("");
    return (
        <div style={{ display: "grid", gap: 24, width: 520, maxWidth: "100%" }}>
            <Card>
                <SettingsRow label="Workspace name" description="Shown on invoices and in emails.">
                    <InlineEdit
                        label="Workspace name"
                        value={workspace}
                        onSave={setWorkspace}
                        required
                    />
                </SettingsRow>
                <SettingsRow label="Website">
                    <InlineEdit
                        label="Website"
                        value={site}
                        onSave={setSite}
                        placeholder="Add a website"
                        saveOnBlur={false}
                    />
                </SettingsRow>
            </Card>
            <DescriptionList divided>
                <DescriptionItem term="Owner">Ada Lovelace</DescriptionItem>
                <DescriptionItem term="Workspace">
                    <InlineEdit
                        label="Workspace name"
                        value={workspace}
                        onSave={setWorkspace}
                        required
                    />
                </DescriptionItem>
                <DescriptionItem term="Plan">Team</DescriptionItem>
            </DescriptionList>
        </div>
    );
}
InSettings.layout = { align: "start" as const };
