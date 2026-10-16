/** The part of the picture inside the frame, in the picture's own pixels (after any rotation). */
export interface ImageCrop {
    /** The left edge, from the picture's left. */
    x: number;
    /** The top edge, from the picture's top. */
    y: number;
    width: number;
    height: number;
}

/** What the cropped image comes out as. */
export interface ImageCropperOutput {
    /** The output's width in pixels. Without it, the crop's own size; with only a height, the width that keeps the shape. */
    width?: number;
    /** The output's height in pixels. Without it, the crop's own size; with only a width, the height that keeps the shape. */
    height?: number;
    /** The file type. A JPEG has no transparency, so any empty space (below a zoom of 1) is filled white.
     * @default "image/png" */
    type?: "image/jpeg" | "image/png" | "image/webp";
    /** Compression for JPEG and WebP, 0 to 1.
     * @default 0.92 */
    quality?: number;
}

export interface ImageCropperLabels {
    /** Names the frame for screen readers.
     * @default "Crop the picture" */
    frame?: string;
    /** How to use the frame with a keyboard; read out after its name.
     * @default "Use the arrow keys to move the picture, Shift for bigger steps, and plus and minus to zoom." */
    instructions?: string;
    /** The zoom slider's label.
     * @default "Zoom" */
    zoom?: string;
    /** The zoom as read out and shown, from a percentage.
     * @default (percent) => `${percent}%` */
    zoomLevel?(percent: number): string;
    /** Shown in the frame while the picture loads.
     * @default "Loading picture…" */
    loading?: string;
    /** Shown in the frame when the picture can't be loaded.
     * @default "The picture couldn't be loaded." */
    failed?: string;
}

export interface ImageCropperProps {
    /** The picture: a URL, or the File or Blob from a FileDropZone or a file input. */
    src: string | File | Blob;
    /** The frame's shape as width over height: 1 for an avatar, 16 / 9 for a banner. Without it, the frame is `width` by
     * `height` and the crop takes that shape. */
    aspect?: number;
    /** `circle` shades the frame's corners, as an avatar will show it. The output is still a rectangle: round it where
     * it's shown, as Avatar does.
     * @default "rect" */
    shape?: "rect" | "circle";
    /** The crop, when you control it: the part of the picture inside the frame, in the picture's pixels. */
    crop?: ImageCrop;
    /** The crop at first, when uncontrolled. Without one, the picture is centred at `defaultZoom`. */
    defaultCrop?: ImageCrop;
    /** Called as the person drags, zooms or presses the arrow keys, with the new crop. */
    onCropChange?(crop: ImageCrop): void;
    /** The zoom, when you control it. 1 is the picture just covering the frame; 2 is twice as close. */
    zoom?: number;
    /** The zoom at first, when uncontrolled.
     * @default 1 */
    defaultZoom?: number;
    /** Called with the new zoom when the slider, the wheel, a pinch or the keys change it. */
    onZoomChange?(zoom: number): void;
    /** The smallest zoom. Below 1 the picture doesn't fill the frame, and the output has empty space.
     * @default 1 */
    minZoom?: number;
    /** The largest zoom.
     * @default 4 */
    maxZoom?: number;
    /** Turns the picture clockwise, in quarter turns, before it's cropped. The crop is in the turned picture's pixels.
     * @default 0 */
    rotation?: 0 | 90 | 180 | 270;
    /** The size and type of the cropped image that `getCroppedImage` and a Form get, unless the call says otherwise. */
    output?: ImageCropperOutput;
    /** The form field name: the cropped image is sent under it as a data URL, made when the form is submitted. */
    name?: string;
    /** Draws a rule-of-thirds grid over the frame.
     * @default false */
    showGrid?: boolean;
    /** The frame's width, in pixels or any CSS length. It never grows past its container.
     * @default 320 */
    width?: number | string;
    /** The frame's height when there's no `aspect`, in pixels or any CSS length.
     * @default 240 */
    height?: number | string;
    /** Set when the picture comes from another origin that allows it, so the cropped image can be read back out of the
     * canvas. Without it, a cross-origin picture shows but can't be exported. */
    crossOrigin?: "anonymous" | "use-credentials";
    /** Fades it; nothing can be moved.
     * @default false */
    disabled?: boolean;
    /** The words it uses, for other languages. */
    labels?: ImageCropperLabels;
    /** Names the frame for screen readers, in place of `labels.frame`. */
    "aria-label"?: string;
    /** Names the frame by another element's id, such as a Field's label; Field sets this. */
    "aria-labelledby"?: string;
    /** Ids of the hint or error that describe it, read after the key instructions; Field sets this. */
    "aria-describedby"?: string;
    /** The frame's id; Field sets this. */
    id?: string;
    className?: string;
}

/** What a ref to an ImageCropper can do. */
export interface ImageCropperHandle {
    /** The cropped image as a file to upload, in the `output` given here or in the props. Rejects before the picture has
     * loaded, or when a cross-origin picture can't be read. */
    getCroppedImage(output?: ImageCropperOutput): Promise<Blob>;
    /** The cropped image as a data URL, for an <img src> or a form; "" before the picture has loaded. */
    toDataURL(output?: ImageCropperOutput): string;
    /** The crop as it stands, in the picture's pixels; null before the picture has loaded. */
    getCrop(): ImageCrop | null;
    /** Centres the picture again at `defaultZoom`. */
    reset(): void;
}

/** A pointer held on the frame, for panning and pinching. Internal. */
export interface ImageCropperPointer {
    x: number;
    y: number;
}

/** The frame's size on screen, in CSS pixels. Internal. */
export interface ImageCropperBox {
    width: number;
    height: number;
}
