import type { ReactNode } from "react";

import type { BlockIconProps } from "@blocks/shared/shared.types";

// The few icons the blocks draw themselves, as Lucide shapes (ISC licence), so the package needs no icon library.
const icon = (paths: ReactNode) =>
    function BlockIcon({ size = 16, strokeWidth = 2 }: BlockIconProps) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
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
export const MenuIcon = icon(
    <>
        <path d="M4 5h16" />
        <path d="M4 12h16" />
        <path d="M4 19h16" />
    </>,
);
export const XIcon = icon(
    <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </>,
);
export const ChevronDownIcon = icon(<path d="m6 9 6 6 6-6" />);
export const ChevronRightIcon = icon(<path d="m9 18 6-6-6-6" />);
export const ArrowRightIcon = icon(
    <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </>,
);
export const MinusIcon = icon(<path d="M5 12h14" />);
export const SunIcon = icon(
    <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
    </>,
);
export const MoonIcon = icon(
    <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />,
);
export const MonitorIcon = icon(
    <>
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
    </>,
);
export const CircleCheckIcon = icon(
    <>
        <circle cx="12" cy="12" r="10" />
        <path d="m16 9-5.5 5.5L8 12" />
    </>,
);
