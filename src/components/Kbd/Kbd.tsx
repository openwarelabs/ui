import type { HTMLAttributes } from "react";

import { cx } from "../../utils/cx";

/** One keyboard key in running text, with a heavier bottom edge like a real key: <Kbd>⌘</Kbd> <Kbd>K</Kbd>. */
export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
    return <kbd className={cx("ow-kbd", className)} {...props} />;
}

/** Code, a path or a command inside a sentence. */
export function Code({ className, ...props }: HTMLAttributes<HTMLElement>) {
    return <code className={cx("ow-code", className)} {...props} />;
}
