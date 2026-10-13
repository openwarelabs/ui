import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cx } from "../../utils/cx";
import { toAriaShortcut } from "../../utils/text";

export interface ChoiceCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
    title: string;
    /** One line under the title saying what this choice does. */
    description: string;
    /** A 20px lucide-react icon, shown on a tinted tile. */
    icon: ReactNode;
    /** Marks the recommended choice with a tinted border. */
    recommended?: boolean;
    /** Keyboard shortcut shown in the top-right corner, e.g. "⌘N". Only pass one that actually works. */
    shortcut?: string;
}

/** A large, card-shaped button for picking between a few options, e.g. on an empty state. */
export const ChoiceCard = forwardRef<HTMLButtonElement, ChoiceCardProps>(function ChoiceCard(
    { className, description, icon, recommended = false, shortcut, title, type = "button", ...buttonProps },
    ref,
) {
    return (
        <button
            ref={ref}
            className={cx("ow-choice", recommended && "ow-choice--recommended", className)}
            type={type}
            aria-keyshortcuts={shortcut ? toAriaShortcut(shortcut) : undefined}
            {...buttonProps}
        >
            <span className="ow-choice__top">
                <span className="ow-choice__icon">{icon}</span>
                {shortcut ? (
                    <kbd aria-hidden="true" className="ow-choice__shortcut">
                        {shortcut}
                    </kbd>
                ) : null}
            </span>
            <span className="ow-choice__text">
                <span className="ow-choice__title">{title}</span>
                <span className="ow-choice__description">{description}</span>
            </span>
        </button>
    );
});
