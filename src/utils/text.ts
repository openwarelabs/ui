/** "Alex Silver" → "AS", "alex" → "A". Empty input returns "". */
export function getInitials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    const first = words[0]?.[0] ?? "";
    const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";

    return `${first}${last}`.toUpperCase();
}

/** "⌘N" → "Meta+N", "Ctrl+O" → "Control+O", for aria-keyshortcuts. */
export function toAriaShortcut(shortcut: string): string {
    return shortcut.replace("⌘", "Meta+").replace("Ctrl+", "Control+");
}
