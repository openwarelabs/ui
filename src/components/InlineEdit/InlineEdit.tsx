import { useId, useLayoutEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { CheckIcon, XIcon } from "@/icons";
import { cx } from "@/utils/cx";
import { Button } from "../Button/Button";
import { Spinner } from "../Spinner/Spinner";
import { Textarea } from "../Textarea/Textarea";
import type { InlineEditProps } from "./InlineEdit.types";

export type { InlineEditLabels, InlineEditProps } from "./InlineEdit.types";

const defaultLabels = {
    edit: (label: string) => `Edit ${label.toLowerCase()}`,
    save: "Save",
    cancel: "Cancel",
    saving: "Saving",
    required: "This can't be empty.",
    failed: "Couldn't save. Try again.",
};

/** Lucide's pencil, the cue that the text can be edited. */
function PencilIcon() {
    return (
        <svg
            className="ow-inline-edit__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            <path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z" />
        </svg>
    );
}

/**
 * Text that people click, or focus and press Enter, to edit where it is: a project's name, a title, a value in a
 * settings row. Enter saves and Escape cancels; focus goes back to the text either way. `onSave` can return a Promise:
 * the editor stays open while it runs, and shows its error if it fails.
 */
export function InlineEdit({
    value,
    defaultValue = "",
    onSave,
    onCancel,
    label,
    placeholder,
    multiline = false,
    validate,
    required = false,
    maxLength,
    textVariant,
    saveOnBlur = true,
    showActions = false,
    editing,
    defaultEditing = false,
    onEditingChange,
    selectOnFocus = false,
    disabled = false,
    readOnly = false,
    labels: labelsProp,
    id,
    className,
}: InlineEditProps) {
    const labels = { ...defaultLabels, ...labelsProp };
    const [current, setCurrent] = useControllableState(value, defaultValue);
    const [isEditing, setEditing] = useControllableState(editing, defaultEditing, onEditingChange);
    const [draft, setDraft] = useState(current);
    const [error, setError] = useState<string>();
    const [pending, setPending] = useState(false);
    const pendingRef = useRef(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const editorRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
    // Whether focus goes back to the text when the editor closes: yes after keys and buttons, not after leaving it.
    const refocus = useRef(false);
    const generatedId = useId();
    const errorId = `${generatedId}-error`;
    const textId = `${generatedId}-text`;
    const editable = !disabled && !readOnly;
    const open = isEditing && editable;
    const hint = placeholder ?? label;

    // Each time it opens, however it was opened, the editor starts from the saved text.
    const [wasOpen, setWasOpen] = useState(open);
    if (wasOpen !== open) {
        setWasOpen(open);
        if (open) {
            setDraft(current);
            setError(undefined);
        }
    }

    useLayoutEffect(() => {
        if (open) {
            const editor = editorRef.current;
            if (!editor) return;
            editor.focus();
            if (selectOnFocus) editor.select();
            else editor.setSelectionRange(editor.value.length, editor.value.length);
        } else if (refocus.current) {
            refocus.current = false;
            buttonRef.current?.focus();
        }
    }, [open, selectOnFocus]);

    function close(focusBack: boolean) {
        refocus.current = focusBack;
        setError(undefined);
        setEditing(false);
    }

    function cancel(focusBack: boolean) {
        if (pendingRef.current) return;
        close(focusBack);
        onCancel?.();
    }

    async function save(focusBack: boolean) {
        if (pendingRef.current) return;
        // Saving it unchanged just closes the editor.
        if (draft === current) return close(focusBack);
        const problem = required && !draft.trim() ? labels.required : validate?.(draft);
        if (problem) {
            setError(problem);
            if (focusBack) editorRef.current?.focus();
            return;
        }
        setError(undefined);
        try {
            const result = onSave?.(draft);
            if (result && typeof result.then === "function") {
                pendingRef.current = true;
                setPending(true);
                await result;
            }
        } catch (reason) {
            setError(reason instanceof Error && reason.message ? reason.message : typeof reason === "string" && reason ? reason : labels.failed);
            // The editor turns editable again on the next render; focus it once it has.
            if (focusBack) requestAnimationFrame(() => editorRef.current?.focus());
            return;
        } finally {
            pendingRef.current = false;
            setPending(false);
        }
        setCurrent(draft);
        close(focusBack);
    }

    function onKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Escape") {
            // Don't let a Dialog or Drawer around it close as well.
            event.preventDefault();
            event.stopPropagation();
            cancel(true);
        } else if (event.key === "Enter" && (!multiline || event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            void save(true);
        }
    }

    function onBlur(event: FocusEvent<HTMLSpanElement>) {
        // Moving between the editor and its buttons isn't leaving it.
        if (!open || event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        if (saveOnBlur) void save(false);
        else cancel(false);
    }

    const editorProps = {
        ref: editorRef,
        value: draft,
        placeholder: hint,
        maxLength,
        readOnly: pending,
        "aria-label": label,
        "aria-describedby": error ? errorId : undefined,
        "aria-invalid": error ? true : undefined,
        onChange: (event: { currentTarget: { value: string } }) => {
            setDraft(event.currentTarget.value);
            if (error) setError(undefined);
        },
        onKeyDown,
    };

    const text = (
        <span id={textId} className={cx("ow-inline-edit__text", !current && "ow-inline-edit__text--empty")}>
            {current || hint}
        </span>
    );

    return (
        <span
            className={cx(
                "ow-inline-edit",
                multiline && "ow-inline-edit--multiline",
                textVariant && `ow-type-${textVariant} ow-text--${textVariant}`,
                className,
            )}
            onBlur={onBlur}
        >
            {readOnly ? (
                text
            ) : open ? (
                <>
                    <span className="ow-inline-edit__editor">
                        {multiline ? (
                            <Textarea {...editorProps} autoGrow rows={1} className="ow-inline-edit__input" isInvalid={Boolean(error)} />
                        ) : (
                            // The text box sizes to its text: a hidden copy of it, in the same grid cell, sets the width.
                            <span className="ow-inline-edit__field" data-value={draft || hint}>
                                <input
                                    {...editorProps}
                                    type="text"
                                    size={1}
                                    className={cx("ow-inline-edit__input", error && "ow-inline-edit__input--invalid")}
                                />
                            </span>
                        )}
                        {showActions ? (
                            <span className="ow-inline-edit__actions">
                                <Button size="sm" variant="primary" iconOnly aria-label={labels.save} loading={pending} onClick={() => void save(true)}>
                                    <CheckIcon />
                                </Button>
                                <Button size="sm" iconOnly aria-label={labels.cancel} disabled={pending} onClick={() => cancel(true)}>
                                    <XIcon />
                                </Button>
                            </span>
                        ) : pending ? (
                            <Spinner size="sm" label="" className="ow-inline-edit__spinner" />
                        ) : null}
                        <span role="status" className="ow-visually-hidden">
                            {pending ? labels.saving : ""}
                        </span>
                    </span>
                    {error ? (
                        <span id={errorId} role="alert" className="ow-inline-edit__error">
                            {error}
                        </span>
                    ) : null}
                </>
            ) : (
                <button
                    ref={buttonRef}
                    type="button"
                    id={id}
                    className="ow-inline-edit__display"
                    aria-labelledby={`${generatedId}-edit ${textId}`}
                    disabled={disabled}
                    onClick={() => setEditing(true)}
                >
                    {/* Named "Edit project name Apollo": what it does, then the text people see on it. */}
                    <span id={`${generatedId}-edit`} className="ow-visually-hidden">
                        {labels.edit(label)}
                    </span>
                    {text}
                    <PencilIcon />
                </button>
            )}
        </span>
    );
}
