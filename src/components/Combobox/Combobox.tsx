import {
    forwardRef,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type ForwardedRef,
    type KeyboardEvent,
    type ReactNode,
} from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { manualPopover, useDismiss, useFloating } from "../../hooks/useFloating";
import { usePresence } from "../../hooks/usePresence";
import { CheckIcon, ChevronDownIcon } from "../../icons";
import { cx } from "../../utils/cx";

export interface ComboboxOption {
    value: string;
    /** The text shown and matched. */
    label: string;
    /** A muted line under the label; also matched. */
    description?: ReactNode;
    disabled?: boolean;
}

export interface ComboboxProps {
    options: ComboboxOption[];
    /** The chosen option's value, or "" for none. */
    value?: string;
    /** @default "" */
    defaultValue?: string;
    onChange?(value: string): void;
    /** Called as the person types, to load options from a server. */
    onInputChange?(text: string): void;
    /** @default "Search…" */
    placeholder?: string;
    /** Shown when nothing matches.
     * @default "No matches" */
    emptyMessage?: ReactNode;
    /** Keep what was typed even if it isn't an option; onChange gets the text.
     * @default false */
    allowCustomValue?: boolean;
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

/**
 * A text field that suggests options as you type: pick a country, a repository, a person.
 * Down opens the list, Up and Down move, Enter picks, Escape closes then clears.
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
    {
        options,
        value,
        defaultValue = "",
        onChange,
        onInputChange,
        placeholder = "Search…",
        emptyMessage = "No matches",
        allowCustomValue = false,
        size = "md",
        isInvalid = false,
        disabled = false,
        id,
        className,
        ...aria
    },
    ref,
) {
    const [selected, setSelected] = useControllableState(value, defaultValue, onChange);
    const labelOf = (v: string) => options.find((option) => option.value === v)?.label ?? (allowCustomValue ? v : "");
    const [text, setText] = useState(() => labelOf(selected));
    const [isOpen, setOpen] = useState(false);
    const [typed, setTyped] = useState(false);
    const [active, setActive] = useState(-1);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const fieldRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const listId = useId();
    const optionId = (index: number) => `${listId}-${index}`;

    const results = useMemo(() => {
        const query = text.trim().toLowerCase();
        if (!typed || !query) return options;
        return options.filter(
            (option) =>
                option.label.toLowerCase().includes(query) ||
                (typeof option.description === "string" && option.description.toLowerCase().includes(query)),
        );
    }, [options, text, typed]);

    // Show the chosen option's label when the value changes from outside.
    useEffect(() => {
        if (!isOpen) setText(labelOf(selected));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the value or options change.
    }, [selected, options]);

    const { mounted, state } = usePresence(isOpen);
    const style = useFloating({ open: mounted, anchorRef: fieldRef, floatingRef: listRef, matchWidth: true, maxHeight: 288 });

    function open() {
        if (disabled || isOpen) return;
        setOpen(true);
        const index = results.findIndex((option) => option.value === selected);
        setActive(index >= 0 ? index : results.findIndex((option) => !option.disabled));
    }

    function close(restore = true) {
        setOpen(false);
        setTyped(false);
        if (!restore) return;
        if (allowCustomValue) {
            if (text !== labelOf(selected)) {
                const match = options.find((option) => option.label.toLowerCase() === text.trim().toLowerCase());
                setSelected(match ? match.value : text);
            }
        } else if (text.trim() === "") setSelected("");
        else setText(labelOf(selected));
    }

    useDismiss(isOpen, [fieldRef, listRef], () => close());

    function choose(option: ComboboxOption | undefined) {
        if (!option || option.disabled) return;
        setSelected(option.value);
        setText(option.label);
        setOpen(false);
        setTyped(false);
    }

    function move(step: 1 | -1) {
        if (!results.length) return;
        let next = active;
        for (let tries = 0; tries < results.length; tries += 1) {
            next = (next + step + results.length) % results.length;
            if (!results[next]!.disabled) break;
        }
        setActive(next);
    }

    useEffect(() => {
        if (isOpen && active >= 0) document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- optionId is stable.
    }, [active, isOpen]);

    function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                if (!isOpen) open();
                else move(1);
                break;
            case "ArrowUp":
                event.preventDefault();
                if (!isOpen) open();
                else move(-1);
                break;
            case "Enter":
                if (isOpen && active >= 0) {
                    event.preventDefault();
                    choose(results[active]);
                } else if (isOpen) close();
                break;
            case "Escape":
                if (isOpen) return; // useDismiss closes it.
                if (text) {
                    event.preventDefault();
                    setText("");
                    setSelected("");
                }
                break;
            case "Tab":
                if (isOpen) close();
                break;
        }
    }

    return (
        <>
            <div
                ref={fieldRef}
                className={cx(
                    "ow-input-group",
                    "ow-combobox",
                    size === "sm" && "ow-input-group--sm",
                    isInvalid && "ow-input-group--invalid",
                    disabled && "ow-input-group--disabled",
                    className,
                )}
            >
                <input
                    ref={(element) => {
                        inputRef.current = element;
                        assignRef(ref, element);
                    }}
                    id={id}
                    className="ow-input-group__input"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? listId : undefined}
                    aria-activedescendant={isOpen && active >= 0 ? optionId(active) : undefined}
                    aria-invalid={isInvalid || undefined}
                    autoComplete="off"
                    disabled={disabled}
                    placeholder={placeholder}
                    value={text}
                    onChange={(event) => {
                        setText(event.target.value);
                        setTyped(true);
                        onInputChange?.(event.target.value);
                        if (!isOpen) setOpen(true);
                        setActive(0);
                    }}
                    onClick={open}
                    onKeyDown={onKeyDown}
                    {...aria}
                />
                <button
                    type="button"
                    className="ow-combobox__toggle"
                    tabIndex={-1}
                    aria-label={isOpen ? "Hide options" : "Show options"}
                    disabled={disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                        if (isOpen) close();
                        else {
                            open();
                            inputRef.current?.focus();
                        }
                    }}
                >
                    <ChevronDownIcon size={size === "sm" ? 14 : 16} className={cx("ow-select__chevron", isOpen && "ow-combobox__chevron--open")} />
                </button>
            </div>
            {mounted ? (
                <div
                    ref={listRef}
                    {...manualPopover}
                    data-state={state}
                    id={listId}
                    role="listbox"
                    aria-label={aria["aria-label"]}
                    aria-labelledby={aria["aria-labelledby"]}
                    className={cx("ow-listbox", "ow-floating", `ow-listbox--${size}`)}
                    style={style}
                >
                    {results.map((option, index) => {
                        const isSelected = option.value === selected;
                        return (
                            <div
                                key={option.value}
                                id={optionId(index)}
                                role="option"
                                aria-selected={isSelected}
                                aria-disabled={option.disabled || undefined}
                                className={cx("ow-option", {
                                    "ow-option--active": index === active && !option.disabled,
                                    "ow-option--selected": isSelected,
                                    "ow-option--disabled": Boolean(option.disabled),
                                })}
                                onPointerMove={() => !option.disabled && setActive(index)}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => choose(option)}
                            >
                                <span className="ow-option__check">{isSelected ? <CheckIcon size={14} /> : null}</span>
                                <span className="ow-option__text">
                                    <span className="ow-option__label">{option.label}</span>
                                    {option.description ? (
                                        <span className="ow-option__description">{option.description}</span>
                                    ) : null}
                                </span>
                            </div>
                        );
                    })}
                    {results.length === 0 ? (
                        <div className="ow-listbox__empty" role="presentation">
                            {emptyMessage}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </>
    );
});
