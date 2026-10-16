import type { HTMLAttributes, ReactNode } from "react";

export interface WatermarkProps extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
    /** The text to tile: one line, or an array for several lines ("Confidential", then a name and a date). */
    content?: string | string[];
    /** An image to tile instead of text, as a URL or data URL. It's drawn at its own size. */
    image?: string;
    /** What the watermark covers. */
    children?: ReactNode;
    /** How far each tile is turned, in degrees; negative turns it anticlockwise. @default -22 */
    rotate?: number;
    /** The space between tiles, across and down, in pixels. @default [100, 100] */
    gap?: [number, number];
    /** Moves the whole pattern across and down, in pixels. @default [0, 0] */
    offset?: [number, number];
    /** The text size in pixels. @default 16 */
    fontSize?: number;
    /** The text weight. @default 400 */
    fontWeight?: number | string;
    /** The text colour, any CSS colour. By default it's the text colour at 10%, so it reads on both themes. */
    color?: string;
    /** The text's font. By default it's the font of the page around it. */
    fontFamily?: string;
    /** The whole layer's opacity, on top of the colour's own. @default 1 */
    opacity?: number;
    /** The layer's z-index, to put it above children with their own stacking. @default 9 */
    zIndex?: number;
    /** Fixes the layer over the whole viewport instead of over the children. @default false */
    fullPage?: boolean;
}

/** One drawn tile: its data URL and its CSS size. */
export interface WatermarkTile {
    url: string;
    width: number;
    height: number;
}
