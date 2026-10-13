import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

import { cx } from "../../utils/cx";
import { Avatar, avatarSize, type AvatarSize } from "./Avatar";

export interface AvatarGroupProps {
    /** Avatars. */
    children: ReactNode;
    /** Shows this many, then a "+3" count.
     * @default 4 */
    max?: number;
    /** Applied to every avatar in the group: a named size or pixels.
     * @default "md" */
    size?: AvatarSize;
    /** Names the group for screen readers, e.g. "5 people on this project". */
    label?: string;
    className?: string;
}

/** Overlapping avatars for the people on something, with a count for the rest. */
export function AvatarGroup({ children, max = 4, size = "md", label, className }: AvatarGroupProps) {
    const avatars = Children.toArray(children).filter(isValidElement) as Array<ReactElement<{ size?: AvatarSize }>>;
    const sizing = avatarSize(size);
    const shown = avatars.slice(0, max);
    const hidden = avatars.length - shown.length;
    return (
        <div role="group" aria-label={label} className={cx("ow-avatar-group", className)}>
            {shown.map((avatar) => cloneElement(avatar, { size }))}
            {hidden > 0 ? (
                <span className={cx("ow-avatar", sizing.className, "ow-avatar--count")} style={sizing.style}>
                    <span aria-hidden="true">+{hidden}</span>
                    <span className="ow-visually-hidden">and {hidden} more</span>
                </span>
            ) : null}
        </div>
    );
}

export interface UserProps {
    name: string;
    /** A second line: an email, a role. */
    description?: ReactNode;
    src?: string;
    /** The avatar's size; the name and gap grow with it from xl (48px) up.
     * @default "md" */
    size?: AvatarSize;
    className?: string;
}

/** The User's class for a size: its own for named sizes; a pixel size uses the nearest named one. */
function userSize(size: AvatarSize) {
    if (typeof size !== "number") return `ow-user--${size}`;
    return size >= 48 ? "ow-user--xl" : size >= 36 ? "ow-user--lg" : size >= 28 ? "ow-user--md" : "ow-user--sm";
}

/** A person: avatar, name and a line about them, as in an account menu. */
export function User({ name, description, src, size = "md", className }: UserProps) {
    return (
        <div className={cx("ow-user", userSize(size), className)}>
            <Avatar name={name} src={src} size={size} />
            <div className="ow-user__text">
                <span className="ow-user__name">{name}</span>
                {description ? <span className="ow-user__description">{description}</span> : null}
            </div>
        </div>
    );
}
