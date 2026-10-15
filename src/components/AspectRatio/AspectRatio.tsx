import type { CSSProperties } from "react";

import { cx } from "@/utils/cx";
import type { AspectRatioProps } from "./AspectRatio.types";
export type { AspectRatioProps } from "./AspectRatio.types";

/**
 * A box that keeps a shape as its width changes, such as 16:9 for a video or 1:1 for a thumbnail. Whatever is inside
 * fills it; an image, video, iframe or embed is cropped to cover it.
 */
export function AspectRatio({ ratio = 16 / 9, as: Element = "div", className, style, ...props }: AspectRatioProps) {
    return <Element className={cx("ow-aspect-ratio", className)} style={{ aspectRatio: String(ratio), ...style } as CSSProperties} {...props} />;
}
