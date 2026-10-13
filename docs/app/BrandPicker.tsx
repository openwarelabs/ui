import { useEffect, useId, useState } from "react";

import { ColorPicker, brandScale } from "@openwarelabs/ui";
import { Check } from "lucide-react";

import { brandPresets, setBrand, swatchOf, useBrand } from "./brands";

/**
 * The docs' theme colour: seven presets, or any colour from a ColorPicker. `compact` draws the presets as
 * tiles for the header's popover and opens the picker when Custom is chosen; otherwise they're named pills,
 * for the Theming page, with the picker beside them.
 */
export function BrandPicker({ compact = false }: { compact?: boolean }) {
    const brand = useBrand();
    const name = useId();
    const [custom, setCustom] = useState(brand.color ?? "#0d9488");

    useEffect(() => {
        if (brand.color) setCustom(brand.color);
    }, [brand.color]);

    const customScale = (() => {
        try {
            return brandScale(custom);
        } catch {
            return brandPresets[0]!.scale;
        }
    })();

    function pickCustom(color: string, animate = true) {
        setCustom(color);
        setBrand({ id: "custom", color }, { animate });
    }

    const options = [
        ...brandPresets.map((preset) => ({ id: preset.id, label: preset.name, swatch: swatchOf(preset.scale) })),
        { id: "custom", label: "Custom", swatch: swatchOf(customScale) },
    ];
    const showPicker = !compact || brand.id === "custom";

    return (
        <div className={`docs-colour-picker${compact ? " docs-colour-picker--compact" : ""}`}>
            <fieldset className="docs-colour-picker__options">
                <legend className={compact ? "ow-visually-hidden" : "docs-colour-picker__legend"}>Theme colour</legend>
                {options.map((option) => {
                    const checked = brand.id === option.id;
                    return (
                        <label key={option.id} className="docs-brand-option" title={compact ? option.label : undefined}>
                            <input
                                type="radio"
                                name={name}
                                value={option.id}
                                checked={checked}
                                onChange={() => (option.id === "custom" ? pickCustom(custom) : setBrand({ id: option.id }))}
                                className="docs-brand-option__input"
                            />
                            <span className="docs-brand-option__swatch" style={{ background: option.swatch }} aria-hidden="true">
                                {compact && checked ? <Check size={14} strokeWidth={3} /> : null}
                            </span>
                            <span className={compact ? "ow-visually-hidden" : undefined}>{option.label}</span>
                        </label>
                    );
                })}
            </fieldset>
            <div className="docs-colour-picker__custom" data-open={showPicker || undefined}>
                <div className="docs-colour-picker__clip">
                    {showPicker ? (
                        <ColorPicker aria-label="Custom theme colour" value={custom} onChange={(color) => pickCustom(color, false)} />
                    ) : null}
                </div>
            </div>
            {compact ? (
                <p className="docs-colour-picker__note">
                    {brand.id === "custom" ? "Any colour works: the scale is rebuilt so contrast holds." : "Pick Custom for any colour."} Remembered in this browser.
                </p>
            ) : null}
        </div>
    );
}
