import { forwardRef, useCallback, useId, useRef, useState, type ForwardedRef } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { manualPopover, useDismiss, useFloating } from "../../hooks/useFloating";
import { usePresence } from "../../hooks/usePresence";
import { CalendarIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { Calendar, type CalendarProps } from "./Calendar";
import { formatDate, type ISODate } from "./dates";

export interface DatePickerProps extends Omit<CalendarProps, "autoFocus" | "className"> {
    /** Shown when no date is chosen.
     * @default "Pick a date" */
    placeholder?: string;
    /** How the chosen date is written in the field.
     * @default { dateStyle: "medium" } */
    formatOptions?: Intl.DateTimeFormatOptions;
    /** @default "md" */
    size?: "sm" | "md";
    /** @default false */
    isInvalid?: boolean;
    disabled?: boolean;
    id?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    className?: string;
}

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
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                // A label names the button; the chosen date is read as its description.
                aria-describedby={[`${panelId}-value`, ariaDescribedBy].filter(Boolean).join(" ")}
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
