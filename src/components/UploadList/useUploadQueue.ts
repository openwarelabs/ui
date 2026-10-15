import { useCallback, useEffect, useId, useRef, useState } from "react";

import type { UploadListItem, UploadQueue, Uploader, UseUploadQueueOptions } from "./UploadList.types";

/**
 * Keeps a queue of files for `UploadList`: uploads them with your `uploader`, a few at a time, and tracks each one's
 * progress and status. Cancel and remove abort the upload's signal; retry puts a file back in the queue.
 *
 * `const queue = useUploadQueue((file, { onProgress, signal }) => upload(file, onProgress, signal));`
 */
export function useUploadQueue(uploader: Uploader, { concurrency = 3 }: UseUploadQueueOptions = {}): UploadQueue {
    const [items, setItems] = useState<UploadListItem[]>([]);
    const prefix = useId();
    const count = useRef(0);
    const files = useRef(new Map<string, File>());
    const running = useRef(new Map<string, AbortController>());
    const uploaderRef = useRef(uploader);
    uploaderRef.current = uploader;
    const itemsRef = useRef(items);
    itemsRef.current = items;

    const update = useCallback((id: string, patch: Partial<UploadListItem>) => {
        setItems((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    }, []);

    const stop = useCallback((id: string) => {
        running.current.get(id)?.abort();
        running.current.delete(id);
    }, []);

    // Starts queued files while there's room.
    useEffect(() => {
        let free = concurrency - running.current.size;
        for (const item of items) {
            if (free <= 0) break;
            const file = files.current.get(item.id);
            if (item.status !== "queued" || !file || running.current.has(item.id)) continue;
            free -= 1;
            const controller = new AbortController();
            const { signal } = controller;
            running.current.set(item.id, controller);
            update(item.id, { status: "uploading", progress: 0, error: undefined });
            const settle = (patch: Partial<UploadListItem>) => {
                if (signal.aborted) return;
                running.current.delete(item.id);
                update(item.id, patch);
            };
            // Through a promise, so an uploader that throws straight away fails the file too.
            Promise.resolve()
                .then(() => uploaderRef.current(file, { signal, onProgress: (progress) => signal.aborted || update(item.id, { progress }) }))
                .then(
                    (href) => settle({ status: "done", progress: 100, href: href || undefined }),
                    (reason: unknown) => settle({ status: "error", error: reason instanceof Error ? reason.message : undefined }),
                );
        }
    }, [items, concurrency, update]);

    // Stops everything and frees the previews when the queue goes away.
    useEffect(() => {
        const controllers = running.current;
        const latest = itemsRef;
        return () => {
            controllers.forEach((controller) => controller.abort());
            controllers.clear();
            latest.current.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
        };
    }, []);

    const add = useCallback(
        (added: File[]) => {
            const next = added.map((file): UploadListItem => {
                const id = `${prefix}${(count.current += 1)}`;
                files.current.set(id, file);
                return {
                    id,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    status: "queued",
                    previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
                };
            });
            setItems((list) => [...list, ...next]);
        },
        [prefix],
    );

    const retry = useCallback((id: string) => update(id, { status: "queued", progress: undefined, error: undefined }), [update]);

    const cancel = useCallback(
        (id: string) => {
            stop(id);
            update(id, { status: "canceled" });
        },
        [stop, update],
    );

    const remove = useCallback(
        (id: string) => {
            stop(id);
            files.current.delete(id);
            setItems((list) =>
                list.filter((item) => {
                    if (item.id === id && item.previewUrl) URL.revokeObjectURL(item.previewUrl);
                    return item.id !== id;
                }),
            );
        },
        [stop],
    );

    return { items, add, retry, cancel, remove };
}
