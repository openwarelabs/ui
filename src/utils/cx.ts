type ClassValue = string | false | null | undefined | Record<string, boolean | undefined>;

/** Joins class names, skipping falsy ones; an object adds each key whose value is true. */
export function cx(...values: ClassValue[]): string {
    const classes: string[] = [];
    for (const value of values) {
        if (!value) continue;
        if (typeof value === "string") {
            classes.push(value);
            continue;
        }
        for (const [name, on] of Object.entries(value)) if (on) classes.push(name);
    }
    return classes.join(" ");
}
