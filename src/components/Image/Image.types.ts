import type { CSSProperties, ImgHTMLAttributes, ReactNode } from "react";

export type ImageFit = "cover" | "contain";

export type ImageRadius = "none" | "control" | "container";

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "alt"> {
    /**
     * What the image shows, for screen readers and when it can't load. Required: pass `alt=""` for a decorative image
     * that adds nothing to the text around it.
     */
    alt: string;
    /** Width over height, such as `16 / 9` or `1`: the image fills a box of that shape as wide as its container. Leave it out to keep the image's own size. */
    ratio?: number;
    /** `cover` fills the box and crops what's over; `contain` shows the whole image, with space around it if the shapes differ. @default "cover" */
    fit?: ImageFit;
    /** The corners: `control` matches inputs and buttons (8px), `container` matches cards (12px). @default "none" */
    radius?: ImageRadius;
    /** Shown instead when the image fails to load or there's no `src`. @default an image icon on a muted ground */
    fallback?: ReactNode;
    /** A line under the image. With it, the image and the caption come in a `<figure>`. */
    caption?: ReactNode;
    /** Lazy loads the image only as it nears the screen; pass `"eager"` for one at the top of the page. @default "lazy" */
    loading?: "lazy" | "eager";
    /** @default "async" */
    decoding?: "async" | "sync" | "auto";
    /** Goes on the outer box (or the figure), not the `<img>`, so you can size and place it. */
    className?: string;
    /** Goes on the outer box (or the figure), not the `<img>`, so you can size and place it. */
    style?: CSSProperties;
}
