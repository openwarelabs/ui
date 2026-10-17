/*
 * @openwarelabs/eslint-plugin-ui: ESLint rules for code written with Openware UI, for people and for the AI tools
 * that write it. The library's exports, props, tokens and classes are bundled in from the docs' data
 * (scripts/eslint-manifest.mjs), so the rules answer for the release they match; the MCP server's check_code
 * runs the same rules.
 */
import type { ESLint, Linter } from "eslint";

import { manifest } from "@plugin/manifest";
import { importFromPackage } from "@plugin/rules/import-from-package";
import { inputNeedsField } from "@plugin/rules/input-needs-field";
import { noInlineColour } from "@plugin/rules/no-inline-colour";
import { noRawControls } from "@plugin/rules/no-raw-controls";
import { validProps } from "@plugin/rules/valid-props";
import { validTokens } from "@plugin/rules/valid-tokens";

export const rules = {
    "no-raw-controls": noRawControls,
    "no-inline-colour": noInlineColour,
    "input-needs-field": inputNeedsField,
    "valid-props": validProps,
    "import-from-package": importFromPackage,
    "valid-tokens": validTokens,
};

const plugin: ESLint.Plugin & { configs: { recommended: Linter.Config } } = {
    meta: { name: "@openwarelabs/eslint-plugin-ui", version: manifest.version },
    rules,
    configs: { recommended: {} },
};

/** Every rule as an error, on JS and TS files, with JSX on. A TypeScript project adds its parser. */
const recommended: Linter.Config = {
    name: "openware-ui/recommended",
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { "openware-ui": plugin },
    rules: Object.fromEntries(Object.keys(rules).map((rule) => [`openware-ui/${rule}`, "error"])),
};
plugin.configs.recommended = recommended;

export const configs = plugin.configs;
export { manifest };
export default plugin;
