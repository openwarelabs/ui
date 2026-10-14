import { useEffect, useRef, useState } from "react";

import {
    Field,
    Kbd,
    PromptInput,
    PromptSuggestion,
    PromptSuggestions,
    Select,
    Text,
    TextShimmer,
    ToggleButton,
    toast,
    type PromptAttachment,
} from "@openwarelabs/ui";
import { BookOpen, Bug, FlaskConical, GitBranch, ListChecks } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "PromptInput",
    category: "AI",
    description:
        "The box you write to the agent in. Enter sends, it grows with the text, it takes files from a picker, the clipboard or a drop, and its send button turns into Stop while the agent replies.",
    source: "components/PromptInput/PromptInput.tsx",
    imports: ["PromptInput", "type PromptAttachment"],
    props: ["PromptInputProps", "PromptAttachment"],
    keyboard: [
        [
            "Enter",
            "Sends the text and attachments, unless there's nothing to send or the agent is replying.",
        ],
        ["Shift + Enter", "Starts a new line."],
        ["Escape", "Stops the agent while it's replying."],
        [
            "Tab",
            "Moves through the attachments' remove buttons, the text, the toolbar and the send button.",
        ],
    ],
    notes: [
        "Uncontrolled, the box clears itself after a send. Controlled, clear value in onSubmit.",
        "Enter that finishes an IME composition (Japanese, Chinese, Korean) only finishes the word; it doesn't send.",
        "Attachments are yours to keep: onAttach hands you the Files, you add them to attachments, with an object URL as the previewUrl of an image, and you take them out in onRemoveAttachment.",
        "Pasting a screenshot attaches it; text copied along with an image, such as spreadsheet cells, pastes as text. A file that doesn't match accept is turned away with a message under the box.",
        'In a Field it takes the Field\'s label, hint and error. Otherwise the text box is named by aria-label, "Message" unless you say otherwise.',
        "With no paperclip and no actions, the send button sits at the end of the text rather than on a row of its own.",
        "Near maxLength a count appears; screen readers hear how many characters are left once typing pauses, not on every key.",
    ],
    related: ["PromptSuggestion", "Textarea", "FileDropZone", "TextShimmer"],
    since: "0.5.0",
};

const ideas = [
    {
        title: "Write tests for invoice dates",
        description: "Cover customers outside the UTC time zone in billing-api.",
        prompt: "Write tests for formatInvoiceDate in billing-api, covering customers outside the UTC time zone.",
        icon: <FlaskConical size={16} />,
    },
    {
        title: "Update the API reference",
        description: "Bring docs/api in line with the v2 endpoints.",
        prompt: "Update docs/api so it matches the v2 endpoints, and flag anything you couldn't confirm.",
        icon: <BookOpen size={16} />,
    },
    {
        title: "Why did mobile-app fail?",
        description: "Read the last CI run and suggest a fix.",
        prompt: "Read the last CI run of mobile-app, find out why it failed and suggest a fix.",
        icon: <Bug size={16} />,
    },
    {
        title: "Tidy up stale branches",
        description: "List branches merged more than 30 days ago.",
        prompt: "List the branches merged into main more than 30 days ago, so I can delete them.",
        icon: <GitBranch size={16} />,
    },
];

/** A new chat: a question, the box, and four ideas. Picking one fills the box to edit; Enter sends it. */
export function NewChat() {
    const [task, setTask] = useState("");
    const input = useRef<HTMLTextAreaElement>(null);
    return (
        <div style={{ display: "grid", gap: 20, width: "100%", maxWidth: 640, margin: "0 auto" }}>
            <Text variant="heading" as="h3" align="center">
                What should the agent work on?
            </Text>
            <PromptInput
                ref={input}
                value={task}
                onChange={setTask}
                minRows={2}
                placeholder="Describe a task…"
                onSubmit={(text) => {
                    toast.success("Task sent to the agent", { description: text });
                    setTask("");
                }}
            />
            <PromptSuggestions layout="grid" aria-label="Ideas to start from">
                {ideas.map((idea) => (
                    <PromptSuggestion
                        key={idea.title}
                        icon={idea.icon}
                        description={idea.description}
                        onClick={() => {
                            setTask(idea.prompt);
                            input.current?.focus();
                        }}
                    >
                        {idea.title}
                    </PromptSuggestion>
                ))}
            </PromptSuggestions>
        </div>
    );
}
NewChat.layout = { fill: true, ground: "canvas" as const };

/** While the agent replies, send becomes Stop, and Escape in the box stops it too. The next message can be typed meanwhile. */
export function Streaming() {
    const [status, setStatus] = useState<"running" | "stopped" | "done">("running");
    useEffect(() => {
        if (status !== "running") return;
        const timer = window.setTimeout(() => setStatus("done"), 8000);
        return () => window.clearTimeout(timer);
    }, [status]);
    return (
        <div style={{ display: "grid", gap: 12, width: 560, maxWidth: "100%" }}>
            <Text variant="body" tone="muted" role="status">
                {status === "running" ? (
                    <TextShimmer>Running tests in billing-api…</TextShimmer>
                ) : status === "stopped" ? (
                    "Stopped after 118 of 240 tests."
                ) : (
                    "240 tests passed."
                )}
            </Text>
            <PromptInput
                placeholder="Ask a follow-up…"
                isStreaming={status === "running"}
                onStop={() => setStatus("stopped")}
                onSubmit={() => setStatus("running")}
            />
        </div>
    );
}

