import { cloneElement, isValidElement, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from "react";

import { cx } from "../../utils/cx";
import { Checkbox } from "../Checkbox/Checkbox";
import { FormContext, type FormFieldEntry, type ValidityMessages } from "../Form/Form";

export interface FieldProps {
    /** The label, set above the control. Leave it out for a control that has its own, like a Checkbox. */
    label?: ReactNode;
    /** One control: an Input, Textarea, Select, or any element that takes an id. */
    children: ReactElement;
    /** A muted line under the control. */
    hint?: ReactNode;
    /** An error under the control; it also marks the control invalid. Inside a Form, it takes the place of the Form's. */
    error?: ReactNode;
    /**
     * The field's name, for a control with no `name` of its own (Select, Combobox, Switch, DatePicker): Field submits
     * the control's `value` (or `checked`) under it in a hidden input, and inside a Form shows the Form's error for it.
     * The control must be controlled; a string, a number, true or an array of them is sent.
     */
    name?: string;
    /**
     * Inside a Form, what to say when one of the browser's checks fails, in place of its own message: one string for
     * any check, or one per check, like { valueMissing: "Enter your work email.", typeMismatch: "…" }.
     */
    errorMessages?: ValidityMessages;
    className?: string;
}

/** Elements a <label for> can name. */
const isLabelable = (element: HTMLElement) =>
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLButtonElement ||
    element instanceof HTMLMeterElement ||
    element instanceof HTMLOutputElement ||
    element instanceof HTMLProgressElement;

/** A stable key for a control's value, to notice when it changes. */
const keyOf = (value: unknown) => JSON.stringify(value ?? null);

/**
 * A label above a control, with an optional hint and error below. Field wires them together:
 * it gives the control an id (unless it has one), points aria-describedby at the hint and error,
 * and marks it invalid when there is an error. Inside a Form, it shows the Form's error for its control's name.
 */
export function Field({ label, children, hint, error, name: nameProp, errorMessages, className }: FieldProps) {
    const form = useContext(FormContext);
    const generatedId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const labelId = `${generatedId}-label`;
    const hintId = `${generatedId}-hint`;
    const errorId = `${generatedId}-error`;

    const child = isValidElement<Record<string, unknown>>(children) ? children : null;
    const controlId = (child?.props.id as string | undefined) ?? `${generatedId}-control`;
    const name = nameProp ?? (child?.props.name as string | undefined);
    const shownError = error || (form && name ? form.status.errors[name] : undefined);
    const describedBy =
        [child?.props["aria-describedby"] as string | undefined, hint ? hintId : undefined, shownError ? errorId : undefined].filter(Boolean).join(" ") ||
        undefined;

    // Our own controls draw the invalid state from `isInvalid`; native elements get aria-invalid. It's only passed
    // when there's something to say, so a control without the prop (SegmentedControl) doesn't get it as an attribute.
    // Checkbox passes its props to its <input>, so it gets aria-invalid too.
    const invalid = (child?.props.isInvalid as boolean | undefined) ?? (shownError ? true : undefined);
    const invalidProp =
        child && typeof child.type !== "string" && child.type !== Checkbox
            ? invalid === undefined
                ? {}
                : { isInvalid: invalid }
            : { "aria-invalid": shownError ? true : undefined };

    // A control with no name of its own (Select, Switch) has no input to submit, so Field carries its value.
    const carries = Boolean(nameProp && child && typeof child.type !== "string" && child.props.name === undefined);
    const carried = carries && child ? ("value" in child.props ? child.props.value : child.props.checked) : undefined;
    // Strings and numbers are sent as they are, true as "on" (like a checkbox); anything else isn't sent.
    const carriedValues = (Array.isArray(carried) ? carried : [carried]).filter(
        (value): value is string | number | true => typeof value === "string" || typeof value === "number" || value === true,
    );
    const carriedKey = carries ? keyOf(carried) : undefined;

    // <label for> only names inputs, selects, textareas and buttons. When the control turns out to be something else
    // (a radiogroup like SegmentedControl, a ListBox, a DateField's group), it's named with aria-labelledby instead.
    const [labelsByFor, setLabelsByFor] = useState(true);
    useLayoutEffect(() => {
        if (!label) return;
        const control = rootRef.current?.ownerDocument.getElementById(controlId);
        setLabelsByFor(!control || isLabelable(control));
    });
    const labelledBy =
        label && !labelsByFor && child && child.props["aria-label"] === undefined && child.props["aria-labelledby"] === undefined
            ? { "aria-labelledby": labelId }
            : {};

    const entry = useRef<FormFieldEntry>({ name, root: rootRef, controlId, errorMessages });
    entry.current = { name, root: rootRef, controlId, errorMessages };
    const register = form?.register;
    useEffect(() => register?.(entry), [register]);

    // Such a control fires no input events either, so Field tells the Form when its value changes.
    const changed = form?.changed;
    const lastCarried = useRef(carriedKey);
    useEffect(() => {
        if (lastCarried.current === carriedKey) return;
        lastCarried.current = carriedKey;
        if (name) changed?.(name);
    }, [carriedKey, changed, name]);

    return (
        <div ref={rootRef} className={cx("ow-field", className)}>
            {label ? (
                <label id={labelId} className="ow-field__label" htmlFor={controlId}>
                    {label}
                </label>
            ) : null}
            {child ? cloneElement(child, { id: controlId, "aria-describedby": describedBy, ...labelledBy, ...invalidProp }) : children}
            {carries && nameProp
                ? carriedValues.map((value, index) => <input key={index} type="hidden" name={nameProp} value={value === true ? "on" : String(value)} />)
                : null}
            {hint ? (
                <p id={hintId} className="ow-field__hint">
                    {hint}
                </p>
            ) : null}
            {shownError ? (
                <p id={errorId} role="alert" className="ow-field__error">
                    {shownError}
                </p>
            ) : null}
        </div>
    );
}
