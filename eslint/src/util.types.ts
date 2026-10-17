/** Where a local name in a file comes from, for the names imported from the library's packages. */
export interface ImportedName {
    /** The package it's imported from. */
    source: string;
    /** The exported name ("Button"), or "*" for a namespace import. */
    imported: string;
}

/** The library's names in one file: local name → where it comes from. */
export type Imports = Map<string, ImportedName>;
