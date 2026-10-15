import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";

import { Spinner } from "@/components/Spinner/Spinner";
import { manualPopover, useDismiss, useFloating } from "@/hooks/useFloating";
import { usePresence } from "@/hooks/usePresence";
import { cx } from "@/utils/cx";
import type { Mention, MentionMatch, MentionOption, MentionTrigger, UseMentionsOptions, UseMentionsResult } from "./MentionInput.types";

/** What the mirror copies from the text box, so its text wraps the same way. A plain list, so it drops out of apps
 * that don't use mentions. */
const copied = [
    "box-sizing",
    "width",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "letter-spacing",
    "line-height",
    "text-transform",
    "word-spacing",
    "text-indent",
    "tab-size",
    "direction",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "border-top-width",
    "border-right-width",
    "border-bottom-width",
    "border-left-width",
];

/**
 * Where a character of a text box sits on screen. A hidden copy of the box, with the same font, width and padding,
 * holds the text before it and the character in a span, which is measured. A one-line box gives its own height,
 * so the list opens under the field.
 */
function charRect(box: HTMLTextAreaElement | HTMLInputElement, index: number) {
    const style = getComputedStyle(box);
    const multiline = box instanceof HTMLTextAreaElement;
    const mirror = document.createElement("div");
    for (const name of copied) mirror.style.setProperty(name, style.getPropertyValue(name));
    Object.assign(mirror.style, {
        position: "fixed",
        top: "0",
        left: "0",
        visibility: "hidden",
        borderStyle: "solid",
        whiteSpace: multiline ? "pre-wrap" : "pre",
        overflowWrap: "break-word",
    });
    const mark = document.createElement("span");
    mark.textContent = box.value[index] ?? ".";
    mirror.append(box.value.slice(0, index), mark);
    document.body.append(mirror);
    const at = mark.getBoundingClientRect();
    const rect = box.getBoundingClientRect();
    mirror.remove();
    const left = Math.min(Math.max(rect.left, rect.left + at.left - box.scrollLeft), rect.right);
    if (!multiline) return new DOMRect(left, rect.top, at.width, rect.height);
    const top = Math.min(Math.max(rect.top, rect.top + at.top - box.scrollTop), rect.bottom - at.height);
    return new DOMRect(left, top, at.width, at.height);
}

/** The trigger typed at the start of the word the caret is in, if any. */
function findMatch(text: string, caret: number, triggers: MentionTrigger[]): MentionMatch | null {
    const before = text.slice(0, caret);
    let found: MentionMatch | null = null;
    for (const trigger of triggers) {
        if (!trigger.char) continue;
        const start = before.lastIndexOf(trigger.char);
        if (start < 0 || (start > 0 && !/\s/.test(before[start - 1] ?? ""))) continue;
        const query = before.slice(start + trigger.char.length);
        if (!/\s/.test(query) && (!found || start > found.start)) found = { trigger, start, query };
    }
    return found;
}

/** Each known "@label" in the text, at the start of a word and not running on into one; longer labels win. */
function findMentions(text: string, known: Array<Pick<Mention, "id" | "label" | "trigger">>) {
    const found: Mention[] = [];
    for (const item of [...known].sort((a, b) => b.label.length - a.label.length)) {
        const token = item.trigger + item.label;
        for (let start = text.indexOf(token); start >= 0 && item.label; start = text.indexOf(token, start + 1)) {
            const end = start + token.length;
            if (start > 0 && !/\s/.test(text[start - 1] ?? "")) continue;
            if (/[\p{L}\p{N}_]/u.test(text[end] ?? "") || found.some((m) => start < m.end && end > m.start)) continue;
            found.push({ ...item, start, end });
        }
    }
    return found.sort((a, b) => a.start - b.start);
}

const matches = (option: MentionOption, query: string) =>
    option.label.toLowerCase().includes(query) || (typeof option.description === "string" && option.description.toLowerCase().includes(query));

/**
 * `@` mentions and `/` commands for any text box. Put `ref` on a textarea or input (a Textarea, an Input, or
 * PromptInput) and render `list`: typing a trigger at the start of a word opens suggestions at the caret, and picking
 * one puts "@Label " in the text. The box becomes a combobox; the hook listens to it directly, so the component that
 * owns it needs no changes.
 */
