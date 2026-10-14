import { useState, type CSSProperties } from "react";

import { UserIcon } from "@/icons";
import { cx } from "@/utils/cx";
import { getInitials } from "@/utils/text";
import type { AvatarProps, AvatarSize } from "./Avatar.types";
export type { AvatarProps, AvatarSize } from "./Avatar.types";

const namedSizes = { sm: 24, md: 28, lg: 36, xl: 48 } as const;

/**
 * The class and style that size an avatar: a named size's class, or a pixel size through --ow-avatar-size.
 * @internal
 */
export function avatarSize(size: AvatarSize): { className: string; style?: CSSProperties; pixels: number } {
    if (typeof size === "number") {
        return { className: "ow-avatar--custom", style: { "--ow-avatar-size": `${size}px` } as CSSProperties, pixels: size };
    }
    return { className: `ow-avatar--${size}`, pixels: namedSizes[size] };
}

/** A round picture of a person: their photo, else their initials on the brand colour, else a person icon. */
export function Avatar({ name, src, size = "md", label, className }: AvatarProps) {
    const initials = getInitials(name);
    const [failedImage, setFailedImage] = useState<string>();
    const showImage = src && src !== failedImage;
    const sizing = avatarSize(size);

    return (
        <span
            className={cx("ow-avatar", sizing.className, !initials && !showImage && "ow-avatar--empty", className)}
            style={sizing.style}
            {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
            // The initials are drawn by CSS, not written in the page: they're a picture of the name, so they don't
            // become the visible label of a button the avatar sits in (which its accessible name would have to match).
            data-initials={!showImage && initials ? initials : undefined}
        >
            {showImage ? (
                <img src={src} alt="" className="ow-avatar__image" onError={() => setFailedImage(src)} />
            ) : initials ? null : (
                <UserIcon size={Math.round(sizing.pixels * 0.52)} />
            )}
        </span>
    );
}
