import { forwardRef, useCallback, useId, useRef, useState, type ForwardedRef } from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { manualPopover, useDismiss, useFloating } from "@/hooks/useFloating";
import { usePresence } from "@/hooks/usePresence";
import { CalendarIcon } from "@/icons";
import { cx } from "@/utils/cx";
import { Calendar, type CalendarProps } from "./Calendar";
import { formatDate, type ISODate } from "./dates";
import type { DatePickerProps } from "./DatePicker.types";
export type { DatePickerProps } from "./DatePicker.types";

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
    if (typeof ref === "function") ref(value);
    else if (ref) ref.current = value;
}

/** A field that opens a Calendar. Choosing a date closes it; Escape closes it without changing anything. */
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(
    {
        value,
        defaultValue = "",
        onChange,
        placeholder = "Pick a date",
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
    const [date, setDate] = useControllableState<ISODate>(value, defaultValue, onChange);
    const [isOpen, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const panelId = useId();
    const { mounted, state } = usePresence(isOpen);
    const style = useFloating({ open: mounted, anchorRef: triggerRef, floatingRef: panelRef, placement: "bottom-start", offset: 6 });

    const close = useCallback((reason?: "outside" | "escape") => {
        setOpen(false);
        if (reason !== "outside") triggerRef.current?.focus();
    }, []);
    useDismiss(isOpen, [panelRef, triggerRef], close);

    const label = date ? formatDate(date, locale, formatOptions) : placeholder;

    return (
        <>
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
                // Named by its label, then the value it shows: the name holds the visible text, as voice control needs.
                aria-label={ariaLabel && !ariaLabelledBy ? `${ariaLabel}, ${label}` : undefined}
                aria-labelledby={ariaLabelledBy ? `${ariaLabelledBy} ${panelId}-value` : undefined}
                aria-describedby={ariaDescribedBy}
                aria-invalid={isInvalid || undefined}
                disabled={disabled}
                className={cx(
                    "ow-select",
                    "ow-date-picker",
                    `ow-select--${size}`,
                    { "ow-select--open": isOpen, "ow-select--invalid": isInvalid && !isOpen },
                    className,
                )}
                onClick={() => setOpen(!isOpen)}
                onKeyDown={(event) => {
                    if (event.key === "ArrowDown" && !isOpen) {
                        event.preventDefault();
                        setOpen(true);
                    }
                }}
            >
                <CalendarIcon size={size === "sm" ? 14 : 16} className="ow-date-picker__icon" />
                <span id={`${panelId}-value`} className={cx("ow-select__value", !date && "ow-select__value--placeholder")}>
                    {label}
                </span>
            </button>
            {mounted ? (
                <div
                    ref={panelRef}
                    {...manualPopover}
                    data-state={state}
                    id={panelId}
                    role="dialog"
                    aria-label="Choose a date"
                    className="ow-popover ow-floating ow-date-picker__panel"
                    style={style}
                >
                    <Calendar
                        {...calendarProps}
                        locale={locale}
                        value={date}
                        autoFocus
                        onChange={(next) => {
                            setDate(next);
                            close();
                        }}
                    />
                </div>
            ) : null}
        </>
    );
});
