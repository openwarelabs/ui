/** Dates as "YYYY-MM-DD" strings: no time, no time zone, so a date never shifts by a day. */
export type ISODate = string;

const pad = (n: number) => String(n).padStart(2, "0");

export function toISO(year: number, month: number, day: number): ISODate {
    // setUTCFullYear, not Date.UTC, which reads years 0–99 as 1900–1999. Months and days past the end roll over.
    const date = new Date(0);
    date.setUTCFullYear(year, month, day);
    return `${String(date.getUTCFullYear()).padStart(4, "0")}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function parseISO(iso: ISODate): { year: number; month: number; day: number } {
    const [year, month, day] = iso.split("-").map(Number);
    return { year: year!, month: month! - 1, day: day! };
}

export function todayISO(): ISODate {
    const now = new Date();
    return toISO(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(iso: ISODate, days: number): ISODate {
    const { year, month, day } = parseISO(iso);
    return toISO(year, month, day + days);
}

export function addMonths(iso: ISODate, months: number): ISODate {
    const { year, month, day } = parseISO(iso);
    const lastDay = new Date(Date.UTC(year, month + months + 1, 0)).getUTCDate();
    return toISO(year, month + months, Math.min(day, lastDay));
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(iso: ISODate): number {
    const { year, month, day } = parseISO(iso);
    return new Date(Date.UTC(year, month, day)).getUTCDay();
}

export function toDate(iso: ISODate): Date {
    const { year, month, day } = parseISO(iso);
    return new Date(Date.UTC(year, month, day));
}

export function formatDate(iso: ISODate, locale: string | undefined, options: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(toDate(iso));
}

/**
 * Two dates as one range in the locale, sharing what they have in common: "3 – 9 Oct 2026", "28 Sept – 4 Oct 2026".
 * The same day twice is written once.
 */
export function formatDateRange(start: ISODate, end: ISODate, locale: string | undefined, options: Intl.DateTimeFormatOptions): string {
    const format = new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" });
    if (typeof format.formatRangeToParts !== "function") {
        return start === end ? format.format(toDate(start)) : `${format.format(toDate(start))} – ${format.format(toDate(end))}`;
    }
    const parts = format.formatRangeToParts(toDate(start), toDate(end));
    // A bare en dash ("3–9 Oct") gets spaces, so a range reads as two dates; other locales' separators stay.
    return parts
        .map((part, index) => {
            const between = part.source === "shared" && parts[index - 1]?.source === "startRange" && parts[index + 1]?.source === "endRange";
            return between && part.value === "–" ? " – " : part.value;
        })
        .join("");
}

/** Keeps a date between min and max, when they're given. */
export function clampDate(date: ISODate, min: ISODate | undefined, max: ISODate | undefined): ISODate {
    if (min && date < min) return min;
    if (max && date > max) return max;
    return date;
}

/** The first day of the month a date falls in. */
export function startOfMonth(iso: ISODate): ISODate {
    const { year, month } = parseISO(iso);
    return toISO(year, month, 1);
}

/** Months counted from year 0, so two months can be compared and subtracted. */
export function monthIndex(iso: ISODate): number {
    const { year, month } = parseISO(iso);
    return year * 12 + month;
}

/** The six weeks a month grid shows for the month starting on `first`, each starting on `weekStartsOn`. */
export function monthWeeks(first: ISODate, weekStartsOn: 0 | 1): ISODate[][] {
    const offset = (weekday(first) - weekStartsOn + 7) % 7;
    const gridStart = addDays(first, -offset);
    return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d)));
}
