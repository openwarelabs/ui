import { useEffect, useMemo, useState } from "react";

import { Tooltip } from "@/components/Tooltip/Tooltip";
import { cx } from "@/utils/cx";
import type { RelativeTimeProps } from "./Countdown.types";
export type { RelativeTimeProps, TimeInput } from "./Countdown.types";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** The unit each span of time is said in: under a minute in seconds, under an hour in minutes, and so on. */
const steps: Array<[limit: number, unit: Intl.RelativeTimeFormatUnit, size: number]> = [
    [MINUTE, "second", SECOND],
    [HOUR, "minute", MINUTE],
    [DAY, "hour", HOUR],
    [7 * DAY, "day", DAY],
    [30 * DAY, "week", 7 * DAY],
    [365 * DAY, "month", 30 * DAY],
    [Infinity, "year", 365 * DAY],
];

/** "3 minutes ago", "in 2 days", or with `numeric: "auto"` "yesterday" and "now". */
export function formatRelativeTime(
    date: Date,
    now: Date,
    options: { locale?: string; numeric?: "auto" | "always"; style?: "long" | "short" | "narrow" } = {},
): string {
    const diff = date.getTime() - now.getTime();
    const abs = Math.abs(diff);
    const [, unit, size] = steps.find(([limit]) => abs < limit)!;
    const value = Math.round(diff / size);
    const formatter = new Intl.RelativeTimeFormat(options.locale, { numeric: options.numeric ?? "auto", style: options.style ?? "long" });
    // Rounding can give -0, which Intl would read as "0 seconds ago" rather than "now".
    return formatter.format(value === 0 ? 0 : value, unit);
}

/**
 * A moment as people say it: "3 minutes ago", "in 2 days". It's a `<time>` with the exact moment in `dateTime`
 * and the full date in its `title`, and it keeps itself up to date.
 */
export function RelativeTime({
    date,
    locale,
    numeric = "auto",
    style = "long",
    threshold,
    dateStyle = "medium",
    format,
    live = true,
    tooltip = false,
    className,
    ...props
}: RelativeTimeProps) {
    const time = useMemo(() => new Date(date), [date]);
    const valid = !Number.isNaN(time.getTime());
    // The first render, on the server too, reads the clock as it is; on hydration the client patches the words if
    // they've changed in between, which is what suppressHydrationWarning is for.
    const [now, setNow] = useState(() => Date.now());

    const absolute = threshold !== undefined && Math.abs(time.getTime() - now) >= threshold * DAY;

    useEffect(() => {
        if (!live || !valid || absolute) return undefined;
        // Worked out from the clock each time, not by counting, so a tab left in the background catches up.
        const abs = Math.abs(time.getTime() - Date.now());
        const delay = abs < MINUTE ? SECOND : abs < HOUR ? MINUTE : HOUR;
        const id = window.setTimeout(() => setNow(Date.now()), delay);
        return () => window.clearTimeout(id);
    }, [live, valid, absolute, time, now]);

    if (!valid) {
        return (
            <time className={cx("ow-relative-time", className)} {...props}>
                {String(date)}
            </time>
        );
    }

    const full = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" }).format(time);
    const text = format
        ? format(time, new Date(now))
        : absolute
          ? new Intl.DateTimeFormat(locale, { dateStyle }).format(time)
          : formatRelativeTime(time, new Date(now), { locale, numeric, style });

    const element = (
        <time className={cx("ow-relative-time", className)} dateTime={time.toISOString()} title={tooltip ? undefined : full} suppressHydrationWarning {...props}>
            {text}
        </time>
    );

    return tooltip ? <Tooltip label={full}>{element}</Tooltip> : element;
}
