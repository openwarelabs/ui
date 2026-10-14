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
