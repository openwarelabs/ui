import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

import { cx } from "../../utils/cx";
import { Avatar, type AvatarProps } from "./Avatar";

export interface AvatarGroupProps {
    /** Avatars. */
    children: ReactNode;
    /** Shows this many, then a "+3" count.
     * @default 4 */
    max?: number;
    /** Applied to every avatar in the group.
     * @default "md" */
    size?: AvatarProps["size"];
    /** Names the group for screen readers, e.g. "5 people on this project". */
    label?: string;
    className?: string;
}

/** Overlapping avatars for the people on something, with a count for the rest. */
export function AvatarGroup({ children, max = 4, size = "md", label, className }: AvatarGroupProps) {
    const avatars = Children.toArray(children).filter(isValidElement) as Array<ReactElement<AvatarProps>>;
    const shown = avatars.slice(0, max);
    const hidden = avatars.length - shown.length;
    return (
        <div role="group" aria-label={label} className={cx("ow-avatar-group", className)}>
            {shown.map((avatar) => cloneElement(avatar, { size }))}
            {hidden > 0 ? (
                <span className={cx("ow-avatar", `ow-avatar--${size}`, "ow-avatar--count")}>
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
    /** @default "md" */
    size?: AvatarProps["size"];
    className?: string;
}

/** A person: avatar, name and a line about them, as in an account menu. */
export function User({ name, description, src, size = "md", className }: UserProps) {
    return (
        <div className={cx("ow-user", `ow-user--${size}`, className)}>
            <Avatar name={name} src={src} size={size} />
            <div className="ow-user__text">
                <span className="ow-user__name">{name}</span>
                {description ? <span className="ow-user__description">{description}</span> : null}
            </div>
        </div>
    );
}
