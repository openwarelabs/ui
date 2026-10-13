import type { CSSProperties } from "react";

/** The eleven steps of a brand scale, as in --ow-brand-50 … --ow-brand-950. */
export const brandSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export type BrandStep = (typeof brandSteps)[number];
export type BrandScale = Record<BrandStep, string>;

export interface BrandPreset {
    id: string;
    name: string;
    scale: BrandScale;
}

// Midnight's lightness and chroma at each step, in OKLCH. Every scale is built on this lightness curve, so white
// text on step 600 (light) and 500 (dark), and the focus rings on 500 and 400, keep their contrast whatever the hue.
const lightness = [0.968, 0.94, 0.89, 0.81, 0.68, 0.53, 0.42, 0.33, 0.27, 0.22, 0.17];
const chroma = [0.012, 0.022, 0.04, 0.066, 0.1, 0.135, 0.134, 0.086, 0.072, 0.058, 0.045];
const peakChroma = 0.135;

type Lch = { l: number; c: number; h: number };

function parseHex(color: string): [number, number, number] {
    let hex = color.trim().replace(/^#/, "");
    if (hex.length === 3 || hex.length === 4) hex = [...hex.slice(0, 3)].map((d) => d + d).join("");
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex)) throw new Error(`brandScale: "${color}" isn't a hex colour like #2563eb.`);
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
}

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const fromLinear = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

function hexToOklch(color: string): Lch {
    const [r, g, b] = parseHex(color).map(toLinear) as [number, number, number];
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return { l: L, c: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}

function oklchToLinear({ l: L, c, h }: Lch): [number, number, number] {
    const A = c * Math.cos((h * Math.PI) / 180);
    const B = c * Math.sin((h * Math.PI) / 180);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
}

const inGamut = (rgb: number[]) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/** The colour at this lightness and hue, with as much of the wanted chroma as sRGB can show. */
function toHex(color: Lch): string {
    let { c } = color;
    if (!inGamut(oklchToLinear(color))) {
        let low = 0;
        let high = c;
        for (let i = 0; i < 24; i += 1) {
            const mid = (low + high) / 2;
            if (inGamut(oklchToLinear({ ...color, c: mid }))) low = mid;
            else high = mid;
        }
        c = low;
    }
    return `#${oklchToLinear({ ...color, c })
        .map((v) => Math.round(Math.min(1, Math.max(0, fromLinear(Math.min(1, Math.max(0, v))))) * 255))
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")}`;
}

/**
 * Builds the eleven brand steps from one colour: its hue and colourfulness on Openware's lightness curve.
 * The steps keep midnight's contrast in both themes, so your exact colour may land a little lighter or
 * darker than given. A grey gives a neutral scale.
 *
 * `brandScale("#0d9488")` → `{ 50: "#ebf7f6", …, 600: "#00595a", …, 950: "#001414" }`
 */
export function brandScale(color: string): BrandScale {
    const { c, h } = hexToOklch(color);
    const strength = Math.min(1.6, c / peakChroma);
    return Object.fromEntries(brandSteps.map((step, i) => [step, toHex({ l: lightness[i]!, c: chroma[i]! * strength, h })])) as BrandScale;
}

/** A colour or a scale as the --ow-brand-* custom properties, for a `style` prop or `element.style`. */
export function brandVariables(brand: string | BrandScale): CSSProperties {
    const scale = typeof brand === "string" ? brandScale(brand) : brand;
    return Object.fromEntries(brandSteps.map((step) => [`--ow-brand-${step}`, scale[step]])) as CSSProperties;
}

/** A colour or a scale as CSS to paste into a stylesheet. */
export function brandCss(brand: string | BrandScale, selector = ":root"): string {
    const scale = typeof brand === "string" ? brandScale(brand) : brand;
    return `${selector} {\n${brandSteps.map((step) => `    --ow-brand-${step}: ${scale[step]};`).join("\n")}\n}`;
}

/**
 * Rebrands everything inside `element` (the whole page by default) by setting the --ow-brand-* properties on
 * it. Pass `null` to go back to midnight. Elements with their own data-theme set their own brand steps, so
 * give those the same properties, or use brandCss with `:root, [data-theme]` in a stylesheet.
 */
export function applyBrand(brand: string | BrandScale | null, element: HTMLElement = document.documentElement) {
    for (const step of brandSteps) element.style.removeProperty(`--ow-brand-${step}`);
    if (brand === null) return;
    const variables = brandVariables(brand) as Record<string, string>;
    for (const [name, value] of Object.entries(variables)) element.style.setProperty(name, value);
}

/** Seven ready-made scales, each checked for contrast in both themes. Midnight is the default. */
export const brandPresets: BrandPreset[] = [
    {
        id: "midnight",
        name: "Midnight",
        scale: {
            50: "#f2f3fc",
            100: "#e7e9f9",
            200: "#d4d7f4",
            300: "#b7bbea",
            400: "#898cd0",
            500: "#5856ad",
            600: "#312c7e",
            700: "#1e1b4b",
            800: "#18163d",
            900: "#13112f",
            950: "#0b0a20",
        },
    },
    {
        id: "ocean",
        name: "Ocean",
        scale: {
            50: "#edf5fe",
            100: "#dfedfd",
            200: "#c3defa",
            300: "#9ac5f3",
            400: "#5a9de0",
            500: "#006ebe",
            600: "#004f8a",
            700: "#003763",
            800: "#00274a",
            900: "#001b36",
            950: "#001023",
        },
    },
    {
        id: "teal",
        name: "Teal",
        scale: {
            50: "#ebf7f7",
            100: "#daf1f0",
            200: "#bae4e4",
            300: "#87d0cf",
            400: "#1fadad",
            500: "#007c7c",
            600: "#005959",
            700: "#003e3e",
            800: "#002d2d",
            900: "#002020",
            950: "#001313",
        },
    },
    {
        id: "forest",
        name: "Forest",
        scale: {
            50: "#eef7f0",
            100: "#e0f0e3",
            200: "#c6e4cd",
            300: "#9ecfaa",
            400: "#5fac76",
            500: "#008240",
            600: "#005d2d",
            700: "#00411d",
            800: "#003014",
            900: "#00220c",
            950: "#001506",
        },
    },
    {
        id: "plum",
        name: "Plum",
        scale: {
            50: "#f9f2f9",
            100: "#f4e6f4",
            200: "#ead1eb",
            300: "#dab1db",
            400: "#bb80be",
            500: "#95489a",
            600: "#732778",
            700: "#4d2150",
            800: "#39163b",
            900: "#290e2b",
            950: "#1a071b",
        },
    },
    {
        id: "rose",
        name: "Rose",
        scale: {
            50: "#fef1f1",
            100: "#fce5e6",
            200: "#f8cfd1",
            300: "#eeadb1",
            400: "#d67981",
            500: "#b43b4e",
            600: "#8e1331",
            700: "#5e1924",
            800: "#470f19",
            900: "#330910",
            950: "#210408",
        },
    },
    {
        id: "ember",
        name: "Ember",
        scale: {
            50: "#fdf2ec",
            100: "#fae7dd",
            200: "#f5d3c0",
            300: "#eab395",
            400: "#d18254",
            500: "#a94e00",
            600: "#7b3700",
            700: "#572500",
            800: "#411900",
            900: "#2f1100",
            950: "#1e0800",
        },
    },
];
