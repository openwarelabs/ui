import {
    forwardRef,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type HTMLAttributes,
    type ReactNode,
    type Ref,
    type RefObject,
} from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { CheckIcon, CircleAlertIcon, CopyIcon, type IconProps } from "../../icons";
import { copyText } from "../../utils/copyText";
import { cx } from "../../utils/cx";
import { Button } from "../Button/Button";
import { ToggleButton } from "../Button/ButtonGroup";
import { Toolbar } from "../Toolbar/Toolbar";
import { Tooltip } from "../Tooltip/Tooltip";
import { ChatConversationContext } from "./ChatConversation";

/* Lucide shapes (ISC licence) the chat draws itself, like src/icons.tsx. */
function lucide(paths: ReactNode) {
    return function Icon({ size = 16, strokeWidth = 2, ...props }: IconProps) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
                {...props}
            >
                {paths}
            </svg>
        );
    };
}

const BotIcon = lucide(
    <>
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
    </>,
);
const RotateCcwIcon = lucide(
    <>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </>,
);
const ThumbsUpIcon = lucide(
    <>
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
        <path d="M7 10v12" />
    </>,
);
const ThumbsDownIcon = lucide(
    <>
        <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
        <path d="M17 14V2" />
    </>,
);
const PencilIcon = lucide(
    <>
        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
        <path d="m15 5 4 4" />
    </>,
);

export interface ChatAgentAvatarProps {
    /** sm 24px, md 28px beside a message, lg 36px in a page or panel header: the sizes of Avatar.
     * @default "md" */
    size?: "sm" | "md" | "lg";
    /** Give it when the avatar stands alone; beside the agent's name, leave it out and it's hidden from screen readers. */
    label?: string;
    className?: string;
}

const botSizes = { sm: 14, md: 16, lg: 18 };

/**
 * The agent's avatar: a bot icon on a tinted circle, in the sizes of Avatar. Messages and the loader show it by
 * default; use it wherever else the agent appears, such as a chat's header.
 */
export function ChatAgentAvatar({ size = "md", label, className }: ChatAgentAvatarProps) {
    return (
        <span
            className={cx("ow-chat-avatar", size !== "md" && `ow-chat-avatar--${size}`, className)}
            role={label ? "img" : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
        >
            <BotIcon size={botSizes[size]} />
        </span>
    );
}

/**
 * Whether this message or loader should animate in: only when it arrives in a conversation that's already showing,
 * not for the history it opens with.
 * @internal
 */
export function useChatEntrance(): boolean {
    const conversation = useContext(ChatConversationContext);
    const [entering] = useState(() => conversation?.ready.current ?? false);
    return entering;
}

const formatters = new Map<string, { short: Intl.DateTimeFormat; full: Intl.DateTimeFormat }>();

function formattersFor(locale: string | undefined) {
    const key = locale ?? "";
    let entry = formatters.get(key);
    if (!entry) {
        entry = {
            short: new Intl.DateTimeFormat(locale, { timeStyle: "short" }),
            full: new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short" }),
        };
        formatters.set(key, entry);
    }
    return entry;
}

/** A short local time ("14:02" in en-GB, "2:02 PM" in en-US) for a Date or ISO string; anything unparseable shows as given. */
function MessageTime({ time, locale }: { time: Date | string; locale?: string }) {
    const date = typeof time === "string" ? new Date(time) : time;
    if (Number.isNaN(date.getTime())) {
        return <time className="ow-chat-message__time">{String(time)}</time>;
    }
    const { short, full } = formattersFor(locale);
    return (
        <time className="ow-chat-message__time" dateTime={date.toISOString()} title={full.format(date)}>
            {short.format(date)}
        </time>
    );
}

/** Text inside these isn't where the writing is happening. */
const skipCaret = '[aria-hidden="true"], .ow-visually-hidden';

/**
 * Keeps the streaming caret just after the last character of the content, wherever that is: a plain string, the
 * last paragraph of rendered Markdown, a code block. It follows the content as it changes and as it reflows.
 */
function useStreamingCaret(bodyRef: RefObject<HTMLElement>, contentRef: RefObject<HTMLElement>, caretRef: RefObject<HTMLElement>, active: boolean) {
    useLayoutEffect(() => {
        const body = bodyRef.current;
        const content = contentRef.current;
        const caret = caretRef.current;
        if (!active || !body || !content || !caret) return undefined;

        const place = () => {
            const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
                acceptNode: (node) => (node.nodeValue?.trim() && !node.parentElement?.closest(skipCaret) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
            });
            const last = walker.lastChild() as Text | null;
            const box = body.getBoundingClientRect();
            if (!last) {
                // Nothing written yet: the caret waits where the first word will go.
                caret.style.transform = "";
                caret.style.removeProperty("height");
                caret.style.removeProperty("color");
                caret.hidden = false;
                return;
            }
            const end = last.data.trimEnd().length;
            const range = document.createRange();
            range.setStart(last, end - 1);
            range.setEnd(last, end);
            const rects = range.getClientRects();
            const rect = rects[rects.length - 1];
            if (!rect) {
                caret.hidden = true;
                return;
            }
            const x = Math.min(rect.right - box.left + 2, box.width - 2);
            caret.hidden = false;
            caret.style.transform = `translate(${Math.round(x)}px, ${Math.round(rect.top - box.top)}px)`;
            caret.style.height = `${Math.round(rect.height)}px`;
            caret.style.color = getComputedStyle(last.parentElement ?? content).color;
        };

        place();
        const mutations = new MutationObserver(place);
        mutations.observe(content, { subtree: true, childList: true, characterData: true });
        const resizes = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
        resizes?.observe(body);
        return () => {
            mutations.disconnect();
            resizes?.disconnect();
        };
    }, [active, bodyRef, contentRef, caretRef]);
}

