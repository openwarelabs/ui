import { forwardRef, useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ForwardedRef } from "react";
import { HexAlphaColorPicker, HexColorInput, HexColorPicker } from "react-colorful";

import { useControllableState } from "@/hooks/useControllableState";
import { manualPopover, useDismiss, useFloating, type Placement } from "@/hooks/useFloating";
import { usePresence } from "@/hooks/usePresence";
import { ChevronDownIcon, PipetteIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type { ColorFieldProps, ColorPickerProps, ColorSwatchOption, EyeDropperResult } from "./ColorPicker.types";
export type { ColorFieldProps, ColorPickerProps, ColorSwatchOption } from "./ColorPicker.types";

const swatchColor = (swatch: ColorSwatchOption) => (typeof swatch === "string" ? swatch : swatch.color);
const swatchName = (swatch: ColorSwatchOption) => (typeof swatch === "string" ? swatch : swatch.name);
const same = (a: string, b: string) => a.toLowerCase().replace(/^#/, "") === b.toLowerCase().replace(/^#/, "");

/**
 * Picks a colour: a saturation area and a hue slider (react-colorful, dressed in Openware's look), a hex field,
 * an eyedropper where the browser has one, and optional swatches. The area and sliders work with the arrow keys.
 */
export function ColorPicker({
    value,
    defaultValue = "#312c7e",
    onChange,
    alpha = false,
    swatches,
    showInput = true,
    eyeDropper = true,
    "aria-label": ariaLabel = "Colour",
    className,
}: ColorPickerProps) {
    const [color, setColor] = useControllableState(value, defaultValue, onChange);
    const [canPick, setCanPick] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    useEffect(() => setCanPick(typeof window !== "undefined" && "EyeDropper" in window), []);

    // react-colorful names its sliders "Color", "Hue" and "Alpha"; read them out in Openware's words.
    useEffect(() => {
        const names: Record<string, string> = { saturation: "Colour", hue: "Hue", alpha: "Opacity" };
        for (const [part, label] of Object.entries(names)) {
            rootRef.current?.querySelector(`.react-colorful__${part} .react-colorful__interactive`)?.setAttribute("aria-label", label);
        }
    }, [alpha]);
    const Picker = alpha ? HexAlphaColorPicker : HexColorPicker;
    const change = (next: string) => setColor(next.toLowerCase());

    async function pickFromScreen() {
        if (!window.EyeDropper) return;
        try {
            const result = await new window.EyeDropper().open();
            change(result.sRGBHex);
        } catch {
            // Escape pressed: nothing picked.
        }
    }

    return (
        <div ref={rootRef} role="group" aria-label={ariaLabel} className={cx("ow-color-picker", className)}>
            <Picker color={color} onChange={change} />
            {showInput || (eyeDropper && canPick) ? (
                <div className="ow-color-picker__row">
                    {eyeDropper && canPick ? (
                        <button type="button" className="ow-color-picker__dropper" aria-label="Pick a colour from the screen" onClick={pickFromScreen}>
                            <PipetteIcon size={15} />
                        </button>
                    ) : null}
                    {showInput ? (
                        <span className="ow-input-group ow-input-group--sm ow-color-picker__input">
                            <span className="ow-input-group__addon" aria-hidden="true">
                                #
                            </span>
                            <HexColorInput
                                className="ow-input-group__input"
                                color={color}
                                onChange={change}
                                alpha={alpha}
                                aria-label="Hex colour"
                                spellCheck={false}
                            />
                        </span>
                    ) : null}
                    <span className="ow-color-picker__preview" style={{ "--ow-color-picker-value": color } as CSSProperties} aria-hidden="true" />
                </div>
            ) : null}
            {swatches?.length ? (
                <div className="ow-color-picker__swatches" role="group" aria-label="Swatches">
                    {swatches.map((swatch) => {
                        const swatchValue = swatchColor(swatch);
                        return (
                            <button
                                key={swatchValue}
                                type="button"
                                className="ow-color-picker__swatch"
                                style={{ "--ow-color-picker-value": swatchValue } as CSSProperties}
                                aria-label={swatchName(swatch)}
                                aria-pressed={same(swatchValue, color)}
                                title={swatchName(swatch)}
                                onClick={() => change(swatchValue)}
                            />
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
    if (typeof ref === "function") ref(value);
    else if (ref) ref.current = value;
}

/** A field that shows a colour and its hex, and opens a ColorPicker below. Escape or a click outside closes it. */
export const ColorField = forwardRef<HTMLButtonElement, ColorFieldProps>(function ColorField(
    {
        value,
        defaultValue = "#312c7e",
        onChange,
        size = "md",
        isInvalid = false,
        disabled = false,
        placement = "bottom-start",
        id,
        className,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        ...pickerProps
    },
    ref,
) {
    const [color, setColor] = useControllableState(value, defaultValue, onChange);
    const [isOpen, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const panelId = useId();
    const { mounted, state } = usePresence(isOpen);
    const style = useFloating({ open: mounted, anchorRef: triggerRef, floatingRef: panelRef, placement, offset: 6, maxHeight: 640 });

    const close = useCallback((reason?: "outside" | "escape") => {
        setOpen(false);
        if (reason !== "outside") triggerRef.current?.focus();
    }, []);
    useDismiss(isOpen, [panelRef, triggerRef], close);

    // Focus the colour area when it opens, so the arrow keys work straight away.
    useEffect(() => {
        if (!isOpen) return undefined;
        const frame = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>(".react-colorful__interactive")?.focus());
        return () => cancelAnimationFrame(frame);
    }, [isOpen]);

    return (
        <>
            <button
                ref={(element) => {
                    triggerRef.current = element;
                    assignRef(ref, element);
                }}
                id={id}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-controls={isOpen ? panelId : undefined}
                // Named by its label, then the value it shows: the name holds the visible text, as voice control needs.
                aria-label={ariaLabel && !ariaLabelledBy ? `${ariaLabel}, ${color.toUpperCase()}` : undefined}
                aria-labelledby={ariaLabelledBy ? `${ariaLabelledBy} ${panelId}-value` : undefined}
                aria-describedby={ariaDescribedBy}
                aria-invalid={isInvalid || undefined}
                disabled={disabled}
                className={cx(
                    "ow-select",
                    "ow-color-field",
                    `ow-select--${size}`,
                    { "ow-select--open": isOpen, "ow-select--invalid": isInvalid && !isOpen },
                    className,
                )}
                onClick={() => setOpen(!isOpen)}
                onKeyDown={(event) => {
                    if (event.key === "ArrowDown" && !isOpen) {
                        event.preventDefault();
                        setOpen(true);
                    }
                }}
            >
                <span className="ow-color-field__swatch" style={{ "--ow-color-picker-value": color } as CSSProperties} aria-hidden="true" />
                <span id={`${panelId}-value`} className="ow-select__value ow-color-field__value">
                    {color.toUpperCase()}
                </span>
                <ChevronDownIcon size={size === "sm" ? 14 : 16} className="ow-select__chevron" />
            </button>
            {mounted ? (
                <div
                    ref={panelRef}
                    {...manualPopover}
                    data-state={state}
                    id={panelId}
                    role="dialog"
                    aria-label="Choose a colour"
                    className="ow-popover ow-floating ow-color-field__panel"
                    style={style}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && (event.target as HTMLElement).closest(".react-colorful")) close();
                    }}
                >
                    <ColorPicker {...pickerProps} value={color} onChange={setColor} />
                </div>
            ) : null}
        </>
    );
});
