import { useEffect, useState, type CSSProperties } from "react";

import { cx } from "../../utils/cx";

export interface SkeletonProps {
    /** CSS width, e.g. "40%" or 120. Default 100%. */
    width?: CSSProperties["width"];
    /** CSS height. Default 14px. */
    height?: CSSProperties["height"];
    /** The lighter grey, for second lines and control shapes. */
    soft?: boolean;
    /** `bar` has round ends; `block` has the field corners, for control placeholders. */
    shape?: "bar" | "block";
    className?: string;
}

/** One grey placeholder bar. Wrap a group of them in something with role="status" and a label. */
export function Skeleton({ width = "100%", height = 14, soft = false, shape = "bar", className }: SkeletonProps) {
    return (
        <span
            className={cx("ow-skeleton", soft && "ow-skeleton--soft", shape === "block" && "ow-skeleton--block", className)}
            style={{ width, height }}
            aria-hidden="true"
        />
    );
}

export interface SkeletonRowsProps {
    /** Read out by screen readers while it's showing. Default "Loading". */
    label?: string;
    rows?: number;
    /** Waits this long before appearing, so content that loads quickly never flashes it. Default 150. */
    delayMs?: number;
}

/**
 * A placeholder in the shape of settings rows (a label and description on the left, a control on the right),
 * so a panel keeps its layout while it loads.
 */
export function SkeletonRows({ label = "Loading", rows = 4, delayMs = 150 }: SkeletonRowsProps) {
    const [isVisible, setIsVisible] = useState(delayMs === 0);

    useEffect(() => {
        if (delayMs === 0) return;
        const timer = window.setTimeout(() => setIsVisible(true), delayMs);
        return () => window.clearTimeout(timer);
    }, [delayMs]);

    return (
        <div role="status" aria-label={label} aria-busy="true">
            {isVisible ? (
                <div className="ow-skeleton-rows" aria-hidden="true">
                    {Array.from({ length: rows }, (_, index) => (
                        <div key={index} className="ow-skeleton-rows__row">
                            <div className="ow-skeleton-rows__text">
                                <Skeleton width={`${28 + ((index * 17) % 22)}%`} height={14} />
                                <Skeleton width={`${46 + ((index * 23) % 30)}%`} height={12} soft />
                            </div>
                            <Skeleton width={96} height={32} soft shape="block" />
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
