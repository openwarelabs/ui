import { useCallback, useReducer, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { useControllableState } from "../../hooks/useControllableState";

/** Red, green and blue from 0 to 255, alpha from 0 to 1. */
export interface Rgba {
    r: number;
    g: number;
    b: number;
    a: number;
}

/** Hue in degrees, saturation and brightness (value) from 0 to 100, alpha from 0 to 1. */
export interface Hsva {
    h: number;
    s: number;
    v: number;
    a: number;
}

/** Hue in degrees, saturation and lightness from 0 to 100, alpha from 0 to 1. */
export interface Hsla {
    h: number;
    s: number;
    l: number;
    a: number;
}

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** "#0d9488", "#0d9488cc", "#0d9" or "0d9488" → its channels; anything else → null. */
export function parseHex(color: string): Rgba | null {
    let hex = color.trim().replace(/^#/, "");
    if (hex.length === 3 || hex.length === 4) hex = [...hex].map((digit) => digit + digit).join("");
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex)) return null;
    const byteAt = (index: number) => parseInt(hex.slice(index, index + 2), 16);
    return { r: byteAt(0), g: byteAt(2), b: byteAt(4), a: hex.length === 8 ? byteAt(6) / 255 : 1 };
}

/** Whether a hex colour spells out its alpha (#rgba or #rrggbbaa). */
export const hasAlpha = (color: string) => /^#?([0-9a-f]{4}|[0-9a-f]{8})$/i.test(color.trim());

const byte = (n: number) =>
    Math.round(clamp(n, 0, 255))
        .toString(16)
        .padStart(2, "0");

/** Lowercase "#rrggbb", or "#rrggbbaa" with `alpha`. */
export function toHex({ r, g, b, a }: Rgba, alpha = false): string {
    return `#${byte(r)}${byte(g)}${byte(b)}${alpha ? byte(a * 255) : ""}`;
}

/** The same colour written one way, so "#0D9488" and "#0d9488" compare equal. Invalid colours come back as given. */
export function normalizeHex(color: string): string {
    const rgba = parseHex(color);
    return rgba ? toHex(rgba, hasAlpha(color)) : color;
}

export function rgbToHsv({ r, g, b, a }: Rgba): Hsva {
    const max = Math.max(r, g, b);
    const range = max - Math.min(r, g, b);
    let h = 0;
    if (range) {
        if (max === r) h = ((g - b) / range) % 6;
        else if (max === g) h = (b - r) / range + 2;
        else h = (r - g) / range + 4;
        h = (h * 60 + 360) % 360;
    }
    return { h, s: max ? (range / max) * 100 : 0, v: (max / 255) * 100, a };
}