export function useMentions({ triggers, value, onMentionsChange, disabled = false, size = "md", labels }: UseMentionsOptions): UseMentionsResult {
    const boxRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const detach = useRef<() => void>();
    const dismissedAt = useRef(-1);
    const [typed, setTyped] = useState("");
    // The last match stays while the list animates out, so its rows don't change as it fades.
    const [match, setMatch] = useState<MentionMatch | null>(null);
    const [isOpen, setOpen] = useState(false);
    const [found, setFound] = useState<MentionOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(0);
    const [picked, setPicked] = useState<Array<Pick<Mention, "id" | "label" | "trigger">>>([]);
    const listId = useId();
    const words = { suggestions: "Suggestions", loading: "Loading…", empty: "No matches", ...labels };

    const text = value ?? typed;
    const open = isOpen && !disabled && match !== null;
    const source = match?.trigger.options;
    const query = match?.query;
    const items = useMemo(
        () => (typeof source === "function" ? found : (source ?? []).filter((option) => matches(option, (query ?? "").toLowerCase()))),
        [source, query, found],
    );
    const current = items[active] && !items[active].disabled ? active : items.findIndex((option) => !option.disabled);

    const known = useMemo(
        () => [
            ...picked,
            ...triggers.flatMap((trigger) =>
                Array.isArray(trigger.options) ? trigger.options.map(({ id, label }) => ({ id, label, trigger: trigger.char })) : [],
            ),
        ],
        [picked, triggers],
    );
    const mentions = useMemo(() => findMentions(text, known), [text, known]);

    // A function's options are fetched for each query; an answer that comes after the next query is dropped.
    const latestTriggers = useRef(triggers);
    latestTriggers.current = triggers;
    const char = match?.trigger.char;
    const fetches = isOpen && typeof source === "function";
    // Before the fetch below, so a function that answers at once isn't cleared.
    useEffect(() => setFound([]), [char]);
    useEffect(() => {
        const options = latestTriggers.current.find((trigger) => trigger.char === char)?.options;
        if (!fetches || typeof options !== "function" || query === undefined) return;
        let live = true;
        const result = options(query);
        if (Array.isArray(result)) {
            setFound(result);
            setLoading(false);
        } else {
            setLoading(true);
            result.then(
                (list) => live && (setFound(list), setLoading(false)),
                () => live && (setFound([]), setLoading(false)),
            );
        }
        return () => {
            live = false;
            setLoading(false);
        };
    }, [fetches, char, query]);

    useEffect(() => setActive(0), [char, query]);

    /** Reads the text and the caret, and opens, moves or closes the list. */
    const sync = useRef<() => void>();
    sync.current = () => {
        const box = boxRef.current;
        if (!box) return;
        setTyped(box.value);
        const caret = box.selectionStart ?? 0;
        const next = box.selectionEnd === caret && document.activeElement === box ? findMatch(box.value, caret, latestTriggers.current) : null;
        // Escape closes the list until the caret leaves that trigger.
        if (next?.start !== dismissedAt.current) dismissedAt.current = -1;
        const show = next !== null && dismissedAt.current < 0;
        setOpen(show);
        if (show) setMatch((last) => (last && last.trigger === next.trigger && last.start === next.start && last.query === next.query ? last : next));
    };

    function choose(option: MentionOption) {
        const box = boxRef.current;
        if (!box || !match || option.disabled) return;
        const token = match.trigger.char + option.label;
        const end = box.selectionStart ?? box.value.length;
        const spaced = /\s/.test(box.value[end] ?? "");
        box.focus();
        box.setSelectionRange(match.start, end);
        // insertText keeps the browser's undo; it fires the input event a controlled box listens to.
        if (!document.execCommand("insertText", false, spaced ? token : `${token} `)) {
            box.setRangeText(spaced ? token : `${token} `, match.start, end, "end");
            box.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (spaced) box.setSelectionRange(match.start + token.length + 1, match.start + token.length + 1);
        setOpen(false);
        setPicked((list) =>
            list.some((item) => item.id === option.id && item.trigger === match.trigger.char)
                ? list
                : [...list, { id: option.id, label: option.label, trigger: match.trigger.char }],
        );
        // The trigger as it is now, so onSelect sees the latest state.
        (latestTriggers.current.find((trigger) => trigger.char === match.trigger.char) ?? match.trigger).onSelect?.(option);
    }

    function move(step: 1 | -1) {
        let next = current;
        for (let tries = 0; tries < items.length; tries += 1) {
            next = (next + step + items.length) % items.length;
            if (!items[next]?.disabled) break;
        }
        setActive(next);
    }

    const keyDown = useRef<(event: KeyboardEvent) => void>();
    keyDown.current = (event) => {
        if (!open || event.isComposing) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") move(event.key === "ArrowDown" ? 1 : -1);
        else if ((event.key === "Enter" || event.key === "Tab") && !event.shiftKey && items[current]) choose(items[current]);
        else return;
        // The box's own keys (Enter to send) don't see a key the list took.
        event.preventDefault();
        event.stopPropagation();
    };

    const ref = useCallback((box: HTMLTextAreaElement | HTMLInputElement | null) => {
        detach.current?.();
        detach.current = undefined;
        boxRef.current = box;
        if (!box) return;
        setTyped(box.value);
        const onSync = () => sync.current?.();
        // Typing is read on the document, after React has taken the change: a render from the box's own listener
        // would come first and put the old value back.
        const onInput = (event: Event) => event.target === box && onSync();
        const events: Array<[string, EventListener]> = [
            ["click", onSync],
            ["keyup", onSync],
            ["keydown", (event) => keyDown.current?.(event as KeyboardEvent)],
            ["blur", () => setOpen(false)],
        ];
        for (const [name, listener] of events) box.addEventListener(name, listener);
        box.ownerDocument.addEventListener("input", onInput);
        detach.current = () => {
            events.forEach(([name, listener]) => box.removeEventListener(name, listener));
            box.ownerDocument.removeEventListener("input", onInput);
        };
    }, []);

    useDismiss(open, [boxRef, listRef], (reason) => {
        if (reason === "escape" && match) dismissedAt.current = match.start;
        setOpen(false);
    });

    // The list sits under the trigger character, measured each time it's placed (on scroll and resize too).
    const startRef = useRef(0);
    startRef.current = match?.start ?? 0;
    const anchorRef = useMemo(
        () => ({ current: { getBoundingClientRect: () => (boxRef.current ? charRect(boxRef.current, startRef.current) : new DOMRect()) } }),
        [],
    ) as unknown as RefObject<HTMLElement>;
    const rtl = open && boxRef.current ? getComputedStyle(boxRef.current).direction === "rtl" : false;
    const { mounted, state } = usePresence(open);
    const style = useFloating({ open: mounted, anchorRef, floatingRef: listRef, placement: rtl ? "bottom-end" : "bottom-start", maxHeight: 288 });

    // Moving to another trigger while the list is still up places it again.
    const placedAt = useRef<number>();
    const start = open ? match?.start : undefined;
    useEffect(() => {
        if (start === undefined) return;
        if (placedAt.current !== undefined && placedAt.current !== start) window.dispatchEvent(new Event("resize"));
        placedAt.current = start;
    }, [start]);

    // The box is a combobox over the list. The attributes are set on the element itself, so any text box can take them.
    const activeId = open && current >= 0 ? `${listId}-${current}` : undefined;
    useLayoutEffect(() => {
        const box = boxRef.current;
        if (!box) return;
        const attributes: Record<string, string | undefined> = {
            role: "combobox",
            "aria-autocomplete": "list",
            "aria-expanded": String(open),
            "aria-controls": open ? listId : undefined,
            "aria-activedescendant": activeId,
        };
        for (const [name, attribute] of Object.entries(attributes)) {
            if (attribute === undefined) box.removeAttribute(name);
            else box.setAttribute(name, attribute);
        }
    });

    useEffect(() => {
        if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
    }, [activeId]);

    const notify = useRef(onMentionsChange);
    notify.current = onMentionsChange;
    const mentionsKey = mentions.map((mention) => `${mention.trigger}${mention.id}@${mention.start}`).join("\n");
    const lastKey = useRef(mentionsKey);
    useEffect(() => {
        if (lastKey.current === mentionsKey) return;
        lastKey.current = mentionsKey;
        notify.current?.(mentions);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the key stands for the mentions.
    }, [mentionsKey]);

    const waiting = loading && items.length === 0;
    const count = items.length;
    const status = !open ? "" : waiting ? words.loading : count ? (words.results?.(count) ?? `${count} ${count === 1 ? "result" : "results"}`) : words.empty;
    const render = match?.trigger.render;

    const list = (
        <>
            {mounted ? (
                <div
                    ref={listRef}
                    {...manualPopover}
                    data-state={state}
                    id={listId}
                    // With nothing to pick, it's only a message: an empty listbox isn't allowed.
                    role={count || waiting ? "listbox" : undefined}
                    aria-label={count || waiting ? (match?.trigger.label ?? words.suggestions) : undefined}
                    aria-busy={loading || undefined}
                    className={cx("ow-listbox", "ow-floating", `ow-listbox--${size}`, "ow-mention-list")}
                    style={style}
                >
                    {items.map((option, index) => (
                        <div
                            key={option.id}
                            id={`${listId}-${index}`}
                            role="option"
                            aria-selected={index === current}
                            aria-disabled={option.disabled || undefined}
                            className={cx("ow-option", { "ow-option--active": index === current, "ow-option--disabled": option.disabled })}
                            onPointerMove={() => !option.disabled && setActive(index)}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => choose(option)}
                        >
                            {render ? (
                                render(option)
                            ) : (
                                <>
                                    {option.icon ? (
                                        <span className="ow-option__icon" aria-hidden="true">
                                            {option.icon}
                                        </span>
                                    ) : null}
                                    <span className="ow-option__text">
                                        <span className="ow-option__label">{option.label}</span>
                                        {option.description ? <span className="ow-option__description">{option.description}</span> : null}
                                    </span>
                                </>
                            )}
                        </div>
                    ))}
                    {count ? null : (
                        <div className="ow-listbox__empty ow-mention-list__empty" role="presentation">
                            {waiting ? <Spinner size="sm" label="" /> : null}
                            {waiting ? words.loading : words.empty}
                        </div>
                    )}
                </div>
            ) : null}
            <span className="ow-visually-hidden" aria-live="polite">
                {status}
            </span>
        </>
    );

    return { ref, list, mentions, isOpen: open };
}
