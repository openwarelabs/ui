import type { HTMLAttributes, JSX, ReactNode } from "react";

import { cx } from "../../utils/cx";

/** The text styles on the Typography page, by the same names: `lead` is the class ow-type-lead. */
export type TextVariant =
    | "hero"
    | "page-title"
    | "section-title"
    | "heading"
    | "lead"
    | "prose"
    | "dialog-title"
    | "card-title"
    | "body"
    | "copy"
    | "label"
    | "button"
    | "caption"
    | "badge"
    | "overline"
    | "code"
    | "kbd";

export type TextTone = "default" | "soft" | "muted" | "primary" | "danger" | "success" | "warning";

export interface TextProps extends HTMLAttributes<HTMLElement> {
    /** Which text style: size, leading, weight and tracking from the Typography page. The display styles shrink on phones.
     * @default "body" */
    variant?: TextVariant;
    /** The element, for the page's outline. Defaults to one that suits the variant: h1 for hero and page-title, h2 for
     * section-title, h3 for heading and the titles, p for running text, span for the rest. */
    as?: keyof JSX.IntrinsicElements;
    /** The colour. Left out, lead, copy, caption and overline are muted, as the styles ask, and the rest take the
     * colour around them. */
    tone?: TextTone;
    /** @default "start" */
    align?: "start" | "center" | "end";
    /** One line, cut off with an ellipsis.
     * @default false */
    truncate?: boolean;
    children?: ReactNode;
}

const elements: Record<TextVariant, keyof JSX.IntrinsicElements> = {
    hero: "h1",
    "page-title": "h1",
    "section-title": "h2",
    heading: "h3",
    lead: "p",
    prose: "p",
    "dialog-title": "h2",
    "card-title": "h3",
    body: "p",
    copy: "p",
    label: "span",
    button: "span",
    caption: "span",
    badge: "span",
    overline: "span",
    code: "code",
    kbd: "kbd",
};

const mutedByDefault: TextVariant[] = ["lead", "copy", "caption", "overline"];

/**
 * Text in one of Openware's styles: `<Text variant="lead">`. The variant sets the look and a sensible element;
 * `as` changes the element without changing the look, so the outline stays right.
 */
export function Text({ variant = "body", as, tone, align, truncate = false, className, children, ...props }: TextProps) {
    const Element = (as ?? elements[variant]) as "p";
    const colour = tone ?? (mutedByDefault.includes(variant) ? "muted" : undefined);
    return (
        <Element
            className={cx(
                "ow-text",
                `ow-type-${variant}`,
                `ow-text--${variant}`,
                colour && `ow-text--${colour}`,
                align && align !== "start" && `ow-text--${align}`,
                truncate && "ow-text--truncate",
                className,
            )}
            {...props}
        >
            {children}
        </Element>
    );
}
