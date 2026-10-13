import { forwardRef, useCallback, useEffect, useId, useRef, useState, type ForwardedRef, type KeyboardEvent } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { manualPopover, useDismiss, useFloating } from "../../hooks/useFloating";
import { usePresence } from "../../hooks/usePresence";
import { CalendarIcon, CheckIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { CloseButton } from "../Button/ButtonGroup";
import { formatDateRange } from "./dates";
import { RangeCalendar, type DateRange, type RangeCalendarProps } from "./RangeCalendar";

/** A named range to pick in one go, such as "Last 7 days". */
export interface DateRangePreset {
    /** What the list shows, in sentence case. */
    label: string;
    range: DateRange;
}

export interface DateRangePickerProps extends Omit<RangeCalendarProps, "autoFocus" | "className" | "visibleMonths"> {
    /** Ranges to pick in one go, listed beside the calendar: "Last 7 days", "This month". */
    presets?: DateRangePreset[];
    /** How many months the calendar shows side by side. Phones always get one.
     * @default 2 */
    visibleMonths?: 1 | 2;
    /** Shown when no range is chosen.
     * @default "Pick dates" */
    placeholder?: string;
    /** How each date is written in the field; dates the two ends share are written once, as in "3 – 9 Oct 2026".
     * @default { dateStyle: "medium" } */
    formatOptions?: Intl.DateTimeFormatOptions;
    /** md is 40px tall, sm 32px.
     * @default "md" */
    size?: "sm" | "md";
    /** @default false */
    isInvalid?: boolean;
    /** @default false */
    disabled?: boolean;
    /** For the field's button, so a label can point at it. */
    id?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    /** Classes for the field, e.g. a width. */
    className?: string;
}

// Two months and the presets need about 740px; below this, the calendar shows one month.
const twoMonthsQuery = "(min-width: 768px)";

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
    if (typeof ref === "function") ref(value);
    else if (ref) ref.current = value;
}

function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => typeof window !== "undefined" && Boolean(window.matchMedia?.(query).matches));
    useEffect(() => {
        const list = window.matchMedia?.(query);
        if (!list) return undefined;
        const update = () => setMatches(list.matches);
        update();
        list.addEventListener("change", update);
        return () => list.removeEventListener("change", update);
    }, [query]);
    return matches;
}

/**
 * A field that opens a two-month RangeCalendar, with optional presets beside it. Picking the second day, or a preset,
 * closes it; Escape closes it without changing anything. Once there's a range, a clear button empties it.
 */
export const DateRangePicker = forwardRef<HTMLButtonElement, DateRangePickerProps>(function DateRangePicker(
    {
        value,
        defaultValue = null,
        onChange,
        presets,
        visibleMonths = 2,
        placeholder = "Pick dates",
        formatOptions = { dateStyle: "medium" },
        size = "md",
        isInvalid = false,
        disabled = false,
        id,
        className,
        locale,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        ...calendarProps
    },
    ref,
) {
    const [range, setRange] = useControllableState<DateRange | null>(value, defaultValue, onChange);
    const [isOpen, setOpen] = useState(false);
    const fieldRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const panelId = useId();
    const roomForTwo = useMediaQuery(twoMonthsQuery);
    const { mounted, state } = usePresence(isOpen);
    const style = useFloating({ open: mounted, anchorRef: triggerRef, floatingRef: panelRef, placement: "bottom-start", offset: 6, maxHeight: 640 });

    const close = useCallback((reason?: "outside" | "escape") => {
        setOpen(false);
        if (reason !== "outside") triggerRef.current?.focus();
    }, []);
    useDismiss(isOpen, [panelRef, fieldRef], close);

    useEffect(() => {
        if (disabled) setOpen(false);
    }, [disabled]);

    const label = range ? formatDateRange(range.start, range.end, locale, formatOptions) : placeholder;

    function onPresetKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        const buttons = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button") ?? []);
        const index = buttons.indexOf(event.currentTarget);
        const moves: Record<string, number> = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: buttons.length - 1 };
        const target = moves[event.key];
        if (target === undefined) return;
        event.preventDefault();
        buttons[(target + buttons.length) % buttons.length]?.focus();
    }

    return (
        <>
            <div
                ref={fieldRef}
                className={cx("ow-date-range-picker", `ow-date-range-picker--${size}`, range && !disabled && "ow-date-range-picker--clearable", className)}
            >
                <button
                    ref={(element) => {
                        triggerRef.current = element;
                        assignRef(ref, element);
                    }}
                    id={id}
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? panelId : undefined}
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                    // A label names the button; the chosen range is read as its description.
                    aria-describedby={[`${panelId}-value`, ariaDescribedBy].filter(Boolean).join(" ")}
                    aria-invalid={isInvalid || undefined}
                    disabled={disabled}
                    className={cx("ow-select", "ow-date-range-picker__trigger", `ow-select--${size}`, {
                        "ow-select--open": isOpen,
                        "ow-select--invalid": isInvalid && !isOpen,
                    })}
                    onClick={() => setOpen(!isOpen)}
                    onKeyDown={(event) => {
                        if (event.key === "ArrowDown" && !isOpen) {
                            event.preventDefault();
                            setOpen(true);
                        }
                    }}
                >
                    <CalendarIcon size={size === "sm" ? 14 : 16} className="ow-date-range-picker__icon" />
                    <span id={`${panelId}-value`} className={cx("ow-select__value", !range && "ow-select__value--placeholder")}>
                        {label}
                    </span>
                </button>
                {range && !disabled ? (
                    <CloseButton
                        size="sm"
                        label="Clear dates"
                        className="ow-date-range-picker__clear"
                        onClick={() => {
                            setRange(null);
                            setOpen(false);
                            triggerRef.current?.focus();
                        }}
                    />
                ) : null}
            </div>
            {mounted ? (
                <div
                    ref={panelRef}
                    {...manualPopover}
                    data-state={state}
                    id={panelId}
                    role="dialog"
                    aria-label="Choose dates"
                    className={cx("ow-popover", "ow-floating", "ow-date-range-picker__panel")}
                    style={style}
                    onBlur={(event) => {
                        // Tabbing out of the panel closes it, as a click outside does.
                        const next = event.relatedTarget as Node | null;
                        if (isOpen && next && !panelRef.current?.contains(next)) setOpen(false);
                    }}
                >
                    {presets?.length ? (
                        <div role="group" aria-label="Presets" className="ow-date-range-picker__presets">
                            {presets.map((preset) => {
                                const isCurrent = range?.start === preset.range.start && range.end === preset.range.end;
                                return (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        aria-current={isCurrent || undefined}
                                        className={cx("ow-date-range-picker__preset", isCurrent && "ow-date-range-picker__preset--current")}
                                        onKeyDown={onPresetKeyDown}
                                        onClick={() => {
                                            setRange(preset.range);
                                            close();
                                        }}
                                    >
                                        <span className="ow-date-range-picker__preset-label">{preset.label}</span>
                                        {isCurrent ? <CheckIcon size={14} className="ow-date-range-picker__preset-check" /> : null}
                                    </button>
                                );
                            })}
                        </div>
                    ) : null}
                    <RangeCalendar
                        {...calendarProps}
                        locale={locale}
                        value={range}
                        visibleMonths={roomForTwo ? visibleMonths : 1}
                        autoFocus
                        onChange={(next) => {
                            setRange(next);
                            close();
                        }}
                    />
                </div>
            ) : null}
        </>
    );
});
