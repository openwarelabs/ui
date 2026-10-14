import { useRef, useState, type ReactNode } from "react";

import { Button, Kbd, Menu, MenuItem, MenuLabel, PromptInput, PromptSuggestion, PromptSuggestions, Text, toast, type PromptAttachment } from "@openwarelabs/ui";
import { BookOpen, Bug, Check, ChevronDown, FlaskConical, FolderGit2, Sparkles } from "lucide-react";

import "./ChatPromptBox.css";

const projects = ["marketing-site", "billing-api", "mobile-app", "docs", "design-system"];

const models = [
    { id: "quick", label: "Quick", description: "Small fixes and questions" },
    { id: "balanced", label: "Balanced", description: "Most tasks" },
    { id: "thorough", label: "Thorough", description: "Large changes across many files" },
];

const suggestions = [
    { label: "Write tests for invoice dates", icon: <FlaskConical size={16} /> },
    { label: "Update the API reference", icon: <BookOpen size={16} /> },
    { label: "Why did mobile-app fail?", icon: <Bug size={16} /> },
];

const attached: PromptAttachment[] = [
    { id: "format", name: "format.ts", type: "text/typescript", size: 2_140 },
    { id: "invoice", name: "invoice-0412.pdf", type: "application/pdf", size: 184_320 },
];

/** A ghost button in the toolbar that opens a menu of choices, the chosen one ticked. */
function Picker({ label, icon, value, children }: { label: string; icon: ReactNode; value: string; children: ReactNode }) {
    return (
        <Menu
            label={label}
            above
            width={260}
            trigger={
                <Button
                    className="chat-prompt-box__picker"
                    variant="ghost"
                    size="sm"
                    startIcon={icon}
                    endIcon={<ChevronDown size={14} />}
                    aria-label={`${label}: ${value}`}
                >
                    {value}
                </Button>
            }
        >
            <MenuLabel>{label}</MenuLabel>
            {children}
        </Menu>
    );
}

export function ChatPromptBox() {
    const [text, setText] = useState("");
    const [files, setFiles] = useState(attached);
    const [project, setProject] = useState("billing-api");
    const [model, setModel] = useState("balanced");
    const input = useRef<HTMLTextAreaElement>(null);

    const chosen = models.find((option) => option.id === model)!;

    const send = (task: string, attachments: PromptAttachment[]) => {
        const extra = attachments.length ? ` and ${attachments.length} attached file${attachments.length === 1 ? "" : "s"}` : "";
        toast.success("Task sent to the agent", { description: `It's planning the work in ${project} now, using the ${chosen.label} model${extra}.` });
        setText("");
        setFiles([]);
    };

    const attach = (picked: File[]) =>
        setFiles((current) => [
            ...current,
            ...picked
                .filter((file) => !current.some((other) => other.name === file.name))
                .map((file) => ({ id: `${file.name}-${file.lastModified}`, name: file.name, type: file.type, size: file.size })),
        ]);

    const tick = (on: boolean) => (on ? <Check size={15} /> : <span className="chat-prompt-box__tick-space" />);

    return (
        <section className="chat-prompt-box" aria-labelledby="chat-prompt-box-title">
            <div className="chat-prompt-box__inner">
                <Text variant="heading" as="h2" align="center" id="chat-prompt-box-title">
                    What should the agent work on?
                </Text>
                <Text variant="copy" align="center" className="chat-prompt-box__lead">
                    Describe the task in plain words. The agent plans it first, and asks before it pushes anything.
                </Text>

                <PromptInput
                    ref={input}
                    className="chat-prompt-box__input"
                    value={text}
                    onChange={setText}
                    onSubmit={send}
                    minRows={2}
                    maxRows={10}
                    placeholder="Fix the invoice dates for customers outside the UTC time zone…"
                    aria-label="Task for the agent"
                    attachments={files}
                    onAttach={attach}
                    onRemoveAttachment={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
                    startActions={
                        <>
                            <Picker label="Project" icon={<FolderGit2 size={14} />} value={project}>
                                {projects.map((option) => (
                                    <MenuItem
                                        key={option}
                                        role="menuitemradio"
                                        aria-checked={option === project}
                                        icon={tick(option === project)}
                                        onSelect={() => setProject(option)}
                                    >
                                        {option}
                                    </MenuItem>
                                ))}
                            </Picker>
                            <Picker label="Model" icon={<Sparkles size={14} />} value={chosen.label}>
                                {models.map((option) => (
                                    <MenuItem
                                        key={option.id}
                                        role="menuitemradio"
                                        aria-checked={option.id === model}
                                        icon={tick(option.id === model)}
                                        onSelect={() => setModel(option.id)}
                                    >
                                        <span className="chat-prompt-box__option">
                                            {option.label}
                                            <Text variant="caption">{option.description}</Text>
                                        </span>
                                    </MenuItem>
                                ))}
                            </Picker>
                        </>
                    }
                    hint={
                        <>
                            <Kbd>Enter</Kbd> to send, <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for a new line. Drop or paste files to attach them.
                        </>
                    }
                />

                <PromptSuggestions className="chat-prompt-box__suggestions" align="center" aria-label="Ideas to start from">
                    {suggestions.map((suggestion) => (
                        <PromptSuggestion
                            key={suggestion.label}
                            icon={suggestion.icon}
                            onClick={() => {
                                setText(suggestion.label);
                                input.current?.focus();
                            }}
                        >
                            {suggestion.label}
                        </PromptSuggestion>
                    ))}
                </PromptSuggestions>
            </div>
        </section>
    );
}
