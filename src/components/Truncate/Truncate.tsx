import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { VisuallyHidden } from "@/components/Layout/Layout";
import { Tooltip } from "@/components/Tooltip/Tooltip";
import { cx } from "@/utils/cx";

import type { TruncatePosition, TruncateProps, TruncateState } from "./Truncate.types";

export type { TruncatePosition, TruncateProps, TruncateState } from "./Truncate.types";

/**
 * Finds the longest cut of `text` that fits in `available` pixels, by setting candidates on the hidden `probe` span
 * and measuring it. Code points rather than UTF-16 units, so an emoji or a surrogate pair is never split.
 */
function fit(
    probe: HTMLElement,
    text: string,
    available: number,
    position: TruncatePosition,
    ellipsis: string,
    tail: number | undefined,
): TruncateState {
    const width = (candidate: string) => {
        probe.textContent = candidate;
        return probe.getBoundingClientRect().width;
    };
    if (available <= 0 || width(text) <= available) return { text, cut: false };

    const chars = Array.from(text);
    const keepTail = tail === undefined ? undefined : Math.max(0, Math.min(tail, chars.length - 1));
    // `n` is how many characters are kept; this is the most that can be.
    const most = keepTail === undefined ? chars.length - 1 : chars.length - 1 - keepTail;
    const build = (n: number) => {
        if (position === "start") return ellipsis + chars.slice(chars.length - n).join("").trimStart();
        const end = keepTail ?? Math.floor(n / 2);
        const start = keepTail === undefined ? n - end : n;
        const last = end ? chars.slice(chars.length - end).join("").trimStart() : "";
        return chars.slice(0, start).join("").trimEnd() + ellipsis + last;
    };

    let low = 0;
    let high = most;
    while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        if (width(build(middle)) <= available) low = middle;
        else high = middle - 1;
    }
    return { text: build(low), cut: true };
}

/**
 * Text cut to the room it has, with an ellipsis at the end, in the middle (file names and hashes keep their start and
 * their end) or at the start (paths keep their end), and the full text in a Tooltip only when it's cut. The middle and
 * start cuts are measured, and measured again when the box changes size or the text changes.
 */
export function Truncate({
    children,
    position = "end",
    lines = 1,
    tooltip = true,
    tail,
    ellipsis = "…",
    as = "span",
    className,
    style,
    ...props
}: TruncateProps) {
    const Element = as as "span";
    const rootRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const probeRef = useRef<HTMLSpanElement>(null);
    const measureRef = useRef<() => void>(() => undefined);
    const [state, setState] = useState<TruncateState>({ text: children, cut: false });
    const measured = position !== "end";
    const clamp = !measured && lines > 1;

    measureRef.current = () => {
        const text = textRef.current;
        if (!text) return;
        let next: TruncateState;
        if (measured) {
            const probe = probeRef.current;
            if (!probe) return;
            next = fit(probe, children, text.getBoundingClientRect().width, position, ellipsis, tail);
        } else {
            const cut = clamp ? text.scrollHeight > text.clientHeight + 1 : text.scrollWidth > text.clientWidth;
            next = { text: children, cut };
        }
        setState((current) => (current.text === next.text && current.cut === next.cut ? current : next));
    };

    // Before paint, so the clipped start of a middle cut never shows; then again whenever the box changes size.
    useLayoutEffect(() => {
        measureRef.current();
    }, [children, position, lines, ellipsis, tail]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root || typeof ResizeObserver === "undefined") return undefined;
        const observer = new ResizeObserver(() => measureRef.current());
        observer.observe(root);
        // Web fonts that arrive later change every width.
        document.fonts?.ready.then(() => measureRef.current());
        return () => observer.disconnect();
    }, []);

    // Only a measured cut swaps the words on screen, so only then is the full text kept for screen readers.
    const swapped = measured && state.cut;
    const text = (
        <span ref={textRef} className="ow-truncate__text" aria-hidden={swapped ? true : undefined}>
            {swapped ? state.text : children}
        </span>
    );

    return (
        <Element
            ref={rootRef}
            className={cx(
                "ow-truncate",
                `ow-truncate--${position}`,
                measured && "ow-truncate--measured",
                clamp && "ow-truncate--clamp",
                className,
            )}
            style={clamp ? ({ "--ow-truncate-lines": lines, ...style } as CSSProperties) : style}
            {...props}
        >
            {tooltip && state.cut ? <Tooltip label={children}>{text}</Tooltip> : text}
            {swapped ? <VisuallyHidden>{children}</VisuallyHidden> : null}
            {measured ? <span ref={probeRef} className="ow-truncate__probe" aria-hidden="true" /> : null}
        </Element>
    );
}
