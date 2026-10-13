import { forwardRef, useRef, type ForwardedRef, type KeyboardEvent } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { SearchIcon } from "../../icons";
import { CloseButton } from "../Button/ButtonGroup";
import { Input, type InputProps } from "../Input/Input";
import { Spinner } from "../Spinner/Spinner";

export interface SearchFieldProps
    extends Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "startContent" | "endContent" | "onSubmit"> {
    value?: string;
    /** @default "" */
    defaultValue?: string;
    onChange?(value: string): void;
    /** Called with the text when the person presses Enter. */
    onSubmit?(value: string): void;
    /** Shows a spinner in place of the clear button while results load.
     * @default false */
    loading?: boolean;
    /** Names the field when there's no visible label.
     * @default "Search" */
    "aria-label"?: string;
}

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
    if (typeof ref === "function") ref(value);
    else if (ref) ref.current = value;
}

/** A search box: a magnifier, the text, and a clear button once there's something to clear. Escape clears it. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
    {
        value,
        defaultValue = "",
        onChange,
        onSubmit,
        loading = false,
        placeholder = "Search",
        "aria-label": ariaLabel = "Search",
        size = "md",
        onKeyDown,
        ...inputProps
    },
    ref,
) {
    const [text, setText] = useControllableState(value, defaultValue, onChange);
    const inputRef = useRef<HTMLInputElement | null>(null);

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "Escape" && text) {
            event.preventDefault();
            event.stopPropagation();
            setText("");
        } else if (event.key === "Enter") {
            onSubmit?.(text);
        }
    }

    return (
        <Input
            ref={(element) => {
                inputRef.current = element;
                assignRef(ref, element);
            }}
            type="search"
            size={size}
            placeholder={placeholder}
            aria-label={ariaLabel}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            startContent={<SearchIcon size={size === "sm" ? 14 : 16} />}
            endContent={
                loading ? (
                    <Spinner size="sm" label="Searching" />
                ) : text ? (
                    <CloseButton
                        size="sm"
                        label="Clear search"
                        onClick={() => {
                            setText("");
                            inputRef.current?.focus();
                        }}
                    />
                ) : null
            }
            {...inputProps}
        />
    );
});
