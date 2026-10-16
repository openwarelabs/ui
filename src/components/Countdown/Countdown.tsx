import { useEffect, useMemo, useRef, useState } from "react";

import { cx } from "@/utils/cx";
import type { CountdownLabels, CountdownParts, CountdownProps, CountdownUnit } from "./Countdown.types";
export type { CountdownLabels, CountdownParts, CountdownProps, CountdownUnit } from "./Countdown.types";

const allUnits: CountdownUnit[] = ["days", "hours", "minutes", "seconds"];
const secondsIn: Record<CountdownUnit, number> = { days: 86400, hours: 3600, minutes: 60, seconds: 1 };
const defaultLabels: Required<CountdownLabels> = { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" };

/** Splits a number of seconds into the units given; the largest unit takes whatever is above it. */
export function splitCountdown(total: number, units: CountdownUnit[]): CountdownParts {
    const parts: CountdownParts = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    let left = Math.max(0, total);
    for (const unit of allUnits) {
        if (!units.includes(unit)) continue;
        parts[unit] = Math.floor(left / secondsIn[unit]);
        left -= parts[unit] * secondsIn[unit];
    }
    return parts;
}

/** "2 days, 14 hours and 9 minutes", for the live announcement; seconds are left out so it changes once a minute. */
function describe(parts: CountdownParts, units: CountdownUnit[], labels: Required<CountdownLabels>): string {
    const words = units
        .filter((unit) => unit !== "seconds" && parts[unit] > 0)
        .map((unit) => `${parts[unit]} ${labels[unit].toLowerCase().replace(/s$/, parts[unit] === 1 ? "" : "s")}`);
    if (words.length === 0) return `under a ${labels.minutes.toLowerCase().replace(/s$/, "")}`;
    return words.length > 1 ? `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}` : words[0]!;
}

/**
 * The time left until a moment, as segments with their units under them: a launch timer. It reads the clock on
 * every tick, so it stays right however long the page is open, and it stops at zero.
 */
export function Countdown({
    to,
    units,
    onComplete,
    completeText,
    size = "md",
    variant = "boxes",
    padZeros = true,
    labels,
    live = true,
    announce = "minute",
    label,
    className,
    ...props
}: CountdownProps) {
    const target = useMemo(() => new Date(to).getTime(), [to]);
    // The first render, on the server too, reads the clock as it is; on hydration the client patches the numbers if
    // they've moved on, which is what suppressHydrationWarning is for.
    const [now, setNow] = useState(() => Date.now());
    const remaining = Number.isNaN(target) ? 0 : target - now;
    const complete = remaining <= 0;
    const words = { ...defaultLabels, ...labels };

    useEffect(() => {
        if (!live || complete) return undefined;
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, [live, complete]);

    // onComplete fires on the way down to zero, not for a moment that had already passed when it mounted.
    const running = useRef(false);
    useEffect(() => {
        if (!complete) running.current = true;
        else if (running.current) {
            running.current = false;
            onComplete?.();
        }
    }, [complete, onComplete]);

    const parts = splitCountdown(Math.floor(remaining / 1000), units ?? allUnits);
    const visible = units ?? (parts.days > 0 ? allUnits : allUnits.filter((unit) => unit !== "days"));
    const digits = (value: number) => (padZeros ? String(value).padStart(2, "0") : String(value));
    const showText = complete && completeText !== undefined;

    return (
        <div
            role="timer"
            aria-live="off"
            aria-atomic="true"
            aria-label={label}
            className={cx("ow-countdown", `ow-countdown--${variant}`, `ow-countdown--${size}`, complete && "ow-countdown--complete", className)}
            {...props}
        >
            {showText ? (
                <span className="ow-countdown__complete">{completeText}</span>
            ) : (
                visible.map((unit, index) => (
                    <span key={unit} className="ow-countdown__segment">
                        {index > 0 ? (
                            <span className="ow-countdown__separator" aria-hidden="true">
                                :
                            </span>
                        ) : null}
                        <span className="ow-countdown__box">
                            <span className="ow-countdown__value" suppressHydrationWarning>
                                {digits(parts[unit])}
                            </span>
                            <span className="ow-countdown__label">{words[unit]}</span>
                        </span>
                    </span>
                ))
            )}
            {announce === "minute" ? (
                <span className="ow-visually-hidden" aria-live="polite" aria-atomic="true">
                    {complete ? (typeof completeText === "string" ? completeText : "Complete") : `${describe(parts, visible, words)} left`}
                </span>
            ) : null}
        </div>
    );
}
