import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
    type Ref,
    type UIEvent,
} from "react";

import { cx } from "@/utils/cx";
import type { Axis, ScrollAreaProps, ThumbState } from "./ScrollArea.types";

export type { ScrollAreaOrientation, ScrollAreaProps, ScrollAreaType } from "./ScrollArea.types";

const hidden: ThumbState = { size: 0, offset: 0, overflow: false };
const minThumb = 20;

function assignRef<T>(ref: Ref<T> | undefined, value: T) {
    if (typeof ref === "function") ref(value);
    else if (ref) (ref as { current: T }).current = value;
}

function reducedMotion() {
    return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** The thumb's size and place for one axis, from the viewport's scroll geometry and the track's length. */
function measure(viewport: HTMLDivElement, track: HTMLDivElement | null, axis: Axis): ThumbState {
    const scrollSize = axis === "y" ? viewport.scrollHeight : viewport.scrollWidth;
    const clientSize = axis === "y" ? viewport.clientHeight : viewport.clientWidth;
    const position = axis === "y" ? viewport.scrollTop : viewport.scrollLeft;
    const range = scrollSize - clientSize;
    if (range <= 1 || clientSize === 0) return hidden;
    // The track is only in the page once its axis overflows; until then, overflow alone is known.
    if (!track) return { size: 0, offset: 0, overflow: true };
    const trackSize = axis === "y" ? track.clientHeight : track.clientWidth;
    const size = Math.max(minThumb, Math.round((clientSize / scrollSize) * trackSize));
    // In right-to-left text a horizontal scrollLeft runs from -range (the end) to 0 (the start).
    const from = axis === "x" && getComputedStyle(viewport).direction === "rtl" ? -range : 0;
    const offset = Math.round(((position - from) / range) * (trackSize - size));
    return { size, offset: Math.min(Math.max(offset, 0), trackSize - size), overflow: true };
}

/** A scrolling area with its own thin scrollbars, drawn in the theme's colours over the content, that show on hover or while
 * scrolling and fade away. The viewport is an ordinary scroll container, so the wheel, touch and the keyboard work as usual. */
export function ScrollArea({
    orientation = "vertical",
    type = "hover",
    scrollHideDelay = 600,
    height,
    maxHeight,
    viewportRef,
    onScroll,
    className,
    style,
    children,
    "aria-label": ariaLabel,
    ...props
}: ScrollAreaProps) {
    const viewport = useRef<HTMLDivElement | null>(null);
    const tracks = useRef<Record<Axis, HTMLDivElement | null>>({ x: null, y: null });
    const [thumbs, setThumbs] = useState<Record<Axis, ThumbState>>({ x: hidden, y: hidden });
    const [scrolling, setScrolling] = useState(false);
    const [dragging, setDragging] = useState<Axis | null>(null);
    const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const drag = useRef<{ axis: Axis; start: number; from: number } | null>(null);

    const vertical = orientation !== "horizontal";
    const horizontal = orientation !== "vertical";

    const update = useCallback(() => {
        const element = viewport.current;
        if (!element) return;
        const next = {
            x: horizontal ? measure(element, tracks.current.x, "x") : hidden,
            y: vertical ? measure(element, tracks.current.y, "y") : hidden,
        };
        setThumbs((current) =>
            current.x.size === next.x.size &&
            current.x.offset === next.x.offset &&
            current.x.overflow === next.x.overflow &&
            current.y.size === next.y.size &&
            current.y.offset === next.y.offset &&
            current.y.overflow === next.y.overflow
                ? current
                : next,
        );
    }, [horizontal, vertical]);

    const setViewport = useCallback(
        (node: HTMLDivElement | null) => {
            viewport.current = node;
            assignRef(viewportRef, node);
        },
        [viewportRef],
    );

    // Measure on mount and whenever the viewport or its content changes size.
    useEffect(() => {
        const element = viewport.current;
        if (!element) return;
        update();
        if (typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(update);
        observer.observe(element);
        if (element.firstElementChild) observer.observe(element.firstElementChild);
        return () => observer.disconnect();
    }, [update]);

    // The track mounts once its axis overflows; measure again so the thumb gets its size.
    useLayoutEffect(() => {
        if ((thumbs.x.overflow && thumbs.x.size === 0) || (thumbs.y.overflow && thumbs.y.size === 0)) update();
    }, [thumbs, update]);

    useEffect(() => () => clearTimeout(hideTimer.current), []);

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        update();
        if (type !== "always") {
            setScrolling(true);
            clearTimeout(hideTimer.current);
            hideTimer.current = setTimeout(() => setScrolling(false), scrollHideDelay);
        }
        onScroll?.(event);
    };

    /** Dragging a thumb scrolls the viewport by the same share of its range. */
    const startDrag = (axis: Axis) => (event: ReactPointerEvent<HTMLDivElement>) => {
        const element = viewport.current;
        if (!element || event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
            axis,
            start: axis === "y" ? event.clientY : event.clientX,
            from: axis === "y" ? element.scrollTop : element.scrollLeft,
        };
        setDragging(axis);
    };

    const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
        const element = viewport.current;
        const current = drag.current;
        if (!element || !current) return;
        const track = tracks.current[current.axis];
        const thumb = thumbs[current.axis];
        if (!track) return;
        const trackSize = current.axis === "y" ? track.clientHeight : track.clientWidth;
        const scrollRange = current.axis === "y" ? element.scrollHeight - element.clientHeight : element.scrollWidth - element.clientWidth;
        const free = trackSize - thumb.size;
        if (free <= 0) return;
        const delta = (current.axis === "y" ? event.clientY : event.clientX) - current.start;
        const target = current.from + (delta / free) * scrollRange;
        if (current.axis === "y") element.scrollTop = target;
        else element.scrollLeft = target;
    };

    const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!drag.current) return;
        drag.current = null;
        setDragging(null);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    };

    /** Clicking the track pages towards the pointer. */
    const pageTo = (axis: Axis) => (event: ReactPointerEvent<HTMLDivElement>) => {
        const element = viewport.current;
        if (!element || event.button !== 0 || event.target !== event.currentTarget) return;
        event.preventDefault();
        const rect = event.currentTarget.getBoundingClientRect();
        const thumb = thumbs[axis];
        const at = axis === "y" ? event.clientY - rect.top : event.clientX - rect.left;
        const direction = at < thumb.offset ? -1 : 1;
        const behavior: ScrollBehavior = reducedMotion() ? "auto" : "smooth";
        if (axis === "y") element.scrollBy({ top: direction * element.clientHeight, behavior });
        else element.scrollBy({ left: direction * element.clientWidth, behavior });
    };

    const overflows = thumbs.x.overflow || thumbs.y.overflow;

    const renderScrollbar = (axis: Axis) => {
        const thumb = thumbs[axis];
        if (!thumb.overflow) return null;
        const thumbStyle: CSSProperties =
            axis === "y"
                ? { height: thumb.size, transform: `translateY(${thumb.offset}px)` }
                : { width: thumb.size, transform: `translateX(${thumb.offset}px)` };
        return (
            <div
                ref={(node) => {
                    tracks.current[axis] = node;
                }}
                className={cx(
                    "ow-scroll-area__scrollbar",
                    axis === "y" ? "ow-scroll-area__scrollbar--vertical" : "ow-scroll-area__scrollbar--horizontal",
                    dragging === axis && "ow-scroll-area__scrollbar--dragging",
                )}
                aria-hidden="true"
                onPointerDown={pageTo(axis)}
            >
                <div
                    className="ow-scroll-area__thumb"
                    style={thumbStyle}
                    onPointerDown={startDrag(axis)}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                />
            </div>
        );
    };

    return (
        <div
            className={cx("ow-scroll-area", `ow-scroll-area--${orientation}`, `ow-scroll-area--${type}`, scrolling && "ow-scroll-area--scrolling", className)}
            style={style}
            {...props}
        >
            <div
                ref={setViewport}
                className="ow-scroll-area__viewport"
                // With the native scrollbar hidden, the keyboard is the only other way to scroll: focusable while there's overflow.
                tabIndex={overflows ? 0 : undefined}
                role={ariaLabel ? "region" : undefined}
                aria-label={ariaLabel}
                style={{ height, maxHeight }}
                onScroll={handleScroll}
            >
                <div className="ow-scroll-area__content">{children}</div>
            </div>
            {renderScrollbar("y")}
            {renderScrollbar("x")}
        </div>
    );
}
