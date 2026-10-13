import type { ComponentType } from "react";

export const categories = ["Typography", "Actions", "Inputs", "Choices", "Pickers", "Feedback", "Overlays", "Navigation", "Data display", "Layout", "Marketing"] as const;

export type Category = (typeof categories)[number];

/** What each docs/examples/<Name>.tsx file exports as `meta`. */
export interface DocMeta {
    /** The component's name, as imported. */
    title: string;
    category: Category;
    /** One or two sentences: what it is and when to use it. */
    description: string;
    /** The names in the import snippet. Defaults to [title]. */
    imports?: string[];
    /** Props interfaces for the API reference. Defaults to [`${title}Props`]. */
    props?: string[];
    /** Keyboard behaviour: [keys, what they do]. */
    keyboard?: Array<[string, string]>;
    /** Accessibility and usage notes, one sentence each. */
    notes?: string[];
    /** The source file under src/, for the Source link. */
    source: string;
    /** Other pages to point to at the end. */
    related?: string[];
    /** The release that added it, e.g. "0.3.0": the sidebar marks it new until the next minor release (0.4.0). */
    since?: string;
}

/** How an example's preview box is laid out; set as `MyExample.layout = {…}` beside it. */
export interface ExampleLayout {
    /** `center` (default) centres the example; `start` lines it up top-left, for forms and lists. */
    align?: "center" | "start";
    /** Lets the example use the full width of the box. */
    fill?: boolean;
    /** The box's minimum height in pixels. */
    minHeight?: number;
    /** `canvas` puts the example on the app's grey ground, for things meant to sit on it. */
    ground?: "surface" | "canvas" | "paper";
}

export type DocModule = { meta: DocMeta } & Record<string, unknown>;

export interface GeneratedExample {
    name: string;
    title: string;
    description: string;
    code: string;
    html: string;
}

export interface ExampleEntry extends GeneratedExample {
    Component: ComponentType;
    layout: ExampleLayout;
}

export interface ComponentDoc {
    slug: string;
    meta: DocMeta;
    examples: ExampleEntry[];
}

export interface PropDoc {
    name: string;
    type: string;
    required: boolean;
    default?: string;
    description: string;
}

export interface PropsDoc {
    props: PropDoc[];
    /** The HTML element whose attributes it also accepts. */
    element?: string;
    description: string;
}

export interface TokenEntry {
    name: string;
    value: string | Record<string, string>;
    usage?: string;
}

export interface TypeStyle {
    name: string;
    fontSize: string;
    lineHeight: number | string;
    fontWeight: number | string;
    letterSpacing?: string;
    sample?: string;
    usage?: string;
}

export interface TokensFile {
    color: { themes: Array<{ id: string; name: string }>; tokens: TokenEntry[] };
    type: {
        fonts: Array<{ family: string; file: string; weight: string }>;
        families: Record<string, string>;
        groups: Array<{ name: string; family: string; note?: string; styles: TypeStyle[] }>;
    };
    spacing: { tokens: TokenEntry[] };
    radius: { tokens: TokenEntry[] };
    shadow: { tokens: TokenEntry[] };
    timing: { tokens: TokenEntry[] };
    weight: { tokens: TokenEntry[] };
}
