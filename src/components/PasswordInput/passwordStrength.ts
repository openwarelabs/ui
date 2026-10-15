import type { PasswordStrength } from "./PasswordInput.types";

/** The word for each score, from 0 to 4. */
export const strengthLabels = ["Very weak", "Weak", "Fair", "Good", "Strong"] as const;

// Passwords and words that lists of leaked passwords are full of. A password that contains one loses points.
const common = [
    "password",
    "passw0rd",
    "qwerty",
    "letmein",
    "welcome",
    "admin",
    "login",
    "iloveyou",
    "monkey",
    "dragon",
    "football",
    "baseball",
    "sunshine",
    "princess",
    "master",
    "shadow",
    "trustno1",
    "secret",
];

// Runs along the alphabet, the number row and the keyboard's rows.
const runs = ["abcdefghijklmnopqrstuvwxyz", "01234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

/** Whether the text has a run of four in a row, forwards or backwards, such as "1234", "dcba" or "qwer". */
function hasRun(text: string) {
    for (let index = 0; index + 4 <= text.length; index++) {
        const part = text.slice(index, index + 4);
        const reversed = [...part].reverse().join("");
        if (runs.some((run) => run.includes(part) || run.includes(reversed))) return true;
    }
    return false;
}

/** Turns common swaps back into letters, so "p@ssw0rd" reads as "password". */
const unleet = (text: string) =>
    text.replace(/[@4]/g, "a").replace(/3/g, "e").replace(/[1!|]/g, "i").replace(/0/g, "o").replace(/[$5]/g, "s").replace(/7/g, "t");

/**
 * A small, quick estimate of a password's strength, from 0 (very weak) to 4 (strong): points for length and for mixing
 * lower case, upper case, digits and symbols, less for common passwords, repeats, runs like "1234" and years. It runs
 * in the browser and sends nothing anywhere. It's a nudge, not a guarantee: check passwords against leaks on the server.
 */
export function passwordStrength(value: string): Required<PasswordStrength> {
    const length = [...value].length;
    if (!length) return { score: 0, label: strengthLabels[0] };

    const lower = value.toLowerCase();
    const plain = unleet(lower);
    if (common.includes(lower) || common.includes(plain)) return { score: 0, label: strengthLabels[0] };

    const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(value)).length;
    let points = [8, 12, 16, 20].filter((step) => length >= step).length + Math.max(0, classes - 1);

    if (common.some((word) => plain.includes(word))) points -= 2;
    if (/(.)\1\1/.test(value)) points -= 1;
    if (hasRun(lower)) points -= 1;
    if (/^\d+$/.test(value)) points -= 1;
    if (/(19|20)\d\d/.test(value)) points -= 1;

    let score = Math.max(0, Math.min(4, points - 1));
    // Short passwords stay weak however mixed they are.
    if (length < 8) score = Math.min(score, length < 6 ? 0 : 1);
    return { score: score as PasswordStrength["score"], label: strengthLabels[score] ?? strengthLabels[0] };
}
