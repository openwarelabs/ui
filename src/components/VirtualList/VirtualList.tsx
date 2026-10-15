import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
    type FocusEvent,
    type ForwardedRef,
    type KeyboardEvent,
    type ReactElement,
    type RefAttributes,
} from "react";

import { cx } from "@/utils/cx";
import { Spinner } from "../Spinner/Spinner";
import { useVirtualizer } from "./useVirtualizer";
import type { VirtualListHandle, VirtualListProps } from "./VirtualList.types";

export type { VirtualListHandle, VirtualListLabels, VirtualListProps } from "./VirtualList.types";

/** How close to the end, in pixels, still counts as following it. */
const stickyDistance = 32;

const rowOf = (target: EventTarget | null) => (target as HTMLElement | null)?.closest?.<HTMLElement>("[data-index]") ?? null;

function VirtualListWithRef<T>(
    {
        items,
        count = items?.length ?? 0,
        renderItem,
        getKey,
        itemSize,
        estimateSize,
        overscan,
        gap = 0,
        height,
        maxHeight,
        onEndReached,
        onStartReached,
        endReachedThreshold = 200,
        loading = false,
        hasMore = true,
        followOutput = false,
        role = "list",
        label,
        "aria-labelledby": ariaLabelledBy,
        empty,
        labels,
        itemClassName,
        id,
        className,
        style,
    }: VirtualListProps<T>,
    ref: ForwardedRef<VirtualListHandle>,
) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const following = useRef(true);
    const lastTop = useRef(0);
    // The row count each end was last reached at, so each is called once per load.
    const reached = useRef({ start: -1, end: -1 });
    const pendingFocus = useRef<number | null>(null);
    const [focused, setFocused] = useState<number | null>(null);
    const feed = role === "feed";

    const keyOf = useCallback((index: number) => getKey!(items?.[index] as T, index), [getKey, items]);
    const { items: rows, totalSize, measureElement, scrollToIndex } = useVirtualizer({
        count,
        getScrollElement: () => scrollRef.current,
        itemSize,
        estimateSize,
        overscan,
        gap,
        getKey: getKey ? keyOf : undefined,
        keepMounted: focused,
    });

    const latest = useRef({ count, loading, hasMore, endReachedThreshold, onEndReached, onStartReached });
    latest.current = { count, loading, hasMore, endReachedThreshold, onEndReached, onStartReached };

    const checkEnds = useCallback(() => {
        const element = scrollRef.current;
        const props = latest.current;
        if (!element || props.loading) return;
        const top = element.scrollTop;
        if (props.onEndReached && props.hasMore && reached.current.end !== props.count && element.scrollHeight - top - element.clientHeight <= props.endReachedThreshold) {
            reached.current.end = props.count;
            props.onEndReached();
        } else if (props.onStartReached && props.count > 0 && reached.current.start !== props.count && top <= props.endReachedThreshold) {
            reached.current.start = props.count;
            props.onStartReached();
        }
    }, []);

    // Keeps the end in view while following: on open, as rows arrive, and as they're measured.
    useLayoutEffect(() => {
        const element = scrollRef.current;
        if (!followOutput || !following.current || !element) return;
        element.scrollTop = element.scrollHeight;
        lastTop.current = element.scrollTop;
    }, [followOutput, totalSize, count, loading]);

    // A list shorter than its frame never scrolls, so check after every load too.
    useEffect(checkEnds, [checkEnds, count, loading, hasMore, totalSize]);

    // Focus moved by Page Down or Page Up lands once the row has rendered.
    useLayoutEffect(() => {
        if (pendingFocus.current === null) return;
        scrollRef.current?.querySelector<HTMLElement>(`[data-index="${pendingFocus.current}"]`)?.focus({ preventScroll: true });
        pendingFocus.current = null;
    });

    useImperativeHandle(
        ref,
        () => ({
            scrollToIndex,
            scrollToEnd(options) {
                following.current = true;
                if (count > 0) scrollToIndex(count - 1, { ...options, align: "end" });
            },
            get element() {
                return scrollRef.current;
            },
        }),
        [count, scrollToIndex],
    );

    function onScroll() {
        const element = scrollRef.current!;
        const top = element.scrollTop;
        const distance = element.scrollHeight - top - element.clientHeight;
        // Any move up is the reader looking back; reaching the end again picks following back up.
        if (top < lastTop.current - 1 && distance > 1) following.current = false;
        else if (distance <= stickyDistance) following.current = true;
        lastTop.current = top;
        checkEnds();
    }

    function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (!feed || (event.key !== "PageDown" && event.key !== "PageUp")) return;
        // In a feed, Page Down and Page Up move between articles; from the feed itself, onto the first one in view.
        const row = rowOf(event.target);
        const top = event.currentTarget.scrollTop;
        const next = row
            ? Number(row.dataset.index) + (event.key === "PageDown" ? 1 : -1)
            : (rows.find((item) => item.start + item.size > top) ?? rows[0])?.index;
        if (next === undefined || next < 0 || next >= count) return;
        event.preventDefault();
        pendingFocus.current = next;
        setFocused(next);
        scrollToIndex(next);
    }

    function onFocus(event: FocusEvent<HTMLDivElement>) {
        const row = rowOf(event.target);
        // The row holding focus stays rendered when it scrolls out of view, so focus isn't dropped.
        if (row && row.parentElement?.parentElement === event.currentTarget) setFocused(Number(row.dataset.index));
    }

    function onBlur(event: FocusEvent<HTMLDivElement>) {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(null);
    }

    const setSize = onEndReached && hasMore ? -1 : count;
    // With no rows and nothing loading, it's an empty box rather than an empty list.
    const hasRows = count > 0 || loading;

    return (
        <div
            id={id}
            className={cx("ow-virtual-list", className)}
            style={{ height: height ?? (maxHeight === undefined ? undefined : "auto"), maxHeight, ...style }}
        >
            <div
                ref={scrollRef}
                className="ow-virtual-list__scroll"
                // A tab stop, so the list scrolls from the keyboard.
                role={hasRows ? role : undefined}
                tabIndex={hasRows ? 0 : undefined}
                aria-label={hasRows && !ariaLabelledBy ? label : undefined}
                aria-labelledby={hasRows ? ariaLabelledBy : undefined}
                aria-busy={loading || undefined}
                onScroll={onScroll}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                onBlur={onBlur}
            >
                <div className="ow-virtual-list__inner" style={{ height: totalSize }}>
                    {rows.map(({ index, key, start }) => (
                        <div
                            key={key}
                            ref={measureElement}
                            data-index={index}
                            role={feed ? "article" : "listitem"}
                            aria-posinset={index + 1}
                            aria-setsize={setSize}
                            tabIndex={feed ? -1 : undefined}
                            className={cx("ow-virtual-list__item", itemClassName)}
                            style={{ transform: `translateY(${start}px)`, height: itemSize }}
                        >
                            {renderItem(items?.[index] as T, index)}
                        </div>
                    ))}
                </div>
                {loading ? (
                    <div className="ow-virtual-list__footer" aria-hidden="true">
                        <Spinner size="sm" label="" />
                    </div>
                ) : null}
                {hasRows ? null : empty}
            </div>
            <span className="ow-visually-hidden" role="status">
                {loading ? (labels?.loading ?? "Loading more") : ""}
            </span>
        </div>
    );
}

const ForwardedVirtualList = forwardRef(VirtualListWithRef);
ForwardedVirtualList.displayName = "VirtualList";

// forwardRef drops the generic that ties `renderItem` and `getKey` to `items`, so the cast puts it back.
/**
 * A scrolling list that renders only the rows in view, for long logs, chat histories and big datasets: 10,000 rows
 * cost what 20 do. Rows have a fixed `itemSize`, or are measured as they render. `onEndReached` loads more as the
 * reader nears the end, `followOutput` keeps a log's newest line in view, and a ref scrolls to any row.
 */
export const VirtualList = ForwardedVirtualList as <T = unknown>(props: VirtualListProps<T> & RefAttributes<VirtualListHandle>) => ReactElement | null;
