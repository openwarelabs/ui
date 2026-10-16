import type { ReactNode } from "react";

export interface LightboxImage {
    /** The full-size image. */
    src: string;
    /** What the image shows, for screen readers. It names the dialog when there's no caption. */
    alt: string;
    /** A line under the image. It names the dialog for screen readers. */
    caption?: ReactNode;
    /** A smaller version for the strip at the bottom. @default `src` */
    thumbnail?: string;
    /** Candidates for the browser to pick from by width, as on an `<img>`. */
    srcSet?: string;
    /** Goes with `srcSet`: how wide the image shows at each screen width. */
    sizes?: string;
}

export interface LightboxLabels {
    /** @default "Close" */
    close?: string;
    /** @default "Previous image" */
    previous?: string;
    /** @default "Next image" */
    next?: string;
    /** @default "Zoom in" */
    zoomIn?: string;
    /** @default "Zoom out" */
    zoomOut?: string;
    /** Names the strip of thumbnails. @default "Images" */
    thumbnails?: string;
    /** The count shown at the top and read out when the image changes. @default (n, count) => `${n} of ${count}` */
    position?(n: number, count: number): string;
}

export interface LightboxProps {
    open: boolean;
    /** Called on Escape, the ✕ or a tap beside the image. Set `open` to false here. */
    onClose(): void;
    /** The images, in order. One image hides the previous and next buttons, the count and the strip. */
    images: LightboxImage[];
    /** The image showing, from 0, when you control it. */
    index?: number;
    /** The image it opens on, when it controls itself.
     * @default 0 */
    defaultIndex?: number;
    /** Called when another image shows, from the buttons, the keys, a swipe or the strip. */
    onIndexChange?(index: number): void;
    /** Lets the image be zoomed: the buttons, + and -, a double-click or double-tap, the wheel and a pinch.
     * @default true */
    zoom?: boolean;
    /** How far it zooms in, as a multiple of the fitted size.
     * @default 4 */
    maxZoom?: number;
    /** Shows a strip of thumbnails along the bottom to jump between images.
     * @default true when there's more than one image */
    thumbnails?: boolean;
    /** Next from the last image goes back to the first, and previous from the first goes to the last.
     * @default false */
    loop?: boolean;
    /** The words it uses, for other languages. */
    labels?: LightboxLabels;
    className?: string;
}

/** Internal: where the image sits, as its scale over the fitted size and how far its centre is from the stage's, in pixels. */
export interface LightboxView {
    scale: number;
    x: number;
    y: number;
}

/** Internal: a point on the screen. */
export interface LightboxPointer {
    x: number;
    y: number;
}

/** Internal: the touch or drag in progress. */
export interface LightboxGesture {
    /** Where the first pointer went down. */
    start: LightboxPointer;
    /** Whether it has moved far enough not to be a tap. */
    moved: boolean;
    /** The distance between two fingers at the last move, 0 with one. */
    distance: number;
    /** The point between two fingers at the last move. */
    middle: LightboxPointer;
    /** Whether it started on the image rather than beside it. */
    onImage: boolean;
}
