import { useRef, type HTMLAttributes, type PointerEvent, type ReactNode } from "react";

import { cx } from "../../utils/cx";

/** A white pill with a brass dot that names a section, set just above its title. */
export function Chip({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
    return <span className={cx("ow-chip", className)} {...props} />;
}

export interface SectionHeadingProps {
    /** One to three words for the Chip above the title. */
    eyebrow?: ReactNode;
    title: ReactNode;
    /** One or two sentences under the title. */
    intro?: ReactNode;
    /** @default "start" */
    align?: "start" | "center";
    /** The heading level.
     * @default "h2" */
    as?: "h1" | "h2" | "h3";
    className?: string;
}

/** How a marketing section opens: a Chip, a big light title, then an intro in muted text. */
export function SectionHeading({
    eyebrow,
    title,
    intro,
    align = "start",
    as: Heading = "h2",
    className,
}: SectionHeadingProps) {
    return (
        <div className={cx("ow-section-heading", align === "center" && "ow-section-heading--center", className)}>
            {eyebrow ? <Chip>{eyebrow}</Chip> : null}
            <Heading className="ow-section-heading__title">{title}</Heading>
            {intro ? <p className="ow-section-heading__intro">{intro}</p> : null}
        </div>
    );
}

export interface SiteHeaderProps {
    /** Your logo or name, usually a link home. */
    brand: ReactNode;
    /** Links in the middle; hidden under 760px wide. */
    nav?: ReactNode;
    /** On the right: one primary Button with shape="pill". */
    actions?: ReactNode;
    className?: string;
}

/** The marketing site's header: a floating white pill over a blur, with a hairline border and a soft shadow. */
export function SiteHeader({ brand, nav, actions, className }: SiteHeaderProps) {
    return (
        <header className={cx("ow-site-header", className)}>
            <div className="ow-site-header__brand">{brand}</div>
            {nav ? <nav className="ow-site-header__nav">{nav}</nav> : null}
            {actions ? <div className="ow-site-header__actions">{actions}</div> : null}
        </header>
    );
}

export interface DotGridProps extends HTMLAttributes<HTMLDivElement> {
    /** Fades the dots out toward the edges.
     * @default false */
    fade?: boolean;
    /** Turns the dots under the pointer brass.
     * @default false */
    interactive?: boolean;
}

/** A ground of 1px dots every 22px, like a sheet laid out for planning. Content goes inside. */
export function DotGrid({ fade = false, interactive = false, className, children, onPointerMove, ...props }: DotGridProps) {
    const ref = useRef<HTMLDivElement>(null);

    function track(event: PointerEvent<HTMLDivElement>) {
        onPointerMove?.(event);
        const element = ref.current;
        if (!interactive || !element) return;
        const rect = element.getBoundingClientRect();
        element.style.setProperty("--ow-pointer-x", `${event.clientX - rect.left}px`);
        element.style.setProperty("--ow-pointer-y", `${event.clientY - rect.top}px`);
    }

    return (
        <div
            ref={ref}
            className={cx("ow-dot-grid", fade && "ow-dot-grid--fade", interactive && "ow-dot-grid--interactive", className)}
            onPointerMove={track}
            {...props}
        >
            <span className="ow-dot-grid__dots" aria-hidden="true" />
            {interactive ? (
                <span className="ow-dot-grid__brass" aria-hidden="true" />
            ) : null}
            <div className="ow-dot-grid__content">{children}</div>
        </div>
    );
}
