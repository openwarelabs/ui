import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cx } from "@/utils/cx";
import type { WatermarkProps, WatermarkTile } from "./Watermark.types";
export type { WatermarkProps, WatermarkTile } from "./Watermark.types";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Loads an image for the canvas. `crossOrigin` lets an image served with CORS headers be drawn; a data URL always can. */
function loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

/** Draws one tile (the text or image, turned by `rotate`, with the gap around it) at the device's pixel ratio and
    returns it as a data URL with its CSS size, or null when there's nothing to draw. */
function drawTile(
    layer: HTMLElement,
    lines: string[],
    image: HTMLImageElement | null,
    rotate: number,
    gap: [number, number],
    fontSize: number,
    fontWeight: number | string,
    fontFamily: string | undefined,
): WatermarkTile | null {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const computed = getComputedStyle(layer);
    const font = `${fontWeight} ${fontSize}px ${fontFamily || computed.fontFamily || "sans-serif"}`;
    const lineHeight = Math.round(fontSize * 1.3);
    let width: number;
    let height: number;
    if (image) {
        width = image.naturalWidth || image.width;
        height = image.naturalHeight || image.height;
    } else {
        ctx.font = font;
        width = Math.ceil(Math.max(0, ...lines.map((line) => ctx.measureText(line).width)));
        height = lines.length * lineHeight;
    }
    if (!width || !height) return null;

    // The turned content's bounding box, so neighbouring tiles never overlap.
    const angle = (rotate * Math.PI) / 180;
    const sin = Math.abs(Math.sin(angle));
    const cos = Math.abs(Math.cos(angle));
    const tileWidth = Math.ceil(width * cos + height * sin + gap[0]);
    const tileHeight = Math.ceil(width * sin + height * cos + gap[1]);
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = tileWidth * ratio;
    canvas.height = tileHeight * ratio;
    ctx.scale(ratio, ratio);
    ctx.translate(tileWidth / 2, tileHeight / 2);
    ctx.rotate(angle);
    if (image) {
        ctx.drawImage(image, -width / 2, -height / 2, width, height);
    } else {
        ctx.font = font;
        ctx.fillStyle = computed.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        lines.forEach((line, index) => {
            ctx.fillText(line, 0, (index - (lines.length - 1) / 2) * lineHeight);
        });
    }
    return { url: canvas.toDataURL(), width: tileWidth, height: tileHeight };
}

/**
 * Tiles text ("DRAFT", a name and a date) or an image across whatever it wraps, for previews and drafts. The layer
 * takes no pointer events and is hidden from assistive technology; it's redrawn when the theme changes and put back
 * if a script removes or restyles it. It isn't a security control: anyone with the dev tools can still take it off.
 */
export function Watermark({
    content,
    image,
    children,
    rotate = -22,
    gap = [100, 100],
    offset = [0, 0],
    fontSize = 16,
    fontWeight = 400,
    color,
    fontFamily,
    opacity = 1,
    zIndex = 9,
    fullPage = false,
    className,
    ...props
}: WatermarkProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const layerRef = useRef<HTMLDivElement>(null);
    /** The inline style last set on the layer, to tell our own changes from someone else's. */
    const appliedRef = useRef("");
    const [theme, setTheme] = useState(0);
    const lines = Array.isArray(content) ? content : content ? [content] : [];
    const text = lines.join("\n");
    const [gapX, gapY] = gap;
    const [offsetX, offsetY] = offset;

    // Redraw when the theme changes: data-theme on <html> or on the nearest themed ancestor, or the system scheme.
    useEffect(() => {
        const root = rootRef.current;
        if (!root || typeof MutationObserver === "undefined") return undefined;
        const themed = root.parentElement?.closest("[data-theme]") ?? document.documentElement;
        const bump = () => setTheme((n) => n + 1);
        const observer = new MutationObserver(bump);
        observer.observe(themed, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
        const media = window.matchMedia?.("(prefers-color-scheme: dark)");
        media?.addEventListener?.("change", bump);
        // Text drawn before the web font arrived is drawn again in the right font.
        if (document.fonts?.status === "loading") void document.fonts.ready.then(bump);
        return () => {
            observer.disconnect();
            media?.removeEventListener?.("change", bump);
        };
    }, []);

    // Draw the tile and style the layer. Done by hand rather than through props so the guard below can tell a
    // tampered style from ours.
    useIsomorphicLayoutEffect(() => {
        const layer = layerRef.current;
        if (!layer) return undefined;
        let cancelled = false;
        const apply = (tile: WatermarkTile | null) => {
            const target = layerRef.current;
            if (cancelled || !target) return;
            const parts = [
                `z-index:${zIndex}`,
                `opacity:${opacity}`,
                `background-position:${offsetX}px ${offsetY}px`,
                color ? `color:${color}` : "",
                tile ? `background-image:url("${tile.url}")` : "",
                tile ? `background-size:${tile.width}px ${tile.height}px` : "",
            ];
            target.style.cssText = parts.filter(Boolean).join(";");
            appliedRef.current = target.getAttribute("style") ?? "";
        };
        // The colour must be in place before the tile is drawn, as the canvas reads the computed one.
        layer.style.cssText = color ? `color:${color}` : "";
        const draw = (img: HTMLImageElement | null) =>
            apply(drawTile(layer, text ? text.split("\n") : [], img, rotate, [gapX, gapY], fontSize, fontWeight, fontFamily));
        if (image) {
            apply(null);
            void loadImage(image).then(draw);
        } else {
            draw(null);
        }
        return () => {
            cancelled = true;
        };
    }, [text, image, rotate, gapX, gapY, offsetX, offsetY, fontSize, fontWeight, color, fontFamily, opacity, zIndex, theme]);

    // Put the layer back if it's removed, hidden or restyled from outside React. A deterrent, not a lock.
    useEffect(() => {
        const root = rootRef.current;
        if (!root || typeof MutationObserver === "undefined") return undefined;
        const layerClass = cx("ow-watermark__layer", fullPage && "ow-watermark__layer--full-page");
        const observer = new MutationObserver((records) => {
            const layer = layerRef.current;
            if (!layer) return;
            // The same node goes back, so React's own view of the tree stays right.
            if (layer.parentNode !== root) root.appendChild(layer);
            for (const record of records) {
                if (record.target !== layer) continue;
                if (record.attributeName === "style") {
                    if (layer.getAttribute("style") !== appliedRef.current) layer.style.cssText = appliedRef.current;
                } else if (record.attributeName === "class") {
                    if (layer.className !== layerClass) layer.className = layerClass;
                } else if (record.attributeName === "hidden") {
                    layer.removeAttribute("hidden");
                } else if (record.attributeName === "aria-hidden") {
                    if (layer.getAttribute("aria-hidden") !== "true") layer.setAttribute("aria-hidden", "true");
                }
            }
        });
        observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class", "hidden", "aria-hidden"] });
        return () => observer.disconnect();
    }, [fullPage]);

    return (
        <div ref={rootRef} className={cx("ow-watermark", className)} {...props}>
            {children}
            <div
                ref={layerRef}
                className={cx("ow-watermark__layer", fullPage && "ow-watermark__layer--full-page")}
                aria-hidden="true"
            />
        </div>
    );
}
