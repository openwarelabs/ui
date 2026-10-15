import { forwardRef, useMemo } from "react";

import { cx } from "@/utils/cx";
import { encodeQR } from "./qr";
import type { QRCodeDataURLOptions, QRCodeProps } from "./QRCode.types";

export type { QRCodeDataURLOptions, QRCodeProps, QRLevel, QROptions } from "./QRCode.types";
export { encodeQR } from "./qr";

/** "QR code for openware.dev" for a link, the text itself when it's short, otherwise just "QR code". */
function defaultLabel(value: string) {
    const link = /^https?:\/\/([^/?#]+)/i.exec(value);
    if (link) return `QR code for ${link[1]}`;
    return value && value.length <= 40 && !/^[a-z][\w+.-]*:/i.test(value) ? `QR code for ${value}` : "QR code";
}

/**
 * A QR code, drawn as one SVG path: for sharing a link, setting up two-factor authentication or pairing a device.
 * The encoder is built in. It's near black on near white in both themes, because scanners need a light ground.
 */
export const QRCode = forwardRef<SVGSVGElement, QRCodeProps>(function QRCode(
    {
        value,
        size = 160,
        level = "M",
        minVersion,
        margin = 4,
        color,
        background,
        label,
        image,
        imageSize = 0.22,
        rounded = false,
        className,
        ...props
    },
    ref,
) {
    const { path, count, hole } = useMemo(() => {
        let modules: boolean[][] = [];
        try {
            modules = encodeQR(value, { level: image ? "H" : level, minVersion });
        } catch {
            // Too long for any QR code: draw the empty ground rather than break the page.
        }
        const count = modules.length;
        // Clear a square in the middle for the logo, an odd or even number of modules to match the code so it's centred.
        let hole = 0;
        if (image && count) {
            hole = Math.ceil(count * Math.min(0.3, Math.max(0, imageSize)));
            if ((count - hole) % 2) hole++;
        }
        const start = (count - hole) / 2;
        let path = "";
        modules.forEach((row, y) => {
            const covered = y >= start && y < start + hole;
            for (let x = 0; x < count; x++) {
                if (!row[x] || (covered && x >= start && x < start + hole)) continue;
                // A run of dark modules along the row becomes one rectangle, or a pill when rounded.
                let end = x + 1;
                while (row[end] && !(covered && end >= start && end < start + hole)) end++;
                const width = end - x;
                path += rounded
                    ? `M${x + margin + 0.5} ${y + margin}h${width - 1}a.5.5 0 0 1 0 1h${1 - width}a.5.5 0 0 1 0-1z`
                    : `M${x + margin} ${y + margin}h${width}v1h-${width}z`;
                x = end;
            }
        });
        return { path, count, hole };
    }, [value, level, minVersion, image, imageSize, rounded, margin]);

    const box = count + margin * 2;
    // The logo sits a little inside the cleared square, so no module touches it.
    const inset = hole ? Math.min(0.5, hole * 0.05) : 0;

    return (
        <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${box} ${box}`}
            width={size}
            height={size}
            role="img"
            aria-label={label ?? defaultLabel(value)}
            shapeRendering={rounded ? undefined : "crispEdges"}
            className={cx("ow-qr-code", className)}
            {...props}
        >
            <rect className="ow-qr-code__ground" width={box} height={box} style={background ? { fill: background } : undefined} />
            <path className="ow-qr-code__modules" d={path} style={color ? { fill: color } : undefined} />
            {image && hole ? (
                <image
                    href={image}
                    x={(box - hole) / 2 + inset}
                    y={(box - hole) / 2 + inset}
                    width={hole - inset * 2}
                    height={hole - inset * 2}
                    preserveAspectRatio="xMidYMid meet"
                />
            ) : null}
        </svg>
    );
});

/**
 * The SVG markup of a rendered QR code, with its colours written in, ready to save as a .svg file. Pass the element
 * from the QRCode's ref.
 */
export function qrCodeToSVG(svg: SVGSVGElement) {
    const copy = svg.cloneNode(true) as SVGSVGElement;
    // Tokens only resolve in the page, so write each shape's computed colour into the copy.
    copy.querySelectorAll("rect, path").forEach((shape, i) => {
        shape.setAttribute("fill", getComputedStyle(svg.querySelectorAll("rect, path")[i]!).fill);
        shape.removeAttribute("class");
        shape.removeAttribute("style");
    });
    copy.removeAttribute("class");
    copy.removeAttribute("style");
    return new XMLSerializer().serializeToString(copy);
}

/**
 * A rendered QR code as an image data URL, PNG by default, for a download link or a canvas. `scale` multiplies its
 * size for a sharper image. A logo from another origin that doesn't allow CORS is left out; the code still scans.
 */
export async function qrCodeToDataURL(svg: SVGSVGElement, { type = "image/png", scale = 4 }: QRCodeDataURLOptions = {}) {
    const copy = new DOMParser().parseFromString(qrCodeToSVG(svg), "image/svg+xml").documentElement;
    // An SVG drawn as an image can't load anything, so the logo goes in as a data URL.
    for (const logo of Array.from(copy.querySelectorAll("image"))) {
        const blob = await fetch(logo.getAttribute("href")!).then((response) => response.blob(), () => null);
        if (!blob) {
            logo.remove();
            continue;
        }
        const data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
        logo.setAttribute("href", data);
    }
    const picture = new Image();
    picture.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}`;
    await picture.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = Math.round(svg.width.baseVal.value * scale);
    canvas.getContext("2d")!.drawImage(picture, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(type);
}
