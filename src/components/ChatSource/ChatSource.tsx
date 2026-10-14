import { forwardRef, useCallback, useEffect, useId, useRef, useState, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { manualPopover, useDismiss, useFloating } from "../../hooks/useFloating";
import { usePresence } from "../../hooks/usePresence";
import { ArrowUpRightIcon, ChevronRightIcon, FileIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { linkClassName } from "../Breadcrumbs/Breadcrumbs";
import { ChatCollapse } from "../ChatTool/ChatTool";

/** One source an answer drew on: a file, a pull request, a web page. ChatSource and ChatSources both take it. */
export interface ChatSourceItem {
    /** What it is: a function, a pull request's title, a page's title. */
    title: ReactNode;
    /** Where it is, in one line: "src/billing/invoice.ts · lines 40–72", "Pull request #482", "docs.stripe.com". */
    source?: ReactNode;
    /** A few lines from it, in the preview. ChatSources leaves it out. */
    snippet?: ReactNode;
    /** Where it opens. With it the citation is a link; without, a button. */
    href?: string;
    /** Opens `href` in a new tab, for sources outside your app.
     * @default false */
    external?: boolean;
    /** A 15px icon for the kind of source, beside its title. */
    icon?: ReactNode;
    /** Its number, shown in the citation chip and on its card: [1], [2]. */
    index?: number;
}

export interface ChatSourceProps extends ChatSourceItem {
    /** A short name for the chip when there's no `index`: "invoice.ts", "#482". */
    label?: string;
    /** How a string `snippet` shows: `text` as a quote, `code` in the mono face with its line breaks kept.
     * @default "text" */
    snippetFormat?: "text" | "code";
    /** The words of the preview's link to `href`.
     * @default "Open" */
    openLabel?: string;
    /** Called when the chip is pressed, e.g. to show the source in a side panel. On touch, the first press opens the preview instead. */
    onClick?(event: MouseEvent<HTMLElement>): void;
    /** Names the chip for screen readers. Defaults to "Source 1", or the label. */
    "aria-label"?: string;
    /** Classes for the chip's wrapper, which also holds the preview. */
    className?: string;
}

const openDelay = 250;
const closeDelay = 150;

/**
 * An inline citation in an answer: a small numbered chip that previews its source on hover, keyboard focus, or a tap,
 * in a card above the page. The chip is a link to the source when it has an `href`; the preview describes it to screen
 * readers without taking focus.
 */
export const ChatSource = forwardRef<HTMLElement, ChatSourceProps>(function ChatSource(
    {
        title,
        source,
        snippet,
        href,
        external = false,
        icon,
        index,
        label,
        snippetFormat = "text",
        openLabel = "Open",
        onClick,
        "aria-label": ariaLabel,
        className,
    },
    ref,
) {
    const id = useId();
    const wrapperRef = useRef<HTMLSpanElement>(null);
    const chipRef = useRef<HTMLElement | null>(null);
    const cardRef = useRef<HTMLSpanElement>(null);
    const timer = useRef(0);
    // How the last press started, so a tap can open the preview before it follows the link.
    const pointer = useRef("mouse");
    const [open, setOpen] = useState(false);
    const { mounted, state } = usePresence(open);
    const style = useFloating({ open: mounted, anchorRef: chipRef, floatingRef: cardRef, placement: "bottom-start", offset: 6, maxHeight: 360 });

    const schedule = (next: boolean, delay: number) => {
        window.clearTimeout(timer.current);
        if (delay === 0) setOpen(next);
        else timer.current = window.setTimeout(() => setOpen(next), delay);
    };
    const close = useCallback(() => {
        window.clearTimeout(timer.current);
        setOpen(false);
    }, []);
    useDismiss(open, [wrapperRef], close);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    const name = ariaLabel ?? (index !== undefined ? `Source ${index}` : (label ?? "Source"));
    const describedBy = [`${id}-title`, source ? `${id}-source` : null, snippet ? `${id}-snippet` : null].filter(Boolean).join(" ");
    const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

    const chipProps = {
        ref: (element: HTMLElement | null) => {
            chipRef.current = element;
            if (typeof ref === "function") ref(element);
            else if (ref) ref.current = element;
        },
        className: cx("ow-chat-source__chip", index === undefined && "ow-chat-source__chip--label", open && "ow-chat-source__chip--open"),
        "aria-label": name,
        "aria-describedby": describedBy,
        onFocus: (event: { currentTarget: HTMLElement }) => {
            if (event.currentTarget.matches(":focus-visible")) schedule(true, 0);
        },
        onBlur: () => schedule(false, 0),
        onPointerDown: (event: { pointerType: string }) => {
            pointer.current = event.pointerType;
        },
        onClick: (event: MouseEvent<HTMLElement>) => {
            const tapped = event.detail > 0 && pointer.current !== "mouse";
            pointer.current = "mouse";
            if (tapped && !open) {
                // The first tap shows the preview; the next one follows the link.
                event.preventDefault();
                schedule(true, 0);
                return;
            }
            if (!href) schedule(true, 0);
            onClick?.(event);
        },
    };

    const chipText = <span className="ow-chat-source__chip-text">{index ?? label}</span>;

    return (
        <span
            ref={wrapperRef}
            className={cx("ow-chat-source", className)}
            onPointerEnter={(event) => {
                if (event.pointerType === "mouse") schedule(true, open ? 0 : openDelay);
            }}
            onPointerLeave={(event) => {
                if (event.pointerType === "mouse") schedule(false, closeDelay);
            }}
        >
            {href ? (
                <a href={href} {...externalProps} {...chipProps}>
                    {chipText}
                </a>
            ) : (
                <button type="button" {...chipProps}>
                    {chipText}
                </button>
            )}
            <span ref={cardRef} {...manualPopover} hidden={!mounted} data-state={state} className="ow-chat-source-card ow-floating" style={style}>
                <span className="ow-chat-source-card__header">
                    {icon ? (
                        <span className="ow-chat-source-card__icon" aria-hidden="true">
                            {icon}
                        </span>
                    ) : null}
                    <span id={`${id}-title`} className="ow-chat-source-card__title">
                        {title}
                    </span>
                </span>
                {source ? (
                    <span id={`${id}-source`} className="ow-chat-source-card__source">
                        {source}
                    </span>
                ) : null}
                {snippet ? (
                    <span id={`${id}-snippet`} className={cx("ow-chat-source-card__snippet", `ow-chat-source-card__snippet--${snippetFormat}`)}>
                        {snippet}
                    </span>
                ) : null}
                {href ? (
                    // The chip is the same link, so this one stays out of the tab order.
                    <a href={href} {...externalProps} tabIndex={-1} className={cx(linkClassName({ variant: "standalone" }), "ow-chat-source-card__open")}>
                        {openLabel}
                        <ArrowUpRightIcon size={13} />
                    </a>
                ) : null}
            </span>
        </span>
    );
});

export interface ChatSourcesProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    /** The sources, in the order the answer cites them. An `id` keeps each one's place as the list changes. */
    sources: Array<ChatSourceItem & { id?: string }>;
    /** The toggle's words. Defaults to "3 sources". */
    label?: ReactNode;
    /** Whether the list shows. */
    expanded?: boolean;
    /** Whether the list starts open.
     * @default false */
    defaultExpanded?: boolean;
    /** Called with the new state when the person opens or closes the list. */
    onExpandedChange?(expanded: boolean): void;
}

/** The sources under an answer: a "3 sources" toggle that opens to a card for each, linking to it when it has an `href`. */
export const ChatSources = forwardRef<HTMLDivElement, ChatSourcesProps>(function ChatSources(
    { sources, label, expanded, defaultExpanded = false, onExpandedChange, className, ...props },
    ref,
) {
    const id = useId();
    const [isOpen, setOpen] = useControllableState(expanded, defaultExpanded, onExpandedChange);
    if (sources.length === 0) return null;

    return (
        <div ref={ref} className={cx("ow-chat-sources", className)} {...props}>
            <button type="button" className="ow-chat-toggle" aria-expanded={isOpen} aria-controls={`${id}-list`} onClick={() => setOpen(!isOpen)}>
                <span className="ow-chat-toggle__chevron" aria-hidden="true">
                    <ChevronRightIcon size={14} />
                </span>
                <span className="ow-chat-toggle__text">{label ?? `${sources.length} ${sources.length === 1 ? "source" : "sources"}`}</span>
            </button>
            <ChatCollapse id={`${id}-list`} open={isOpen} bleed className="ow-chat-sources__body">
                <ul className="ow-chat-sources__list">
                    {sources.map((item, position) => {
                        const content = (
                            <>
                                <span className="ow-chat-sources__lead">
                                    {item.index !== undefined ? (
                                        <span className="ow-chat-sources__index">
                                            <span className="ow-visually-hidden">Source </span>
                                            {item.index}
                                        </span>
                                    ) : null}
                                    {item.icon || item.index === undefined ? (
                                        <span className="ow-chat-sources__icon" aria-hidden="true">
                                            {item.icon ?? <FileIcon size={15} />}
                                        </span>
                                    ) : null}
                                </span>
                                <span className="ow-chat-sources__text">
                                    <span className="ow-chat-sources__title">{item.title}</span>
                                    {item.source ? <span className="ow-chat-sources__source">{item.source}</span> : null}
                                </span>
                                {item.href && item.external ? (
                                    <>
                                        <span className="ow-chat-sources__external" aria-hidden="true">
                                            <ArrowUpRightIcon size={14} />
                                        </span>
                                        <span className="ow-visually-hidden"> (opens in a new tab)</span>
                                    </>
                                ) : null}
                            </>
                        );
                        return (
                            <li key={item.id ?? item.index ?? position}>
                                {item.href ? (
                                    <a
                                        href={item.href}
                                        className="ow-chat-sources__card ow-chat-sources__card--link"
                                        {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                    >
                                        {content}
                                    </a>
                                ) : (
                                    <div className="ow-chat-sources__card">{content}</div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </ChatCollapse>
        </div>
    );
});
