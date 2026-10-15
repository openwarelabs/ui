export interface SignaturePadLabels {
    /** The prompt on the empty pad.
     * @default "Sign here" */
    signHere?: string;
    /** @default "Clear" */
    clear?: string;
    /** Takes back the last stroke.
     * @default "Undo" */
    undo?: string;
    /** Switches to typing a name, for people who can't draw (with a keyboard, say).
     * @default "Type instead" */
    typeInstead?: string;
    /** Switches back to drawing.
     * @default "Draw instead" */
    drawInstead?: string;
    /** The typed name's placeholder, and its label when there's no Field.
     * @default "Type your name" */
    typeName?: string;
    /** Reads out the pad, which is an image, for screen readers.
     * @default (signed) => signed ? "Signature, signed" : "Signature, empty" */
    state?(signed: boolean): string;
}

export interface SignaturePadProps {
    /**
     * The signature, when you control it: a data URL, "data:image/png;base64,…" (or "data:image/svg+xml,…" with
     * `format="svg"`), ready for an <img src>. "" is no signature. A value that didn't come from the pad, such as a saved
     * one, is drawn in, to show or sign over.
     */
    value?: string;
    /** The signature at first, when uncontrolled.
     * @default "" */
    defaultValue?: string;
    /** Called with the new data URL when a stroke ends, a stroke is undone, the typed name changes, or it's cleared (""). */
    onChange?(value: string): void;
    /** What the value holds: a PNG at twice the pad's size, or an SVG of the strokes (each at its average width).
     * @default "png" */
    format?: "png" | "svg";
    /** The form field name: the data URL is sent under it (nothing when it's empty). */
    name?: string;
    /** Asks for a signature before the form can be sent. Needs a `name`. */
    required?: boolean;
    /** Marks it invalid, with an error colour; Field sets this. */
    isInvalid?: boolean;
    /** The ink on screen, as any CSS colour (a token too). It's also the exported ink when set.
     * @default the text colour, so it follows the theme */
    penColor?: string;
    /** The ink in the exported value when there's no `penColor`, so a signature drawn in dark mode isn't saved white.
     * @default "#111111" */
    exportColor?: string;
    /** A colour to fill the exported image's background with. Without it, the export is transparent, and a saved
     * signature shown in the pad is re-inked in the pen colour, so it reads in either theme.
     * @default undefined */
    background?: string;
    /** The stroke width in pixels. A pen's pressure makes it thinner or up to 1.6 times thicker.
     * @default 2.5 */
    penWidth?: number;
    /** The drawing area's height, in pixels or any CSS length.
     * @default 160 */
    height?: number | string;
    /** Offers "Type instead": a text box whose name is set in a script face as the signature.
     * @default true */
    allowTyping?: boolean;
    /** @default false */
    disabled?: boolean;
    /** Shows the signature without the buttons, and nothing can be drawn.
     * @default false */
    readOnly?: boolean;
    /** Called when Clear is pressed. */
    onClear?(): void;
    /** The words it uses, for other languages. */
    labels?: SignaturePadLabels;
    /** Names the pad for screen readers when there's no Field label, ahead of its state: "Your signature". */
    "aria-label"?: string;
    /** Names the pad by another element's id, such as a Field's label; Field sets this. */
    "aria-labelledby"?: string;
    /** Ids of the hint or error that describe it; Field sets this. */
    "aria-describedby"?: string;
    /** The id of the pad (or of the text box, when typing), so a Field's label points at it; Field sets this. */
    id?: string;
    className?: string;
}

/** What a ref to a SignaturePad can do. */
export interface SignaturePadHandle {
    /** Empties the pad (and calls onChange with ""). */
    clear(): void;
    /** The signature as a data URL, in `format` or the one given; "" when it's empty. */
    toDataURL(format?: "png" | "svg"): string;
    /** True when nothing has been drawn or typed. */
    isEmpty(): boolean;
}

/** One sampled point of a stroke: where it is, in pixels, and its width as a share of penWidth. Internal. */
export interface SignaturePoint {
    x: number;
    y: number;
    w: number;
}

/** What paints the pad, on screen or into an export. Internal. */
export interface SignaturePaint {
    width: number;
    height: number;
    color: string;
}
