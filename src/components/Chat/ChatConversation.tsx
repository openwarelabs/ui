import {
    Children,
    createContext,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type HTMLAttributes,
    type MutableRefObject,
    type ReactNode,
} from "react";

import { usePresence } from "../../hooks/usePresence";
import { ArrowDownIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { Button } from "../Button/Button";

export interface ChatConversationProps extends HTMLAttributes<HTMLDivElement> {
    /** The messages: ChatMessages, a ChatLoader, anything else in the column. */
    children?: ReactNode;
    /** Shown in place of the messages while there are none: a greeting, suggestions, an EmptyState. */
    empty?: ReactNode;
    /** Docked under the messages and lined up with them, outside the log: usually a PromptInput. It stays in view while
     * the messages scroll, and Jump to latest floats above it. */
    footer?: ReactNode;
    /** Names the conversation for screen readers.
     * @default "Conversation" */
    "aria-label"?: string;
    /** The id of a visible heading that names the conversation, in place of aria-label. */
    "aria-labelledby"?: string;
    /** `comfortable` keeps the messages in a 720px column in the middle, for reading; `full` lets them use the whole
     * width, for a narrow side panel.
     * @default "comfortable" */
    width?: "comfortable" | "full";
    /** The words on the button that appears once the reader scrolls up.
     * @default "Jump to latest" */
    jumpLabel?: string;
    /** How that button counts the messages that arrived while the reader was scrolled up.
     * @default (count) => `${count} new` */
    formatNewCount?(count: number): string;
}

export interface ChatConversationHandle {
    /** Scrolls to the newest message and follows new content again: smoothly, or at once under reduced motion. Call it
     * when the person sends a message, so they see their own words and the answer. */
    scrollToBottom(options?: { behavior?: ScrollBehavior }): void;
}

/** What messages inside a conversation need from it. */
interface ChatConversationContextValue {
    /** True once the first messages have painted: messages that mount after that animate in. */
    ready: MutableRefObject<boolean>;
    /** A message mounted; it counts as new while the reader is scrolled up. Returns the cleanup for when it goes. */
    register(id: string): () => void;
}

/** @internal */
export const ChatConversationContext = createContext<ChatConversationContextValue | null>(null);

/** How close to the bottom, in pixels, still counts as reading the latest. */
const stickyDistance = 32;

const defaultCount = (count: number) => `${count} new`;

const prefersReducedMotion = () => typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/**
 * The scrolling column of a chat. It follows the newest content while the reader is at the bottom (new messages, an
 * answer that's still streaming), stops as soon as they scroll up to read, and offers a "Jump to latest" button to
 * come back. It's a polite live region (role="log"), so screen readers hear messages as they're added.
 */
export const ChatConversation = forwardRef<ChatConversationHandle, ChatConversationProps>(function ChatConversation(
    {
        children,
        empty,
        footer,
        "aria-label": ariaLabel = "Conversation",
        "aria-labelledby": ariaLabelledBy,
        width = "comfortable",
        jumpLabel = "Jump to latest",
        formatNewCount = defaultCount,
        className,
        ...props
    },
    ref,
) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const jumpRef = useRef<HTMLButtonElement>(null);
    const following = useRef(true);
    const lastTop = useRef(0);
    const ready = useRef(false);
    const unseen = useRef(new Set<string>());
    const [isFollowing, setIsFollowing] = useState(true);
    const [newCount, setNewCount] = useState(0);
    const isEmpty = Children.toArray(children).length === 0;

    const follow = useCallback((next: boolean) => {
        following.current = next;
        setIsFollowing(next);
        if (next && unseen.current.size > 0) {
            unseen.current.clear();
            setNewCount(0);
        }
    }, []);

    // Pins the view to the bottom at once. Following never animates, so a streaming answer never lags behind.
    const stick = useCallback(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        scroller.scrollTop = scroller.scrollHeight;
        lastTop.current = scroller.scrollTop;
    }, []);

    const scrollToBottom = useCallback(
        (options?: { behavior?: ScrollBehavior }) => {
            const scroller = scrollerRef.current;
            if (!scroller) return;
            follow(true);
            scroller.scrollTo({ top: scroller.scrollHeight, behavior: options?.behavior ?? (prefersReducedMotion() ? "auto" : "smooth") });
        },
        [follow],
    );

    useImperativeHandle(ref, () => ({ scrollToBottom }), [scrollToBottom]);

    // Opens at the newest message.
    useLayoutEffect(stick, [stick]);

    useEffect(() => {
        ready.current = true;
    }, []);

    // Follows whatever changes the size, whether or not this renders: a new message, a streaming answer, a code block
    // loading, the frame shrinking as the prompt box grows below. It runs before paint, so nothing lags a frame behind.
    useEffect(() => {
        const scroller = scrollerRef.current;
        const content = contentRef.current;
        if (!scroller || !content || typeof ResizeObserver === "undefined") return undefined;
        const observer = new ResizeObserver(() => {
            if (following.current) stick();
        });
        observer.observe(content);
        observer.observe(scroller);
        return () => observer.disconnect();
    }, [stick]);

    function onScroll() {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        const top = scroller.scrollTop;
        const distance = scroller.scrollHeight - top - scroller.clientHeight;
        // Any move up is the reader looking back. (Content shrinking under them only clamps them to the bottom.)
        if (top < lastTop.current && distance > 1) {
            if (following.current) follow(false);
        } else if (distance <= stickyDistance && !following.current) {
            follow(true);
        }
        lastTop.current = top;
    }

    const context = useMemo<ChatConversationContextValue>(
        () => ({
            ready,
            register(id) {
                if (ready.current && !following.current) {
                    unseen.current.add(id);
                    setNewCount(unseen.current.size);
                }
                return () => {
                    if (unseen.current.delete(id)) setNewCount(unseen.current.size);
                };
            },
        }),
        [],
    );

    const showJump = !isFollowing && !isEmpty;
    const jump = usePresence(showJump);

    return (
        <div className={cx("ow-chat-conversation", width === "full" && "ow-chat-conversation--full", className)} {...props}>
            <div className="ow-chat-conversation__viewport">
                <div
                    ref={scrollerRef}
                    className="ow-chat-conversation__scroll"
                    role="log"
                    aria-live="polite"
                    aria-relevant="additions"
                    aria-label={ariaLabelledBy ? undefined : ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                    // A tab stop, so the conversation scrolls from the keyboard.
                    tabIndex={isEmpty ? undefined : 0}
                    onScroll={onScroll}
                >
                    <div ref={contentRef} className="ow-chat-conversation__content">
                        <ChatConversationContext.Provider value={context}>{children}</ChatConversationContext.Provider>
                    </div>
                </div>
                {isEmpty && empty ? (
                    <div className="ow-chat-conversation__empty">
                        <div className="ow-chat-conversation__empty-inner">{empty}</div>
                    </div>
                ) : null}
                {jump.mounted ? (
                    <div className="ow-chat-conversation__jump" data-state={jump.state}>
                        <Button
                            ref={jumpRef}
                            size="sm"
                            shape="pill"
                            startIcon={<ArrowDownIcon size={16} />}
                            aria-label={newCount > 0 ? `${jumpLabel}, ${formatNewCount(newCount)}` : jumpLabel}
                            tabIndex={showJump ? undefined : -1}
                            onClick={() => {
                                // The button goes once the view is at the bottom: keep keyboard focus in the conversation.
                                if (document.activeElement === jumpRef.current) scrollerRef.current?.focus({ preventScroll: true });
                                scrollToBottom();
                            }}
                        >
                            {jumpLabel}
                            {newCount > 0 ? <span className="ow-chat-conversation__count">{formatNewCount(newCount)}</span> : null}
                        </Button>
                    </div>
                ) : null}
            </div>
            {footer != null && footer !== false ? (
                <div className="ow-chat-conversation__footer">
                    <div className="ow-chat-conversation__footer-inner">{footer}</div>
                </div>
            ) : null}
        </div>
    );
});
