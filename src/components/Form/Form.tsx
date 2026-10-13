import {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type FocusEvent,
    type FormEvent,
    type FormHTMLAttributes,
    type MutableRefObject,
    type ReactNode,
    type RefObject,
} from "react";

import { cx } from "../../utils/cx";
import { Alert } from "../Alert/Alert";

/** What onSubmit and validate get: each name in the form with its value, or a string[] when the name appears more than once. */
export type FormValues = Record<string, string | string[]>;

/** Messages by field name. */
export type FormErrors = Partial<Record<string, string>>;

/** The browser's own checks, by their ValidityState names. */
export type ValidityCheck =
    | "valueMissing"
    | "typeMismatch"
    | "patternMismatch"
    | "tooShort"
    | "tooLong"
    | "rangeUnderflow"
    | "rangeOverflow"
    | "stepMismatch"
    | "badInput";

/** What to say when a browser check fails: one message for any of them, or one per check. */
export type ValidityMessages = string | Partial<Record<ValidityCheck, string>>;

/** What a Form tells the components inside it, through the render function or useFormStatus(). */
export interface FormStatus {
    /** True while the promise onSubmit returned is pending. */
    isSubmitting: boolean;
    /** The errors showing now, by field name. */
    errors: FormErrors;
}

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "children"> {
    /**
     * Called with the values once every check passes. Return a promise to keep the form busy until it settles; if it
     * rejects, the error's message shows in FormError ("That didn't work. Try again." when it has none). Without
     * onSubmit, a valid form submits the usual way, to its `action`.
     */
    onSubmit?(values: FormValues, event: FormEvent<HTMLFormElement>): unknown;
    /** Checks the values after the browser's own checks, for rules it can't express: return { [name]: message } for what's wrong. */
    validate?(values: FormValues): FormErrors | void;
    /** Errors from the server, by field name. Each shows under its field until the person changes that field. */
    validationErrors?: FormErrors;
    /** The fields and buttons, or a function of the form's status: ({ isSubmitting, errors }) => … */
    children?: ReactNode | ((status: FormStatus) => ReactNode);
}

/** @internal What a Field tells its Form, so the Form can word its errors, focus it and tell which field lost focus. */
export interface FormFieldEntry {
    name: string | undefined;
    root: RefObject<HTMLElement>;
    controlId: string;
    errorMessages: ValidityMessages | undefined;
}

interface FormContextValue {
    status: FormStatus;
    formError: string | undefined;
    register(entry: MutableRefObject<FormFieldEntry>): () => void;
    changed(name: string): void;
    addErrorSlot(): () => void;
}

/** @internal */
export const FormContext = createContext<FormContextValue | null>(null);

interface Validatable extends HTMLElement {
    name: string;
    willValidate: boolean;
    validity: ValidityState;
    validationMessage: string;
}

const checks: ValidityCheck[] = [
    "valueMissing",
    "typeMismatch",
    "patternMismatch",
    "tooShort",
    "tooLong",
    "rangeUnderflow",
    "rangeOverflow",
    "stepMismatch",
    "badInput",
];

const failedMessage = "That didn't work. Try again.";
const focusable = ':is(input:not([type="hidden"]), select, textarea, button, [tabindex]):not(:disabled):not([tabindex="-1"])';
const idle: FormStatus = { isSubmitting: false, errors: {} };

const controlsOf = (form: HTMLFormElement) => Array.from(form.elements) as Validatable[];

function canFocus(element: Element | null | undefined): element is HTMLElement {
    return element instanceof HTMLElement && element.matches(focusable) && element.getClientRects().length > 0;
}

function firstFocusable(root: Element | null | undefined) {
    return root ? Array.from(root.querySelectorAll(focusable)).find(canFocus) : undefined;
}

function valuesOf(form: HTMLFormElement, submitter?: HTMLElement | null): FormValues {
    const data = new FormData(form);
    // The button that submitted the form is part of what it sends, as in a plain form.
    if ((submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) && submitter.name) {
        data.append(submitter.name, submitter.value);
    }
    const values: FormValues = {};
    data.forEach((value, name) => {
        if (typeof value !== "string") return;
        const existing = values[name];
        values[name] = existing === undefined ? value : [...(Array.isArray(existing) ? existing : [existing]), value];
    });
    return values;
}

function messageOf(error: unknown) {
    if (typeof error === "string" && error) return error;
    if (error instanceof Error && error.message) return error.message;
    return failedMessage;
}

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
    typeof value === "object" && value !== null && typeof (value as PromiseLike<unknown>).then === "function";

function sameErrors(a: FormErrors, b: FormErrors) {
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
}

