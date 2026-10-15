import type { CSSProperties } from "react";

import { cx } from "@/utils/cx";
import type { DescriptionItemProps, DescriptionListProps } from "./DescriptionList.types";
export type { DescriptionItemProps, DescriptionListLayout, DescriptionListProps } from "./DescriptionList.types";

/**
 * Terms and their values, for detail pages, settings summaries and receipts: a `<dl>` with a DescriptionItem for each
 * pair. Horizontal by default, stacking in a narrow container; vertical; or a grid of columns.
 */
export function DescriptionList({
    layout = "horizontal",
    columns = 2,
    divided = false,
    density = "comfortable",
    termWidth,
    className,
    style,
    ...props
}: DescriptionListProps) {
    const width = typeof termWidth === "number" ? `${termWidth}px` : termWidth;
    return (
        <dl
            className={cx(
                "ow-description-list",
                `ow-description-list--${layout}`,
                `ow-description-list--${density}`,
                layout === "grid" && `ow-description-list--cols-${columns}`,
                divided && "ow-description-list--divided",
                className,
            )}
            style={width ? ({ "--ow-description-term-width": width, ...style } as CSSProperties) : style}
            {...props}
        />
    );
}

/** One term and its value in a DescriptionList, with an optional action at the end of the row. */
export function DescriptionItem({ term, children, action, span = 1, className, ...props }: DescriptionItemProps) {
    return (
        <div className={cx("ow-description-item", span !== 1 && `ow-description-item--span-${span}`, className)} {...props}>
            <dt className="ow-description-item__term">{term}</dt>
            <dd className={cx("ow-description-item__value", action != null && "ow-description-item__value--action")}>
                {action != null ? (
                    <>
                        <div className="ow-description-item__content">{children}</div>
                        <div className="ow-description-item__action">{action}</div>
                    </>
                ) : (
                    children
                )}
            </dd>
        </div>
    );
}
