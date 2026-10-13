import { CopyButton } from "@openwarelabs/ui";
import tokens from "docs:tokens";

import { brandPresets, brandSteps, useBrand } from "../app/brands";
import { slugify } from "../app/content";
import { DocPage, Section } from "../app/Page";
import type { TokenEntry } from "../app/types";

const all = tokens.color.tokens;
const byName = new Map(all.map((token) => [token.name, token]));

function valueIn(token: TokenEntry, theme: "light" | "dark"): string {
    return typeof token.value === "string" ? token.value : (token.value[theme] ?? token.value.light ?? "");
}

/** "{ow-gray-100}" → "gray-100 · #f1f5f9"; color-mix(…brand-400 14%…) → "brand-400 at 14%". */
function describe(value: string, theme: "light" | "dark"): string {
    const alias = /^\{ow-(.+)\}$/.exec(value);
    if (alias) {
        const target = byName.get(`ow-${alias[1]}`);
        return target ? `${alias[1]} · ${describe(valueIn(target, theme), theme).replace(/^.* · /, "")}` : alias[1]!;
    }
    const mix = /^color-mix\(in srgb, var\(--ow-(.+?)\) ([0-9.]+)%, transparent\)$/.exec(value);
    if (mix) return `${mix[1]} at ${mix[2]}%`;
    return value;
}

const groups: Array<{ name: string; intro: string; match: (name: string) => boolean }> = [
    {
        name: "Surfaces",
        intro: "The grounds things sit on, from the canvas behind everything to the controls on top.",
        match: (n) => /^ow-(canvas|paper|surface|surface-muted|control|control-shade|control-shade-hover|hover|disabled|backdrop|dot|header-glass)$/.test(n),
    },
    {
        name: "Text and icons",
        intro: "Four steps of text, each checked against every surface it sits on.",
        match: (n) => /^ow-(text|text-soft|text-muted|text-disabled|icon)$/.test(n),
    },
    {
        name: "Borders and focus",
        intro: "Hairlines in three strengths, and the focus ring every control shares.",
        match: (n) => /^ow-(border|border-strong|border-hover|focus-border|focus-ring)$/.test(n),
    },
    { name: "Primary", intro: "The brand colour in use: the main action, what's selected, and its tints.", match: (n) => /^ow-(primary|on-primary)/.test(n) },
    {
        name: "Brass",
        intro: "The accent, kept small. It's a graphic colour on light grounds; use brass-deep for brass text.",
        match: (n) => n.startsWith("ow-brass"),
    },
    { name: "Danger", intro: "Something failed, or will delete something.", match: (n) => n.startsWith("ow-danger") },
    { name: "Success", intro: "Something worked.", match: (n) => n.startsWith("ow-success") },
    { name: "Warning", intro: "Something needs the person's attention.", match: (n) => n.startsWith("ow-warning") },
];

const scales = /^ow-(brand|gray)-/;
const grouped = new Set(all.filter((token) => scales.test(token.name) || groups.some((group) => group.match(token.name))).map((token) => token.name));
const components = all.filter((token) => !grouped.has(token.name));

function Swatch({ token }: { token: TokenEntry }) {
    const light = valueIn(token, "light");
    const dark = valueIn(token, "dark");
    const same = light === dark;
    const variable = `var(--${token.name})`;
    return (
        <div className="docs-swatch">
            <span className="docs-swatch__chips" aria-hidden="true">
                <span data-theme="light">
                    <span style={{ background: variable }} />
                </span>
                <span data-theme="dark">
                    <span style={{ background: variable }} />
                </span>
            </span>
            <span className="docs-swatch__text">
                <span className="docs-swatch__name">
                    <code>{token.name.replace(/^ow-/, "")}</code>
                    <CopyButton value={variable} label={`Copy ${variable}`} iconOnly className="docs-swatch__copy" />
                </span>
                <span className="docs-swatch__values">
                    {same ? describe(light, "light") : `Light ${describe(light, "light")}  ·  Dark ${describe(dark, "dark")}`}
                </span>
                {token.usage ? <span className="docs-swatch__usage">{token.usage}</span> : null}
            </span>
        </div>
    );
}

function Scale({ prefix, label }: { prefix: "brand" | "gray"; label: string }) {
    const brand = useBrand();
    return (
        <div className="docs-scale" role="list" aria-label={label}>
            {brandSteps.map((step) => {
                const token = byName.get(`ow-${prefix}-${step}`);
                // The brand row shows the theme colour picked in the header, if any.
                const value = prefix === "brand" ? brand.scale[step] : token ? valueIn(token, "light") : "";
                return (
                    <div key={step} className="docs-scale__step" role="listitem">
                        <span className="docs-scale__chip" style={{ background: `var(--ow-${prefix}-${step})` }} />
                        <span className="docs-scale__label">{step}</span>
                        <span className="docs-scale__value">{value}</span>
                    </div>
                );
            })}
        </div>
    );
}

function BrandHeading() {
    const brand = useBrand();
    const name = brand.id === "custom" ? `custom, from ${brand.color}` : (brandPresets.find((preset) => preset.id === brand.id)?.name ?? "").toLowerCase();
    return <h3 className="docs-h3">Brand: {name}</h3>;
}

export function Colours() {
    const sections = [...groups.map((group) => group.name), "Components"];
    return (
        <DocPage
            title="Colours"
            description={`Every colour is a CSS variable, with a value for each theme. The swatches show light on the left and dark on the right. ${all.length} in all.`}
            toc={[{ id: "scales", label: "Scales", level: 2 }, ...sections.map((name) => ({ id: slugify(name), label: name, level: 2 as const }))]}
        >
            <Section
                id="scales"
                title="Scales"
                description="Two scales of eleven steps. Every other colour is made from them, or set beside them. Swap the brand scale to rebrand."
            >
                <BrandHeading />
                <Scale prefix="brand" label="Brand scale" />
                <h3 className="docs-h3">Gray: slate</h3>
                <Scale prefix="gray" label="Gray scale" />
            </Section>
            {groups.map((group) => (
                <Section key={group.name} id={slugify(group.name)} title={group.name} description={group.intro}>
                    <div className="docs-swatches">
                        {all
                            .filter((token) => group.match(token.name))
                            .map((token) => (
                                <Swatch key={token.name} token={token} />
                            ))}
                    </div>
                </Section>
            ))}
            <Section id="components" title="Components" description="Colours for one job each: tooltips, switches, skeletons, code blocks and the like.">
                <div className="docs-swatches">
                    {components.map((token) => (
                        <Swatch key={token.name} token={token} />
                    ))}
                </div>
            </Section>
        </DocPage>
    );
}
