import {
    forwardRef,
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type FocusEvent,
    type ForwardedRef,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode,
    type RefAttributes,
} from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { CheckIcon } from "../../icons";
import { cx } from "../../utils/cx";
import type { SelectOption } from "../Select/Select";

/** An option, shaped like Select's, with an optional icon. */
export interface ListBoxOption extends SelectOption {
    /** A 16px icon between the checkmark and the label. */
    icon?: ReactNode;
    /** Plain text for type-to-find, when `label` isn't a string. */
    textValue?: string;
}

/** Options under a heading, like a Select's groups. */
export interface ListBoxGroup {
    /** The heading, shown in uppercase above the options and read out as the group's name. */
    label: string;
    options: ListBoxOption[];
}

export type ListBoxItem = ListBoxOption | ListBoxGroup;

export type ListBoxSelectionMode = "single" | "multiple";

/** ListBox's props for one selection mode: `value` is a string in single mode and an array in multiple mode. */
export interface ListBoxModeProps<Mode extends ListBoxSelectionMode> {
    /** The options, and groups of options under a heading. */
    options: ListBoxItem[];
    /** `single` chooses one option; `multiple` any number.
     * @default "single" */
    selectionMode?: Mode;
    /** The selected option's value in single mode ("" for none), or the selected values in multiple mode. */
    value?: Mode extends "multiple" ? string[] : string;
    /** The starting value when uncontrolled.
     * @default "" or [] */
    defaultValue?: Mode extends "multiple" ? string[] : string;
    /** Called with the new value: a string in single mode, the selected values in the options' order in multiple mode. */
    onChange?(value: Mode extends "multiple" ? string[] : string): void;
    /** Keeps at least one option selected: choosing the selected option again doesn't clear it.
     * @default false */
    disallowEmptySelection?: boolean;
    /** Shown in the list when there are no options.
     * @default "No options" */
    emptyMessage?: ReactNode;
    /** Scrolls the options past this height, e.g. 240 or "40vh". */
    maxHeight?: number | string;
    /** md rows are 36px; sm rows are 32px with 12px text, like a small Select's list.
     * @default "md" */
    size?: "sm" | "md";
    /** Shows the list as wrong: a red border, and a red halo when focused. Also sets aria-invalid. Field passes it.
     * @default false */
    isInvalid?: boolean;
    /** The options can be moved through and read, but the selection can't change.
     * @default false */
    isReadOnly?: boolean;
    /** Fades the list and takes it out of the tab order.
     * @default false */
    disabled?: boolean;
    id?: string;
    /** Names the list for screen readers when it isn't in a Field. */
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    className?: string;
}

/** ListBox's props. `value`, `defaultValue` and `onChange` take a string in single mode and an array in multiple mode. */
export interface ListBoxProps extends ListBoxModeProps<ListBoxSelectionMode> {}

const typeaheadResetMs = 600;

function isGroup(item: ListBoxItem): item is ListBoxGroup {
    return "options" in item;
}

function textOf(option: ListBoxOption): string {
    return option.textValue ?? (typeof option.label === "string" ? option.label : option.value);
}

function sameValues(a: Set<string>, b: Set<string>) {
    return a.size === b.size && [...a].every((value) => b.has(value));
}

/**
 * Select's list of options, standing on the page in a bordered surface: a choice in a settings panel, a picker beside
 * other content. One option or any number; arrows, Home/End and type-to-find move, Space or Enter selects, and in
 * multiple mode Shift extends the selection and Ctrl/⌘+A selects everything.
 */
