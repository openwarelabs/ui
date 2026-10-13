import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { manualPopover, useFloating } from "../../hooks/useFloating";
import { usePresence } from "../../hooks/usePresence";
import { CheckIcon, ChevronDownIcon } from "../../icons";
import { cx } from "../../utils/cx";

export interface SelectOption {
    value: string;
    label: ReactNode;
    /** Plain text for type-to-find and the trigger's tooltip, when `label` isn't a string. */
    textValue?: string;
    /** A muted line under the label. */
    description?: ReactNode;
    disabled?: boolean;
}

export interface SelectGroup {
    label: string;
    options: SelectOption[];
}

export type SelectItem = SelectOption | SelectGroup;

export interface SelectProps {
    value: string;
    options: SelectItem[];
    onChange(value: string): void;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    id?: string;
    disabled?: boolean;
    /** Shown when no option matches `value`. Default "Select…". */
    placeholder?: string;
    size?: "sm" | "md";
    isInvalid?: boolean;
    /** Classes for the trigger, e.g. a width. */
    className?: string;
    /** Classes for the trigger's and options' text, e.g. a monospace class. */
    valueClassName?: string;
}

const menuGap = 4;
const menuMaxHeight = 288;
const typeaheadResetMs = 600;

function isGroup(item: SelectItem): item is SelectGroup {
    return "options" in item;
}

function textOf(option: SelectOption): string {
    return option.textValue ?? (typeof option.label === "string" ? option.label : option.value);
}

/**
 * A dropdown: a button that opens a listbox of options, in place of a native <select>.
 * It works with the keyboard like a select (arrows, Home/End, type to find, Enter/Space to pick,
 * Escape/Tab to close), keeps focus on the trigger, and its menu sits in the top layer so it
 * isn't clipped by dialogs or scroll areas.
 */