export type ChatMessageFrom = "user" | "assistant" | "system";
export type ChatMessageStatus = "streaming" | "done" | "error";

export interface ChatMessageProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    /** Who it's from. `user`: the person, in a bubble on the right. `assistant`: the agent, full width beside its
     * avatar. `system`: a muted line in the middle, between hairlines, for things that happened ("Siobhan changed the
     * model to Claude Sonnet"). */
    from: ChatMessageFrom;
    /** The message. A person's plain text keeps its line breaks; give an agent's formatted answer as Prose, and put
     * paragraphs in Text so blocks sit 12px apart. */
    children?: ReactNode;
    /** Shown above the message: "Acme agent", "Siobhan Murphy". Left out, screen readers hear "You" or "Agent" instead. */
    name?: ReactNode;
    /** The agent's bot tile by default; any node (an Avatar) in its place, or null for none. A person's message shows one
     * only when you give it. */
    avatar?: ReactNode;
    /** When it was sent, as a Date or an ISO string. It shows as a short local time, with the full date on hover. */
    time?: Date | string;
    /** The locale for the time, such as "en-GB". Defaults to the browser's. */
    locale?: string;
    /** `streaming` while the text is still arriving: a soft caret blinks after it and the message is aria-busy.
     * `error` shows a line saying what went wrong, with Retry when you pass `onRetry`.
     * @default "done" */
    status?: ChatMessageStatus;
    /** What went wrong, for `status="error"`.
     * @default "The answer didn't finish." for the agent, "Couldn't send this message." for a person */
    error?: ReactNode;
    /** Shows a Retry button on the error line. */
    onRetry?(): void;
    /** The Retry button's words, for another language.
     * @default "Retry" */
    retryLabel?: string;
    /** Actions under the message, usually a ChatMessageActions. They wait until the message has finished streaming. */
    actions?: ReactNode;
    /** `hover` shows the actions while the message is hovered or has focus, and always on touch screens. `always` keeps
     * them in view, for the latest answer.
     * @default "hover" */
    showActions?: "hover" | "always";
}

