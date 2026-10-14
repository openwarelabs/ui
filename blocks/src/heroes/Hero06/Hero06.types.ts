import type { HTMLAttributes, ReactNode } from "react";

import type { BlockLink } from "@blocks/shared/shared.types";

/** The systems Hero06 can recognise, to put the visitor's own first. */
export type Hero06PlatformId = "mac" | "windows" | "linux";

export interface Hero06Platform {
    id: Hero06PlatformId;
    /** "macOS", "Windows", "Linux". */
    name: string;
    /** What it needs, shown for the visitor's system: "macOS 13 or later". */
    requirement?: ReactNode;
    /** The download's address. Makes the button a link. */
    href?: string;
    /** Runs when its button is pressed, for a download you start yourself. */
    onDownload?(): void;
}

export interface Hero06Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A short line in a Chip above the title, such as "Acme for desktop". */
    eyebrow?: ReactNode;
    /** The headline. In half the width it takes the page-title size. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description: ReactNode;
    /**
     * A button for each system. The visitor's own (or the first, on phones and anything unknown) leads as the primary
     * "Download for …" button; the rest follow as smaller ones with just their names.
     */
    platforms: Hero06Platform[];
    /** Shown under the buttons, before the requirement: "Version 3.2.0". */
    version?: ReactNode;
    /** A link at the end of that line, to every download. */
    otherDownloads?: BlockLink;
    /** The primary button's words.
     * @default (name) => `Download for ${name}` */
    downloadLabel?(name: string): string;
    /** The app on the right (under the text on phones), usually a screenshot. */
    visual?: ReactNode;
}
