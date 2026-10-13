import { useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";

import { Button, Kbd, Menu, MenuItem, MenuLabel, Tag, TagGroup, Text, Textarea, toast } from "@openwarelabs/ui";
import { ArrowUp, Check, ChevronDown, FileCode2, FileImage, FileText, Lightbulb, Paperclip, Sparkles } from "lucide-react";

import "./ChatPromptBox.css";

const models = [
    { id: "quick", label: "Quick", description: "Small fixes and questions" },
    { id: "balanced", label: "Balanced", description: "Most tasks" },
    { id: "thorough", label: "Thorough", description: "Large changes across many files" },
];

const suggestions = ["Write tests for invoice dates", "Update the API reference", "Why did mobile-app fail?"];

function iconFor(name: string) {
    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(name)) return <FileImage size={14} />;
    if (/\.(ts|tsx|js|jsx|py|go|rs|swift|css|json)$/i.test(name)) return <FileCode2 size={14} />;
    return <FileText size={14} />;
}

export function ChatPromptBox() {
    const [text, setText] = useState("");
    const [files, setFiles] = useState(["format.ts", "invoice-0412.pdf"]);
    const [model, setModel] = useState("balanced");
    const input = useRef<HTMLTextAreaElement>(null);
    const picker = useRef<HTMLInputElement>(null);

    const chosen = models.find((option) => option.id === model)!;
    const ready = text.trim().length > 0;

    const send = (event: FormEvent | KeyboardEvent) => {
        event.preventDefault();
        if (!ready) return;
        const attached = files.length ? ` and ${files.length} attached file${files.length === 1 ? "" : "s"}` : "";
        toast.success("Task sent to the agent", { description: `It's planning the work now, using the ${chosen.label} model${attached}.` });
        setText("");
        setFiles([]);
    };

    // Enter sends; Shift+Enter starts a new line.
    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) send(event);
    };

    const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const picked = [...(event.target.files ?? [])].map((file) => file.name);
        setFiles((current) => [...current, ...picked.filter((name) => !current.includes(name))]);
        event.target.value = "";
        input.current?.focus();
    };

    const pickSuggestion = (suggestion: string) => {
        setText(suggestion);
        input.current?.focus();
    };

    return (
        <section className="chat-prompt-box" aria-labelledby="chat-prompt-box-title">
            <div className="chat-prompt-box__inner">
                <Text variant="heading" as="h2" align="center" id="chat-prompt-box-title">
                    What should the agent work on?
                </Text>
                <Text variant="copy" align="center" className="chat-prompt-box__lead">
                    Describe the task in plain words. The agent plans it first, and asks before it pushes anything.
                </Text>

                <form className="chat-prompt-box__box" onSubmit={send}>
                    {files.length ? (
                        <TagGroup className="chat-prompt-box__attachments" label="Attached files">
                            {files.map((name) => (
                                <Tag key={name} size="sm" icon={iconFor(name)} onRemove={() => setFiles((current) => current.filter((file) => file !== name))}>
                                    {name}
                                </Tag>
                            ))}
                        </TagGroup>
                    ) : null}

                    <Textarea
                        ref={input}
                        className="chat-prompt-box__input"
                        bare
                        autoGrow
                        autoGrowMaxHeight={240}
                        rows={2}
                        value={text}
                        placeholder="Fix the invoice dates for customers outside the UTC time zone…"
                        aria-label="Task for the agent"
                        onChange={(event) => setText(event.target.value)}
                        onKeyDown={onKeyDown}
                    />

                    <div className="chat-prompt-box__toolbar">
                        <Button variant="ghost" size="sm" iconOnly aria-label="Attach files" onClick={() => picker.current?.click()}>
                            <Paperclip size={16} />
                        </Button>
                        <input ref={picker} className="chat-prompt-box__file-input" type="file" multiple tabIndex={-1} aria-hidden="true" onChange={addFiles} />

                        <Menu
                            label="Model"
                            above
                            width={260}
                            trigger={
                                <Button
                                    className="chat-prompt-box__model"
                                    variant="ghost"
                                    size="sm"
                                    startIcon={<Sparkles size={14} />}
                                    endIcon={<ChevronDown size={14} />}
                                    aria-label={`Model: ${chosen.label}`}
                                >
                                    {chosen.label}
                                </Button>
                            }
                        >
                            <MenuLabel>Model</MenuLabel>
                            {models.map((option) => (
                                <MenuItem
                                    key={option.id}
                                    role="menuitemradio"
                                    aria-checked={option.id === model}
                                    icon={option.id === model ? <Check size={15} /> : <span className="chat-prompt-box__check-space" />}
                                    onSelect={() => setModel(option.id)}
                                >
                                    <span className="chat-prompt-box__model-option">
                                        {option.label}
                                        <Text variant="caption">{option.description}</Text>
                                    </span>
                                </MenuItem>
                            ))}
                        </Menu>

                        <Text variant="caption" className="chat-prompt-box__hint">
                            <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for a new line
                        </Text>
                        <Button className="chat-prompt-box__send" type="submit" variant="primary" size="sm" iconOnly aria-label="Send" disabled={!ready}>
                            <ArrowUp size={16} />
                        </Button>
                    </div>
                </form>

                <div className="chat-prompt-box__suggestions" role="group" aria-label="Ideas to start from">
                    {suggestions.map((suggestion) => (
                        <Button
                            key={suggestion}
                            size="sm"
                            shape="pill"
                            startIcon={<Lightbulb size={14} />}
                            className="chat-prompt-box__suggestion"
                            onClick={() => pickSuggestion(suggestion)}
                        >
                            {suggestion}
                        </Button>
                    ))}
                </div>
            </div>
        </section>
    );
}