/**
 * One message in a conversation: the person's in a bubble on the right, the agent's across the full width with its
 * avatar, name and time, or a system line in the middle. It shows a caret while the answer streams, an error with
 * Retry when it fails, and its actions on hover.
 */
export const ChatMessage = forwardRef<HTMLElement, ChatMessageProps>(function ChatMessage(
    { from, children, name, avatar, time, locale, status = "done", error, onRetry, retryLabel = "Retry", actions, showActions = "hover", className, ...props },
    ref,
) {
    const conversation = useContext(ChatConversationContext);
    const entering = useChatEntrance();
    const id = useId();
    const bodyRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const caretRef = useRef<HTMLSpanElement>(null);
    const streaming = status === "streaming";

    useEffect(() => conversation?.register(id), [conversation, id]);
    useStreamingCaret(bodyRef, contentRef, caretRef, streaming && from !== "system");

    if (from === "system") {
        return (
            <div
                ref={ref as Ref<HTMLDivElement>}
                className={cx("ow-chat-message", "ow-chat-message--system", entering && "ow-chat-message--enter", className)}
                {...props}
            >
                <span className="ow-chat-message__system-text">
                    {children}
                    {time !== undefined ? (
                        <>
                            <span aria-hidden="true"> · </span>
                            <MessageTime time={time} locale={locale} />
                        </>
                    ) : null}
                </span>
            </div>
        );
    }

    const isUser = from === "user";
    const avatarNode = avatar !== undefined ? avatar : isUser ? null : <ChatAgentAvatar />;
    const hasHeader = name != null || time !== undefined;
    const errorText = error ?? (isUser ? "Couldn't send this message." : "The answer didn't finish.");

    return (
        <article
            ref={ref}
            className={cx(
                "ow-chat-message",
                `ow-chat-message--${from}`,
                entering && "ow-chat-message--enter",
                streaming && "ow-chat-message--streaming",
                status === "error" && "ow-chat-message--error",
                showActions === "always" && "ow-chat-message--actions-always",
                className,
            )}
            aria-busy={streaming || undefined}
            {...props}
        >
            {avatarNode != null && avatarNode !== false ? <div className="ow-chat-message__avatar">{avatarNode}</div> : null}
            <div className="ow-chat-message__main">
                {hasHeader ? (
                    <div className="ow-chat-message__header">
                        {name != null ? (
                            <span className="ow-chat-message__name">{name}</span>
                        ) : (
                            <span className="ow-visually-hidden">{isUser ? "You" : "Agent"}</span>
                        )}
                        {time !== undefined ? <MessageTime time={time} locale={locale} /> : null}
                    </div>
                ) : (
                    <span className="ow-visually-hidden">{isUser ? "You" : "Agent"}</span>
                )}
                <div ref={bodyRef} className="ow-chat-message__body">
                    <div ref={contentRef} className="ow-chat-message__content">
                        {children}
                    </div>
                    {streaming ? <span ref={caretRef} className="ow-chat-message__caret" aria-hidden="true" /> : null}
                </div>
                {status === "error" ? (
                    <div className={cx("ow-chat-message__error", onRetry && "ow-chat-message__error--retry")}>
                        <CircleAlertIcon size={16} className="ow-chat-message__error-icon" />
                        <span className="ow-chat-message__error-text">{errorText}</span>
                        {onRetry ? (
                            <Button size="sm" startIcon={<RotateCcwIcon size={16} />} onClick={onRetry}>
                                {retryLabel}
                            </Button>
                        ) : null}
                    </div>
                ) : null}
                {actions && !streaming ? <div className="ow-chat-message__actions">{actions}</div> : null}
            </div>
        </article>
    );
});

export type ChatRating = "up" | "down";

