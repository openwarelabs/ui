import type { Command } from "./CommandPalette";

/** How well a query matches some text: prefix and word-start matches beat letters in order; 0 = no match. */
function score(query: string, text: string, loose = true): number {
    const haystack = text.toLowerCase();
    if (haystack.startsWith(query)) return 100 - Math.min(haystack.length, 50) / 10;
    const wordStart = haystack.indexOf(` ${query}`);
    if (wordStart >= 0) return 80 - wordStart / 10;
    const anywhere = haystack.indexOf(query);
    if (anywhere >= 0) return 60 - anywhere / 10;
    if (!loose) return 0;
    // Letters in order ("rnp" → "Run pipeline"), only against titles: in long keyword text almost anything matches.
    let position = 0;
    let gaps = 0;
    for (const letter of query) {
        const found = haystack.indexOf(letter, position);
        if (found < 0) return 0;
        gaps += found - position;
        position = found + 1;
    }
    return Math.max(1, 40 - gaps);
}

/** Commands matching every word of the query, best first; with no query, the list as given. */
export function filterCommands(commands: Command[], query: string): Command[] {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return commands;
    return commands
        .map((command, index) => {
            const extra = `${command.group ?? ""} ${command.keywords ?? ""} ${command.hint ?? ""}`;
            let total = 0;
            for (const word of words) {
                const best = Math.max(score(word, command.title) * 1.5, score(word, extra, false));
                if (!best) return undefined;
                total += best;
            }
            // Runnable commands first, then the original order among equals.
            return { command, rank: total - (command.disabled ? 50 : 0) - index / 1000 };
        })
        .filter((entry): entry is { command: Command; rank: number } => Boolean(entry))
        .sort((a, b) => b.rank - a.rank)
        .map((entry) => entry.command);
}
