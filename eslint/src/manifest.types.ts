/** One component's props, as the docs read them from its <Name>Props interface. */
export interface ComponentManifest {
    /** The HTML element whose attributes it also accepts ("button", "input", "element"…), or null. */
    element: string | null;
    /** Each prop's allowed values when it's a choice of strings ('primary' | 'secondary'), else null. */
    props: Record<string, string[] | null>;
}

/** What the plugin knows about the library: eslint/build/manifest.json, from scripts/eslint-manifest.mjs. */
export interface Manifest {
    version: string;
    package: string;
    blocksPackage: string;
    /** Every value export of @openwarelabs/ui. */
    exports: string[];
    /** Every value export of @openwarelabs/blocks. */
    blocks: string[];
    components: Record<string, ComponentManifest>;
    /** Every --ow- custom property: the tokens and the ones the components define. */
    properties: string[];
    /** A colour token's value (lower-case hex) → its custom property, to name a hard-coded colour. */
    colours: Record<string, string>;
    /** Classes an app may use: ow-app, the type styles and the blocks' own classes. */
    classes: string[];
    /** A component's own class → the component, for code that reaches for it instead of the component. */
    internalClasses: Record<string, string>;
}