const screenshot = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f1f5f9"/><rect width="80" height="12" fill="#1e1b4b"/><rect x="8" y="20" width="64" height="16" rx="2" fill="#fee2e2" stroke="#fca5a5"/><rect x="12" y="26" width="30" height="4" rx="2" fill="#dc2626"/><rect x="8" y="44" width="48" height="4" rx="2" fill="#cbd5e1"/><rect x="8" y="54" width="60" height="4" rx="2" fill="#cbd5e1"/><rect x="8" y="64" width="36" height="4" rx="2" fill="#cbd5e1"/></svg>',
)}`;

/** Attach with the paperclip, by pasting a screenshot, or by dropping files on the box. You keep the list. */
export function Attachments() {
    const [files, setFiles] = useState<PromptAttachment[]>([
        {
            id: "screenshot",
            name: "checkout-error.png",
            type: "image/png",
            size: 182_400,
            previewUrl: screenshot,
        },
        { id: "log", name: "test-run-2026-10-14.log", type: "text/plain", size: 48_213 },
    ]);
    const attach = (picked: File[]) =>
        setFiles((current) => [
            ...current,
            ...picked.map((file) => ({
                id: crypto.randomUUID(),
                name: file.name,
                type: file.type,
                size: file.size,
                previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
            })),
        ]);
    const remove = (id: string) => {
        const url = files.find((file) => file.id === id)?.previewUrl;
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        setFiles((current) => current.filter((file) => file.id !== id));
    };
    return (
        <div style={{ width: 560, maxWidth: "100%" }}>
            <PromptInput
                defaultValue="The checkout page shows this error after the last deploy. The test log is attached."
                attachments={files}
                onAttach={attach}
                onRemoveAttachment={remove}
                accept="image/*,.log,.txt,.json"
                hint="Images, .log, .txt and .json files. Paste a screenshot or drop files on the box."
                onSubmit={(_, attached) => {
                    toast.success("Sent to the agent", {
                        description: `With ${attached.length} attachment${attached.length === 1 ? "" : "s"}.`,
                    });
                    setFiles([]);
                }}
            />
        </div>
    );
}

const models = [
    { value: "quick", label: "Quick", description: "Small fixes and questions" },
    { value: "balanced", label: "Balanced", description: "Most tasks" },
    { value: "thorough", label: "Thorough", description: "Large changes across many files" },
];

/** Controls go in the toolbar: a model Select at the start, a toggle at the end. The hint says how to send. */
export function Toolbar() {
    const [model, setModel] = useState("balanced");
    const [planFirst, setPlanFirst] = useState(true);
    const chosen = models.find((option) => option.value === model)?.label ?? "Balanced";
    return (
        <div style={{ width: 600, maxWidth: "100%" }}>
            <PromptInput
                minRows={2}
                placeholder="Describe a task for the agent…"
                startActions={
                    <Select
                        size="sm"
                        aria-label="Model"
                        value={model}
                        onChange={setModel}
                        options={models}
                    />
                }
                endActions={
                    <ToggleButton
                        size="sm"
                        variant="ghost"
                        startIcon={<ListChecks size={16} />}
                        pressed={planFirst}
                        onPressedChange={setPlanFirst}
                    >
                        Plan first
                    </ToggleButton>
                }
                hint={
                    <>
                        <Kbd>Enter</Kbd> to send, <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for a new line
                    </>
                }
                onSubmit={() =>
                    toast.success("Task sent to the agent", {
                        description: planFirst
                            ? `It will share a plan before it changes anything, using the ${chosen} model.`
                            : `It's starting now, using the ${chosen} model.`,
                    })
                }
            />
        </div>
    );
}

/** size="sm" for a side panel or a reply box. Near maxLength, a quiet count appears beside the send button. */
export function Compact() {
    return (
        <div style={{ display: "grid", gap: 16, width: 340, maxWidth: "100%" }}>
            <PromptInput
                size="sm"
                placeholder="Reply to Acme agent…"
                onSubmit={() => toast.success("Reply sent")}
            />
            <PromptInput
                size="sm"
                aria-label="Note for the reviewer"
                maxLength={280}
                maxRows={6}
                defaultValue="Looks good. Before you merge, rename formatInvoiceDate to formatInvoiceDay so it matches the API, and add a test for customers in Auckland, where the date turns over first. Then open the pull request against main and ask Dana to review it."
                onSubmit={() => toast.success("Note sent")}
            />
        </div>
    );
}
Compact.layout = { align: "start" as const };

/** disabled turns off the text, its buttons and the toolbar's controls; say why in the hint. In a Field, it takes the label and error. */
export function DisabledAndInAField() {
    const [instructions, setInstructions] = useState("");
    const [error, setError] = useState<string>();
    return (
        <div style={{ display: "grid", gap: 28, width: 520, maxWidth: "100%" }}>
            <PromptInput
                disabled
                placeholder="Describe a task for the agent…"
                onAttach={() => undefined}
                startActions={
                    <Select
                        size="sm"
                        aria-label="Model"
                        value="balanced"
                        onChange={() => undefined}
                        options={models}
                    />
                }
                hint="Connect GitHub to give the agent tasks in this repository."
            />
            <Field
                label="Every morning at 9:00, the agent will…"
                hint="It runs on main and opens a pull request for any change."
                error={error}
            >
                <PromptInput
                    value={instructions}
                    onChange={(text) => {
                        setInstructions(text);
                        setError(undefined);
                    }}
                    placeholder="Update dependencies with security fixes"
                    onSubmit={(text) => {
                        if (text.length < 12) {
                            setError("Say a little more: what should it check, and where?");
                            return;
                        }
                        toast.success("Scheduled", {
                            description: "The agent will run it every morning at 9:00.",
                        });
                        setInstructions("");
                    }}
                />
            </Field>
        </div>
    );
}
DisabledAndInAField.layout = { align: "start" as const };
