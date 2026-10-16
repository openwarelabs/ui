import type { ReactNode } from "react";

import { ChevronRightIcon, CircleCheckIcon, InfoIcon, LightbulbIcon, OctagonAlertIcon, StickyNoteIcon, TriangleAlertIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type { CalloutProps, CalloutTone } from "./Callout.types";

export type { CalloutProps, CalloutTone, CalloutVariant } from "./Callout.types";

const titles: Record<CalloutTone, string> = {
    note: "Note",
    tip: "Tip",
    info: "Info",
    warning: "Warning",
    danger: "Danger",
    success: "Success",
};

const icons: Record<CalloutTone, ReactNode> = {
    note: <StickyNoteIcon size={16} />,
    tip: <LightbulbIcon size={16} />,
    info: <InfoIcon size={16} />,
    warning: <TriangleAlertIcon size={16} />,
    danger: <OctagonAlertIcon size={16} />,
    success: <CircleCheckIcon size={16} />,
};

/**
 * A note set apart from the text in docs and long-form writing: a tip, a warning before a step, a bit of context. It's
 * static content, not a message about the app's state: for that, use Alert; across the top of the page, Banner.
 */
export function Callout({
    tone = "note",
    title,
    icon,
    variant = "soft",
    collapsible = false,
    defaultOpen = false,
    as = "aside",
    className,
    children,
    ...props
}: CalloutProps) {
    const Element = as as "div";
    const heading = title === undefined || (collapsible && title === null) ? titles[tone] : title;
    const mark = icon === undefined ? icons[tone] : icon;
    const header =
        heading === null && mark === null ? null : (
            <>
                {mark === null ? null : (
                    <span className="ow-callout__icon" aria-hidden="true">
                        {mark}
                    </span>
                )}
                {heading === null ? null : <strong className="ow-callout__title">{heading}</strong>}
            </>
        );

    return (
        <Element
            role="note"
            className={cx("ow-callout", `ow-callout--${tone}`, `ow-callout--${variant}`, collapsible && "ow-callout--collapsible", className)}
            {...props}
        >
            {collapsible ? (
                <details className="ow-callout__details" open={defaultOpen}>
                    <summary className="ow-callout__header">
                        {header}
                        <span className="ow-callout__chevron" aria-hidden="true">
                            <ChevronRightIcon size={16} />
                        </span>
                    </summary>
                    <div className="ow-callout__body">{children}</div>
                </details>
            ) : (
                <>
                    {header ? <div className="ow-callout__header">{header}</div> : null}
                    <div className="ow-callout__body">{children}</div>
                </>
            )}
        </Element>
    );
}
