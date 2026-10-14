import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction } from "@blocks/shared/shared.types";

export interface SectionHeading03Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line in a Chip above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading, on the left. */
    title: ReactNode;
    /** A sentence or two, on the right beside the title (under it on smaller screens). */
    description?: ReactNode;
    /** A button under the description, as a secondary pill: "How agents work". */
    action?: BlockAction;
}
