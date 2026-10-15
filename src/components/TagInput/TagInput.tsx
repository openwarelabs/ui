import {
    forwardRef,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type ClipboardEvent,
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
} from "react";

import { FormContext } from "@/components/Form/Form";
import { useControllableState } from "@/hooks/useControllableState";
import { manualPopover, useDismiss, useFloating } from "@/hooks/useFloating";
import { usePresence } from "@/hooks/usePresence";
import { XIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type { TagInputOption, TagInputProps, TagInputRejectReason } from "./TagInput.types";

export type { TagInputOption, TagInputProps, TagInputRejectReason } from "./TagInput.types";

const none: string[] = [];
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** An item in the suggestions: an option, or the one that adds what's typed. */
type Item = { option: TagInputOption } | { create: string };

/**
 * Several values in one field: each shows as a removable tag before the text box. People type a value and press
 * Enter or a comma, or paste a list. With `options`, it suggests values as they type, like Combobox.
 */
export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(function TagInput(
    {
        value,
        defaultValue = none,
        onChange,
        options,
        allowCustom = false,
        validate,
        onReject,
        allowDuplicates = false,
        max,
        separators = [","],
        onInputChange,
        placeholder,
        emptyMessage = "No matches",
        size = "md",
        isInvalid = false,
        disabled = false,
        name,
        id,
        labels,
        className,
        ...aria
    },
    ref,
) {
    const [values, setValues] = useControllableState(value, defaultValue, onChange);
    const [text, setText] = useState("");
    const [isOpen, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const [announcement, setAnnouncement] = useState("");
    const [listLabel, setListLabel] = useState<string>();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const fieldRef = useRef<HTMLDivElement>(null);
    const tagsRef = useRef<HTMLUListElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const focusAfter = useRef<number | "input">();
    const listId = useId();
    const optionId = (index: number) => `${listId}-${index}`;

    const suggests = options !== undefined;
    const takesAnything = !suggests || allowCustom;
    const splitters = separators.filter(Boolean);
    const full = max !== undefined && values.length >= max;
    const removeLabel = labels?.remove ?? ((tag: string) => `Remove ${tag}`);
    const labelOf = (v: string) => options?.find((option) => option.value === v)?.label ?? v;
    const has = (list: string[], v: string) => list.some((item) => item.toLowerCase() === v.toLowerCase());

    const items = useMemo<Item[]>(() => {
        if (!options) return [];
        const query = text.trim().toLowerCase();
        const found: Item[] = options
            .filter(
                (option) =>
                    (allowDuplicates || !values.includes(option.value)) &&
                    (!query ||
                        option.label.toLowerCase().includes(query) ||
                        (typeof option.description === "string" && option.description.toLowerCase().includes(query))),
            )
            .map((option) => ({ option }));
        const exact = options.some((option) => option.label.toLowerCase() === query);
        if (allowCustom && query && !exact && (allowDuplicates || !has(values, query))) found.push({ create: text.trim() });
        return found;
    }, [options, text, values, allowCustom, allowDuplicates]);

    const enabled = (item: Item | undefined) => Boolean(item && ("create" in item || !item.option.disabled));
    const firstEnabled = (list: Item[]) => list.findIndex(enabled);
    const showList = suggests && isOpen && !disabled && !full;

    const { mounted, state } = usePresence(showList);
    const style = useFloating({ open: mounted, anchorRef: fieldRef, floatingRef: listRef, matchWidth: true, maxHeight: 288 });

    // Inside a Form, say when the values change: the hidden inputs that carry them fire no events of their own.
    const form = useContext(FormContext);
    const changed = form?.changed;
    const valuesKey = values.join("\n");
    const lastKey = useRef(valuesKey);
    useEffect(() => {
        if (lastKey.current === valuesKey) return;
        lastKey.current = valuesKey;
        if (name) changed?.(name);
    }, [valuesKey, changed, name]);

    // After a tag is removed, focus moves to its neighbour, or back to the text box.
    useEffect(() => {
        const target = focusAfter.current;
        if (target === undefined) return;
        focusAfter.current = undefined;
        focusTag(target);
    }, [valuesKey]);

    useEffect(() => {
        if (showList && active >= 0) document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- optionId is stable.
    }, [active, showList]);

    function focusTag(target: number | "input") {
        const buttons = tagsRef.current?.querySelectorAll<HTMLButtonElement>(".ow-tag__remove");
        const button = target === "input" ? undefined : buttons?.[target];
        (button ?? inputRef.current)?.focus();
    }

    function open() {
        if (!suggests || disabled || isOpen) return;
        setOpen(true);
        setActive(firstEnabled(items));
        setListLabel(inputRef.current?.labels?.[0]?.id || undefined);
    }

    function close() {
        setOpen(false);
        setActive(-1);
    }

    useDismiss(showList, [fieldRef, listRef], close);

    /**
     * Adds what was typed or pasted, split on the separators. Returns the parts that weren't added, joined back up,
     * for the text box to keep.
     */
    function addText(raw: string, splitLines = false) {
        const pattern = [...splitters.map(escape), ...(splitLines ? ["\\r?\\n"] : [])].join("|");
        const parts = (pattern ? raw.split(new RegExp(pattern)) : [raw]).map((part) => part.trim()).filter(Boolean);
        const next = [...values];
        const kept: string[] = [];
        const added: string[] = [];
        for (const part of parts) {
            const match = options?.find(
                (option) => !option.disabled && (option.label.toLowerCase() === part.toLowerCase() || option.value === part),
            );
            let reason: TagInputRejectReason | undefined;
            if (max !== undefined && next.length >= max) reason = "max";
            else if (!match && !takesAnything) reason = "unknown";
            else if (!match && validate && !validate(part)) reason = "invalid";
            else if (!allowDuplicates && has(next, match ? match.value : part)) reason = "duplicate";
            if (reason) {
                kept.push(part);
                onReject?.(part, reason);
                continue;
            }
            next.push(match ? match.value : part);
            added.push(match ? match.label : part);
        }
        if (added.length) {
            setValues(next);
            announce(labels?.added, "Added", added.join(", "));
        }
        return kept.join(`${splitters[0] ?? ","} `);
    }

    function announce(word: ((tag: string) => string) | undefined, fallback: string, tags: string) {
        setAnnouncement(word ? word(tags) : `${fallback} ${tags}`);
    }

    function setTyped(next: string) {
        if (next === text) return;
        setText(next);
        onInputChange?.(next);
    }

    function choose(item: Item | undefined) {
        if (!item || !enabled(item)) return;
        if ("create" in item) setTyped(addText(item.create));
        else {
            if (full) return onReject?.(item.option.label, "max");
            setValues([...values, item.option.value]);
            announce(labels?.added, "Added", item.option.label);
            setTyped("");
            if (max !== undefined && values.length + 1 >= max) close();
        }
        setActive(0);
    }

    function remove(index: number, focus: number | "input") {
        const tag = values[index];
        if (tag === undefined || disabled) return;
        focusAfter.current = focus;
        setValues(values.filter((_, i) => i !== index));
        announce(labels?.removed, "Removed", labelOf(tag));
    }

    function move(step: 1 | -1) {
        if (!items.length) return;
        let next = active;
        for (let tries = 0; tries < items.length; tries += 1) {
            next = (next + step + items.length) % items.length;
            if (enabled(items[next])) break;
        }
        setActive(next);
    }

    function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        const input = event.currentTarget;
        const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
        switch (event.key) {
            case "ArrowDown":
            case "ArrowUp":
                if (!suggests) return;
                event.preventDefault();
                if (!isOpen) open();
                else move(event.key === "ArrowDown" ? 1 : -1);
                break;
            case "Enter":
                if (showList && active >= 0 && items[active]) {
                    event.preventDefault();
                    choose(items[active]);
                } else if (text.trim()) {
                    // Enter adds what's typed instead of submitting the form.
                    event.preventDefault();
                    setTyped(addText(text));
                }
                break;
            case "Backspace":
                if (text === "" && values.length) {
                    event.preventDefault();
                    focusTag(values.length - 1);
                }
                break;
            case "ArrowLeft":
                if (atStart && values.length) {
                    event.preventDefault();
                    focusTag(values.length - 1);
                }
                break;
            case "Escape":
                if (showList) return; // useDismiss closes it.
                if (text) {
                    event.preventDefault();
                    setTyped("");
                }
                break;
            case "Tab":
                close();
                break;
        }
    }

    function onTagKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        switch (event.key) {
            case "ArrowLeft":
                event.preventDefault();
                focusTag(Math.max(0, index - 1));
                break;
            case "ArrowRight":
                event.preventDefault();
                focusTag(index + 1 < values.length ? index + 1 : "input");
                break;
            case "Backspace":
                event.preventDefault();
                remove(index, index > 0 ? index - 1 : "input");
                break;
            case "Delete":
                event.preventDefault();
                remove(index, index + 1 < values.length ? index : "input");
                break;
            default:
                // Typing on a tag goes on in the text box.
                if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) inputRef.current?.focus();
        }
    }

    function onPaste(event: ClipboardEvent<HTMLInputElement>) {
        const pasted = event.clipboardData.getData("text");
        if (!/\r|\n/.test(pasted) && !splitters.some((separator) => pasted.includes(separator))) return;
        event.preventDefault();
        const input = event.currentTarget;
        const start = input.selectionStart ?? text.length;
        const end = input.selectionEnd ?? text.length;
        setTyped(addText(text.slice(0, start) + pasted + text.slice(end), true));
    }

    function onBlur(event: FocusEvent<HTMLDivElement>) {
        const next = event.relatedTarget as Node | null;
        if (next && (fieldRef.current?.contains(next) || listRef.current?.contains(next))) return;
        close();
        // Leaving the field keeps what was typed, as if Enter had been pressed.
        if (takesAnything && text.trim()) setTyped(addText(text));
    }

    function onFieldMouseDown(event: MouseEvent<HTMLDivElement>) {
        if (disabled || (event.target !== fieldRef.current && event.target !== tagsRef.current)) return;
        event.preventDefault();
        inputRef.current?.focus();
        open();
    }

    return (
        <>
            <div
                ref={fieldRef}
                className={cx(
                    "ow-input-group",
                    "ow-tag-input",
                    size === "sm" && "ow-input-group--sm",
                    values.length > 0 && "ow-tag-input--filled",
                    isInvalid && "ow-input-group--invalid",
                    disabled && "ow-input-group--disabled",
                    className,
                )}
                // The tags fade with the field, like a disabled input's text.
                aria-disabled={disabled || undefined}
                onMouseDown={onFieldMouseDown}
                onBlur={onBlur}
            >
                {values.length ? (
                    <ul ref={tagsRef} role="list" className="ow-tag-input__tags">
                        {values.map((tag, index) => {
                            const label = labelOf(tag);
                            return (
                                <li
                                    key={`${tag}-${index}`}
                                    className={cx("ow-tag", "ow-tag--neutral", size === "sm" ? "ow-tag--sm" : "ow-tag--md", !disabled && "ow-tag--removable")}
                                >
                                    <span className="ow-tag__label">{label}</span>
                                    {disabled ? null : (
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            className="ow-tag__remove"
                                            aria-label={removeLabel(label)}
                                            onClick={() => remove(index, "input")}
                                            onKeyDown={(event) => onTagKeyDown(event, index)}
                                        >
                                            <XIcon size={12} />
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : null}
                <input
                    ref={(element) => {
                        inputRef.current = element;
                        if (typeof ref === "function") ref(element);
                        else if (ref) ref.current = element;
                    }}
                    id={id}
                    className="ow-input-group__input ow-tag-input__input"
                    type="text"
                    autoComplete="off"
                    {...(suggests
                        ? {
                              role: "combobox",
                              "aria-autocomplete": "list" as const,
                              "aria-expanded": showList,
                              "aria-controls": showList ? listId : undefined,
                              "aria-activedescendant": showList && active >= 0 ? optionId(active) : undefined,
                          }
                        : {})}
                    aria-invalid={isInvalid || undefined}
                    disabled={disabled}
                    placeholder={values.length ? undefined : placeholder}
                    value={text}
                    onChange={(event) => {
                        let next = event.target.value;
                        // A separator typed (or entered from a phone's keyboard) adds what's before it.
                        // A value that isn't taken stays, and the separator goes.
                        const separator = splitters.find((candidate) => next.includes(candidate));
                        if (separator) {
                            const at = next.lastIndexOf(separator);
                            const rest = next.slice(at + separator.length);
                            const kept = addText(next.slice(0, at));
                            next = kept ? kept + rest : rest.trimStart();
                        }
                        setTyped(next);
                        if (suggests && !isOpen) open();
                        setActive(0);
                    }}
                    onClick={open}
                    onKeyDown={onInputKeyDown}
                    onPaste={onPaste}
                    {...aria}
                />
                {name ? values.map((tag, index) => <input key={index} type="hidden" name={name} value={tag} disabled={disabled} />) : null}
                <span className="ow-visually-hidden" aria-live="polite">
                    {announcement}
                </span>
            </div>
            {mounted ? (
                <div
                    ref={listRef}
                    {...manualPopover}
                    data-state={state}
                    id={listId}
                    role="listbox"
                    aria-multiselectable
                    aria-label={aria["aria-label"]}
                    aria-labelledby={aria["aria-labelledby"] ?? (aria["aria-label"] ? undefined : listLabel)}
                    className={cx("ow-listbox", "ow-floating", `ow-listbox--${size}`)}
                    style={style}
                >
                    {items.map((item, index) => {
                        const isCreate = "create" in item;
                        const disabledItem = !enabled(item);
                        return (
                            <div
                                key={isCreate ? "\u0000create" : item.option.value}
                                id={optionId(index)}
                                role="option"
                                aria-selected={false}
                                aria-disabled={disabledItem || undefined}
                                className={cx("ow-option", {
                                    "ow-option--active": index === active && !disabledItem,
                                    "ow-option--disabled": disabledItem,
                                })}
                                onPointerMove={() => !disabledItem && setActive(index)}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => choose(item)}
                            >
                                <span className="ow-option__text">
                                    <span className="ow-option__label">
                                        {isCreate ? (labels?.create ?? ((typed: string) => `Add "${typed}"`))(item.create) : item.option.label}
                                    </span>
                                    {!isCreate && item.option.description ? (
                                        <span className="ow-option__description">{item.option.description}</span>
                                    ) : null}
                                </span>
                            </div>
                        );
                    })}
                    {items.length === 0 ? (
                        <div className="ow-listbox__empty" role="presentation">
                            {emptyMessage}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </>
    );
});
