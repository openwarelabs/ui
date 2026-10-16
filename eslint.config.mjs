// ESLint here is for React's hooks rules, the bugs TypeScript and Prettier don't catch: hooks called
// conditionally, and effects, callbacks and memos missing a value they read (so they run with stale state).
// eslint-suppressions.json holds the problems there were when it started; only new ones fail. Fix one and run
// `npx eslint --prune-suppressions` to take it off the list.
//
// The docs and the blocks are also checked with the library's own plugin (eslint/), as an app using the library
// would be: the components instead of raw controls, real props and values, labelled inputs, tokens. It needs
// `npm run eslint:build` first; without the build, the hooks rules still run.
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const openware = await import("./eslint/dist/index.js").then((module) => module.default).catch(() => null);

export default [
    // docs/snippets are JSX fragments shown in the docs, not modules.
    { ignores: ["**/dist/**", "docs-dist/**", "mcp/dist/**", "eslint/build/**", ".tmp/**", "node_modules/**", "docs/snippets/**"] },
    {
        files: ["src/**/*.{ts,tsx}", "blocks/src/**/*.{ts,tsx}", "docs/**/*.{ts,tsx}", "eslint/src/**/*.ts", "mcp/src/**/*.ts"],
        languageOptions: { parser: tseslint.parser },
        plugins: { "react-hooks": reactHooks },
        rules: {
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "error",
        },
    },
    ...(openware
        ? [
              {
                  ...openware.configs.recommended,
                  files: ["blocks/src/**/*.tsx", "docs/examples/**/*.tsx", "docs/blocks/**/*.tsx"],
                  languageOptions: { parser: tseslint.parser },
              },
              {
                  // Raw HTML is the point of these examples: Prose styles rendered HTML (a task list's checkboxes),
                  // and Lightbox opens from pictures that are buttons.
                  files: ["docs/examples/Prose.tsx", "docs/examples/Lightbox.tsx"],
                  rules: { "openware-ui/no-raw-controls": "off" },
              },
          ]
        : []),
];
