import {
    createContext,
    useContext,
    useEffect,
    useId,
    useRef,
    type HTMLAttributes,
    type KeyboardEvent,
    type ReactNode,
} from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { ChevronRightIcon } from "../../icons";
import { cx } from "../../utils/cx";

interface DisclosureViewProps {
    open: boolean;
    onToggle(): void;
    title: ReactNode;
    subtitle?: ReactNode;
    icon?: ReactNode;
    actions?: ReactNode;
    headingLevel: 2 | 3 | 4 | 5 | 6;
    disabled?: boolean;
    children: ReactNode;
    className?: string;
    item?: boolean;
}

function DisclosureView({
    open,
    onToggle,
    title,
    subtitle,
    icon,
    actions,
    headingLevel,
    disabled,
    children,
    className,
    item,
}: DisclosureViewProps) {
    const id = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const Heading = `h${headingLevel}` as "h3";

    // Closed content can't be tabbed into or read out.
    useEffect(() => {
        if (panelRef.current) panelRef.current.inert = !open;
    }, [open]);

    return (
        <div className={cx(item ? "ow-accordion__item" : "ow-disclosure", className)} data-open={open}>
            <div className="ow-disclosure__header">
                <Heading className="ow-disclosure__heading">
                    <button
                        type="button"
                        id={`${id}-trigger`}
                        className="ow-disclosure__trigger"
                        aria-expanded={open}
                        aria-controls={`${id}-panel`}
                        disabled={disabled}
                        data-accordion-trigger={item ? "" : undefined}
                        onClick={onToggle}
                    >
                        <ChevronRightIcon size={14} className="ow-disclosure__chevron" />
                        {icon ? <span className="ow-disclosure__icon">{icon}</span> : null}
                        <span className="ow-disclosure__titles">
                            <span className="ow-disclosure__title">{title}</span>
                            {subtitle ? <span className="ow-disclosure__subtitle">{subtitle}</span> : null}
                        </span>
                    </button>
                </Heading>
                {actions ? <div className="ow-disclosure__actions">{actions}</div> : null}
            </div>
            <div
                ref={panelRef}
                id={`${id}-panel`}
                role="region"
                aria-labelledby={`${id}-trigger`}
                className="ow-disclosure__panel"
            >
                <div className="ow-disclosure__clip">
                    <div className="ow-disclosure__content">{children}</div>
                </div>
            </div>
        </div>
    );
}

export interface DisclosureProps {
    title: ReactNode;
    /** A muted line under the title. */
    subtitle?: ReactNode;
    /** A 15px icon between the chevron and the title. */
    icon?: ReactNode;
    /** Controls on the right of the header, outside the toggle (a ghost Button). */
    actions?: ReactNode;
    open?: boolean;
    /** @default false */
    defaultOpen?: boolean;
    onOpenChange?(open: boolean): void;
    /** `card` is a bordered surface; `plain` is just the toggle and its content, for "Show details".
     * @default "card" */
    variant?: "card" | "plain";
    /** The heading level of the title, to fit the page's outline.
     * @default 3 */
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    disabled?: boolean;
    children: ReactNode;
    className?: string;
}

/** A section that opens and closes under its title, like Commandr's "3 files changed". */
export function Disclosure({
    open,
    defaultOpen = false,
    onOpenChange,
    variant = "card",
    headingLevel = 3,
    className,
    ...props
}: DisclosureProps) {
    const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
    return (
        <DisclosureView
            {...props}
            open={isOpen}
            onToggle={() => setOpen(!isOpen)}
            headingLevel={headingLevel}
            className={cx(variant === "plain" && "ow-disclosure--plain", className)}
        />
    );
}

interface AccordionContextValue {
    isOpen(value: string): boolean;
    toggle(value: string): void;
    headingLevel: 2 | 3 | 4 | 5 | 6;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    /** `single` keeps one item open at a time; `multiple` lets any number be open.
     * @default "single" */
    type?: "single" | "multiple";
    /** The open items' values. */
    value?: string[];
    /** @default [] */
    defaultValue?: string[];
    onValueChange?(value: string[]): void;
    /** `bordered` puts the items in one card with hairlines between; `separated` gives each its own card.
     * @default "bordered" */
    variant?: "bordered" | "separated";
    /** @default 3 */
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    children: ReactNode;
}

/** A stack of Disclosures, such as an FAQ. Up and Down move between the headers. */
export function Accordion({
    type = "single",
    value,
    defaultValue = [],
    onValueChange,
    variant = "bordered",
    headingLevel = 3,
    className,
    children,
    onKeyDown,
    ...props
}: AccordionProps) {
    const [openValues, setOpenValues] = useControllableState(value, defaultValue, onValueChange);

    function toggle(item: string) {
        const isOpen = openValues.includes(item);
        if (type === "single") setOpenValues(isOpen ? [] : [item]);
        else setOpenValues(isOpen ? openValues.filter((open) => open !== item) : [...openValues, item]);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        onKeyDown?.(event);
        const triggers = [
            ...event.currentTarget.querySelectorAll<HTMLButtonElement>("[data-accordion-trigger]:not(:disabled)"),
        ];
        const index = triggers.indexOf(document.activeElement as HTMLButtonElement);
        if (index < 0) return;
        const moves: Record<string, number> = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: triggers.length - 1 };
        if (!(event.key in moves)) return;
        event.preventDefault();
        triggers[(moves[event.key]! + triggers.length) % triggers.length]?.focus();
    }

    return (
        <AccordionContext.Provider value={{ isOpen: (item) => openValues.includes(item), toggle, headingLevel }}>
            <div className={cx("ow-accordion", `ow-accordion--${variant}`, className)} onKeyDown={handleKeyDown} {...props}>
                {children}
            </div>
        </AccordionContext.Provider>
    );
}

export interface AccordionItemProps {
    value: string;
    title: ReactNode;
    subtitle?: ReactNode;
    icon?: ReactNode;
    disabled?: boolean;
    children: ReactNode;
    className?: string;
}

/** One section of an Accordion. */
export function AccordionItem({ value, ...props }: AccordionItemProps) {
    const context = useContext(AccordionContext);
    if (!context) throw new Error("AccordionItem must be inside <Accordion>.");
    return (
        <DisclosureView
            {...props}
            item
            open={context.isOpen(value)}
            onToggle={() => context.toggle(value)}
            headingLevel={context.headingLevel}
        />
    );
}
