import { forwardRef, useId, useRef, type CSSProperties, type ForwardedRef, type KeyboardEvent, type ReactNode } from "react";

import { cx } from "../../utils/cx";
import {
    clamp,
    describeColor,
    hslModel,
    hsvModel,
    hueHex,
    hueStops,
    parseHex,
    toHex,
    useColorModel,
    useDrag,
    type ColorModel,
    type Hsla,
    type Hsva,
    type Rgba,
} from "./color";

/** A channel a ColorSlider changes: HSL's hue, saturation or lightness, the alpha, or red, green or blue. */
export type ColorChannel = "hue" | "saturation" | "lightness" | "alpha" | "red" | "green" | "blue";

export interface ColorSliderProps {
    /** The channel it changes. Saturation and lightness are HSL's; the track shows the channel's range for the current colour. */
    channel: ColorChannel;
    /** The colour as hex. The alpha channel takes and returns "#rrggbbaa"; the others keep any alpha they're given. */
    value?: string;
    /** The starting colour when uncontrolled.
     * @default "#312c7e" */
    defaultValue?: string;
    /** Called with a lowercase hex as the person drags or presses the arrow keys. */
    onChange?(color: string): void;
    /** Called when the person lets go or releases the key, for work too slow to do on every move. */
    onChangeEnd?(color: string): void;
    /** The hue to show while the colour is a grey, which has none of its own. Without it, the slider keeps the last hue it had. */
    hue?: number;
    /** Called with the hue as a hue slider moves, including over a grey, whose hex doesn't change. Pass it on to a
     * ColorArea's `hue` to keep the two in step. */
    onHueChange?(hue: number): void;
    /** Shown above the track, and names the slider for screen readers. */
    label?: ReactNode;
    /** Shows the channel's value (174°, 72%, or 0 to 255 for red, green and blue) at the right of the label.
     * Defaults to true when there's a label. */
    showValue?: boolean;
    /** A vertical slider is 152px tall, a ColorArea's height; set another with CSS.
     * @default "horizontal" */
    orientation?: "horizontal" | "vertical";
    /** Fades it; the pointer and the keys do nothing.
     * @default false */
    disabled?: boolean;
    /** The locale for the value shown and read out. Defaults to the browser's. */
    locale?: string;
    /** The form field name; the hex is submitted under it. */
    name?: string;
    /** Names the slider when there's no label. Defaults to the channel's name ("Hue", "Opacity"), unless aria-labelledby
     * or a Field names it. */
    "aria-label"?: string;
    /** Names the slider by a visible label's id. */
    "aria-labelledby"?: string;
    /** Ids of a hint or an error, read out after the value; a Field sets it. */
    "aria-describedby"?: string;
    /** The input's id; a Field sets it so its label names the slider. */
    id?: string;
    /** Classes for the slider's outer element, e.g. a height for a vertical one. */
    className?: string;
}

type Model = Hsva | Hsla;

const channels: Record<ColorChannel, { name: string; max: number; unit: "degree" | "percent" | "number" }> = {
    hue: { name: "Hue", max: 360, unit: "degree" },
    saturation: { name: "Saturation", max: 100, unit: "percent" },
    lightness: { name: "Lightness", max: 100, unit: "percent" },
    alpha: { name: "Opacity", max: 100, unit: "percent" },
    red: { name: "Red", max: 255, unit: "number" },
    green: { name: "Green", max: 255, unit: "number" },
    blue: { name: "Blue", max: 255, unit: "number" },
};

const rgbKey = { red: "r", green: "g", blue: "b" } as const;

function read(channel: ColorChannel, model: Model, rgba: Rgba): number {
    if (channel === "hue") return model.h;
    if (channel === "saturation") return model.s;
    if (channel === "lightness") return (model as Hsla).l;
    if (channel === "alpha") return model.a * 100;
    return rgba[rgbKey[channel]];
}

function write(channel: ColorChannel, model: Model, rgba: Rgba, n: number): Model {
    if (channel === "hue") return { ...model, h: n };
    if (channel === "saturation") return { ...model, s: n };
    if (channel === "lightness") return { ...model, l: n };
    if (channel === "alpha") return { ...model, a: n / 100 };
    return hsvModel.read({ ...rgba, [rgbKey[channel]]: Math.round(n) }, model as Hsva);
}

/** The track's colours, from the channel's minimum to its maximum, for the current colour. */
function gradient(channel: ColorChannel, model: Model, rgba: Rgba): string {
    const opaque = { ...rgba, a: 1 };
    const hsl = (s: number, l: number) => toHex(hslModel.write({ h: model.h, s, l, a: 1 }));
    switch (channel) {
        case "hue":
            return hueStops;
        case "saturation":
            return `${hsl(0, (model as Hsla).l)}, ${hsl(100, (model as Hsla).l)}`;
        case "lightness":
            return `#000000, ${hsl(model.s, 50)}, #ffffff`;
        case "alpha":
            return `${toHex({ ...rgba, a: 0 }, true)}, ${toHex(opaque)}`;
        default: {
            const key = rgbKey[channel];
            return `${toHex({ ...opaque, [key]: 0 })}, ${toHex({ ...opaque, [key]: 255 })}`;
        }
    }
}

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
    if (typeof ref === "function") ref(value);
    else if (ref) ref.current = value;
}

