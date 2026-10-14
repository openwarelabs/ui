import type { ReactNode } from "react";

import type { BlockIconProps } from "@blocks/shared/shared.types";

// The few icons the blocks draw themselves, as Lucide shapes (ISC licence), so the package needs no icon library.
const icon = (paths: ReactNode) =>
    function BlockIcon({ size = 16 }: BlockIconProps) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                {paths}
            </svg>
        );
    };

export const CheckIcon = icon(<path d="M20 6 9 17l-5-5" />);
export const MailIcon = icon(
    <>
        <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
        <rect x="2" y="4" width="20" height="16" rx="2" />
    </>,
);
export const DownloadIcon = icon(
    <>
        <path d="M12 15V3" />
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="m7 10 5 5 5-5" />
    </>,
);
