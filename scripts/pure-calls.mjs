// Shared by the library's and the blocks' builds (scripts/build.mjs, scripts/build-blocks.mjs).
import fs from "node:fs";

/**
 * Marks the calls that make a component (forwardRef, createContext, memo, a displayName, and the icons' icon() and
 * lucide()) as pure, with the comment bundlers read, so an app that imports one component doesn't get the whole
 * library: unused ones drop out. scripts/size.mjs checks it.
 */
export const pureCalls = {
    name: "pure-calls",
    setup(builder) {
        builder.onLoad({ filter: /[\\/]src[\\/].*\.tsx?$/ }, (args) => {
            const source = fs.readFileSync(args.path, "utf8");
            const contents = source
                // `const X = forwardRef(…);` then `X.displayName = "X";`, as one expression a bundler can drop.
                .replace(
                    /^((?:export )?const (\w+)(?:: [^=\n]+)? = )([^;\n]+);\n\2\.displayName = ("[^"\n]*");$/gm,
                    "$1Object.assign(/* @__PURE__ */ $3, { displayName: $4 });",
                )
                .replace(/^((?:export )?const \w+(?:: [^=\n]+)? = )(forwardRef|createContext|memo|icon|lucide|Object\.assign)\b/gm, "$1/* @__PURE__ */ $2");
            return { contents, loader: args.path.endsWith(".tsx") ? "tsx" : "ts" };
        });
    },
};
