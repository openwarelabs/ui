// esbuild keeps one `import { … } from "react"` per module it bundles, so dist/index.js opened with 180-odd of them.
// They cost nothing once an app bundles React, but a bundler that keeps React external (and scripts/size.mjs) carries
// every one, used or not. This merges them into one statement per package. Each statement it removes leaves as many
// blank lines as it had, so line numbers, and the source map, stay right.

const statement = /^import \{([^}]*)\} from "([^"]+)";$/gm;

/** The ESM build's code with its named imports merged, one statement per package, where the first one was. */
export function mergeImports(code) {
    const names = new Map();
    let first = -1;
    const merged = code.replace(statement, (match, specifiers, from, offset) => {
        if (first === -1) first = offset;
        if (!names.has(from)) names.set(from, new Set());
        for (const name of specifiers.split(",")) if (name.trim()) names.get(from).add(name.trim());
        return "\n".repeat(match.split("\n").length - 1);
    });
    if (first === -1) return code;
    const imports = [...names].map(([from, set]) => `import { ${[...set].join(", ")} } from "${from}";`).join(" ");
    return merged.slice(0, first) + imports + merged.slice(first);
}
