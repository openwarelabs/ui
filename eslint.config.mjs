// ESLint here is only for React's hooks rules, the bugs TypeScript and Prettier don't catch: hooks called
// conditionally, and effects, callbacks and memos missing a value they read (so they run with stale state).
// eslint-suppressions.json holds the problems there were when it started; only new ones fail. Fix one and run
// `npx eslint --prune-suppressions` to take it off the list.
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default [
    // docs/snippets are JSX fragments shown in the docs, not modules.
    { ignores: ["**/dist/**", "docs-dist/**", "mcp/dist/**", ".tmp/**", "node_modules/**", "docs/snippets/**"] },
    {
        files: ["src/**/*.{ts,tsx}", "blocks/src/**/*.{ts,tsx}", "docs/**/*.{ts,tsx}"],
        languageOptions: { parser: tseslint.parser },
        plugins: { "react-hooks": reactHooks },
        rules: {
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "error",
        },
    },
];
