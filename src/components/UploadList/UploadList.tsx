import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/Button/Button";
import { ProgressBar } from "@/components/Progress/Progress";
import { CircleAlertIcon, CircleCheckIcon, FileIcon, XIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type { UploadListItem, UploadListProps, UploadStatus } from "./UploadList.types";

export {
    type UploadContext,
    type Uploader,
    type UploadListItem,
    type UploadListLabels,
    type UploadListProps,
    type UploadQueue,
    type UploadStatus,
    type UseUploadQueueOptions,
} from "./UploadList.types";
export { useUploadQueue } from "./useUploadQueue";

// Lucide's rotate-ccw, drawn here as it's the only place that needs it.
const retryIcon = (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);

const units = ["byte", "kilobyte", "megabyte", "gigabyte"];

/** 2_200_000 → "2.1 MB", 340_000 → "332 kB", in the locale's numbers. */
function formatBytes(bytes: number, locale: string) {
    let unit = 0;
    while (bytes >= 1024 && unit < units.length - 1) {
        bytes /= 1024;
        unit += 1;
    }
    return new Intl.NumberFormat(locale, {
        style: "unit",
        unit: units[unit],
        // "0 bytes", not "0 byte".
        unitDisplay: unit ? "short" : "long",
        maximumFractionDigits: unit > 1 ? 1 : 0,
        minimumFractionDigits: unit > 1 ? 1 : 0,
    }).format(bytes);
}

/**
 * The files being uploaded, under a FileDropZone: each with its size, a progress bar while it uploads, and its
 * status. Retry, Cancel and Remove buttons call back with the file's id. Finished and failed files are announced
 * politely. `useUploadQueue` does the uploading and keeps the `items` for you.
 */
export function UploadList({
    items,
    onRetry,
    onCancel,
    onRemove,
    layout = "list",
    density = "comfortable",
    showTimeRemaining = false,
    locale = "en",
    labels: labelsProp,
    className,
}: UploadListProps) {
    const labels = {
        list: "Uploads",
        queued: "Waiting",
        uploading: "Uploading",
        failed: "Upload failed",
        canceled: "Canceled",
        progress: (loaded: string, total: string) => `${loaded} of ${total}`,
        remaining: (seconds: number) =>
            `About ${new Intl.NumberFormat(locale, {
                style: "unit",
                unit: seconds < 60 ? "second" : "minute",
                unitDisplay: "short",
            }).format(seconds < 60 ? Math.ceil(seconds) : Math.round(seconds / 60))} left`,
        size: (bytes: number) => formatBytes(bytes, locale),
        retry: (name: string) => `Retry upload of ${name}`,
        cancel: (name: string) => `Cancel upload of ${name}`,
        remove: (name: string) => `Remove ${name}`,
        done: (name: string) => `${name} uploaded`,
        error: (name: string, error?: string) => `${name} failed to upload${error ? `: ${error}` : ""}`,
        ...labelsProp,
    };
    const [announcement, setAnnouncement] = useState("");
    const listRef = useRef<HTMLUListElement>(null);
    const rows = useRef(new Map<string, HTMLLIElement>());
    const statuses = useRef<Map<string, UploadStatus>>();
    const focusAfter = useRef<string[]>();
    // When and where each upload was first seen, for the time left.
    const started = useRef(new Map<string, number[]>()).current;

    // Announces files that have just finished or failed; not every percent on the way.
    useEffect(() => {
        const previous = statuses.current;
        statuses.current = new Map(items.map((item) => [item.id, item.status]));
        if (!previous) return;
        const news = items
            .filter((item) => previous.get(item.id) !== item.status && (item.status === "done" || item.status === "error"))
            .map((item) => (item.status === "done" ? labels.done(item.name) : labels.error(item.name, item.error)));
        if (news.length) setAnnouncement(news.join(". "));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- Only a change of items says something new.
    }, [items]);

    // After a button goes (a removed row, Retry turning into Cancel), focus moves on to the row, its neighbour or the list.
    useEffect(() => {
        const ids = focusAfter.current;
        const list = listRef.current;
        focusAfter.current = undefined;
        if (!ids || !list || list.contains(document.activeElement)) return;
        const row = ids.map((id) => rows.current.get(id)).find(Boolean);
        (row?.querySelector<HTMLElement>("a, button") ?? list).focus();
    }, [items]);

    function act(item: UploadListItem, index: number, callback: (id: string) => void) {
        focusAfter.current = [item.id, ...[items[index + 1], items[index - 1]].filter(Boolean).map((other) => other!.id)];
        callback(item.id);
    }

    const compact = density === "compact";
    const now = Date.now();

    return (
        <div className={cx("ow-upload-list", `ow-upload-list--${layout}`, compact && "ow-upload-list--compact", className)}>
            <ul ref={listRef} role="list" tabIndex={-1} aria-label={labels.list} className="ow-upload-list__items">
                {items.map((item, index) => {
                    const { id, name, size, progress, status, previewUrl } = item;
                    const going = status === "uploading";
                    let detail = labels.size(size);
                    let valueText: string | undefined;
                    if (going && progress === undefined) detail = labels.uploading;
                    else if (going) {
                        detail = labels.progress(labels.size((size * progress!) / 100), detail);
                        valueText = `${Math.round(progress!)}%, ${detail}`;
                        const [time, from] = started.get(id) ?? [];
                        if (time === undefined || from === undefined || progress! < from) started.set(id, [now, progress!]);
                        else if (showTimeRemaining && progress! > from && now - time > 1000) {
                            const seconds = ((now - time) / (progress! - from) / 1000) * (100 - progress!);
                            detail += ` · ${labels.remaining(seconds)}`;
                        }
                    } else {
                        started.delete(id);
                        if (status === "queued") detail = labels.queued;
                        else if (status === "error") detail = item.error || labels.failed;
                        else if (status === "canceled") detail = labels.canceled;
                    }
                    const buttons = [
                        (status === "error" || status === "canceled") && onRetry && (["retry", retryIcon, onRetry] as const),
                        (status === "queued" || going) && onCancel && (["cancel", <XIcon key="x" />, onCancel] as const),
                        onRemove && !((status === "queued" || going) && onCancel) && (["remove", <XIcon key="x" />, onRemove] as const),
                    ];
                    return (
                        <li
                            key={id}
                            ref={(element) => (element ? rows.current.set(id, element) : rows.current.delete(id))}
                            className={cx("ow-upload-list__item", `ow-upload-list__item--${status}`)}
                        >
                            <span className="ow-upload-list__thumb" aria-hidden="true">
                                <FileIcon size={compact ? 16 : 18} />
                                {/* Over the file icon, and hidden if it fails to load. */}
                                {previewUrl && !compact ? <img src={previewUrl} alt="" onError={(event) => (event.currentTarget.hidden = true)} /> : null}
                            </span>
                            <span className="ow-upload-list__body">
                                <span className="ow-upload-list__name">
                                    {item.href && status === "done" ? (
                                        <a className="ow-link" href={item.href} target="_blank" rel="noreferrer">
                                            {name}
                                        </a>
                                    ) : (
                                        name
                                    )}
                                </span>
                                <span className="ow-upload-list__detail">
                                    {status === "done" ? <CircleCheckIcon size={14} className="ow-upload-list__icon" /> : null}
                                    {status === "error" ? <CircleAlertIcon size={14} className="ow-upload-list__icon" /> : null}
                                    <span>{detail}</span>
                                </span>
                                {going ? (
                                    <ProgressBar
                                        className="ow-upload-list__progress"
                                        value={progress}
                                        showValue={false}
                                        aria-label={name}
                                        valueLabel={valueText}
                                    />
                                ) : null}
                            </span>
                            <span className="ow-upload-list__actions">
                                {buttons.map((button) =>
                                    button ? (
                                        <Button
                                            key={button[0]}
                                            variant="ghost"
                                            size="sm"
                                            iconOnly
                                            aria-label={labels[button[0]](name)}
                                            onClick={() => act(item, index, button[2])}
                                        >
                                            {button[1]}
                                        </Button>
                                    ) : null,
                                )}
                            </span>
                        </li>
                    );
                })}
            </ul>
            <span className="ow-visually-hidden" aria-live="polite">
                {announcement}
            </span>
        </div>
    );
}
