// Modules the docs build script (scripts/docs.mjs) generates.
declare module "docs:examples" {
    import type { DocModule, GeneratedExample } from "./app/types";
    export const pages: Array<{ slug: string; module: DocModule; examples: GeneratedExample[] }>;
}

declare module "docs:props" {
    import type { PropsDoc } from "./app/types";
    export const props: Record<string, PropsDoc>;
}

declare module "docs:tokens" {
    const tokens: import("./app/types").TokensFile;
    export default tokens;
}

declare module "docs:styles";

declare module "*?highlight" {
    const snippet: { code: string; html: string };
    export default snippet;
}

declare module "@fontsource-variable/inter";
declare module "@fontsource-variable/geist-mono";

declare module "docs:blocks" {
    import type { ComponentType } from "react";
    /** Every block, by "<category>/<Name>". */
    export const blocks: Record<string, ComponentType>;
}

declare module "docs:block-index" {
    /** The ids ("<category>/<Name>") of the blocks that exist in docs/blocks. */
    export const builtBlocks: string[];
}

declare module "*.css";

declare module "docs:releases" {
    /** Every release in CHANGELOG.md, newest first. */
    export const releases: import("./app/types").Release[];
    export const repository: string;
}
