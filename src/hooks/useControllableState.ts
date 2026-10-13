import { useCallback, useRef, useState } from "react";

/**
 * State that a parent may control (`value` + `onChange`) or leave to the component (`defaultValue`).
 * Returns the current value and a setter that calls `onChange` either way.
 */
export function useControllableState<T>(
    value: T | undefined,
    defaultValue: T,
    onChange?: (next: T) => void,
): [T, (next: T | ((previous: T) => T)) => void] {
    const [internal, setInternal] = useState<T>(defaultValue);
    const isControlled = value !== undefined;
    const current = isControlled ? value : internal;
    const currentRef = useRef(current);
    currentRef.current = current;
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const setValue = useCallback(
        (next: T | ((previous: T) => T)) => {
            const resolved =
                typeof next === "function" ? (next as (previous: T) => T)(currentRef.current) : next;
            if (Object.is(resolved, currentRef.current)) return;
            if (!isControlled) setInternal(resolved);
            onChangeRef.current?.(resolved);
        },
        [isControlled],
    );

    return [current, setValue];
}
