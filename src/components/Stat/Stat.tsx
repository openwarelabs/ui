import type { ReactNode } from "react";

import { ArrowDownIcon, ArrowUpIcon } from "../../icons";
import { cx } from "../../utils/cx";

export interface StatProps {
    /** What's measured, in a few words: "Tokens this week". */
    label: ReactNode;
    /** The number, formatted: "1.2M", "€48.20". */
    value: ReactNode;
    /** A 14px icon on a small tile beside the label. */
    icon?: ReactNode;
    /** The change since last time, as text: "+12%", "−3". */
    change?: string;
    /** Whether the change is good or bad. Worked out from a leading + or − when left out; costs going up are negative, so set it. */
    changeTone?: "positive" | "negative" | "neutral";
    /** A muted line under the value: "vs last week". */
    description?: ReactNode;
    /** Recent values for a small line chart under the number. */
    trend?: number[];
    className?: string;
}

function Sparkline({ values }: { values: number[] }) {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const span = max - min || 1;
    const points = values.map((value, index) => {
        const x = (index / (values.length - 1)) * 100;
        const y = 36 - ((value - min) / span) * 32;
        return [x, y] as const;
    });
    const line = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
    const [lastX, lastY] = points[points.length - 1]!;
    return (
        <div className="ow-stat__trend" aria-hidden="true">
            <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d={`${line} L100 40 L0 40 Z`} className="ow-stat__trend-area" />
                <path d={line} className="ow-stat__trend-line" vectorEffect="non-scaling-stroke" />
            </svg>
            {/* The end point is HTML, so the stretched chart doesn't stretch it into an oval. */}
            <span className="ow-stat__trend-end" style={{ left: `${lastX}%`, top: `${(lastY / 40) * 100}%` }} />
        </div>
    );
}

/** One headline number with its label, change and trend, like Commandr's overview cards. */
export function Stat({ label, value, icon, change, changeTone, description, trend, className }: StatProps) {
    const tone = changeTone ?? (change?.startsWith("+") ? "positive" : /^[-−]/.test(change ?? "") ? "negative" : "neutral");
    const rising = change ? !/^[-−]/.test(change) : false;
    return (
        <div className={cx("ow-stat", className)}>
            <div className="ow-stat__label">
                {icon ? <span className="ow-stat__icon">{icon}</span> : null}
                <span>{label}</span>
            </div>
            <div className="ow-stat__row">
                <span className="ow-stat__value">{value}</span>
                {change ? (
                    <span className={cx("ow-stat__change", `ow-stat__change--${tone}`)}>
                        {tone === "neutral" ? null : rising ? <ArrowUpIcon size={12} /> : <ArrowDownIcon size={12} />}
                        {change}
                    </span>
                ) : null}
            </div>
            {description ? <div className="ow-stat__description">{description}</div> : null}
            {trend && trend.length > 1 ? <Sparkline values={trend} /> : null}
        </div>
    );
}