export function hsvToRgb({ h, s, v, a }: Hsva): Rgba {
    const S = s / 100;
    const V = v / 100;
    const channel = (n: number) => {
        const k = (n + h / 60) % 6;
        return (V - V * S * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
    };
    return { r: channel(5), g: channel(3), b: channel(1), a };
}

export function hsvToHsl({ h, s, v, a }: Hsva): Hsla {
    const S = s / 100;
    const V = v / 100;
    const l = V * (1 - S / 2);
    return { h, s: l === 0 || l === 1 ? 0 : ((V - l) / Math.min(l, 1 - l)) * 100, l: l * 100, a };
}

export function hslToHsv({ h, s, l, a }: Hsla): Hsva {
    const S = s / 100;
    const L = l / 100;
    const v = L + S * Math.min(L, 1 - L);
    return { h, s: v === 0 ? 0 : 2 * (1 - L / v) * 100, v: v * 100, a };
}

/** A way of seeing a colour that a control edits, and how to read a hex into it without losing what a grey can't hold. */
export interface ColorModel<M extends { h: number }> {
    read(rgba: Rgba, previous: M | undefined): M;
    write(model: M): Rgba;
}

export const hsvModel: ColorModel<Hsva> = {
    read(rgba, previous) {
        const next = rgbToHsv(rgba);
        if (!previous) return next;
        // A grey has no hue, and black no saturation either: keep the last ones, so a corner doesn't lose them.
        if (next.s === 0 || next.v === 0) next.h = previous.h;
        if (next.v === 0) next.s = previous.s;
        return next;
    },
    write: hsvToRgb,
};

export const hslModel: ColorModel<Hsla> = {
    read(rgba, previous) {
        const next = hsvToHsl(rgbToHsv(rgba));
        if (!previous) return next;
        if (next.s === 0) next.h = previous.h;
        // Black and white have neither hue nor saturation.
        if (next.l <= 0 || next.l >= 100) {
            next.h = previous.h;
            next.s = previous.s;
        }
        return next;
    },
    write: (model) => hsvToRgb(hslToHsv(model)),
};

const fallback: Rgba = { r: 0, g: 0, b: 0, a: 1 };

/**
 * A hex colour that a parent may control, seen through a model (HSV or HSL). The model is kept between renders
 * and only read again from the hex when the hex changes from outside, so greys and black keep their hue.
 * `hue`, when given, is the hue to show while the colour is a grey.
 */
export function useColorModel<M extends { h: number }>(
    value: string | undefined,
    defaultValue: string,
    onChange: ((color: string) => void) | undefined,
    model: ColorModel<M>,
    { hue, alpha = false }: { hue?: number; alpha?: boolean } = {},
) {
    const [color, setColor] = useControllableState(value, defaultValue, onChange);
    const memory = useRef<{ hex: string; model: ColorModel<M>; value: M } | null>(null);
    const [, rerender] = useReducer((n: number) => n + 1, 0);

    const incoming = normalizeHex(color);
    if (!memory.current || memory.current.hex !== incoming || memory.current.model !== model) {
        const rgba = parseHex(incoming);
        const previous = memory.current?.model === model ? memory.current.value : undefined;
        memory.current = { hex: incoming, model, value: rgba ? model.read(rgba, previous) : (previous ?? model.read(fallback, undefined)) };
    }

    const rgba = parseHex(memory.current.hex) ?? model.write(memory.current.value);
    const isGrey = rgba.r === rgba.g && rgba.g === rgba.b;
    const current = isGrey && hue !== undefined ? { ...memory.current.value, h: hue } : memory.current.value;
    const withAlpha = alpha || hasAlpha(color);

    const set = useCallback(
        (next: M) => {
            const hex = toHex(model.write(next), withAlpha);
            memory.current = { hex, model, value: next };
            // When the hex doesn't change (the hue of a grey), only the thumb moves: render that.
            rerender();
            setColor(hex);
            return hex;
        },
        [model, withAlpha, setColor],
    );

    // The latest hex, for onChangeEnd, which can run before the next render.
    const latest = useCallback(() => memory.current?.hex ?? incoming, [incoming]);

    return { value: current, rgba: model.write(current), hex: memory.current.hex, set, latest };
}

/**
 * Pointer dragging over an element: reports where the pointer is as fractions of its box (0 to 1, from the top
 * left), keeps reporting outside it through pointer capture, and calls onEnd when the pointer lets go. onStart runs
 * on press, to focus the control. `pointerFocus` is true from a press until a key or a blur: the control was focused
 * by the pointer and shows no focus ring, the way :focus-visible would if it were a native control.
 */
export function useDrag({
    onMove,
    onEnd,
    onStart,
    disabled = false,
}: {
    onMove(x: number, y: number): void;
    onEnd(): void;
    onStart?(): void;
    disabled?: boolean;
}) {
    const [dragging, setDragging] = useState(false);
    const [pointerFocus, setPointerFocus] = useState(false);
    const move = (event: ReactPointerEvent<HTMLElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onMove(clamp((event.clientX - rect.left) / (rect.width || 1), 0, 1), clamp((event.clientY - rect.top) / (rect.height || 1), 0, 1));
    };
    return {
        dragging,
        pointerFocus,
        /** For the input's onKeyDown and onBlur: the focus ring shows again. */
        keyboard: () => setPointerFocus(false),
        handlers: {
            onPointerDown(event: ReactPointerEvent<HTMLElement>) {
                if (disabled || event.button !== 0) return;
                // No text selection or page scroll while dragging.
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                onStart?.();
                setPointerFocus(true);
                setDragging(true);
                move(event);
            },
            onPointerMove(event: ReactPointerEvent<HTMLElement>) {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event);
            },
            onLostPointerCapture() {
                setDragging(false);
                onEnd();
            },
        },
    };
}

// Relative luminance, for picking a check mark's colour.
const linear = (channel: number) => {
    const v = channel / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = ({ r, g, b }: Pick<Rgba, "r" | "g" | "b">) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/** Whether light (white) or dark (slate 900) ink reads better on a colour; a translucent colour is seen over white. */
export function inkFor({ r, g, b, a }: Rgba): "light" | "dark" {
    const over = (channel: number) => channel * a + 255 * (1 - a);
    const ground = luminance({ r: over(r), g: over(g), b: over(b) });
    return ratio(ground, 1) >= ratio(ground, luminance({ r: 15, g: 23, b: 42 })) ? "light" : "dark";
}

function hueName(h: number, l: number): string {
    if (h < 12 || h >= 345) return l > 70 ? "pink" : "red";
    if (h < 42) return l < 35 ? "brown" : "orange";
    if (h < 66) return l < 30 ? "olive" : "yellow";
    if (h < 85) return "lime";
    if (h < 150) return "green";
    if (h < 170) return "teal";
    if (h < 195) return l >= 45 ? "cyan" : "teal";
    if (h < 240) return "blue";
    if (h < 260) return "indigo";
    if (h < 290) return "purple";
    if (h < 320) return "magenta";
    return "pink";
}

/** A short description of a colour for screen readers: "dark teal", "light grey", "greyish blue". */
export function describeColor(rgba: Rgba): string {
    const { h, s, v } = rgbToHsv(rgba);
    const { l } = hsvToHsl({ h, s, v, a: 1 });
    const chroma = Math.max(rgba.r, rgba.g, rgba.b) - Math.min(rgba.r, rgba.g, rgba.b);
    if (chroma < 12) {
        if (l < 8) return "black";
        if (l > 97) return "white";
        return l < 35 ? "dark grey" : l > 75 ? "light grey" : "grey";
    }
    const name = hueName(h, l);
    const shade =
        name === "brown" || name === "olive" ? (l < 20 ? "dark" : "") : l < 20 ? "very dark" : l < 38 ? "dark" : l > 85 ? "very light" : l > 68 ? "light" : "";
    return [shade, chroma < 40 ? "greyish" : "", name].filter(Boolean).join(" ");
}

/** The pure hue, as a hex: what a hue slider's thumb shows. */
export const hueHex = (h: number) => toHex(hsvToRgb({ h, s: 100, v: 100, a: 1 }));

/** The six stops of the hue wheel, red to red. */
export const hueStops = "#ff0000 0%, #ffff00 16.67%, #00ff00 33.33%, #00ffff 50%, #0000ff 66.67%, #ff00ff 83.33%, #ff0000 100%";
