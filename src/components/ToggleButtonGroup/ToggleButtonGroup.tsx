import { useContext, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { cx } from "../../utils/cx";
import { ToggleButton } from "../Button/ButtonGroup";
import { ToolbarContext } from "../Toolbar/Toolbar";
import { Tooltip } from "../Tooltip/Tooltip";

export interface ToggleButtonGroupOption {
    /** Identifies the option in `value`. */
    value: string;
    /** The visible text. Leave it out for an icon-only option, and give that an aria-label. */
    label?: ReactNode;
    /** A 16px icon before the label, or on its own. */
    icon?: ReactNode;
    /** Names an icon-only option for screen readers; a tooltip shows the same words. */
    "aria-label"?: string;
    /** Greys the option out; the arrow keys skip it.
     * @default false */
    disabled?: boolean;
}

export interface ToggleButtonGroupProps {
    /** The toggles, in order. */
    options: ToggleButtonGroupOption[];
    /** `multiple` lets any number be on, like bold and italic; `single` allows at most one, like an alignment.
     * Either way all can be off, unless `disallowEmptySelection`.
     * @default "single" */
    selectionMode?: "single" | "multiple";
    /** What's on: in single mode a value, or "" for none; in multiple mode an array of values. Leave it out to let the
     * group keep its own state. */
    value?: string | string[];
    /** The starting value when uncontrolled.
     * @default "" or [] */
    defaultValue?: string | string[];
    /** Called with the new value: a string ("" for none) in single mode, an array in the options' order in multiple mode. */
    onChange?(value: string | string[]): void;
    /** Keeps one option on: pressing the only one that's on leaves it on.
     * @default false */
    disallowEmptySelection?: boolean;
    /** sm 32px, md 40px tall, like Button. Inside a Toolbar it takes the toolbar's size.
     * @default "md" */
    size?: "sm" | "md";
    /** Inside a Toolbar it takes the toolbar's orientation.
     * @default "horizontal" */
    orientation?: "horizontal" | "vertical";
    /** Disables every option, keeping what's on visible.
     * @default false */
    disabled?: boolean;
    /** Names the group for screen readers, e.g. "Text style". */
    "aria-label"?: string;
    /** The id of a visible label for the group, in place of aria-label. */
    "aria-labelledby"?: string;
    /** The id of a hint or description for the group. */
    "aria-describedby"?: string;
    /** An id for the group's element. */
    id?: string;
    /** Extra classes for the group. */
    className?: string;
}

type SharedProps = Omit<ToggleButtonGroupProps, "selectionMode" | "value" | "defaultValue" | "onChange">;

/** The props in single mode: `value` is one option's value, or "" when none is on. */
export type ToggleButtonGroupSingleProps = SharedProps & {
    selectionMode?: "single";
    value?: string;
    defaultValue?: string;
    onChange?(value: string): void;
};

/** The props in multiple mode: `value` is the values of the options that are on. */
export type ToggleButtonGroupMultipleProps = SharedProps & {
    selectionMode: "multiple";
    value?: string[];
    defaultValue?: string[];
    onChange?(value: string[]): void;
};

const toList = (value: string | string[] | undefined): string[] | undefined =>
    value === undefined ? undefined : Array.isArray(value) ? value : value === "" ? [] : [value];

const hasLabel = (option: ToggleButtonGroupOption) => option.label !== undefined && option.label !== null && option.label !== false && option.label !== "";

/**
 * Toggle buttons joined into one control: several can be on (bold, italic, underline) or at most one (an alignment),
 * and, unlike a SegmentedControl, all can be off. On its own it's one tab stop with the arrow keys moving between its
 * buttons; inside a Toolbar it leaves the arrow keys to the toolbar.
 */
export function ToggleButtonGroup(props: ToggleButtonGroupSingleProps | ToggleButtonGroupMultipleProps) {
    const {
        options,
        selectionMode = "single",
        value,
        defaultValue,
        onChange,
        disallowEmptySelection = false,
        size: sizeProp,
        orientation: orientationProp,
        disabled = false,
        className,
        id,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
    } = props as ToggleButtonGroupProps;
    const toolbar = useContext(ToolbarContext);
    const size = sizeProp ?? toolbar?.size ?? "md";
    const orientation = orientationProp ?? toolbar?.orientation ?? "horizontal";
    const multiple = selectionMode === "multiple";

    const [selected, setSelected] = useControllableState<string[]>(toList(value), toList(defaultValue) ?? [], (next) =>
        onChange?.(multiple ? next : (next[0] ?? "")),
    );
    const [focusedValue, setFocusedValue] = useState<string | null>(null);
    const refs = useRef<Array<HTMLButtonElement | null>>([]);

    const rank = (item: string) => {
        const index = options.findIndex((option) => option.value === item);
        return index < 0 ? options.length : index;
    };

    function toggle(item: string) {
        let next: string[];
        if (selected.includes(item)) next = multiple ? selected.filter((entry) => entry !== item) : [];
        else next = multiple ? [...selected, item].sort((a, b) => rank(a) - rank(b)) : [item];
        if (next.length === 0 && disallowEmptySelection) return;
        setSelected(next);
    }

    // On its own, the group is one tab stop: the button focused last, else the first that's on, else the first.
    const enabled = disabled ? [] : options.filter((option) => !option.disabled);
    const tabStop = enabled.find((option) => option.value === focusedValue) ?? enabled.find((option) => selected.includes(option.value)) ?? enabled[0];

    function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, current: string) {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const steps: Record<string, number> = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: 1, ArrowUp: -1 };
        const position = enabled.findIndex((option) => option.value === current);
        let target: number | undefined;
        if (event.key in steps) target = (position + steps[event.key]! + enabled.length) % enabled.length;
        else if (event.key === "Home") target = 0;
        else if (event.key === "End") target = enabled.length - 1;
        if (target === undefined || !enabled[target]) return;
        event.preventDefault();
        refs.current[options.indexOf(enabled[target]!)]?.focus();
    }

    const iconOnly = options.length > 0 && options.every((option) => option.icon && !hasLabel(option));

    return (
        <div
            role="group"
            id={id}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            className={cx(
                "ow-toggle-group",
                `ow-toggle-group--${size}`,
                orientation === "vertical" && "ow-toggle-group--vertical",
                iconOnly && "ow-toggle-group--icon-only",
                className,
            )}
        >
            {options.map((option, index) => {
                const optionIconOnly = Boolean(option.icon) && !hasLabel(option);
                const button = (
                    <ToggleButton
                        key={option.value}
                        ref={(element) => {
                            refs.current[index] = element;
                        }}
                        size={size}
                        iconOnly={optionIconOnly}
                        startIcon={optionIconOnly ? undefined : option.icon}
                        aria-label={option["aria-label"]}
                        pressed={selected.includes(option.value)}
                        onPressedChange={() => toggle(option.value)}
                        disabled={disabled || option.disabled}
                        // In a toolbar, the toolbar sets the tab stops and handles the arrow keys.
                        tabIndex={toolbar ? undefined : option === tabStop ? 0 : -1}
                        onFocus={() => setFocusedValue(option.value)}
                        onKeyDown={toolbar ? undefined : (event) => onKeyDown(event, option.value)}
                    >
                        {optionIconOnly ? option.icon : option.label}
                    </ToggleButton>
                );
                return optionIconOnly && option["aria-label"] ? (
                    <Tooltip key={option.value} label={option["aria-label"]} placement={orientation === "vertical" ? "right" : "top"}>
                        {button}
                    </Tooltip>
                ) : (
                    button
                );
            })}
        </div>
    );
}
