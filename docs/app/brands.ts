import { useSyncExternalStore } from "react";

import { brandCss, brandPresets, brandScale, brandSteps, type BrandScale } from "@openwarelabs/ui";

export { brandPresets, brandSteps };

/** The docs' theme colour: a preset, or a custom colour turned into a scale with brandScale(). */
export interface BrandChoice {
    /** A preset's id, or "custom". */
    id: string;
    /** The colour picked, for "custom". */
    color?: string;
    scale: BrandScale;
}

// index.html reads the same key before the page paints, so a saved colour never flashes midnight first.
const storageKey = "ow-docs-brand";
const midnight: BrandChoice = { id: "midnight", scale: brandPresets[0]!.scale };
const listeners = new Set<() => void>();

function read(): BrandChoice {
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as BrandChoice | null;
        if (saved?.scale && brandSteps.every((step) => typeof saved.scale[step] === "string")) return saved;
    } catch {
        // Nothing saved, or storage blocked.
    }
    return midnight;
}

let current = read();

/** Paints the whole docs with the scale, panes with their own data-theme included. */
export function paintBrand(choice: BrandChoice) {
    document.getElementById("docs-brand")?.remove();
    if (choice.id === "midnight") return;
    const style = document.createElement("style");
    style.id = "docs-brand";
    // Doubled selectors outweigh the stylesheet's own :root and [data-theme="…"] rules, wherever this lands.
    style.textContent = brandCss(choice.scale, ":root:root, [data-theme][data-theme]");
    document.head.append(style);
}

/** Picks a preset by id, or a custom colour. Remembered in this browser. `animate: false` while dragging a picker. */
export function setBrand(next: { id: string; color?: string }, { animate = true } = {}) {
    const preset = brandPresets.find((entry) => entry.id === next.id);
    let scale: BrandScale;
    try {
        scale = preset ? preset.scale : brandScale(next.color ?? "");
    } catch {
        return;
    }
    current = { id: preset ? preset.id : "custom", color: preset ? undefined : next.color, scale };
    const apply = () => paintBrand(current);
    // Cross-fade the change where the browser can.
    const doc = document as Document & { startViewTransition?: (update: () => void) => unknown };
    if (animate && doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(apply);
    else apply();
    try {
        if (current.id === "midnight") localStorage.removeItem(storageKey);
        else localStorage.setItem(storageKey, JSON.stringify(current));
    } catch {
        // Storage blocked: the colour lasts until reload.
    }
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/** The current theme colour, shared by every picker on the page. */
export function useBrand(): BrandChoice {
    return useSyncExternalStore(subscribe, () => current);
}

/** The colour that stands for a choice in its swatch. */
export const swatchOf = (scale: BrandScale) => `linear-gradient(135deg, ${scale[400]}, ${scale[600]})`;
