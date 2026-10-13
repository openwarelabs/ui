/** Dates as "YYYY-MM-DD" strings: no time, no time zone, so a date never shifts by a day. */
export type ISODate = string;

const pad = (n: number) => String(n).padStart(2, "0");

export function toISO(year: number, month: number, day: number): ISODate {
    const date = new Date(Date.UTC(year, month, day));
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
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
