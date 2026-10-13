import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type HTMLAttributes,
    type JSX,
    type ReactNode,
} from "react";

import { cx } from "../../utils/cx";

export type SpaceToken = "none" | "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";

const space = (token: SpaceToken) => (token === "none" ? "0" : `var(--ow-space-${token})`);

export interface StackProps extends HTMLAttributes<HTMLElement> {
    /** @default "column" */
    direction?: "row" | "column";
    /** The space between children, from the spacing scale.
     * @default "md" */
    gap?: SpaceToken;
    /** Cross-axis alignment. */
    align?: "start" | "center" | "end" | "stretch" | "baseline";
    /** Main-axis alignment. */
    justify?: "start" | "center" | "end" | "between";
    /** Lets a row wrap onto more lines.
     * @default false */
    wrap?: boolean;
    /** The element to render.
     * @default "div" */
    as?: keyof JSX.IntrinsicElements;
    children?: ReactNode;
}

const alignments = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch", baseline: "baseline", between: "space-between" };

/** Lays children out in a row or a column with a gap from the spacing scale. */
export function Stack({
    direction = "column",
    gap = "md",
    align,
    justify,
    wrap = false,
    as = "div",
    className,
    style,
    children,
    ...props
}: StackProps) {
    const Element = as as "div";
    return (
        <Element
            className={cx("ow-stack", className)}
            style={{
                flexDirection: direction,
                gap: space(gap),
                alignItems: align ? alignments[align] : undefined,
                justifyContent: justify ? alignments[justify] : undefined,
                flexWrap: wrap ? "wrap" : undefined,
                ...style,
            }}
            {...props}
        >
            {children}
        </Element>
    );
}

export interface SeparatorProps {
    /** @default "horizontal" */
    orientation?: "horizontal" | "vertical";
    /** Text in the middle of a horizontal line, such as "or". */
    label?: ReactNode;
    /** Space before and after, from the spacing scale.
     * @default "none" */
    spacing?: SpaceToken;
    className?: string;
}

/** A hairline between groups of content. Prefer space; use a line when space alone doesn't separate. */
export function Separator({ orientation = "horizontal", label, spacing = "none", className }: SeparatorProps) {
    const margin = orientation === "horizontal" ? `${space(spacing)} 0` : `0 ${space(spacing)}`;
    if (label && orientation === "horizontal") {
        return (
            <div role="separator" className={cx("ow-separator-label", className)} style={{ margin }}>
                <span className="ow-separator-label__text">{label}</span>
            </div>
        );
    }
    return (
        <div
            role="separator"
            aria-orientation={orientation}
            className={cx("ow-separator", `ow-separator--${orientation}`, className)}
            style={{ margin }}
        />
    );
}

export interface ScrollShadowProps extends HTMLAttributes<HTMLDivElement> {
    /** @default "vertical" */
    orientation?: "vertical" | "horizontal";
    /** How far the fade reaches, in pixels.
     * @default 32 */
    size?: number;
    /** Its height (vertical) or width; it scrolls past this. */
    maxSize?: number | string;
    /** Names the area; with it, the area becomes a focusable region so keyboards can scroll it. */
    "aria-label"?: string;
    children: ReactNode;
}

/** A scrolling area whose edges fade out where there's more to scroll, so nothing looks cut off. */
export function ScrollShadow({
    orientation = "vertical",
    size = 32,
    maxSize,
    className,
    style,
    children,
    "aria-label": ariaLabel,
    ...props
}: ScrollShadowProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [edges, setEdges] = useState({ start: false, end: false });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const update = () => {
            const position = orientation === "vertical" ? element.scrollTop : element.scrollLeft;
            const extent = orientation === "vertical" ? element.scrollHeight - element.clientHeight : element.scrollWidth - element.clientWidth;
            setEdges({ start: position > 1, end: position < extent - 1 });
        };
        update();
        element.addEventListener("scroll", update, { passive: true });
        const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(update);
        observer?.observe(element);
        if (element.firstElementChild) observer?.observe(element.firstElementChild);
        return () => {
            element.removeEventListener("scroll", update);
            observer?.disconnect();
        };
    }, [orientation]);

    return (
        <div
            ref={ref}
            className={cx("ow-scroll-shadow", `ow-scroll-shadow--${orientation}`, className)}
            data-start={edges.start || undefined}
            data-end={edges.end || undefined}
            tabIndex={ariaLabel ? 0 : undefined}
            role={ariaLabel ? "region" : undefined}
            aria-label={ariaLabel}
            style={
                {
                    "--ow-scroll-shadow": `${size}px`,
                    [orientation === "vertical" ? "maxHeight" : "maxWidth"]: maxSize,
                    ...style,
                } as CSSProperties
            }
            {...props}
        >
            {children}
        </div>
    );
}

/** Hides content visually but keeps it for screen readers: extra context for an icon, a table caption. */
export function VisuallyHidden({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
    return <span className={cx("ow-visually-hidden", className)} {...props} />;
}