export interface ChatMessageActionsProps {
    /** The message as plain text. Shows Copy, which copies it and says "Copied" for two seconds. */
    copyText?: string;
    /** Shows Edit, for the person's own messages. */
    onEdit?(): void;
    /** Shows Retry, to ask for the answer again. */
    onRetry?(): void;
    /** Shows Good response and Bad response. Called with the one pressed, or null when the pressed one is pressed again. */
    onRate?(rating: ChatRating | null): void;
    /** Which rating is pressed, when you keep it yourself. */
    rating?: ChatRating | null;
    /** The starting rating when uncontrolled.
     * @default null */
    defaultRating?: ChatRating | null;
    /** More actions after these: ghost, sm, icon-only Buttons, each in a Tooltip with its aria-label. */
    children?: ReactNode;
    /** The buttons' words, for another language. */
    labels?: Partial<Record<"copy" | "copied" | "edit" | "retry" | "good" | "bad", string>>;
    /** Names the toolbar for screen readers.
     * @default "Message actions" */
    "aria-label"?: string;
    className?: string;
}

const defaultLabels = { copy: "Copy", copied: "Copied", edit: "Edit", retry: "Retry", good: "Good response", bad: "Bad response" };

function CopyAction({ text, label, copiedLabel }: { text: string; label: string; copiedLabel: string }) {
    const [copied, setCopied] = useState(false);
    const timer = useRef(0);
    useEffect(() => () => window.clearTimeout(timer.current), []);
    const current = copied ? copiedLabel : label;
    return (
        <>
            <Tooltip label={current}>
                <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={current}
                    className={cx("ow-chat-actions__copy", copied && "ow-chat-actions__copy--copied")}
                    onClick={async () => {
                        if (await copyText(text)) {
                            setCopied(true);
                            window.clearTimeout(timer.current);
                            timer.current = window.setTimeout(() => setCopied(false), 2000);
                        }
                    }}
                >
                    <span className="ow-chat-actions__copy-icon">
                        <CopyIcon size={16} />
                        <CheckIcon size={16} />
                    </span>
                </Button>
            </Tooltip>
            <span className="ow-visually-hidden" aria-live="polite">
                {copied ? copiedLabel : ""}
            </span>
        </>
    );
}

/**
 * The row of small actions under a message: Copy, Edit, Retry, and Good or Bad response. Only the ones you give a
 * callback (or `copyText`) appear. It's a toolbar: one tab stop, with the arrow keys moving between the buttons.
 */
export function ChatMessageActions({
    copyText: text,
    onEdit,
    onRetry,
    onRate,
    rating,
    defaultRating = null,
    children,
    labels,
    "aria-label": ariaLabel = "Message actions",
    className,
}: ChatMessageActionsProps) {
    const words = { ...defaultLabels, ...labels };
    const [current, setCurrent] = useControllableState<ChatRating | null>(rating, defaultRating, onRate);

    const rate = (value: ChatRating, label: string, Icon: typeof ThumbsUpIcon) => {
        const pressed = current === value;
        return (
            <Tooltip label={label}>
                <ToggleButton
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={label}
                    pressed={pressed}
                    className="ow-chat-actions__rate"
                    onPressedChange={() => setCurrent(pressed ? null : value)}
                >
                    <Icon size={16} />
                </ToggleButton>
            </Tooltip>
        );
    };

    return (
        <Toolbar variant="plain" size="sm" aria-label={ariaLabel} className={cx("ow-chat-actions", className)}>
            {text !== undefined ? <CopyAction text={text} label={words.copy} copiedLabel={words.copied} /> : null}
            {onEdit ? (
                <Tooltip label={words.edit}>
                    <Button variant="ghost" size="sm" iconOnly aria-label={words.edit} onClick={onEdit}>
                        <PencilIcon size={16} />
                    </Button>
                </Tooltip>
            ) : null}
            {onRetry ? (
                <Tooltip label={words.retry}>
                    <Button variant="ghost" size="sm" iconOnly aria-label={words.retry} onClick={onRetry}>
                        <RotateCcwIcon size={16} />
                    </Button>
                </Tooltip>
            ) : null}
            {onRate ? (
                <>
                    {rate("up", words.good, ThumbsUpIcon)}
                    {rate("down", words.bad, ThumbsDownIcon)}
                </>
            ) : null}
            {children}
        </Toolbar>
    );
}
