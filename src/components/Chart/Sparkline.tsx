import type { CSSProperties } from "react";

import { cx } from "@/utils/cx";
import { colorOf } from "./chartUtils";
import type { SparklineProps } from "./Chart.types";

/**
 * A small line with no axes, for the shape of a trend beside a number or in a table cell. It's an image to screen
 * readers: say what it shows in its aria-label.
 */
export function Sparkline({ data, "aria-label": ariaLabel, color = 1, area = true, width = 120, height = 32, className }: SparklineProps) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    // 3px of room above and below, so the line and its end dot aren't cut off.
    const pad = 3;
    const y = (value: number) => pad + (1 - (value - min) / (max - min || 1)) * (height - pad * 2) - (max === min ? (height - pad * 2) / 2 : 0);
    const x = (i: number) => (data.length > 1 ? (i / (data.length - 1)) * 100 : 50);
    const line = data.map((value, i) => `${i ? "L" : "M"}${x(i).toFixed(2)} ${y(value).toFixed(2)}`).join("");
    const last = data.length - 1;

    return (
        <span
            role="img"
            aria-label={ariaLabel}
            className={cx("ow-sparkline", className)}
            style={{ width, height, "--ow-sparkline-color": colorOf(color, 0) } as CSSProperties}
        >
            {data.length ? (
                <>
                    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden="true">
                        {area ? <path className="ow-sparkline__area" d={`${line}L100 ${height}L0 ${height}Z`} /> : null}
                        <path className="ow-sparkline__line" d={line} vectorEffect="non-scaling-stroke" />
                    </svg>
                    {/* The end point is HTML, so the stretched drawing doesn't stretch it into an oval. */}
                    <span className="ow-sparkline__end" style={{ left: `${x(last)}%`, top: y(data[last]!) }} aria-hidden="true" />
                </>
            ) : null}
        </span>
    );
}
