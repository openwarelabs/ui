import { useId, useRef, useState } from "react";

import { Button, cx, Kbd, Menu, MenuItem, MenuLabel, PromptInput, PromptSuggestion, PromptSuggestions, Text, type PromptAttachment } from "@openwarelabs/ui";

import { CheckIcon, ChevronDownIcon } from "@blocks/shared/icons";
import type { Chat02Picker, Chat02Props } from "./Chat02.types";

/** A ghost button in the toolbar that opens a menu of choices, the chosen one ticked. */
function Picker({ picker, value, onChange }: { picker: Chat02Picker; value: string; onChange(value: string): void }) {
    const chosen = picker.options.find((option) => option.value === value);
    const label = chosen?.label ?? value;
    return (
        <Menu
            label={picker.label}
            above
            width={260}
            trigger={
                <Button
                    className="ow-chat02__picker"
                    variant="ghost"
                    size="sm"
                    startIcon={picker.icon}
                    endIcon={<ChevronDownIcon size={14} />}
                    aria-label={`${picker.label}: ${label}`}
                >
                    {label}
                </Button>
            }
        >
            <MenuLabel>{picker.label}</MenuLabel>
            {picker.options.map((option) => (
                <MenuItem
                    key={option.value}
                    role="menuitemradio"
                    aria-checked={option.value === value}
                    icon={option.value === value ? <CheckIcon size={15} /> : <span className="ow-chat02__tick-space" />}
                    onSelect={() => onChange(option.value)}
                >
                    {option.description ? (
                        <span className="ow-chat02__option">
                            {option.label}
                            <Text variant="caption">{option.description}</Text>
                        </span>
                    ) : (
                        option.label
                    )}
                </MenuItem>
            ))}
        </Menu>
    );
}

/**
 * A new-task page: a question, a growing box to answer it in with attachments and pickers for the project and the
 * model, and a few ideas to start from.
 */
export function Chat02({ title, description, pickers = [], defaultAttachments = [], suggestions, onSend, labels = {}, className, ...props }: Chat02Props) {
    const id = useId();
    const [text, setText] = useState("");
    const [files, setFiles] = useState<PromptAttachment[]>(defaultAttachments);
    const [ownChoices, setOwnChoices] = useState<Record<string, string>>(() =>
        Object.fromEntries(pickers.map((picker) => [picker.id, picker.defaultValue ?? picker.options[0]?.value ?? ""])),
    );
    const input = useRef<HTMLTextAreaElement>(null);

    const choiceOf = (picker: Chat02Picker) => picker.value ?? ownChoices[picker.id] ?? "";
    const choose = (picker: Chat02Picker, value: string) => {
        setOwnChoices((current) => ({ ...current, [picker.id]: value }));
        picker.onChange?.(value);
    };

    const send = (task: string, attachments: PromptAttachment[]) => {
        onSend?.({ text: task, attachments, choices: Object.fromEntries(pickers.map((picker) => [picker.id, choiceOf(picker)])) });
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

    return (
        <section className={cx("ow-chat02", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-chat02__inner">
                <Text variant="heading" as="h2" align="center" id={`${id}-title`}>
                    {title}
                </Text>
                {description ? (
                    <Text variant="copy" align="center" className="ow-chat02__lead">
                        {description}
                    </Text>
                ) : null}

                <PromptInput
                    ref={input}
                    className="ow-chat02__input"
                    value={text}
                    onChange={setText}
                    onSubmit={send}
                    minRows={2}
                    maxRows={10}
                    placeholder={labels.placeholder ?? "Describe the task…"}
                    aria-label={labels.input ?? "Task for the agent"}
                    attachments={files}
                    onAttach={attach}
                    onRemoveAttachment={(fileId) => setFiles((current) => current.filter((file) => file.id !== fileId))}
                    startActions={
                        pickers.length ? (
                            <>
                                {pickers.map((picker) => (
                                    <Picker key={picker.id} picker={picker} value={choiceOf(picker)} onChange={(value) => choose(picker, value)} />
                                ))}
                            </>
                        ) : undefined
                    }
                    hint={
                        labels.hint ?? (
                            <>
                                <Kbd>Enter</Kbd> to send, <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for a new line. Drop or paste files to attach them.
                            </>
                        )
                    }
                />

                {suggestions?.length ? (
                    <PromptSuggestions className="ow-chat02__suggestions" align="center" aria-label={labels.suggestions ?? "Ideas to start from"}>
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
                ) : null}
            </div>
        </section>
    );
}
