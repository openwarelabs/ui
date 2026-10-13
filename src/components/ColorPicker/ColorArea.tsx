import { forwardRef, useRef, useState, type CSSProperties, type ForwardedRef, type KeyboardEvent } from "react";

import { cx } from "../../utils/cx";
import { clamp, describeColor, hsvModel, hueHex, toHex, useColorModel, useDrag } from "./color";

export interface ColorAreaProps {
    /** The colour as hex, "#0d9488". Given with alpha ("#0d9488cc"), it keeps the alpha. */
    value?: string;
    /** The starting colour when uncontrolled.
     * @default "#312c7e" */
    defaultValue?: string;
    /** Called with a lowercase hex as the person drags or presses the arrow keys. */
    onChange?(color: string): void;
    /** Called when the person lets go or releases the key, for work too slow to do on every move. */
    onChangeEnd?(color: string): void;
    /** The hue to show while the colour is a grey, which has none of its own. Pass a hue ColorSlider's `onHueChange`
     * value here to keep the two in step on greys. Without it, the area keeps the last hue it had. */
    hue?: number;
    /** Pixels, or any CSS width. It never grows past its container.
     * @default 232 */
    width?: number | string;
    /** Pixels, or any CSS height.
     * @default 152 */
    height?: number | string;
    /** Fades it; the pointer and the keys do nothing.
     * @default false */
    disabled?: boolean;
    /** The locale for the percentages screen readers hear. Defaults to the browser's. */
    locale?: string;
    /** The form field name; the hex is submitted under it. */
    name?: string;
    /** Names the area for screen readers; its two sliders are "Saturation" and "Brightness" within it.
     * @default "Colour" */
    "aria-label"?: string;
    /** Names the area by a visible label's id, in place of aria-label. */
    "aria-labelledby"?: string;
    /** Ids of a hint or an error, read out after each slider's value. */
    "aria-describedby"?: string;
    /** The group's id. */
    id?: string;
    /** Classes for the area, e.g. a size. */
    className?: string;
}

type Axis = "x" | "y";

const size = (length: number | string | undefined) => (typeof length === "number" ? `${length}px` : length);

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
    if (typeof ref === "function") ref(value);
    else if (ref) ref.current = value;
}

/**
 * A square of one hue: saturation across, brightness up and down. Drag the thumb, or use the arrow keys.
 * To screen readers it's two sliders, saturation and brightness, each reading out the colour.
 * The ref is the saturation slider's input, for focusing it.
 */
export const ColorArea = forwardRef<HTMLInputElement, ColorAreaProps>(function ColorArea(
    {
        value,
        defaultValue = "#312c7e",
        onChange,
        onChangeEnd,
        hue,
        width,
        height,
        disabled = false,
        locale,
        name,
        "aria-label": ariaLabel = "Colour",
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        id,
        className,
    },
    ref,
) {
    const { value: hsv, rgba, hex, set, latest } = useColorModel(value, defaultValue, onChange, hsvModel, { hue });
    const rootRef = useRef<HTMLDivElement>(null);
    const inputs = useRef<Record<Axis, HTMLInputElement | null>>({ x: null, y: null });
    // Only one of the two sliders is a tab stop: the one last used.
    const [axis, setAxis] = useState<Axis>("x");
    const isRtl = () => (rootRef.current ? getComputedStyle(rootRef.current).direction === "rtl" : false);
    const end = () => onChangeEnd?.(latest());

    const drag = useDrag({
        onMove: (x, y) => set({ ...hsv, s: (isRtl() ? 1 - x : x) * 100, v: (1 - y) * 100 }),
        onEnd: end,
        onStart: () => inputs.current[axis]?.focus({ preventScroll: true }),
        disabled,
    });

    function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        drag.keyboard();
        const step = event.shiftKey ? 10 : 1;
        const forward = isRtl() ? -1 : 1;
        let { s, v } = hsv;
        let moved: Axis = "x";
        switch (event.key) {
            case "ArrowRight":
                s = Math.round(s) + step * forward;
                break;
            case "ArrowLeft":
                s = Math.round(s) - step * forward;
                break;
            case "Home":
                s = 0;
                break;
            case "End":
                s = 100;
                break;
            case "ArrowUp":
            case "PageUp":
                v = Math.round(v) + (event.key === "PageUp" ? 10 : step);
                moved = "y";
                break;
            case "ArrowDown":
            case "PageDown":
                v = Math.round(v) - (event.key === "PageDown" ? 10 : step);
                moved = "y";
                break;
            default:
                return;
        }
        event.preventDefault();
        set({ ...hsv, s: clamp(s, 0, 100), v: clamp(v, 0, 100) });
        // Move focus to the slider for the axis that changed, so a screen reader reads that one.
        if (moved !== axis) {
            setAxis(moved);
            inputs.current[moved]?.focus({ preventScroll: true });
        }
    }

    function onKeyUp(event: KeyboardEvent<HTMLInputElement>) {
        if (/^(Arrow|Page|Home|End)/.test(event.key)) end();
    }

    const percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 });
    const saturation = `Saturation ${percent.format(hsv.s / 100)}`;
    const brightness = `brightness ${percent.format(hsv.v / 100)}`;
    const colorName = describeColor(rgba);

    const input = (which: Axis) => (
        <input
            ref={(element) => {
                inputs.current[which] = element;
                if (which === "x") assignRef(ref, element);
            }}
            type="range"
            className="ow-visually-hidden"
            min={0}
            max={100}
            step={1}
            value={Math.round(which === "x" ? hsv.s : hsv.v)}
            disabled={disabled}
            tabIndex={axis === which ? undefined : -1}
            aria-label={which === "x" ? "Saturation" : "Brightness"}
            aria-roledescription="2D slider"
            aria-orientation={which === "x" ? "horizontal" : "vertical"}
            aria-valuetext={
                which === "x"
                    ? `${saturation}, ${brightness}, ${colorName}`
                    : `${brightness[0]!.toUpperCase()}${brightness.slice(1)}, ${saturation.toLowerCase()}, ${colorName}`
            }
            aria-describedby={ariaDescribedBy}
            onChange={(event) => set({ ...hsv, [which === "x" ? "s" : "v"]: Number(event.target.value) })}
            onFocus={() => setAxis(which)}
            onBlur={drag.keyboard}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
        />
    );

    return (
        <div
            ref={rootRef}
            id={id}
            role="group"
            aria-label={ariaLabelledBy ? undefined : ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-disabled={disabled || undefined}
            className={cx(
                "ow-color-area",
                { "ow-color-area--dragging": drag.dragging, "ow-color-area--pointer": drag.pointerFocus, "ow-color-area--disabled": disabled },
                className,
            )}
            style={
                {
                    "--ow-color-area-hue": hueHex(hsv.h),
                    "--ow-color-area-width": size(width),
                    "--ow-color-area-height": size(height),
                } as CSSProperties
            }
            {...drag.handlers}
        >
            <div
                className="ow-color-area__thumb"
                style={{ "--ow-color-area-x": `${hsv.s}%`, "--ow-color-area-y": `${100 - hsv.v}%`, "--ow-color-area-color": toHex(rgba) } as CSSProperties}
            >
                {input("x")}
                {input("y")}
            </div>
            {name ? <input type="hidden" name={name} value={hex} /> : null}
        </div>
    );
});
