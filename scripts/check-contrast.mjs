// Checks that every text, icon and focus pair the components use meets WCAG contrast in every theme.
// Run after changing tokens/tokens.json: npm run contrast
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatHex, parse, wcagContrast } from "culori";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tokens = JSON.parse(fs.readFileSync(path.join(root, "tokens/tokens.json"), "utf8"));
const byName = Object.fromEntries(tokens.color.tokens.map((token) => [token.name, token.value]));
const themes = tokens.color.themes.map((theme) => theme.id);

function raw(name, theme) {
    let value = byName[name];
    if (value === undefined) throw new Error(`No colour token ${name}`);
    if (typeof value === "object") value = value[theme] ?? value[themes[0]];
    const alias = /^\{(.+)\}$/.exec(value);
    return alias ? raw(alias[1], theme) : value;
}

/** A colour as it shows: a translucent one is laid over its ground first. */
function shown(name, theme, ground = "ow-surface") {
    const value = raw(name, theme);
    // color-mix(in srgb, var(--ow-x) 14%, transparent) is that token at 14% opacity.
    const mix = /^color-mix\(in srgb, var\(--(ow-[a-z0-9-]+)\) ([0-9.]+)%, transparent\)$/.exec(value);
    const colour = mix ? { ...parse(shown(mix[1], theme)), alpha: Number(mix[2]) / 100 } : parse(value);
    if (!colour) throw new Error(`Can't read ${name} (${value}) in ${theme}`);
    if (colour.alpha === undefined || colour.alpha >= 1) return formatHex(colour);
    const under = parse(shown(ground, theme));
    const a = colour.alpha;
    return formatHex({ mode: "rgb", r: colour.r * a + under.r * (1 - a), g: colour.g * a + under.g * (1 - a), b: colour.b * a + under.b * (1 - a) });
}

// [foreground, background, minimum]
const text = 4.5;
const mark = 3;
const pairs = [
    ["ow-text", "ow-surface", text], ["ow-text", "ow-canvas", text], ["ow-text", "ow-surface-muted", text], ["ow-text", "ow-hover", text],
    ["ow-text-soft", "ow-control", text], ["ow-text-soft", "ow-control-shade", text], ["ow-text-soft", "ow-surface-muted", text], ["ow-text-soft", "ow-canvas", text],
    ["ow-text-muted", "ow-surface", text], ["ow-text-muted", "ow-canvas", text], ["ow-text-muted", "ow-surface-muted", text],
    ["ow-text-muted", "ow-control-shade", text], ["ow-text-muted", "ow-paper", text], ["ow-text-muted", "ow-primary-subtle", text],
    ["ow-on-primary", "ow-primary", text], ["ow-on-primary", "ow-primary-hover", text],
    ["ow-primary-text", "ow-surface", text], ["ow-primary-text", "ow-primary-subtle", text], ["ow-text", "ow-primary-subtle", text],
    ["ow-focus-ring", "ow-surface", mark], ["ow-focus-ring", "ow-canvas", mark], ["ow-focus-ring", "ow-surface-muted", mark], ["ow-focus-ring", "ow-paper", mark],
    ["ow-focus-border", "ow-surface", mark],
    ["ow-brass-deep", "ow-surface", text], ["ow-brass-deep", "ow-paper", text], ["ow-brass-deep", "ow-brass-soft", text],
    ["ow-danger-text", "ow-surface", text], ["ow-danger-text", "ow-danger-surface", text], ["ow-danger-text", "ow-danger-wash", mark],
    ["ow-success-text", "ow-surface", text], ["ow-success-text", "ow-success-surface", text],
    ["ow-warning-text", "ow-surface", text], ["ow-warning-text", "ow-warning-surface", text],
    ["ow-on-primary", "ow-danger-fill", text],
    ["ow-on-tooltip", "ow-tooltip", text],
    ["ow-text", "ow-code-ground", text], ["ow-text-soft", "ow-key-ground", text],
    ["ow-on-avatar-empty", "ow-avatar-empty", mark],
    ["ow-text", "ow-thumb", text], ["ow-text-muted", "ow-track", text], ["ow-text-soft", "ow-track", text],
    ["ow-progress", "ow-meter-track", mark], ["ow-progress", "ow-surface", mark], ["ow-progress", "ow-canvas", mark],
    ["ow-on-code-block", "ow-code-block", text], ["ow-on-code-block-muted", "ow-code-block", text], ["ow-on-code-block-muted", "ow-code-block-header", text],
    ["ow-primary-text", "ow-track", text], ["ow-danger-text", "ow-danger-surface", text],
    ["ow-success-text", "ow-meter-track", mark], ["ow-warning-text", "ow-meter-track", mark], ["ow-danger-text", "ow-meter-track", mark],
    ["ow-primary-text", "ow-primary-subtle", text], ["ow-warning-text", "ow-warning-surface", text],
    ["ow-text", "ow-success-surface", text], ["ow-text", "ow-warning-surface", text], ["ow-text", "ow-danger-surface", text],
];

// Pairs the source keeps below the line on purpose; listed so a change to them is noticed.
const knownLow = new Set(["ow-on-primary on ow-danger-solid"]);

let failures = 0;
for (const theme of themes) {
    for (const [fg, bg, min] of pairs) {
        const ratio = wcagContrast(shown(fg, theme, bg), shown(bg, theme));
        const label = `${fg} on ${bg}`;
        if (ratio < min && !knownLow.has(label)) {
            failures += 1;
            console.log(`FAIL ${theme.padEnd(5)} ${ratio.toFixed(2)}:1 ${label} (needs ${min}:1)`);
        }
    }
}
console.log(failures ? `${failures} pair(s) below the minimum.` : `All ${pairs.length} pairs pass in ${themes.join(" and ")}.`);
process.exit(failures ? 1 : 0);
