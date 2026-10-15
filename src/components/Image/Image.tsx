import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { AspectRatio } from "@/components/AspectRatio/AspectRatio";
import { ImageOffIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type { ImageProps } from "./Image.types";
export type { ImageFit, ImageProps, ImageRadius } from "./Image.types";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const toLength = (value: number | string | undefined) => (typeof value === "number" ? `${value}px` : value);

/**
 * An `<img>` with a pulsing placeholder while it loads and a fallback if it fails, lazy loaded by default. Give it a
 * `ratio` to fill a box of that shape, and a `caption` to put it in a figure.
 */
export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
    {
        src,
        srcSet,
        alt,
        ratio,
        fit = "cover",
        radius = "none",
        fallback,
        caption,
        loading = "lazy",
        decoding = "async",
        className,
        style,
        width,
        height,
        onLoad,
        onError,
        ...props
    },
    ref,
) {
    const source = src || srcSet;
    const imageRef = useRef<HTMLImageElement | null>(null);
    // Kept with the source it's about, so a new src starts loading again without an extra render.
    const [settled, setSettled] = useState<{ source: string; status: "loaded" | "error" }>();
    const status = !source ? "error" : settled?.source === source ? settled.status : "loading";

    const setRef = useCallback(
        (node: HTMLImageElement | null) => {
            imageRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
        },
        [ref],
    );

    // An image from the cache (or one the server rendered) can finish before React listens for its load or error
    // event, so check it once it's in the page; otherwise the placeholder would stay.
    useIsomorphicLayoutEffect(() => {
        const image = imageRef.current;
        if (!source || !image?.complete) return;
        if (image.naturalWidth > 0) {
            setSettled({ source, status: "loaded" });
            return;
        }
        let current = true;
        image.decode().then(
            () => current && setSettled({ source, status: "loaded" }),
            () => current && setSettled({ source, status: "error" }),
        );
        return () => {
            current = false;
        };
    }, [source]);

    const failed = status === "error";
    const media = failed ? (
        <span
            className={cx("ow-image__fallback", fallback === undefined && "ow-image__fallback--default")}
            style={ratio ? undefined : { width: toLength(width), height: toLength(height) }}
            {...(fallback !== undefined ? {} : alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
        >
            {fallback === undefined ? <ImageOffIcon size={24} /> : fallback}
        </span>
    ) : (
        <img
            ref={setRef}
            src={src}
            srcSet={srcSet}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            decoding={decoding}
            className="ow-image__img"
            onLoad={(event) => {
                if (source) setSettled({ source, status: "loaded" });
                onLoad?.(event);
            }}
            onError={(event) => {
                if (source) setSettled({ source, status: "error" });
                onError?.(event);
            }}
            {...props}
        />
    );

    const boxClassName = cx(
        "ow-image",
        `ow-image--${fit}`,
        radius !== "none" && `ow-image--radius-${radius}`,
        status === "loading" && "ow-image--loading",
        failed && "ow-image--failed",
        !caption && className,
    );
    const boxStyle: CSSProperties | undefined = caption ? undefined : style;
    const box = ratio ? (
        <AspectRatio as="span" ratio={ratio} className={boxClassName} style={boxStyle}>
            {media}
        </AspectRatio>
    ) : (
        <span className={boxClassName} style={boxStyle}>
            {media}
        </span>
    );

    if (!caption) return box;
    return (
        <figure className={cx("ow-image-figure", className)} style={style}>
            {box}
            <figcaption className="ow-image-figure__caption">{caption}</figcaption>
        </figure>
    );
});
