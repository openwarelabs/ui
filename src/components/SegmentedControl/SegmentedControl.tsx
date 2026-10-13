import { useRef, type KeyboardEvent, type ReactNode } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { useIndicator } from "../../hooks/useIndicator";
import { cx } from "../../utils/cx";

export interface SegmentedControlOption {
    value: string;
    label: ReactNode;
    /** A 16px icon before the label. With no label, give the option an aria-label. */
    icon?: ReactNode;
    disabled?: boolean;
    "aria-label"?: string;
}

export interface SegmentedControlProps {
    options: SegmentedControlOption[];
    value?: string;
    /** The starting value when uncontrolled. Defaults to the first option. */
    defaultValue?: string;
    onChange?(value: string): void;
    /** sm 28px, md 32px tall.
     * @default "md" */
    size?: "sm" | "md";
    /** Stretches the segments to fill the container.
     * @default false */
    fullWidth?: boolean;
    /** Names the choice for screen readers. */
    "aria-label"?: string;
    "aria-labelledby"?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * Two to five mutually exclusive options in a well, with the chosen one raised: a view switch, a filter.
 * It behaves like a radio group: the arrow keys move and choose.
 */
export function SegmentedControl({
    options,
    value,
    defaultValue,
    onChange,
    size = "md",
    fullWidth = false,
    disabled = false,
    className,
    ...aria
}: SegmentedControlProps) {
    const [current, setCurrent] = useControllableState(value, defaultValue ?? options[0]?.value ?? "", onChange);
    const refs = useRef<Array<HTMLButtonElement | null>>([]);
    const groupRef = useRef<HTMLDivElement>(null);
    useIndicator(groupRef, '[aria-checked="true"]', current);
    const enabled = options.map((option, index) => ({ option, index })).filter(({ option }) => !option.disabled);

    function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        let target: number | undefined;
        if (event.key in keys) {
            const position = enabled.findIndex((entry) => entry.index === index);
            target = enabled[(position + keys[event.key]! + enabled.length) % enabled.length]?.index;
        } else if (event.key === "Home") target = enabled[0]?.index;
        else if (event.key === "End") target = enabled[enabled.length - 1]?.index;
        if (target === undefined) return;
        event.preventDefault();
        refs.current[target]?.focus();
        setCurrent(options[target]!.value);
    }

    const focusable = options.some((option) => option.value === current && !option.disabled) ? current : enabled[0]?.option.value;

    return (
        <div
            ref={groupRef}
            role="radiogroup"
            className={cx("ow-segmented", `ow-segmented--${size}`, fullWidth && "ow-segmented--full", disabled && "ow-segmented--disabled", className)}
            {...aria}
        >
            {options.map((option, index) => {
                const isSelected = option.value === current;
                return (
                    <button
                        key={option.value}
                        ref={(element) => {
                            refs.current[index] = element;
                        }}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={option["aria-label"]}
                        tabIndex={option.value === focusable ? 0 : -1}
                        disabled={disabled || option.disabled}
                        className={cx("ow-segmented__item", isSelected && "ow-segmented__item--selected")}
                        onClick={() => setCurrent(option.value)}
                        onKeyDown={(event) => onKeyDown(event, index)}
                    >
                        {option.icon ? <span className="ow-segmented__icon">{option.icon}</span> : null}
                        {option.label}
                    </button>
                );
            })}
            <span className="ow-indicator" aria-hidden="true" />
        </div>
    );
}
