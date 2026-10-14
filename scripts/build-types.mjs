// Makes the declarations tsc writes to dist/ work under every TypeScript module resolution, not only "bundler":
//   @/x      the src/ alias in tsconfig.json becomes a relative path, since the projects using the types don't have it
//   *.d.ts   ESM types: relative imports get the .js (or /index.js) Node needs, so "node16" and "nodenext" find them
//   *.d.cts  the same types for require(), pointing at each other with .cjs, so CommonJS projects get CommonJS types
// package.json's exports send "import" to index.d.ts and "require" to index.d.cts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// `node scripts/build-types.mjs [<dist> <alias>]`: the library's dist/ and its @/ alias by default; the blocks
// package passes blocks/dist and @blocks/.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.resolve(root, process.argv[2] ?? "dist");
const aliasPrefix = process.argv[3] ?? "@/";

const declarations = fs
    .readdirSync(dist, { recursive: true })
    .map(String)
    .filter((file) => file.endsWith(".d.ts"))
    .map((file) => path.join(dist, file));

// from "./x", import("./x"), export * from "../y": every relative specifier in a declaration.
const specifier = /((?:from|import)\s*\(?\s*)(["'])(\.{1,2}\/[^"']*)\2/g;

/** "./components/Button/Button" → "./components/Button/Button.js"; a folder → "./folder/index.js". */
function withExtension(file, target, extension) {
    if (/\.(c|m)?js$/.test(target)) return target.replace(/\.(c|m)?js$/, extension);
    const resolved = path.resolve(path.dirname(file), target);
    if (fs.existsSync(`${resolved}.d.ts`)) return `${target}${extension}`;
    if (fs.existsSync(path.join(resolved, "index.d.ts"))) return `${target}/index${extension}`;
    throw new Error(`${path.relative(dist, file)}: can't find the declaration for "${target}"`);
}

// from "@/hooks/useFloating": the alias for src/, which is dist/ once built.
const escaped = aliasPrefix.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const alias = new RegExp(`((?:from|import)\\s*\\(?\\s*)(["'])${escaped}([^"']*)\\2`, "g");

/** "@/hooks/useFloating" in dist/components/Menu/Menu.d.ts → "../../hooks/useFloating". */
function unalias(file, target) {
    const relative = path.relative(path.dirname(file), path.join(dist, target)).split(path.sep).join("/");
    return relative.startsWith(".") ? relative : `./${relative}`;
}

for (const file of declarations) {
    const text = fs.readFileSync(file, "utf8").replace(alias, (_, before, quote, target) => `${before}${quote}${unalias(file, target)}${quote}`);
    const rewrite = (extension) => text.replace(specifier, (_, before, quote, target) => `${before}${quote}${withExtension(file, target, extension)}${quote}`);
    fs.writeFileSync(file, rewrite(".js"));
    fs.writeFileSync(file.replace(/\.d\.ts$/, ".d.cts"), rewrite(".cjs"));
}

console.log(`types: ${path.relative(root, dist)}: ${declarations.length} declarations, as .d.ts for import and .d.cts for require`);