/**
 * A form that checks its fields before it submits. On submit it runs the browser's checks (required, type, minLength,
 * pattern, min, max…), then `validate`, then any `validationErrors`; each message shows under its Field and focus goes to
 * the first wrong field. Only when everything passes does it call onSubmit with the values.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
    { onSubmit, validate, validationErrors, children, className, onChange, onBlur, onReset, ...formProps },
    ref,
) {
    const formRef = useRef<HTMLFormElement | null>(null);
    const fields = useRef(new Set<MutableRefObject<FormFieldEntry>>());
    const [local, setLocal] = useState<FormErrors>({});
    const [dismissed, setDismissed] = useState<ReadonlySet<string>>(() => new Set());
    const [isSubmitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string>();
    const [errorSlots, setErrorSlots] = useState(0);
    const [focusRequest, setFocusRequest] = useState(0);
    const [refreshRequest, setRefreshRequest] = useState(0);
    const queue = useRef({ changed: new Set<string>(), blurred: new Set<string>() });
    const submitted = useRef(false);
    const busy = useRef(false);
    const mounted = useRef(true);
    const attempts = useRef(0);
    const latest = useRef({ validate, validationErrors, local, dismissed });
    latest.current = { validate, validationErrors, local, dismissed };

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const setFormRef = useCallback(
        (element: HTMLFormElement | null) => {
            formRef.current = element;
            if (typeof ref === "function") ref(element);
            else if (ref) ref.current = element;
        },
        [ref],
    );

    const entryFor = (name: string) => [...fields.current].find((entry) => entry.current.name === name)?.current;

    /** The field a node belongs to: the Field around it, or its own name. */
    function nameAt(node: EventTarget | null) {
        if (!(node instanceof Element)) return undefined;
        for (const entry of fields.current) {
            const { name, root } = entry.current;
            if (name && root.current?.contains(node)) return name;
        }
        return (node as Validatable).name || undefined;
    }

    /** The browser's checks, then validate(): the first message for each name. */
    function collect(form: HTMLFormElement): FormErrors {
        const found: FormErrors = {};
        for (const element of controlsOf(form)) {
            const { name } = element;
            if (!name || found[name] || !element.willValidate || element.validity.valid) continue;
            const messages = entryFor(name)?.errorMessages;
            const failed = checks.find((check) => element.validity[check]);
            found[name] = typeof messages === "string" ? messages : (failed && messages?.[failed]) || element.validationMessage || "Check this field.";
        }
        const custom = latest.current.validate?.(valuesOf(form)) ?? {};
        for (const [name, message] of Object.entries(custom)) if (message && !found[name]) found[name] = message;
        return found;
    }

    const serverErrors = useMemo(() => {
        const active: FormErrors = {};
        for (const [name, message] of Object.entries(validationErrors ?? {})) if (message && !dismissed.has(name)) active[name] = message;
        return active;
    }, [validationErrors, dismissed]);

    // The browser's and validate()'s messages come before the server's.
    const errors = useMemo(() => ({ ...serverErrors, ...local }), [serverErrors, local]);
    const errorsRef = useRef(errors);
    errorsRef.current = errors;

    // Changes and blurs are handled after React renders them, so hidden inputs that carry a value have caught up.
    const request = useCallback((name: string, kind: "changed" | "blurred") => {
        // With no message showing, a change has nothing to clear: skip the render.
        if (kind === "changed" && !Object.keys(errorsRef.current).length) return;
        queue.current[kind].add(name);
        setRefreshRequest((count) => count + 1);
    }, []);

    // A hidden input that carries a control's value (a code, a date) changes without an input event, so watch it.
    useEffect(() => {
        const form = formRef.current;
        if (!form || typeof MutationObserver === "undefined") return;
        const observer = new MutationObserver((mutations) => {
            for (const { target } of mutations) {
                const name = target instanceof HTMLInputElement && target.type === "hidden" ? nameAt(target) : undefined;
                if (name) request(name, "changed");
            }
        });
        observer.observe(form, { subtree: true, attributes: true, attributeFilter: ["value"] });
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- nameAt reads refs only.
    }, [request]);

    useEffect(() => {
        const form = formRef.current;
        const { changed, blurred } = queue.current;
        queue.current = { changed: new Set(), blurred: new Set() };
        if (!form || (!changed.size && !blurred.size)) return;

        // A server error is about the value it was sent, so it goes once that value changes.
        const server = latest.current.validationErrors ?? {};
        const edited = [...changed].filter((name) => server[name] && !latest.current.dismissed.has(name));
        if (edited.length) setDismissed((previous) => new Set([...previous, ...edited]));

        // Messages already showing are checked again (and go once fixed); a field that lost focus can get a new one.
        const current = latest.current.local;
        const names = new Set([...Object.keys(current), ...blurred]);
        if (!names.size) return;
        const fresh = collect(form);
        const next: FormErrors = {};
        for (const name of names) if (fresh[name]) next[name] = fresh[name];
        if (!sameErrors(next, current)) setLocal(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per request.
    }, [refreshRequest]);

    // New errors from the server show again, even where the person had edited, and take focus. Not on first render.
    const serverKey = JSON.stringify(validationErrors ?? {});
    const serverSeen = useRef<{ key: string; attempts: number } | null>(null);
    useEffect(() => {
        const previous = serverSeen.current;
        serverSeen.current = { key: serverKey, attempts: attempts.current };
        if (!previous || (previous.key === serverKey && previous.attempts === attempts.current)) return;
        setDismissed(new Set());
        if (Object.values(validationErrors ?? {}).some(Boolean)) setFocusRequest((count) => count + 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- serverKey stands for validationErrors.
    }, [validationErrors]);

    // Focus the first field with an error, in the order they appear.
    useEffect(() => {
        const form = formRef.current;
        if (!focusRequest || !form) return;
        const targets: HTMLElement[] = [];
        for (const name of Object.keys(errorsRef.current)) {
            const entry = entryFor(name);
            const named = controlsOf(form).filter((element) => element.name === name);
            const control = entry ? document.getElementById(entry.controlId) : null;
            const target =
                (canFocus(control) ? control : firstFocusable(entry?.root.current)) ??
                named.find(canFocus) ??
                // A hidden input that carries a value: focus what's beside it, such as a code's first box.
                firstFocusable(named[0]?.parentElement);
            if (target) targets.push(target);
        }
        targets.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        targets[0]?.focus();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per request.
    }, [focusRequest]);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        const form = event.currentTarget;
        const submitter = (event.nativeEvent as SubmitEvent).submitter;
        if (busy.current) {
            event.preventDefault();
            return;
        }
        attempts.current += 1;
        submitted.current = true;
        setFormError(undefined);

        // A button with formNoValidate, such as "Save draft", submits without the checks, as in a plain form.
        const skipChecks = (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) && submitter.formNoValidate;
        const found = skipChecks ? {} : collect(form);
        setLocal(found);
        if (!skipChecks && Object.keys({ ...serverErrors, ...found }).length) {
            event.preventDefault();
            setFocusRequest((count) => count + 1);
            return;
        }
        if (!onSubmit) return;

        event.preventDefault();
        let result: unknown;
        try {
            result = onSubmit(valuesOf(form, submitter), event);
        } catch (error) {
            setFormError(messageOf(error));
            return;
        }
        if (!isThenable(result)) return;
        busy.current = true;
        setSubmitting(true);
        result.then(
            () => {
                busy.current = false;
                if (mounted.current) setSubmitting(false);
            },
            (error: unknown) => {
                busy.current = false;
                if (!mounted.current) return;
                setSubmitting(false);
                setFormError(messageOf(error));
            },
        );
    }

    function handleChange(event: FormEvent<HTMLFormElement>) {
        onChange?.(event);
        const name = nameAt(event.target);
        if (name) request(name, "changed");
    }

    function handleBlur(event: FocusEvent<HTMLFormElement>) {
        onBlur?.(event);
        if (!submitted.current) return;
        const name = nameAt(event.target);
        // Moving between the boxes of one field, or the options of one radio group, isn't leaving it.
        if (name && nameAt(event.relatedTarget) !== name) request(name, "blurred");
    }

    function handleReset(event: FormEvent<HTMLFormElement>) {
        onReset?.(event);
        submitted.current = false;
        setLocal({});
        setFormError(undefined);
        setDismissed(new Set(Object.keys(validationErrors ?? {})));
    }

    const register = useCallback((entry: MutableRefObject<FormFieldEntry>) => {
        fields.current.add(entry);
        return () => {
            fields.current.delete(entry);
        };
    }, []);

    const changed = useCallback((name: string) => request(name, "changed"), [request]);

    const addErrorSlot = useCallback(() => {
        setErrorSlots((count) => count + 1);
        return () => setErrorSlots((count) => count - 1);
    }, []);

    const status = useMemo<FormStatus>(() => ({ isSubmitting, errors }), [isSubmitting, errors]);
    const context = useMemo<FormContextValue>(
        () => ({ status, formError, register, changed, addErrorSlot }),
        [status, formError, register, changed, addErrorSlot],
    );

    return (
        <FormContext.Provider value={context}>
            <form
                ref={setFormRef}
                {...formProps}
                noValidate
                aria-busy={isSubmitting || undefined}
                className={cx("ow-form", className)}
                onSubmit={handleSubmit}
                onChange={handleChange}
                onBlur={handleBlur}
                onReset={handleReset}
            >
                {typeof children === "function" ? children(status) : children}
                {formError && errorSlots === 0 ? <FormErrorAlert message={formError} /> : null}
            </form>
        </FormContext.Provider>
    );
});

function FormErrorAlert({ message, className }: { message: string; className?: string }) {
    return (
        <Alert variant="danger" className={cx("ow-form__error", className)}>
            {message}
        </Alert>
    );
}

export interface FormErrorProps {
    className?: string;
}

/**
 * Where a Form says why a submission failed: the message from a rejected onSubmit, in a danger Alert (role="alert").
 * Put it just above the buttons. Without one, the Form shows the message at its end.
 */
export function FormError({ className }: FormErrorProps) {
    const form = useContext(FormContext);
    const addErrorSlot = form?.addErrorSlot;
    useEffect(() => addErrorSlot?.(), [addErrorSlot]);
    return form?.formError ? <FormErrorAlert message={form.formError} className={className} /> : null;
}

/** The status of the Form around a component, for a submit button that shows `loading` while it submits. */
export function useFormStatus(): FormStatus {
    return useContext(FormContext)?.status ?? idle;
}
