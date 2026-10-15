import type { ReactNode, SVGProps } from "react";

/*
 * The few icons the components draw themselves. They are Lucide shapes (ISC licence, lucide.dev):
 * a 24-unit grid, 2px round strokes in currentColor. For your own icons, use lucide-react.
 */

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
    size?: number;
}

function icon(paths: ReactNode) {
    return function Icon({ size = 16, strokeWidth = 2, ...props }: IconProps) {
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
                focusable="false"
                {...props}
            >
                {paths}
            </svg>
        );
    };
}

export const CheckIcon = icon(<path d="M20 6 9 17l-5-5" />);
export const ChevronDownIcon = icon(<path d="m6 9 6 6 6-6" />);
export const SearchIcon = icon(
    <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </>,
);
export const CornerDownLeftIcon = icon(
    <>
        <polyline points="9 10 4 15 9 20" />
        <path d="M20 4v7a4 4 0 0 1-4 4H4" />
    </>,
);
export const XIcon = icon(
    <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </>,
);
export const UserIcon = icon(
    <>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </>,
);
export const TrashIcon = icon(
    <>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
    </>,
);
export const CircleCheckIcon = icon(
    <>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
    </>,
);
export const CircleAlertIcon = icon(
    <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
    </>,
);
export const ChevronRightIcon = icon(<path d="m9 18 6-6-6-6" />);
export const ChevronLeftIcon = icon(<path d="m15 18-6-6 6-6" />);
export const ChevronUpIcon = icon(<path d="m18 15-6-6-6 6" />);
export const MinusIcon = icon(<path d="M5 12h14" />);
export const PlusIcon = icon(
    <>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
    </>,
);
export const InfoIcon = icon(
    <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </>,
);
export const TriangleAlertIcon = icon(
    <>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </>,
);
export const PipetteIcon = icon(
    <>
        <path d="m2 22 1-1h3l9-9" />
        <path d="M3 21v-3l9-9" />
        <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
    </>,
);
export const CopyIcon = icon(
    <>
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </>,
);
export const CalendarIcon = icon(
    <>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
    </>,
);
export const FileIcon = icon(
    <>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </>,
);
export const ImageOffIcon = icon(
    <>
        <line x1="2" x2="22" y1="2" y2="22" />
        <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
        <line x1="13.5" x2="6" y1="13.5" y2="21" />
        <line x1="18" x2="21" y1="12" y2="15" />
        <path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59" />
        <path d="M21 15V5a2 2 0 0 0-2-2H9" />
    </>,
);
export const FolderIcon = icon(
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />,
);
export const FolderOpenIcon = icon(
    <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />,
);
export const UploadIcon = icon(
    <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" x2="12" y1="3" y2="15" />
    </>,
);
export const ArrowUpRightIcon = icon(
    <>
        <path d="M7 7h10v10" />
        <path d="M7 17 17 7" />
    </>,
);
export const ArrowUpIcon = icon(
    <>
        <path d="m5 12 7-7 7 7" />
        <path d="M12 19V5" />
    </>,
);
export const ArrowDownIcon = icon(
    <>
        <path d="M12 5v14" />
        <path d="m19 12-7 7-7-7" />
    </>,
);
export const ChevronsUpDownIcon = icon(
    <>
        <path d="m7 15 5 5 5-5" />
        <path d="m7 9 5-5 5 5" />
    </>,
);
export const InboxIcon = icon(
    <>
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </>,
);
export const EllipsisIcon = icon(
    <>
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
    </>,
);
export const MenuIcon = icon(
    <>
        <path d="M4 5h16" />
        <path d="M4 12h16" />
        <path d="M4 19h16" />
    </>,
);
export const PanelLeftOpenIcon = icon(
    <>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
        <path d="m14 9 3 3-3 3" />
    </>,
);
export const PanelLeftCloseIcon = icon(
    <>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
        <path d="m16 15-3-3 3-3" />
    </>,
);
