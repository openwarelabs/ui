import type { ReactNode } from "react";

import { InboxIcon } from "../../icons";
import { cx } from "../../utils/cx";

export interface EmptyStateProps {
    /** What's missing, as a plain statement: "No projects yet". */
    title: ReactNode;
    /** What to do about it, in a sentence. */
    description?: ReactNode;
    /** A 20px icon on a tile.
     * @default <InboxIcon /> */
    icon?: ReactNode;
    /** One primary Button, and maybe a secondary one. */
    actions?: ReactNode;
    /** Draws a dashed outline around it, for an empty area inside a page.
     * @default false */
    bordered?: boolean;
    className?: string;
}

/** What a list, table or panel shows when there's nothing in it yet, and the way to add the first thing. */
export function EmptyState({ title, description, icon, actions, bordered = false, className }: EmptyStateProps) {
    return (
        <div className={cx("ow-empty", bordered && "ow-empty--bordered", className)}>
            <span className="ow-empty__icon" aria-hidden="true">
                {icon ?? <InboxIcon size={20} />}
            </span>
            <div className="ow-empty__text">
                <p className="ow-empty__title">{title}</p>
                {description ? <p className="ow-empty__description">{description}</p> : null}
            </div>
            {actions ? <div className="ow-empty__actions">{actions}</div> : null}
        </div>
    );
}