function ListBoxWithRef<Mode extends ListBoxSelectionMode = "single">(
    {
        options,
        selectionMode,
        value,
        defaultValue,
        onChange,
        disallowEmptySelection = false,
        emptyMessage = "No options",
        maxHeight,
        size = "md",
        isInvalid = false,
        isReadOnly = false,
        disabled = false,
        id,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        className,
    }: ListBoxModeProps<Mode>,
    ref: ForwardedRef<HTMLDivElement>,
) {
    const multiple = selectionMode === "multiple";
    const [current, setCurrent] = useControllableState<string | string[]>(
        value as string | string[] | undefined,
        (defaultValue as string | string[] | undefined) ?? (multiple ? [] : ""),
        onChange as ((next: string | string[]) => void) | undefined,
    );
    const listRef = useRef<HTMLDivElement | null>(null);
    const optionIdPrefix = useId();
    const emptyId = useId();
    const optionId = (index: number) => `${optionIdPrefix}-${index}`;
    const typeahead = useRef({ text: "", timer: 0 });
    // Where a Shift selection grows from, and what was selected before it started.
    const anchor = useRef<{ index: number; base: Set<string> } | null>(null);
    const pointerDown = useRef(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [focus, setFocus] = useState<"none" | "pointer" | "keyboard">("none");
    const [fieldLabelId, setFieldLabelId] = useState<string>();

    const flat = useMemo(() => options.flatMap((item) => (isGroup(item) ? item.options : [item])), [options]);
    const selected = useMemo(() => new Set(Array.isArray(current) ? current : current ? [current] : []), [current]);
    const canSelect = !disabled && !isReadOnly;

    function enabledFrom(start: number, step: 1 | -1): number {
        for (let index = start; index >= 0 && index < flat.length; index += step) {
            if (!flat[index]!.disabled) return index;
        }
        return -1;
    }

    // Until something is highlighted, focus lands on the first selected option, or else the first option.
    const active = useMemo(() => {
        if (activeIndex >= 0 && activeIndex < flat.length && !flat[activeIndex]!.disabled) return activeIndex;
        const firstSelected = flat.findIndex((option) => !option.disabled && selected.has(option.value));
        return firstSelected >= 0 ? firstSelected : flat.findIndex((option) => !option.disabled);
    }, [activeIndex, flat, selected]);

    const setRefs = useCallback(
        (element: HTMLDivElement | null) => {
            listRef.current = element;
            if (typeof ref === "function") ref(element);
            else if (ref) ref.current = element;
        },
        [ref],
    );

    // Field labels its control with <label for>, which only names native form controls, so name the list by the label's
    // id instead, and let a click on the label focus the list as it would an input.
    useEffect(() => {
        const list = listRef.current;
        if (!id || ariaLabel || ariaLabelledBy || !list) return;
        const root = list.getRootNode() as Document | ShadowRoot;
        const label = [...(root.querySelectorAll?.("label") ?? [])].find((element) => element.htmlFor === id);
        if (!label) return;
        if (!label.id) label.id = `${id}-label`;
        setFieldLabelId(label.id);
        const focusList = () => listRef.current?.focus();
        label.addEventListener("click", focusList);
        return () => label.removeEventListener("click", focusList);
    }, [id, ariaLabel, ariaLabelledBy]);

    // Keep the highlighted option in view while moving with the keyboard (not on a click, which would scroll under the pointer).
    useEffect(() => {
        if (focus !== "keyboard" || active < 0) return;
        document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- optionId is stable for this component.
    }, [focus, active]);

    useEffect(() => () => window.clearTimeout(typeahead.current.timer), []);

    function commit(next: Set<string>) {
        if (!canSelect || sameValues(next, selected) || (disallowEmptySelection && next.size === 0)) return;
        if (!multiple) {
            setCurrent([...next][0] ?? "");
            return;
        }
        // Report values in the options' order, keeping any the options don't list.
        const listed = new Set(flat.map((option) => option.value));
        setCurrent([
            ...new Set([...flat.filter((option) => next.has(option.value)).map((option) => option.value), ...[...next].filter((v) => !listed.has(v))]),
        ]);
    }

    function toggle(index: number) {
        const option = flat[index];
        if (!option || option.disabled) return;
        const isSelected = selected.has(option.value);
        if (!multiple) {
            commit(new Set(isSelected ? [] : [option.value]));
            return;
        }
        const next = new Set(selected);
        if (isSelected) next.delete(option.value);
        else next.add(option.value);
        commit(next);
        anchor.current = { index, base: next };
    }

    /** Selects from the anchor to `index`, on top of what was selected before the anchor was set. */
    function extendTo(index: number, anchorIfNone: number) {
        if (!anchor.current) anchor.current = { index: anchorIfNone, base: new Set(selected) };
        const { index: from, base } = anchor.current;
        const next = new Set(base);
        for (let i = Math.min(from, index); i <= Math.max(from, index); i += 1) {
            const option = flat[i];
            if (option && !option.disabled) next.add(option.value);
        }
        commit(next);
    }

    function toggleAll() {
        const enabled = flat.filter((option) => !option.disabled).map((option) => option.value);
        const next = new Set(selected);
        const allSelected = enabled.every((v) => selected.has(v));
        for (const v of enabled) {
            if (allSelected) next.delete(v);
            else next.add(v);
        }
        commit(next);
        anchor.current = null;
    }

    function findByTyping(key: string) {
        const state = typeahead.current;
        window.clearTimeout(state.timer);
        state.text += key.toLowerCase();
        state.timer = window.setTimeout(() => {
            state.text = "";
        }, typeaheadResetMs);
        // A repeated single letter cycles through the matches.
        const repeated = state.text.length > 1 && [...state.text].every((letter) => letter === state.text[0]);
        const search = repeated ? state.text[0]! : state.text;
        const start = repeated || state.text.length === 1 ? active + 1 : active;
        for (let offset = 0; offset < flat.length; offset += 1) {
            const index = (Math.max(start, 0) + offset) % flat.length;
            const option = flat[index]!;
            if (!option.disabled && textOf(option).toLowerCase().startsWith(search)) {
                setActiveIndex(index);
                return;
            }
        }
    }

    function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (disabled || event.altKey) return;
        const { key, shiftKey } = event;
        const extending = multiple && shiftKey && canSelect;
        const modifier = event.metaKey || event.ctrlKey;
        let target = -1;
        let anchorIfNone = -1;

        switch (key) {
            case "ArrowDown":
                target = enabledFrom(active + 1, 1);
                anchorIfNone = target;
                break;
            case "ArrowUp":
                target = active < 0 ? enabledFrom(flat.length - 1, -1) : enabledFrom(active - 1, -1);
                anchorIfNone = target;
                break;
            case "Home":
            case "PageUp":
                target = enabledFrom(0, 1);
                anchorIfNone = active;
                break;
            case "End":
            case "PageDown":
                target = enabledFrom(flat.length - 1, -1);
                anchorIfNone = active;
                break;
            case " ":
            case "Enter":
                event.preventDefault();
                setFocus("keyboard");
                if (key === " " && typeahead.current.text) findByTyping(" ");
                else if (active < 0) return;
                else if (extending) extendTo(active, active);
                else toggle(active);
                return;
            default:
                if (modifier && key.toLowerCase() === "a" && multiple) {
                    event.preventDefault();
                    toggleAll();
                } else if (key.length === 1 && !modifier) {
                    setFocus("keyboard");
                    findByTyping(key);
                }
                return;
        }

        // An arrow, Home or End.
        event.preventDefault();
        setFocus("keyboard");
        if (target < 0) return;
        setActiveIndex(target);
        if (extending) extendTo(target, anchorIfNone < 0 ? target : anchorIfNone);
    }

    function onFocus(event: FocusEvent<HTMLDivElement>) {
        if (event.target !== event.currentTarget) return;
        setFocus(pointerDown.current ? "pointer" : "keyboard");
        pointerDown.current = false;
        // Pin where focus landed, so it doesn't follow the selection as that changes.
        setActiveIndex((previous) => (previous >= 0 && previous < flat.length && !flat[previous]!.disabled ? previous : active));
    }

    function onBlur(event: FocusEvent<HTMLDivElement>) {
        if (event.target !== event.currentTarget) return;
        setFocus("none");
        setActiveIndex(-1);
        pointerDown.current = false;
        typeahead.current.text = "";
    }

    let flatIndex = -1;

    const renderOption = (option: ListBoxOption) => {
        flatIndex += 1;
        const index = flatIndex;
        const isSelected = selected.has(option.value);
        return (
            <div
                key={`${option.value}-${index}`}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                className={cx("ow-option", {
                    "ow-option--active": focus === "keyboard" && index === active,
                    "ow-option--selected": isSelected,
                    "ow-option--disabled": Boolean(option.disabled),
                })}
                onPointerDown={() => {
                    if (!disabled && !option.disabled) setActiveIndex(index);
                }}
                onClick={(event) => {
                    if (disabled || option.disabled) return;
                    setActiveIndex(index);
                    if (multiple && event.shiftKey && canSelect) extendTo(index, index);
                    else toggle(index);
                }}
            >
                <span className="ow-option__check">{isSelected ? <CheckIcon size={14} /> : null}</span>
                {option.icon ? (
                    <span className="ow-option__icon" aria-hidden="true">
                        {option.icon}
                    </span>
                ) : null}
                <span className="ow-option__text">
                    <span className="ow-option__label">{option.label}</span>
                    {option.description ? <span className="ow-option__description">{option.description}</span> : null}
                </span>
            </div>
        );
    };

    const isEmpty = flat.length === 0;
    const describedBy = [ariaDescribedBy, isEmpty ? emptyId : undefined].filter(Boolean).join(" ") || undefined;

    return (
        <div
            ref={setRefs}
            id={id}
            role="listbox"
            tabIndex={disabled ? undefined : 0}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy ?? (ariaLabel ? undefined : fieldLabelId)}
            aria-describedby={describedBy}
            aria-multiselectable={multiple || undefined}
            aria-activedescendant={!disabled && active >= 0 ? optionId(active) : undefined}
            aria-invalid={isInvalid || undefined}
            aria-readonly={isReadOnly || undefined}
            aria-disabled={disabled || undefined}
            className={cx(
                "ow-listbox",
                "ow-listbox--standalone",
                `ow-listbox--${size}`,
                {
                    "ow-listbox--focus-visible": focus === "keyboard",
                    "ow-listbox--invalid": isInvalid,
                    "ow-listbox--readonly": isReadOnly,
                    "ow-listbox--disabled": disabled,
                },
                className,
            )}
            style={maxHeight === undefined ? undefined : { maxHeight }}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            onPointerDown={() => {
                pointerDown.current = true;
                if (focus === "keyboard") setFocus("pointer");
            }}
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
            {isEmpty ? (
                <div id={emptyId} className="ow-listbox__empty" role="presentation">
                    {emptyMessage}
                </div>
            ) : null}
        </div>
    );
}

const ForwardedListBox = forwardRef(ListBoxWithRef);
ForwardedListBox.displayName = "ListBox";

// forwardRef drops the generic that ties `value` and `onChange` to `selectionMode`, so the cast puts it back.
/**
 * Select's list of options on its own: a choice that stays on the page. `selectionMode="multiple"` makes `value` an array.
 */
export const ListBox = ForwardedListBox as <Mode extends ListBoxSelectionMode = "single">(
    props: ListBoxModeProps<Mode> & RefAttributes<HTMLDivElement>,
) => ReactElement | null;
