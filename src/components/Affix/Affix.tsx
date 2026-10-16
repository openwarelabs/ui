import { useEffect, useRef, useState, type CSSProperties } from "react";

import { cx } from "@/utils/cx";
import type { AffixProps } from "./Affix.types";
export type { AffixProps, AffixMode, AffixPosition, AffixState } from "./Affix.types";

/**
 * Keeps an element at the top or bottom of the scroll area once it would scroll past: a toolbar, a page header, a bar of
 * actions. It knows when it's pinned, so it can gain a shadow or render differently, and tells you through `onChange`.
 *
 * By default it is `position: sticky`, and an IntersectionObserver on the element itself (with the root shrunk by the
 * offset plus a pixel) reports when it is pinned, so there are no scroll listeners. `mode="fixed"` is for layouts where
 * an ancestor clips overflow and sticky can't work.
 */
export function Affix({
    children,
    position = "top",
    offset = 0,
    container,
    mode = "sticky",
    onChange,
    zIndex,
    shadow = true,
    placeholder = true,
    disabled = false,
    as: Element = "div",
    className,
    style,
    ...props
}: AffixProps) {
    const elementRef = useRef<HTMLElement>(null);
    const anchorRef = useRef<HTMLDivElement>(null);
    const [affixed, setAffixed] = useState(false);
    const [fixedStyle, setFixedStyle] = useState<CSSProperties>();
    const [height, setHeight] = useState<number>();
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const reported = useRef(false);

    useEffect(() => {
        if (reported.current === affixed) return;
        reported.current = affixed;
        onChangeRef.current?.(affixed);
    }, [affixed]);

    // In sticky mode the element is observed; in fixed mode its placeholder is, as the element leaves the flow when pinned.
    // The root is shrunk by `offset + 1` on the pinned edge, so the element (or placeholder) crosses out of it exactly when
    // its edge reaches the pinned position, and the rects in the entry say which edge it left by.
    useEffect(() => {
        const target = mode === "fixed" ? anchorRef.current : elementRef.current;
        if (disabled || !target || typeof IntersectionObserver === "undefined") {
            setAffixed(false);
            return;
        }
        const margin = `${-(offset + 1)}px`;
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[entries.length - 1];
                if (!entry) return;
                const bounds = entry.rootBounds;
                const rect = entry.boundingClientRect;
                if (bounds) setAffixed(position === "top" ? rect.top < bounds.top : rect.bottom > bounds.bottom);
                else setAffixed(entry.isIntersecting && entry.intersectionRatio < 1);
            },
            {
                root: container?.current ?? null,
                rootMargin: position === "top" ? `${margin} 0px 0px 0px` : `0px 0px ${margin} 0px`,
                threshold: [0, 1],
            },
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, [mode, position, offset, disabled, container]);

    // Fixed mode: once pinned, the element takes the placeholder's left and width, and sits `offset` from the scroll
    // container's edge; it follows the window's scroll and resizes, since `fixed` is relative to the viewport.
    useEffect(() => {
        const anchor = anchorRef.current;
        const element = elementRef.current;
        if (mode !== "fixed" || !affixed || !anchor || !element) {
            setFixedStyle(undefined);
            setHeight(undefined);
            return;
        }
        setHeight(element.offsetHeight);
        const update = () => {
            const rect = anchor.getBoundingClientRect();
            const root = container?.current;
            const edge = root ? root.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
            setFixedStyle({
                position: "fixed",
                left: rect.left,
                width: rect.width,
                [position]: position === "top" ? edge.top + offset : window.innerHeight - edge.bottom + offset,
            });
        };
        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, { passive: true });
        const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(update);
        observer?.observe(anchor);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update);
            observer?.disconnect();
        };
    }, [mode, affixed, position, offset, container]);

    const element = (
        <Element
            ref={elementRef}
            className={cx(
                "ow-affix",
                `ow-affix--${position}`,
                mode === "fixed" && "ow-affix--fixed",
                shadow && "ow-affix--shadow",
                disabled && "ow-affix--disabled",
                className,
            )}
            data-affixed={affixed ? "true" : "false"}
            style={{ "--ow-affix-offset": `${offset}px`, zIndex, ...fixedStyle, ...style } as CSSProperties}
            {...props}
        >
            {typeof children === "function" ? children({ affixed }) : children}
        </Element>
    );
    if (mode !== "fixed") return element;
    return (
        <div ref={anchorRef} className="ow-affix__placeholder" style={placeholder ? { minHeight: height } : undefined}>
            {element}
        </div>
    );
}
