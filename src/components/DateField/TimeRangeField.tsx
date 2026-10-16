import { forwardRef, useEffect, useRef, useState } from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { cx } from "@/utils/cx";

import { TimeField } from "./TimeField";
import type { TimeRange, TimeRangeFieldProps } from "./TimeRangeField.types";

export type { TimeRange, TimeRangeFieldLabels, TimeRangeFieldProps } from "./TimeRangeField.types";

const empty: TimeRange = { start: null, end: null };

/**
 * A start and an end time, each a TimeField, joined by "to" in one group. The two share a clock, granularity and
 * limits; an end before the start shows both as invalid unless the range may run overnight.
 */
export const TimeRangeField = forwardRef<HTMLDivElement, TimeRangeFieldProps>(function TimeRangeField(
    {
        value,
        defaultValue = empty,
        onChange,
        hourCycle,
        granularity = "minute",
        minuteStep = 1,
        min,
        max,
        allowOvernight = false,
        locale,
        size = "md",
        isInvalid = false,
        disabled = false,
        readOnly = false,
        name,
        labels,
        startContent,
        id,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        className,
    },
    ref,
) {
    const [range, setRange] = useControllableState(value, defaultValue, onChange);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [labelId, setLabelId] = useState<string>();

    // A label can't point at a group, so the one Field puts above (label[for=id]) is wired up here, as in TimeField:
    // it names the group, and clicking it focuses the first segment.
    useEffect(() => {
        const root = rootRef.current;
        if (!root || !id) return;
        const scope = root.getRootNode() as Document | ShadowRoot;
        const found = Array.from(scope.querySelectorAll<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`));
        const label = found[0];
        if (!label) {
            setLabelId(undefined);
            return;
        }
        if (!label.id) label.id = `${id}-label`;
        setLabelId(label.id);
        const onClick = () => {
            if (!root.matches("[aria-disabled]")) root.querySelector<HTMLElement>("[data-segment]")?.focus();
        };
        found.forEach((element) => element.addEventListener("click", onClick));
        return () => found.forEach((element) => element.removeEventListener("click", onClick));
    }, [id]);

    const update = (end: "start" | "end") => (time: string) => setRange({ ...range, [end]: time || null });

    // Both times are "HH:MM" or "HH:MM:SS" with the same length, so they compare as text.
    const backwards = !allowOvernight && range.start !== null && range.end !== null && range.end < range.start;
    const invalid = isInvalid || backwards;

    const shared = {
        hourCycle,
        granularity,
        minuteStep,
        min,
        max,
        locale,
        size,
        isInvalid: invalid,
        disabled,
        readOnly,
        startContent,
        "aria-describedby": ariaDescribedBy,
        className: "ow-time-range-field__time",
    };

    return (
        <div
            ref={(element) => {
                rootRef.current = element;
                if (typeof ref === "function") ref(element);
                else if (ref) ref.current = element;
            }}
            id={id}
            role="group"
            aria-label={ariaLabel}
            aria-labelledby={[...new Set([ariaLabelledBy, labelId].filter(Boolean))].join(" ") || undefined}
            aria-disabled={disabled || undefined}
            data-invalid={invalid || undefined}
            className={cx("ow-time-range-field", size === "sm" && "ow-time-range-field--sm", invalid && "ow-time-range-field--invalid", disabled && "ow-time-range-field--disabled", className)}
        >
            <TimeField
                {...shared}
                aria-label={labels?.start ?? "Start"}
                name={name === undefined ? undefined : `${name}Start`}
                value={range.start ?? ""}
                onChange={update("start")}
            />
            <span className="ow-time-range-field__to" aria-hidden="true">
                {labels?.to ?? "to"}
            </span>
            <TimeField
                {...shared}
                aria-label={labels?.end ?? "End"}
                name={name === undefined ? undefined : `${name}End`}
                value={range.end ?? ""}
                onChange={update("end")}
            />
        </div>
    );
});