export function Select({
    value,
    options,
    onChange,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    id,
    disabled = false,
    placeholder = "Select…",
    size = "md",
    isInvalid = false,
    className,
    valueClassName,
}: SelectProps) {
    const listboxId = useId();
    const optionIdPrefix = useId();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const typeahead = useRef({ text: "", timer: 0 });
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const flat = useMemo(() => options.flatMap((item) => (isGroup(item) ? item.options : [item])), [options]);
    const selectedIndex = flat.findIndex((option) => option.value === value);
    const selected = flat[selectedIndex];
    const optionId = (index: number) => `${optionIdPrefix}-${index}`;

    const enabledFrom = useCallback(
        (start: number, step: 1 | -1): number => {
            for (let index = start; index >= 0 && index < flat.length; index += step) {
                if (!flat[index]!.disabled) return index;
            }
            return -1;
        },
        [flat],
    );

    const { mounted, state } = usePresence(isOpen);
    const floatingStyle = useFloating({
        open: mounted,
        anchorRef: triggerRef,
        floatingRef: menuRef,
        offset: menuGap,
        matchWidth: true,
        maxHeight: menuMaxHeight,
    });

    function open(startAt?: "first" | "last") {
        if (disabled || isOpen) return;
        setActiveIndex(
            startAt === "first"
                ? enabledFrom(0, 1)
                : startAt === "last"
                  ? enabledFrom(flat.length - 1, -1)
                  : selectedIndex >= 0 && !flat[selectedIndex]!.disabled
                    ? selectedIndex
                    : enabledFrom(0, 1),
        );
        setIsOpen(true);
    }

    function close() {
        setIsOpen(false);
    }

    function choose(index: number) {
        const option = flat[index];
        if (!option || option.disabled) return;
        close();
        triggerRef.current?.focus();
        if (option.value !== value) onChange(option.value);
    }

    // Keep the active option in view while moving with the keyboard.
    useEffect(() => {
        if (!isOpen || activeIndex < 0) return;
        document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: "nearest" });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- optionId is stable for this component.
    }, [isOpen, activeIndex]);

    // Close on a click elsewhere. (useFloating follows the trigger when the page scrolls or resizes.)
    useEffect(() => {
        if (!isOpen) return;
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) close();
        };
        document.addEventListener("pointerdown", onPointerDown, true);
        return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [isOpen]);

    useEffect(() => {
        if (disabled) setIsOpen(false);
    }, [disabled]);

    useEffect(() => () => window.clearTimeout(typeahead.current.timer), []);

    function findByTyping(key: string) {
        const state = typeahead.current;
        window.clearTimeout(state.timer);
        state.text += key.toLowerCase();
        state.timer = window.setTimeout(() => {
            state.text = "";
        }, typeaheadResetMs);
        const from = isOpen ? activeIndex : selectedIndex;
        // A repeated single letter cycles through the matches.
        const repeated = state.text.length > 1 && [...state.text].every((letter) => letter === state.text[0]);
        const search = repeated ? state.text[0]! : state.text;
        const start = repeated || state.text.length === 1 ? from + 1 : from;
        for (let offset = 0; offset < flat.length; offset += 1) {
            const index = (Math.max(start, 0) + offset) % flat.length;
            const option = flat[index]!;
            if (!option.disabled && textOf(option).toLowerCase().startsWith(search)) {
                if (isOpen) setActiveIndex(index);
                else if (option.value !== value) onChange(option.value);
                return;
            }
        }
    }

    function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (disabled) return;
        const { key } = event;

        if (!isOpen) {
            if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter" || key === " ") {
                event.preventDefault();
                open(key === "ArrowUp" && selectedIndex < 0 ? "last" : undefined);
            } else if (key.length === 1 && !event.metaKey && !event.ctrlKey) {
                findByTyping(key);
            }
            return;
        }

        switch (key) {
            case "ArrowDown": {
                event.preventDefault();
                const next = enabledFrom(activeIndex + 1, 1);
                if (next >= 0) setActiveIndex(next);
                return;
            }
            case "ArrowUp": {
                event.preventDefault();
                const previous = enabledFrom(activeIndex - 1, -1);
                if (previous >= 0) setActiveIndex(previous);
                return;
            }
            case "Home":
            case "PageUp":
                event.preventDefault();
                setActiveIndex(enabledFrom(0, 1));
                return;
            case "End":
            case "PageDown":
                event.preventDefault();
                setActiveIndex(enabledFrom(flat.length - 1, -1));
                return;
            case "Enter":
                event.preventDefault();
                choose(activeIndex);
                return;
            case " ":
                event.preventDefault();
                if (typeahead.current.text) findByTyping(" ");
                else choose(activeIndex);
                return;
            case "Escape":
                // Close the menu, not the dialog around it.
                event.preventDefault();
                event.stopPropagation();
                close();
                return;
            case "Tab":
                close();
                return;
            default:
                if (key.length === 1 && !event.metaKey && !event.ctrlKey) findByTyping(key);
        }
    }

    let flatIndex = -1;

    const renderOption = (option: SelectOption) => {
        flatIndex += 1;
        const index = flatIndex;
        const isSelected = index === selectedIndex;
        const isActive = index === activeIndex;
        return (
            <div
                key={`${option.value}-${index}`}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                className={cx("ow-option", {
                    "ow-option--active": isActive && !option.disabled,
                    "ow-option--selected": isSelected,
                    "ow-option--disabled": Boolean(option.disabled),
                })}
                onPointerMove={() => {
                    if (!option.disabled && activeIndex !== index) setActiveIndex(index);
                }}
                // Keep focus on the trigger.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
            >
                <span className="ow-option__check">{isSelected ? <CheckIcon size={14} /> : null}</span>
                <span className="ow-option__text">
                    <span className={cx("ow-option__label", valueClassName)}>{option.label}</span>
                    {option.description ? <span className="ow-option__description">{option.description}</span> : null}
                </span>
            </div>
        );
    };

    return (
        <>
            <button
                ref={triggerRef}
                id={id}
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={isOpen ? listboxId : undefined}
                aria-activedescendant={isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                aria-invalid={isInvalid || undefined}
                disabled={disabled}
                title={selected ? textOf(selected) : undefined}
                className={cx("ow-select", `ow-select--${size}`, { "ow-select--open": isOpen, "ow-select--invalid": isInvalid && !isOpen }, className)}
                onClick={() => (isOpen ? close() : open())}
                onKeyDown={onKeyDown}
                onBlur={(event) => {
                    if (!menuRef.current?.contains(event.relatedTarget as Node)) close();
                }}
            >
                <span className={cx("ow-select__value", !selected && "ow-select__value--placeholder", valueClassName)}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDownIcon size={size === "sm" ? 14 : 16} className="ow-select__chevron" />
            </button>
            {mounted ? (
                <div
                    ref={menuRef}
                    {...manualPopover}
                    data-state={state}
                    id={listboxId}
                    role="listbox"
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                    tabIndex={-1}
                    className={cx("ow-listbox", "ow-floating", `ow-listbox--${size}`)}
                    style={floatingStyle}
                >
                    {options.map((item, groupIndex) =>
                        isGroup(item) ? (
                            <div key={`group-${item.label}-${groupIndex}`} role="group" aria-label={item.label} className="ow-listbox__group">
                                <div className="ow-listbox__group-label" aria-hidden="true">
                                    {item.label}
                                </div>
                                {item.options.map(renderOption)}
                            </div>
                        ) : (
                            renderOption(item)
                        ),
                    )}
                    {flat.length === 0 ? <div className="ow-listbox__empty">No options</div> : null}
                </div>
            ) : null}
        </>
    );
}
