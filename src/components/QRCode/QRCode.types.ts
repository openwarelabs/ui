import type { ComponentPropsWithoutRef } from "react";

/** How much of the code can be damaged or covered and still scan: about 7% (L), 15% (M), 25% (Q) or 30% (H). Higher levels make a denser code. */
export type QRLevel = "L" | "M" | "Q" | "H";

export interface QROptions {
    /** The error correction level.
     * @default "M" */
    level?: QRLevel;
    /** The smallest version (1–40) to use, so codes for texts of different lengths can share a size. A longer text still gets a bigger version.
     * @default 1 */
    minVersion?: number;
    /** Forces one of the eight masks (0–7) instead of the one with the lowest penalty. For testing; leave it out. */
    mask?: number;
}

export interface QRCodeProps extends Omit<ComponentPropsWithoutRef<"svg">, "color" | "children"> {
    /** The text to encode: a link, an `otpauth://` URI, any text. Encoded as UTF-8, or more densely when it's only digits or upper-case letters. */
    value: string;
    /** The width and height, in pixels. It shrinks to fit a narrower container.
     * @default 160 */
    size?: number;
    /** The error correction level: how much of the code can be damaged and still scan. `image` raises it to H.
     * @default "M" */
    level?: QRLevel;
    /** The smallest version (1–40), so codes for different texts can share the same grid. */
    minVersion?: number;
    /** The quiet zone around the code, in modules. Scanners need about 4; go lower only when the code sits on a plain light ground.
     * @default 4 */
    margin?: number;
    /** The colour of the dark modules: any CSS colour or token, like `"var(--ow-text)"`. Keep it dark and the background light: most scanners can't read inverted codes.
     * @default "var(--ow-gray-950)", near black in both themes */
    color?: string;
    /** The colour behind the modules and in the quiet zone. It stays light in the dark theme, because scanners need a light ground and strong contrast.
     * @default "var(--ow-gray-50)", near white in both themes */
    background?: string;
    /** The accessible name: "QR code for openware.dev". Say where it leads or what it's for.
     * @default "QR code for" and the link's host, or the text when it's short; otherwise "QR code" */
    label?: string;
    /** A logo for the centre, by URL. The modules under it are cleared and the level is raised to H, so the code still scans. */
    image?: string;
    /** The logo's width as a share of the code's, up to 0.3.
     * @default 0.22 */
    imageSize?: number;
    /** Draws each run of dark modules with rounded ends. Still scans, but square modules are the safest.
     * @default false */
    rounded?: boolean;
}

export interface QRCodeDataURLOptions {
    /** The image format, such as `"image/jpeg"`.
     * @default "image/png" */
    type?: string;
    /** Multiplies the code's size in pixels, for a sharper image.
     * @default 4 */
    scale?: number;
}