/**
 * Changes one channel of a colour by dragging, over a track that shows that channel's range: a hue slider, an
 * opacity slider over a checkerboard, or red, green and blue. It works with the keyboard like Slider.
 * The ref is its input, for focusing it.
 */
export const ColorSlider = forwardRef<HTMLInputElement, ColorSliderProps>(function ColorSlider(
    {
        channel,
        value,
        defaultValue = "#312c7e",
        onChange,
        onChangeEnd,
        hue,
        onHueChange,
        label,
        showValue = Boolean(label),
        orientation = "horizontal",
        disabled = false,
        locale,
        name,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        id,
        className,
    },
    ref,
) {
    const spec = channels[channel];
    const isHsl = channel === "saturation" || channel === "lightness";
    const color = useColorModel<Model>(value, defaultValue, onChange, (isHsl ? hslModel : hsvModel) as ColorModel<Model>, {
        hue,
        alpha: channel === "alpha",
    });
    const { rgba, latest } = color;
    const current = read(channel, color.value, rgba);
    const labelId = useId();
    const trackRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const vertical = orientation === "vertical";
    const isRtl = () => !vertical && trackRef.current !== null && getComputedStyle(trackRef.current).direction === "rtl";
    const end = () => onChangeEnd?.(latest());

    function change(n: number) {
        const next = write(channel, color.value, rgba, clamp(n, 0, spec.max));
        color.set(next);
        if (next.h !== color.value.h) onHueChange?.(next.h);
    }

    const drag = useDrag({
        onMove: (x, y) => change((vertical ? 1 - y : isRtl() ? 1 - x : x) * spec.max),
        onEnd: end,
        onStart: () => inputRef.current?.focus({ preventScroll: true }),
        disabled,
    });

    function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        drag.keyboard();
        const step = event.shiftKey ? 10 : 1;
        const forward = isRtl() ? -1 : 1;
        const from = Math.round(current);
        const keys: Record<string, number> = {
            ArrowRight: from + step * forward,
            ArrowLeft: from - step * forward,
            ArrowUp: from + step,
            ArrowDown: from - step,
            PageUp: from + 10,
            PageDown: from - 10,
            Home: 0,
            End: spec.max,
        };
        if (!(event.key in keys)) return;
        event.preventDefault();
        change(keys[event.key]!);
    }

    const format =
        spec.unit === "degree"
            ? new Intl.NumberFormat(locale, { style: "unit", unit: "degree", unitDisplay: "narrow", maximumFractionDigits: 0 })
            : spec.unit === "percent"
              ? new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 })
              : new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    const shown = format.format(spec.unit === "percent" ? current / 100 : current);
    const named = channel === "hue" ? describeColor(parseHex(hueHex(color.value.h))!) : describeColor({ ...rgba, a: 1 });
    const fill = channel === "hue" ? hueHex(color.value.h) : toHex(rgba, channel === "alpha");

    return (
        <div
            className={cx(
                "ow-color-slider",
                `ow-color-slider--${orientation}`,
                {
                    "ow-color-slider--alpha": channel === "alpha",
                    "ow-color-slider--dragging": drag.dragging,
                    "ow-color-slider--pointer": drag.pointerFocus,
                    "ow-color-slider--disabled": disabled,
                },
                className,
            )}
        >
            {label || showValue ? (
                <div className="ow-color-slider__header">
                    {label ? (
                        <span id={labelId} className="ow-color-slider__label">
                            {label}
                        </span>
                    ) : (
                        <span />
                    )}
                    {showValue ? (
                        <output className="ow-color-slider__value" aria-hidden="true">
                            {shown}
                        </output>
                    ) : null}
                </div>
            ) : null}
            <div
                ref={trackRef}
                className="ow-color-slider__track"
                style={
                    {
                        "--ow-color-slider-gradient": `linear-gradient(var(--ow-color-slider-direction), ${gradient(channel, color.value, rgba)})`,
                    } as CSSProperties
                }
                {...drag.handlers}
            >
                <div
                    className="ow-color-slider__thumb"
                    style={{ "--ow-color-slider-position": `${(current / spec.max) * 100}%`, "--ow-color-slider-thumb": fill } as CSSProperties}
                >
                    <input
                        ref={(element) => {
                            inputRef.current = element;
                            assignRef(ref, element);
                        }}
                        id={id}
                        type="range"
                        className="ow-visually-hidden"
                        min={0}
                        max={spec.max}
                        step={1}
                        value={Math.round(current)}
                        disabled={disabled}
                        aria-orientation={orientation}
                        aria-labelledby={label ? labelId : ariaLabelledBy}
                        aria-label={label || ariaLabelledBy || (id && !ariaLabel) ? undefined : (ariaLabel ?? spec.name)}
                        aria-valuetext={channel === "alpha" ? shown : `${shown}, ${named}`}
                        aria-describedby={ariaDescribedBy}
                        onChange={(event) => change(Number(event.target.value))}
                        onKeyDown={onKeyDown}
                        onBlur={drag.keyboard}
                        onKeyUp={(event) => {
                            if (/^(Arrow|Page|Home|End)/.test(event.key)) end();
                        }}
                    />
                </div>
            </div>
            {name ? <input type="hidden" name={name} value={color.hex} /> : null}
        </div>
    );
});
