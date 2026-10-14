import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

import { cx } from "../../utils/cx";
import { buttonClassName } from "../Button/Button";

export interface PromptSuggestionProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    /** The suggested prompt, or a short title for it. Keep it to a few words on a pill. */
    children: ReactNode;
    /** A 16px lucide-react icon before the text. */
    icon?: ReactNode;
    /** A muted second line under the text, saying what the agent will do. Shown on cards. */
    description?: ReactNode;
    /** `pill` for a row of short prompts; `card` for a few larger starting points, each with a description.
     * @default "card" with a description, otherwise "pill" */
    variant?: "pill" | "card";
}

/**
 * A suggested prompt to start from: a quiet pill, or a card with a second line. It's a button: what it does on click,
 * filling the prompt box or sending at once, is up to you.
 */
export const PromptSuggestion = forwardRef<HTMLButtonElement, PromptSuggestionProps>(function PromptSuggestion(
    { children, icon, description, variant = description ? "card" : "pill", type = "button", className, ...buttonProps },
    ref,
) {
    if (variant === "card") {
        return (
            <button ref={ref} type={type} className={cx("ow-prompt-suggestion", "ow-prompt-suggestion--card", className)} {...buttonProps}>
                {icon ? <span className="ow-prompt-suggestion__icon">{icon}</span> : null}
                <span className="ow-prompt-suggestion__text">
                    <span className="ow-prompt-suggestion__title">{children}</span>
                    {description ? <span className="ow-prompt-suggestion__description">{description}</span> : null}
                </span>
            </button>
        );
    }
    return (
        <button
            ref={ref}
            type={type}
            className={cx(
                buttonClassName({ variant: "secondary", size: "sm", shape: "pill" }),
                "ow-prompt-suggestion",
                "ow-prompt-suggestion--pill",
                className,
            )}
            {...buttonProps}
        >
            {icon ? <span className="ow-prompt-suggestion__icon">{icon}</span> : null}
            <span className="ow-prompt-suggestion__label">{children}</span>
        </button>
    );
});

export interface PromptSuggestionsProps extends HTMLAttributes<HTMLDivElement> {
    /** PromptSuggestion buttons. */
    children: ReactNode;
    /** `wrap` runs pills along a line and onto the next; `grid` sets cards in equal columns that fold to one when
     * there's no room.
     * @default "wrap" */
    layout?: "wrap" | "grid";
    /** The most columns in a grid. Columns are at least 200px wide, so a narrow grid has fewer.
     * @default 2 */
    columns?: number;
    /** Where wrapped pills line up.
     * @default "start" */
    align?: "start" | "center";
    /** Names the set for screen readers.
     * @default "Suggested prompts" */
    "aria-label"?: string;
}

/** Suggested prompts, as a labelled group: pills that wrap, or cards in a grid. */
export function PromptSuggestions({
    children,
    layout = "wrap",
    columns = 2,
    align = "start",
    "aria-label": ariaLabel = "Suggested prompts",
    className,
    style,
    ...props
}: PromptSuggestionsProps) {
    return (
        <div
            role="group"
            aria-label={ariaLabel}
            className={cx("ow-prompt-suggestions", `ow-prompt-suggestions--${layout}`, align === "center" && "ow-prompt-suggestions--center", className)}
            style={layout === "grid" ? ({ "--ow-suggestion-columns": Math.max(1, Math.round(columns)), ...style } as CSSProperties) : style}
            {...props}
        >
            {children}
        </div>
    );
}
