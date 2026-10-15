/** Where a file's upload has got to. */
export type UploadStatus = "queued" | "uploading" | "done" | "error" | "canceled";

/** One file in an UploadList. */
export interface UploadListItem {
    /** Tells the rows apart; stays the same while the file uploads. */
    id: string;
    /** The file's name, shown and used to name its buttons: "report.pdf". */
    name: string;
    /** The file's size in bytes. */
    size: number;
    /** The file's MIME type, such as "image/png". */
    type?: string;
    /** How far it's got, from 0 to 100. Leave it out while uploading for a bar of unknown length. */
    progress?: number;
    /** Where it's got to: `queued` waits its turn, `uploading` shows a bar, `done`, `error` and `canceled` say so. */
    status: UploadStatus;
    /** Why it failed, shown in place of the size when the status is "error". */
    error?: string;
    /** An image to show as its thumbnail, such as an object URL of the file. */
    previewUrl?: string;
    /** Where the uploaded file is: once it's done, the name links there. */
    href?: string;
}

export interface UploadListLabels {
    /** Names the list for screen readers.
     * @default "Uploads" */
    list?: string;
    /** @default "Waiting" */
    queued?: string;
    /** Shown while uploading when the progress isn't known.
     * @default "Uploading" */
    uploading?: string;
    /** @default "Upload failed" */
    failed?: string;
    /** @default "Canceled" */
    canceled?: string;
    /** How much has gone up, from sizes already formatted.
     * @default (loaded, total) => `${loaded} of ${total}` */
    progress?(loaded: string, total: string): string;
    /** The time left, in seconds.
     * @default (seconds) => "About 12 sec left" */
    remaining?(seconds: number): string;
    /** Formats a size in bytes.
     * @default 2.1 MB, 340 kB, with Intl.NumberFormat */
    size?(bytes: number): string;
    /** @default (name) => `Retry upload of ${name}` */
    retry?(name: string): string;
    /** @default (name) => `Cancel upload of ${name}` */
    cancel?(name: string): string;
    /** @default (name) => `Remove ${name}` */
    remove?(name: string): string;
    /** Announced when a file finishes.
     * @default (name) => `${name} uploaded` */
    done?(name: string): string;
    /** Announced when a file fails.
     * @default (name, error) => `${name} failed to upload: ${error}` */
    error?(name: string, error?: string): string;
}

export interface UploadListProps {
    /** The files, in the order to show them. `useUploadQueue` keeps a list like this for you. */
    items: UploadListItem[];
    /** Called when Retry is pressed on a file that failed or was canceled. Without it there's no Retry button. */
    onRetry?(id: string): void;
    /** Called when Cancel is pressed on a file that's waiting or uploading. Without it there's no Cancel button. */
    onCancel?(id: string): void;
    /** Called when Remove is pressed. Without it there's no Remove button. */
    onRemove?(id: string): void;
    /** `list` is a row per file; `grid` is a tile per file, with a large thumbnail, for images.
     * @default "list" */
    layout?: "list" | "grid";
    /** `compact` fits each file on one short line, for a sidebar or a long list.
     * @default "comfortable" */
    density?: "comfortable" | "compact";
    /** Shows an estimate of the time left on files that are uploading.
     * @default false */
    showTimeRemaining?: boolean;
    /** The locale sizes and times are formatted in.
     * @default "en" */
    locale?: string;
    /** The words it uses, for other languages. */
    labels?: UploadListLabels;
    className?: string;
}

/** What an uploader is given along with the file. */
export interface UploadContext {
    /** Report how far it's got, from 0 to 100, or undefined when it can't tell. */
    onProgress(progress: number | undefined): void;
    /** Aborted when the upload is canceled or removed: pass it to fetch, or listen for "abort". */
    signal: AbortSignal;
}

/**
 * Uploads one file. Resolve when it's done, with the uploaded file's URL if you have one (the name then links to it);
 * throw or reject to fail it, and the error's message is shown.
 */
export type Uploader = (file: File, context: UploadContext) => Promise<string | void>;

export interface UseUploadQueueOptions {
    /** How many files upload at once.
     * @default 3 */
    concurrency?: number;
}

/** What `useUploadQueue` returns: the items for UploadList and the actions for its buttons. */
export interface UploadQueue {
    /** The files and how they're going, for `UploadList`'s `items`. */
    items: UploadListItem[];
    /** Adds files to the queue, such as those from `FileDropZone`'s `onFiles`. */
    add(files: File[]): void;
    /** Puts a failed or canceled file back in the queue. */
    retry(id: string): void;
    /** Stops a file that's waiting or uploading, aborting its signal. */
    cancel(id: string): void;
    /** Stops a file if it's going, and takes it off the list. */
    remove(id: string): void;
}
