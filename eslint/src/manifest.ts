import data from "@build/manifest.json";

import type { Manifest } from "./manifest.types";

export const manifest = data as Manifest;

export const exportSet = new Set(manifest.exports);
export const blockSet = new Set(manifest.blocks);
export const propertySet = new Set(manifest.properties);
export const classSet = new Set(manifest.classes);

/** Which package exports a name, if either does. */
export function packageOf(name: string) {
    if (exportSet.has(name)) return manifest.package;
    if (blockSet.has(name)) return manifest.blocksPackage;
    return null;
}
