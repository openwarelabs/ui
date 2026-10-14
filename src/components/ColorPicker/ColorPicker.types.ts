import type { Placement } from "@/hooks/useFloating";

/** What a swatch is: a colour, or a colour with a name to read out. */
export type ColorSwatchOption = string | { color: string; name: string };

export interface ColorPickerProps {
    /** A hex colour: "#0d9488", or "#0d9488cc" with alpha. */
    value?: string;
    /** @default "#312c7e" */
    defaultValue?: string;
    /** Called with a lowercase hex colour as the person drags, types or picks. */
    onChange?(color: string): void;
    /** Adds an opacity slider; colours come back as #rrggbbaa.
     * @default false */
    alpha?: boolean;
    /** Ready-made colours as swatches under the picker. */
    swatches?: ColorSwatchOption[];
    /** The hex field under the picker.
     * @default true */
    showInput?: boolean;
    /** A button that picks a colour from anywhere on the screen, where the browser can (Chrome and Edge).
     * @default true */
    eyeDropper?: boolean;
    /** Names the picker for screen readers.
     * @default "Colour" */
    "aria-label"?: string;
    className?: string;
}

export interface EyeDropperResult {
    sRGBHex: string;
}

declare global {
    interface Window {
        EyeDropper?: new () => { open(): Promise<EyeDropperResult> };
    }
}

export interface ColorFieldProps extends Omit<ColorPickerProps, "className" | "aria-label"> {
    /** @default "md" */
    size?: "sm" | "md";
    /** @default false */
    isInvalid?: boolean;
    disabled?: boolean;
    /** Where the picker opens; it flips when there's no room.
     * @default "bottom-start" */
    placement?: Placement;
    id?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    className?: string;
}
