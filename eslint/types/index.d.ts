import type { ESLint, Linter, Rule } from "eslint";

export interface Manifest {
    version: string;
    package: string;
    blocksPackage: string;
    exports: string[];
    blocks: string[];
    components: Record<string, { element: string | null; props: Record<string, string[] | null> }>;
    properties: string[];
    colours: Record<string, string>;
    classes: string[];
    internalClasses: Record<string, string>;
}

export declare const rules: {
    "no-raw-controls": Rule.RuleModule;
    "no-inline-colour": Rule.RuleModule;
    "input-needs-field": Rule.RuleModule;
    "valid-props": Rule.RuleModule;
    "import-from-package": Rule.RuleModule;
    "valid-tokens": Rule.RuleModule;
};

export declare const configs: { recommended: Linter.Config };

/** What the plugin knows about the library: its exports, props, tokens and classes, for the release it matches. */
export declare const manifest: Manifest;

declare const plugin: ESLint.Plugin & { rules: typeof rules; configs: typeof configs };
export default plugin;
