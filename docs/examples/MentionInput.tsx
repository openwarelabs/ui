import { useState } from "react";

import {
    Avatar,
    Button,
    Field,
    Form,
    MentionInput,
    PromptInput,
    Text,
    toast,
    useMentions,
    type Mention,
    type MentionOption,
    type MentionTrigger,
} from "@openwarelabs/ui";
import { FileText, Languages, ListChecks, Sparkles } from "lucide-react";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "MentionInput",
    category: "Inputs",
    description:
        "A text field that suggests people after @ and commands after /, in a list at the caret. Picking one puts it in the text and reports it with its id. useMentions adds the same to PromptInput or any textarea.",
    source: "components/MentionInput/MentionInput.tsx",
    imports: ["MentionInput", "useMentions"],
    props: [
        "MentionInputProps",
        "MentionTrigger",
        "MentionOption",
        "Mention",
        "UseMentionsOptions",
        "UseMentionsResult",
    ],
    keyboard: [
        [
            "@ or /",
            "At the start of a word, opens the suggestions; what you type next filters them.",
        ],
        ["Down and Up", "Move through the suggestions."],
        ["Enter or Tab", "Puts the highlighted suggestion in the text."],
        ["Escape", "Closes the suggestions until you move to another trigger."],
    ],
    notes: [
        "The text box is a combobox over a listbox: aria-expanded, aria-controls and aria-activedescendant follow the list, and focus stays in the text.",
        'The number of suggestions, "Loading…" and "No matches" are read out politely as they change.',
        'A picked option goes in as plain text, such as "@Ada Lovelace ". `mentions` and onMentionsChange find each one in the text again, so deleting it drops it.',
        "useMentions listens to the text box directly, so it works with PromptInput as it is: put its ref on PromptInput and render its list. While the list is open, Enter picks instead of sending.",
        "Give it a name and the text is submitted like any input. It takes the id, isInvalid and aria-describedby a Field gives it.",
    ],
    related: ["PromptInput", "Combobox", "TagInput", "Field"],
    since: "0.15.0",
};

const people: MentionOption[] = [
    { id: "u1", label: "Ada Lovelace", description: "Engineering" },
    { id: "u2", label: "Grace Hopper", description: "Compilers" },
    { id: "u3", label: "Alan Turing", description: "Research" },
    { id: "u4", label: "Katherine Johnson", description: "Navigation" },
    { id: "u5", label: "Edsger Dijkstra", description: "Away until Monday", disabled: true },
].map((person) => ({ ...person, icon: <Avatar name={person.label} size={16} /> }));

/** Type @ and a name. The list follows the caret; the mentions below come with their ids. */
export function People() {
    const [mentions, setMentions] = useState<Mention[]>([]);
    return (
        <div style={{ display: "grid", gap: 12, width: 420, maxWidth: "100%" }}>
            <MentionInput
                aria-label="Comment"
                placeholder="Write a comment, @ to mention"
                triggers={[{ char: "@", options: people, label: "People" }]}
                onMentionsChange={setMentions}
            />
            <Text variant="caption">
                {mentions.length
                    ? `Mentions: ${mentions.map((mention) => `${mention.label} (${mention.id})`).join(", ")}`
                    : "No one mentioned yet."}
            </Text>
        </div>
    );
}
People.layout = { align: "start" as const };

const commands: MentionOption[] = [
    {
        id: "summarize",
        label: "summarize",
        description: "Sum up the thread",
        icon: <Sparkles size={16} />,
    },
    {
        id: "translate",
        label: "translate",
        description: "Into another language",
        icon: <Languages size={16} />,
    },
    {
        id: "todo",
        label: "todo",
        description: "Turn it into a checklist",
        icon: <ListChecks size={16} />,
    },
    { id: "cite", label: "cite", description: "Add the sources", icon: <FileText size={16} /> },
];

/** Slash commands in a multiline box. onSelect runs when one is picked. */
export function SlashCommands() {
    return (
        <div style={{ width: 420, maxWidth: "100%" }}>
            <MentionInput
                multiline
                rows={3}
                aria-label="Instructions"
                placeholder="Type / for commands"
                triggers={[
                    {
                        char: "/",
                        options: commands,
                        label: "Commands",
                        onSelect: (command) => toast(`/${command.label} added`),
                    },
                ]}
            />
        </div>
    );
}
SlashCommands.layout = { align: "start" as const };

/** Both triggers on PromptInput, through useMentions. Enter picks while the list is open, and sends when it isn't. */
export function ChatPrompt() {
    const [text, setText] = useState("");
    const [sent, setSent] = useState<string>();
    const triggers: MentionTrigger[] = [
        { char: "@", options: people, label: "People" },
        { char: "/", options: commands, label: "Commands" },
    ];
    const { ref, list, mentions } = useMentions({ triggers, value: text });
    return (
        <div
            style={{ display: "grid", gap: 12, width: 520, maxWidth: "100%", marginInline: "auto" }}
        >
            <PromptInput
                ref={ref}
                value={text}
                onChange={setText}
                placeholder="Ask anything, @ to mention, / for commands"
                hint="Enter to send, Shift + Enter for a new line"
                onSubmit={(message) => {
                    const names = mentions.filter((m) => m.trigger === "@").map((m) => m.label);
                    setSent(names.length ? `${message} — for ${names.join(", ")}` : message);
                    setText("");
                }}
            />
            {list}
            {sent ? <Text variant="caption">Sent: {sent}</Text> : null}
        </div>
    );
}
ChatPrompt.layout = { fill: true, align: "start" as const };

const directory = [
    "Ada Lovelace",
    "Alan Kay",
    "Barbara Liskov",
    "Dennis Ritchie",
    "Donald Knuth",
    "Frances Allen",
    "Grace Hopper",
    "Ken Thompson",
    "Margaret Hamilton",
    "Radia Perlman",
].map((name, index) => ({ id: `p${index}`, label: name }));

/** Searching a server: options is a function that returns a promise. A spinner shows while it waits. */
function searchPeople(query: string) {
    return new Promise<MentionOption[]>((resolve) =>
        setTimeout(() => {
            const q = query.toLowerCase();
            resolve(directory.filter((person) => person.label.toLowerCase().includes(q)));
        }, 600),
    );
}

/** The options come from a search that takes a moment; an answer for an old query is dropped. */
export function AsyncSearch() {
    return (
        <div style={{ width: 420, maxWidth: "100%" }}>
            <MentionInput
                aria-label="Message"
                placeholder="@ to search the directory"
                triggers={[{ char: "@", options: searchPeople, label: "Directory" }]}
            />
        </div>
    );
}
AsyncSearch.layout = { align: "start" as const };

/** In a Field and a Form: the label, hint and error are wired up, and name submits the text. */
export function InAField() {
    return (
        <Form
            style={{ width: 420, maxWidth: "100%" }}
            validate={(values) =>
                String(values.note ?? "").includes("@")
                    ? undefined
                    : { note: "Mention who should review it." }
            }
            onSubmit={(values) => toast.success(`Saved: ${String(values.note)}`)}
        >
            <Field label="Handover note" hint="Mention the reviewer with @.">
                <MentionInput
                    name="note"
                    multiline
                    rows={2}
                    triggers={[{ char: "@", options: people }]}
                />
            </Field>
            <Field label="Archived note">
                <MentionInput
                    defaultValue="Signed off by @Grace Hopper"
                    triggers={[{ char: "@", options: people }]}
                    disabled
                />
            </Field>
            <Button type="submit">Save</Button>
        </Form>
    );
}
InAField.layout = { align: "start" as const };
