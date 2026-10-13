import { useState, type CSSProperties } from "react";

import { UserIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { getInitials } from "../../utils/text";

export interface AvatarProps {
    /** The person's name; its initials show when there's no image. */
    name: string;
    /** A photo URL. If it fails to load, the initials show instead. */
    src?: string;
    /** sm 24px, md 28px, lg 36px, xl 48px, or any size in pixels, such as 96 for a team page. The initials scale with it.
     * @default "md" */
    size?: AvatarSize;
    /** Give it when the avatar stands alone; beside the name, leave it out and it's hidden from screen readers. */
    label?: string;
    className?: string;
}

export type AvatarSize = "sm" | "md" | "lg" | "xl" | number;

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
        >
            {showImage ? (
                <img src={src} alt="" className="ow-avatar__image" onError={() => setFailedImage(src)} />
            ) : (
                initials || <UserIcon size={Math.round(sizing.pixels * 0.52)} />
            )}
        </span>
    );
}
