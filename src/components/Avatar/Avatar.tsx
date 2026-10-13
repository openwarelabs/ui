import { useState } from "react";

import { UserIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { getInitials } from "../../utils/text";

export interface AvatarProps {
    /** The person's name; its initials show when there's no image. */
    name: string;
    /** A photo URL. If it fails to load, the initials show instead. */
    src?: string;
    /** sm 24px, md 28px, lg 36px.
     * @default "md" */
    size?: "sm" | "md" | "lg";
    /** Give it when the avatar stands alone; beside the name, leave it out and it's hidden from screen readers. */
    label?: string;
    className?: string;
}

/** A round picture of a person: their photo, else their initials on the brand colour, else a person icon. */
export function Avatar({ name, src, size = "md", label, className }: AvatarProps) {
    const initials = getInitials(name);
    const [failedImage, setFailedImage] = useState<string>();
    const showImage = src && src !== failedImage;

    return (
        <span
            className={cx("ow-avatar", `ow-avatar--${size}`, !initials && !showImage && "ow-avatar--empty", className)}
            {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
        >
            {showImage ? (
                <img src={src} alt="" className="ow-avatar__image" onError={() => setFailedImage(src)} />
            ) : (
                initials || <UserIcon size={size === "sm" ? 13 : size === "lg" ? 18 : 15} />
            )}
        </span>
    );
}
