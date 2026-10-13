import { useEffect, useRef, useState, type ClipboardEvent, type ForwardedRef, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

import { cx } from "../../utils/cx";

/*
 * The engine DateField and TimeField share: a group of spinbutton segments that take typed digits, step with the
 * arrow keys and move between each other, with the separators between them. Each field works out its segments
 * (order, range, how a value is shown) and keeps the values; this draws them and turns keys into changes.
 */

export type SegmentType = "day" | "month" | "year" | "hour" | "minute" | "second" | "dayPeriod";

/** Values by segment; a key set to undefined clears that segment. */
export type SegmentValues = { [Type in SegmentType]?: number | undefined };

export interface Segment {
    type: SegmentType;
    /** Read out as the segment's name: "Day", "Hour". */
    label: string;
    value: number | undefined;
    min: number;
    max: number;
    /** Shown while it's empty: "dd", "––". */
    placeholder: string;
    /** The value as shown: "07", "PM". */
    format(value: number): string;
    /** The value as read out (aria-valuetext): "10 – October". */
    describe(value: number): string;
    /** Up or Down on an empty segment starts here, without stepping. */
    start: number;
    /** Up and Down move by this, landing on its multiples. */
    step?: number;
    /** PageUp and PageDown move by this. */
    page: number;
    /** Past the max goes round to the min. The year stops instead. */
    wrap: boolean;
    /** Typing only sets the value once it's whole or the segment loses focus, so a year of 2026 doesn't pass through 0002. */
    deferTyping?: boolean;
    /** Letters that set a value: a and p for AM and PM. */
    letters?: Record<string, number>;
    /** Kept this many digits wide, so the field doesn't change width as it fills. */
    width?: 2 | 4;
}

export type Part = Segment | { type: "literal"; text: string };

export interface SegmentedFieldProps {
    parts: Part[];
    /** The field's whole value, for the hidden input. */
    value: string;
    onSegmentsChange(changes: SegmentValues): void;
    /** Reads pasted text in the field's own format, such as "2026-10-13"; null when it can't. */
    parsePaste?(text: string): SegmentValues | null;
    /** The locale's digits, 0 to 9. */
    digits: string[];
    forwardedRef: ForwardedRef<HTMLDivElement>;
    id?: string;
    name?: string;
    size: "sm" | "md";
    isInvalid: boolean;
    disabled: boolean;
    readOnly: boolean;
    startContent?: ReactNode;
    className?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
}

interface Typing {
    type: SegmentType;
    text: string;
}

const escapeHTML = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function SegmentedField({
    parts,
    value,
    onSegmentsChange,
    parsePaste,
    digits,
    forwardedRef,
    id,
    name,
    size,
    isInvalid,
    disabled,
    readOnly,
    startContent,
    className,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
}: SegmentedFieldProps) {
    const segments = parts.filter((part): part is Segment => part.type !== "literal");
    const editable = !disabled && !readOnly;
    const rootRef = useRef<HTMLDivElement | null>(null);
    const segmentRefs = useRef<Array<HTMLSpanElement | null>>([]);
    // What each segment should show, to put back if the browser edits it anyway (an IME composition can't be cancelled).
    const texts = useRef<string[]>([]);
    // Digits typed into the focused segment that may still grow ("1" in a month waits for a second digit). Kept in a
    // ref as well, because typing moves focus and the blur that follows runs before React renders.
    const [typing, setTypingState] = useState<Typing | null>(null);
    const typingRef = useRef<Typing | null>(null);
    const [labelId, setLabelId] = useState<string>();

    function setTyping(next: Typing | null) {
        typingRef.current = next;
        setTypingState(next);
    }

    function focusSegment(index: number) {
        segmentRefs.current[Math.max(0, Math.min(segments.length - 1, index))]?.focus();
    }

    function parseDigit(char: string): number | undefined {
        if (char >= "0" && char <= "9") return Number(char);
        const index = digits.indexOf(char);
        return index >= 0 ? index : undefined;
    }

    const fits = (segment: Segment, n: number) => n >= segment.min && n <= segment.max;

    /** Ends typing in the segment; a year typed so far is set now. Returns the segment's value after that. */
    function flush(segment?: Segment): number | undefined {
        const typed = typingRef.current;
        if (!typed || (segment && typed.type !== segment.type)) return segment?.value;
        setTyping(null);
        const owner = segments.find((candidate) => candidate.type === typed.type);
        if (!owner?.deferTyping) return owner?.value;
        const n = Number(typed.text);
        if (!fits(owner, n)) return owner.value;
        onSegmentsChange({ [owner.type]: n });
        return n;
    }

    /** Typing a digit: fills the segment and moves on once no further digit could fit. Returns the focused index. */
    function typeDigit(index: number, digit: number): number {
        const segment = segments[index]!;
        const typed = typingRef.current;
        let text = (typed?.type === segment.type ? typed.text : "") + digit;
        let n = Number(text);
        if (n > segment.max) {
            text = String(digit);
            n = digit;
        }
        const complete = n * 10 > segment.max || text.length >= String(segment.max).length;
        if (fits(segment, n) && (complete || !segment.deferTyping)) onSegmentsChange({ [segment.type]: n });
        if (!complete) {
            setTyping({ type: segment.type, text });
            return index;
        }
        setTyping(null);
        if (!fits(segment, n) || index >= segments.length - 1) return index;
        focusSegment(index + 1);
        return index + 1;
    }

    /** A letter sets AM or PM, from any segment; from the AM/PM segment itself it then moves on. */
    function typeLetter(index: number, char: string): number {
        const letter = char.toLowerCase();
        const target = segments.findIndex((segment) => segment.letters?.[letter] !== undefined);
        if (target < 0) return index;
        flush();
        onSegmentsChange({ [segments[target]!.type]: segments[target]!.letters![letter] });
        if (target !== index || index >= segments.length - 1) return index;
        focusSegment(index + 1);
        return index + 1;
    }

    /** A separator (/ . : or a space) ends a half-typed segment and moves on, so "1/5/2026" is the 1st of May, not the 15th. */
    function typeSeparator(index: number): number {
        if (typingRef.current?.type !== segments[index]!.type) return index;
        flush();
        if (index >= segments.length - 1) return index;
        focusSegment(index + 1);
        return index + 1;
    }

    function insertText(index: number, text: string) {
        let current = index;
        for (const char of text) {
            const digit = parseDigit(char);
            if (digit !== undefined && !segments[current]!.letters) current = typeDigit(current, digit);
            else if (/[\p{P}\p{S}\s]/u.test(char)) current = typeSeparator(current);
            else current = typeLetter(current, char);
        }
    }

    function step(index: number, key: string) {
        const segment = segments[index]!;
        const current = flush(segment);
        const unit = segment.step ?? 1;
        const top = segment.min + Math.floor((segment.max - segment.min) / unit) * unit;
        let next: number;
        if (key === "Home") next = segment.min;
        else if (key === "End") next = top;
        else if (current === undefined) next = segment.start;
        else if (key === "PageUp" || key === "PageDown") {
            const moved = current + (key === "PageUp" ? segment.page : -segment.page);
            const range = segment.max - segment.min + 1;
            next = segment.wrap ? segment.min + ((((moved - segment.min) % range) + range) % range) : Math.min(segment.max, Math.max(segment.min, moved));
        } else {
            // Snap to the step: with 15-minute steps, Up from 07 goes to 15 and Down to 00.
            const offset = current - segment.min;
            const moved = segment.min + (key === "ArrowUp" ? Math.floor(offset / unit) + 1 : Math.ceil(offset / unit) - 1) * unit;
            if (moved > segment.max) next = segment.wrap ? segment.min : segment.max;
            else if (moved < segment.min) next = segment.wrap ? top : segment.min;
            else next = moved;
        }
        onSegmentsChange({ [segment.type]: next });
    }

    /** Backspace or Delete empties the segment; Backspace on an empty one goes back to the one before. */
    function clear(index: number, moveBack: boolean) {
        const segment = segments[index]!;
        const wasTyping = typingRef.current?.type === segment.type;
        if (wasTyping) setTyping(null);
        if (segment.value !== undefined) onSegmentsChange({ [segment.type]: undefined });
        else if (!wasTyping && moveBack) focusSegment(index - 1);
    }

    function onKeyDown(event: KeyboardEvent<HTMLSpanElement>, index: number) {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        switch (event.key) {
            case "ArrowLeft":
            case "ArrowRight":
                event.preventDefault();
                flush();
                focusSegment(index + (event.key === "ArrowRight" ? 1 : -1));
                return;
            case "ArrowUp":
            case "ArrowDown":
            case "PageUp":
            case "PageDown":
            case "Home":
            case "End":
                event.preventDefault();
                if (editable) step(index, event.key);
                return;
            case "Backspace":
            case "Delete":
                event.preventDefault();
                if (editable) clear(index, event.key === "Backspace");
                return;
        }
    }

    const indexOf = (target: EventTarget | null) => {
        const element = target instanceof Element ? target.closest<HTMLElement>("[data-segment]") : null;
        return element ? Number(element.dataset.segment) : undefined;
    };

    /** Reads digit groups in the segments' order, so "13/10/2026" pastes into dd/mm/yyyy, and a or p for AM/PM. */
    function readGroups(text: string): SegmentValues | null {
        const numeric = segments.filter((segment) => !segment.letters);
        const groups: number[] = [];
        let group = "";
        for (const char of `${text} `) {
            const digit = parseDigit(char);
            if (digit !== undefined) group += digit;
            else if (group) {
                groups.push(Number(group));
                group = "";
            }
        }
        if (groups.length !== numeric.length) return null;
        const changes: SegmentValues = {};
        for (const [i, segment] of numeric.entries()) {
            const n = groups[i]!;
            // The day's range depends on the month, which may be changing too: the field fits it afterwards.
            if (n < segment.min || n > (segment.type === "day" ? 31 : segment.max)) return null;
            changes[segment.type] = n;
        }
        const period = segments.find((segment) => segment.letters);
        const letter = period && [...text.toLowerCase()].find((char) => period.letters![char] !== undefined);
        if (period && letter) changes[period.type] = period.letters![letter];
        return changes;
    }

    function onPaste(event: ClipboardEvent<HTMLDivElement>) {
        event.preventDefault();
        if (!editable) return;
        const text = event.clipboardData.getData("text/plain").trim();
        const changes = parsePaste?.(text) ?? readGroups(text);
        if (changes) {
            setTyping(null);
            onSegmentsChange(changes);
            return;
        }
        const index = indexOf(event.target);
        if (index !== undefined) insertText(index, text);
    }

    /** A click on the field but not on a segment (the padding, a separator, the icon) focuses the nearest segment. */
    function onMouseDown(event: MouseEvent<HTMLDivElement>) {
        if (disabled || event.button !== 0) return;
        const target = event.target as Element;
        if (target.closest("[data-segment], button, a, input, select, textarea")) return;
        event.preventDefault();
        let nearest = 0;
        let distance = Infinity;
        segmentRefs.current.slice(0, segments.length).forEach((element, index) => {
            if (!element) return;
            const box = element.getBoundingClientRect();
            const gap = event.clientX < box.left ? box.left - event.clientX : Math.max(0, event.clientX - box.right);
            if (gap < distance) {
                distance = gap;
                nearest = index;
            }
        });
        focusSegment(nearest);
    }

    // The browser's editing events, read through a ref so the listeners can be added once.
    const handlers = useRef({ beforeInput: (_event: InputEvent) => {}, input: (_event: InputEvent) => {}, compositionEnd: (_event: CompositionEvent) => {} });
    const restore = (index: number) => {
        const element = segmentRefs.current[index];
        if (element && element.textContent !== texts.current[index]) element.textContent = texts.current[index] ?? "";
    };
    handlers.current = {
        // Segments are contentEditable so phones open their number pad; every edit is cancelled and done here instead.
        beforeInput(event) {
            const index = indexOf(event.target);
            if (event.inputType === "insertCompositionText" || index === undefined) return;
            event.preventDefault();
            if (!editable) return;
            if (event.inputType.startsWith("delete")) clear(index, event.inputType === "deleteContentBackward");
            else if (event.data) insertText(index, event.data);
        },
        input(event) {
            const index = indexOf(event.target);
            if (index !== undefined && !event.isComposing) restore(index);
        },
        compositionEnd(event) {
            const index = indexOf(event.target);
            if (index === undefined) return;
            restore(index);
            if (editable && event.data) insertText(index, event.data);
        },
    };

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const beforeInput = (event: Event) => handlers.current.beforeInput(event as InputEvent);
        const input = (event: Event) => handlers.current.input(event as InputEvent);
        const compositionEnd = (event: Event) => handlers.current.compositionEnd(event as CompositionEvent);
        root.addEventListener("beforeinput", beforeInput);
        root.addEventListener("input", input);
        root.addEventListener("compositionend", compositionEnd);
        return () => {
            root.removeEventListener("beforeinput", beforeInput);
            root.removeEventListener("input", input);
            root.removeEventListener("compositionend", compositionEnd);
        };
    }, []);

    // A label can't point at a group, so the one Field puts above (label[for=id]) is wired up here: it names the
    // group, and clicking it focuses the first segment.
    const focusFirst = useRef(() => {});
    focusFirst.current = () => {
        if (!disabled) focusSegment(0);
    };
    useEffect(() => {
        const root = rootRef.current;
        if (!root || !id) return;
        const scope = root.getRootNode() as Document | ShadowRoot;
        const labels = Array.from(scope.querySelectorAll<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`));
        const label = labels[0];
        if (!label) {
            setLabelId(undefined);
            return;
        }
        if (!label.id) label.id = `${id}-label`;
        setLabelId(label.id);
        const onClick = () => focusFirst.current();
        labels.forEach((element) => element.addEventListener("click", onClick));
        return () => labels.forEach((element) => element.removeEventListener("click", onClick));
    }, [id]);

    let segmentIndex = -1;

    return (
        <div
            ref={(element) => {
                rootRef.current = element;
                if (typeof forwardedRef === "function") forwardedRef(element);
                else if (forwardedRef) forwardedRef.current = element;
            }}
            id={id}
            role="group"
            aria-label={ariaLabel}
            aria-labelledby={[ariaLabelledBy, labelId].filter(Boolean).join(" ") || undefined}
            aria-disabled={disabled || undefined}
            className={cx(
                "ow-date-field",
                size === "sm" && "ow-date-field--sm",
                startContent !== undefined && "ow-date-field--with-start",
                isInvalid && "ow-date-field--invalid",
                disabled && "ow-date-field--disabled",
                readOnly && "ow-date-field--readonly",
                className,
            )}
            onMouseDown={onMouseDown}
            onPaste={onPaste}
        >
            {startContent !== undefined ? <span className="ow-date-field__addon">{startContent}</span> : null}
            <span className="ow-date-field__segments">
                {parts.map((part, partIndex) => {
                    if (part.type === "literal") {
                        return (
                            <span key={`literal-${partIndex}`} className="ow-date-field__literal" aria-hidden="true">
                                {part.text}
                            </span>
                        );
                    }
                    segmentIndex += 1;
                    const index = segmentIndex;
                    const typed = typing?.type === part.type ? typing.text : null;
                    const current = typed !== null && part.deferTyping ? Number(typed) : part.value;
                    const isPlaceholder = typed === null && part.value === undefined;
                    const text =
                        typed !== null
                            ? [...typed].map((digit) => digits[Number(digit)]).join("")
                            : part.value !== undefined
                              ? part.format(part.value)
                              : part.placeholder;
                    texts.current[index] = text;
                    return (
                        <span
                            key={part.type}
                            ref={(element) => {
                                segmentRefs.current[index] = element;
                            }}
                            role="spinbutton"
                            data-segment={index}
                            className={cx(
                                "ow-date-field__segment",
                                part.width && `ow-date-field__segment--digits-${part.width}`,
                                isPlaceholder && "ow-date-field__segment--placeholder",
                            )}
                            tabIndex={disabled ? undefined : 0}
                            contentEditable={editable || undefined}
                            suppressContentEditableWarning
                            inputMode={part.letters ? "text" : "numeric"}
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            enterKeyHint={index < segments.length - 1 ? "next" : "done"}
                            aria-label={part.label}
                            aria-valuenow={current}
                            aria-valuemin={part.min}
                            aria-valuemax={part.max}
                            aria-valuetext={current === undefined ? "Empty" : part.describe(current)}
                            aria-invalid={isInvalid || undefined}
                            aria-readonly={readOnly || undefined}
                            aria-disabled={disabled || undefined}
                            aria-describedby={ariaDescribedBy}
                            dangerouslySetInnerHTML={{ __html: escapeHTML(text) }}
                            onKeyDown={(event) => onKeyDown(event, index)}
                            onBlur={() => flush()}
                        />
                    );
                })}
            </span>
            {name !== undefined ? <input type="hidden" name={name} value={value} disabled={disabled} /> : null}
        </div>
    );
}

/** The locale's digits, 0 to 9, so typed and shown numbers follow its numbering system. */
export function localeDigits(locale: string | undefined): string[] {
    const format = new Intl.NumberFormat(locale, { useGrouping: false });
    return Array.from({ length: 10 }, (_, digit) => format.format(digit));
}
