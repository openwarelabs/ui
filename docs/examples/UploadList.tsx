import { useState } from "react";

import { FileDropZone, Stack, UploadList, useUploadQueue } from "@openwarelabs/ui";
import type { UploadContext, UploadListItem } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "UploadList",
    category: "Pickers",
    description:
        "The files being uploaded, under a FileDropZone: each with its size, a progress bar while it goes up, and its status, with Retry, Cancel and Remove. useUploadQueue does the uploading.",
    source: "components/UploadList/UploadList.tsx",
    imports: ["UploadList", "useUploadQueue"],
    props: [
        "UploadListProps",
        "UploadListItem",
        "UploadListLabels",
        "UploadContext",
        "UploadQueue",
        "UseUploadQueueOptions",
    ],
    keyboard: [["Tab", "Moves through each file's link and buttons."]],
    notes: [
        'It\'s a list named "Uploads"; each row starts with the file\'s name, and its buttons are named for it: "Retry upload of report.pdf", "Remove report.pdf".',
        'While a file uploads, its bar is a progressbar named by the file, read as "45%, 1.8 MB of 4.0 MB".',
        "A file finishing or failing is announced politely, once; the percentages on the way aren't.",
        "When a button goes, after Remove or Retry, focus moves to the same row, the next one or the list, so it isn't lost.",
        "useUploadQueue(uploader) takes (file, { onProgress, signal }) => Promise and uploads a few files at a time (concurrency, 3 by default). Cancel and Remove abort the signal; pass it to fetch. Resolve with the file's URL to link its name.",
        "Image files get a preview from an object URL, freed when they're removed.",
    ],
    related: ["FileDropZone", "ProgressBar", "ProgressCircle"],
    since: "0.15.0",
};

/** Pretends to upload: a random speed, and about one file in four fails partway. */
function fakeUpload(file: File, { onProgress, signal }: UploadContext) {
    return new Promise<void>((resolve, reject) => {
        const speed = 2 + Math.random() * 10;
        const fails = file.name.includes("fail") || Math.random() < 0.25;
        let progress = 0;
        const timer = setInterval(() => {
            progress = Math.min(100, progress + speed);
            onProgress(progress);
            if (fails && progress > 45) {
                clearInterval(timer);
                reject(new Error("The connection dropped."));
            } else if (progress === 100) {
                clearInterval(timer);
                resolve();
            }
        }, 250);
        signal.addEventListener("abort", () => clearInterval(timer));
    });
}

/** Drop files (or browse) and they upload, three at a time, with the time left. Some fail: retry them. */
export function WithDropZone() {
    const queue = useUploadQueue(fakeUpload);
    return (
        <Stack gap="md" style={{ width: 460, maxWidth: "100%" }}>
            <FileDropZone multiple hint="Any file, up to 20 MB." onFiles={queue.add} />
            <UploadList
                items={queue.items}
                onRetry={queue.retry}
                onCancel={queue.cancel}
                onRemove={queue.remove}
                showTimeRemaining
            />
        </Stack>
    );
}
WithDropZone.layout = { align: "start" as const };

const states: UploadListItem[] = [
    { id: "1", name: "report-q3.pdf", size: 4_194_304, status: "uploading", progress: 52 },
    { id: "2", name: "recording.mp4", size: 88_604_672, status: "uploading" },
    { id: "3", name: "notes.txt", size: 2_340, status: "queued" },
    { id: "4", name: "budget.xlsx", size: 348_160, status: "done", href: "#" },
    {
        id: "5",
        name: "contract-signed.pdf",
        size: 1_203_404,
        status: "error",
        error: "Too large for this folder.",
    },
    { id: "6", name: "archive.zip", size: 23_068_672, status: "canceled" },
];

/** Every status: uploading (known and unknown length), waiting, done with a link, failed, canceled. */
export function States() {
    const [items, setItems] = useState(states);
    return (
        <div style={{ width: 460, maxWidth: "100%" }}>
            <UploadList
                items={items}
                onRetry={() => undefined}
                onCancel={() => undefined}
                onRemove={(id) => setItems(items.filter((item) => item.id !== id))}
            />
        </div>
    );
}
States.layout = { align: "start" as const };

/** A small landscape drawn as an SVG, so the examples don't load anything over the network. */
function landscape(sky: string, sun: string, hill: string) {
    return `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="${sky}"/><circle cx="200" cy="110" r="36" fill="${sun}"/><path d="M0 200 C 80 150 160 170 300 200 V300 H0Z" fill="${hill}"/></svg>`,
    )}`;
}

const photos: UploadListItem[] = [
    {
        id: "a",
        name: "dusk.png",
        size: 2_516_582,
        status: "done",
        previewUrl: landscape("#1e2a4a", "#f4e3c1", "#2b3a5c"),
    },
    {
        id: "b",
        name: "noon.jpg",
        size: 3_984_588,
        status: "uploading",
        progress: 64,
        previewUrl: landscape("#8fb8de", "#fff4cf", "#46704f"),
    },
    {
        id: "c",
        name: "fog.jpg",
        size: 1_887_436,
        status: "error",
        previewUrl: landscape("#c8ccd2", "#eef0f2", "#8a9099"),
    },
    { id: "d", name: "field-notes.pdf", size: 412_000, status: "queued" },
];

/** layout="grid": a tile per file, with a large preview for images. Retry the failed one. */
export function Grid() {
    const [items, setItems] = useState(photos);
    const patch = (id: string, change: Partial<UploadListItem>) =>
        setItems(items.map((item) => (item.id === id ? { ...item, ...change } : item)));
    return (
        <div style={{ width: 520, maxWidth: "100%" }}>
            <UploadList
                layout="grid"
                items={items}
                onRetry={(id) => patch(id, { status: "done" })}
                onCancel={(id) => patch(id, { status: "canceled" })}
                onRemove={(id) => setItems(items.filter((item) => item.id !== id))}
            />
        </div>
    );
}
Grid.layout = { align: "start" as const };

/** density="compact": one short line per file, for a sidebar or a long list. */
export function Compact() {
    const [items, setItems] = useState(states.slice(0, 5));
    return (
        <div style={{ width: 360, maxWidth: "100%" }}>
            <UploadList
                density="compact"
                items={items}
                onRemove={(id) => setItems(items.filter((item) => item.id !== id))}
            />
        </div>
    );
}
Compact.layout = { align: "start" as const };
