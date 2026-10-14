import type { ReactNode } from "react";

import type { BlockIconProps } from "@blocks/shared/shared.types";

// The few icons the blocks draw themselves, as Lucide shapes (ISC licence), so the package needs no icon library.
const icon = (paths: ReactNode) =>
    function BlockIcon({ size = 16, strokeWidth = 2, className }: BlockIconProps) {
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
                className={className}
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
export const PauseIcon = icon(
    <>
        <rect x="14" y="3" width="5" height="18" rx="1" />
        <rect x="5" y="3" width="5" height="18" rx="1" />
    </>,
);
export const PlayIcon = icon(<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />);
export const QuoteIcon = icon(
    <>
        <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
        <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
    </>,
);

export const ArrowLeftIcon = icon(
    <>
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </>,
);

export const CalendarDaysIcon = icon(
    <>
        <path d="M8 2v3" />
        <path d="M16 2v3" />
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M8 13h.01" />
        <path d="M12 13h.01" />
        <path d="M16 13h.01" />
        <path d="M8 17h.01" />
        <path d="M12 17h.01" />
        <path d="M16 17h.01" />
    </>,
);

export const ClockIcon = icon(
    <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
    </>,
);

export const MapPinIcon = icon(
    <>
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" />
    </>,
);

export const LinkIcon = icon(
    <>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>,
);
