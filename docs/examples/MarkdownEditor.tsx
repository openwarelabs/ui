import { useState } from "react";

import { Button, Field, Form, Input, MarkdownEditor, Text, toast } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "MarkdownEditor",
    category: "Inputs",
    description:
        "A text box for Markdown with a formatting toolbar and a preview: a comment, a description, release notes. The text stays plain Markdown that a Form sends like any other field.",
    source: "components/MarkdownEditor/MarkdownEditor.tsx",
    imports: ["MarkdownEditor"],
    props: ["MarkdownEditorProps", "MarkdownEditorLabels"],
    keyboard: [
        ["Tab", "Moves from the Write and Preview tabs to the toolbar (one stop for all of its buttons), then into the text."],
        ["Left or Right", "In the toolbar, moves between its buttons; in the tabs, switches between Write and Preview."],
        ["Ctrl+B, Ctrl+I, Ctrl+E", "Bold, italic and code: wrap the selection or the word at the caret, or take the marks off. ⌘ on a Mac."],
        ["Ctrl+Shift+X", "Strikethrough."],
        ["Ctrl+K", "Makes the selection a link, with the URL selected to type over; a selected URL becomes the link's target."],
        ["Ctrl+Shift+8, Ctrl+Shift+7", "A bulleted or a numbered list on the selected lines; again takes it off."],
        ["Ctrl+Shift+.", "A quote on the selected lines."],
        ["Enter", "At the end of a list item, starts the next one (the next number, an empty task box). On an empty item, ends the list."],
    ],
    notes: [
        "Field names the text box, points aria-describedby at its hint and error, and marks it invalid; the frame shows the focus and invalid states.",
        'The toolbar is a Toolbar named "Formatting": one tab stop with the arrow keys between its buttons. Each button is labelled, shows its shortcut in a tooltip and carries it as aria-keyshortcuts.',
        "Bold, italic, strikethrough, code, heading, quote and the lists are toggle buttons: aria-pressed says whether the format is on at the caret.",
        "Edits go through the browser's own insertText, so Ctrl+Z undoes them like typing; clicking a button keeps the caret where it was.",
        "The preview renders with Markdown, which never injects HTML. Images in the text show only as links to them, as in Markdown by default.",
        "With onUpload, an image pasted or dropped into the text uploads: the text holds ![Uploading name…]() meanwhile and the URL takes its place, and a polite live region says what's happening.",
        "In split view the preview stacks under the text when the editor is under 560px wide.",
    ],
    related: ["Textarea", "Markdown", "MentionInput", "Toolbar"],
    since: "0.18.0",
};

const releaseNotes = `## What's new

- **Dark map style** for the night shift, on by default after sunset.
- Exports are rate-limited to _60 a minute_, with a \`Retry-After\` header.

> Sign in again after the update: sessions were reset.

- [x] Tested on iOS and Android
- [ ] Translations for Irish`;

/** In a Field, with a label and a hint. Select a word and press Ctrl+B, or use the toolbar; Preview shows the result. */
export function Basic() {
    const [notes, setNotes] = useState(releaseNotes);
    return (
        <div style={{ width: 560, maxWidth: "100%" }}>
            <Field label="Release notes" hint="Markdown: **bold**, _italic_, lists and links.">
                <MarkdownEditor value={notes} onChange={setNotes} placeholder="What changed, and who it's for." />
            </Field>
        </div>
    );
}
Basic.layout = { align: "start" as const, fill: true };

/** preview="split" shows the text and its preview side by side, and one above the other when the editor is narrow. */
export function Split() {
    return (
        <div style={{ width: 760, maxWidth: "100%" }}>
            <MarkdownEditor
                aria-label="Description"
                preview="split"
                rows={8}
                defaultValue={`# Scope\n\nA recipe app that plans the week from what's in the fridge.\n\n1. Scan the shelves\n2. Pick a plan\n3. Shop for the rest`}
            />
        </div>
    );
}
Split.layout = { align: "start" as const, fill: true };

/** A comment box: a few tools, no preview, and autoGrow so it grows with the comment. */
export function Comment() {
    const [comment, setComment] = useState("");
    return (
        <div style={{ width: 480, maxWidth: "100%" }}>
            <Field label="Comment">
                <MarkdownEditor
                    value={comment}
                    onChange={setComment}
                    toolbar={["bold", "italic", "code", "link", "bulletList"]}
                    preview="none"
                    autoGrow
                    rows={3}
                    autoGrowMaxHeight={240}
                    placeholder="Leave a comment for Aoife…"
                    toolbarEnd={
                        <Text variant="caption" tone="muted">
                            {comment.length} / 500
                        </Text>
                    }
                    maxLength={500}
                />
            </Field>
        </div>
    );
}
Comment.layout = { align: "start" as const };

/** In a Form: the Markdown is sent under its name, and required asks for some first. */
export function InAForm() {
    return (
        <Form
            style={{ width: 520, maxWidth: "100%" }}
            onSubmit={(values) =>
                toast.success("Issue opened", {
                    description: `"${String(values.title)}", ${String(values.body).split("\n").length} lines of Markdown.`,
                })
            }
        >
            <Field label="Title">
                <Input name="title" defaultValue="Login redirects to a blank page" required />
            </Field>
            <Field label="Description" hint="Steps to reproduce, and what you expected." errorMessages="Describe the issue before you send it.">
                <MarkdownEditor name="body" rows={5} required toolbar={["bold", "italic", "code", "codeBlock", "link", "bulletList", "numberedList", "taskList"]} />
            </Field>
            <Button type="submit" variant="primary">
                Open issue
            </Button>
        </Form>
    );
}
InAForm.layout = { align: "start" as const };
