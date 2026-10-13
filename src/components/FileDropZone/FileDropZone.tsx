import { useId, useRef, useState, type DragEvent, type ReactNode } from "react";

import { UploadIcon } from "../../icons";
import { cx } from "../../utils/cx";

export interface FileDropZoneProps {
    /** Called with the accepted files, whether dropped or picked. */
    onFiles(files: File[]): void;
    /** File types to accept, as for <input accept>: ".png,.jpg", "image/*". */
    accept?: string;
    /** @default false */
    multiple?: boolean;
    /** The largest file accepted, in bytes. */
    maxSize?: number;
    /** @default "Drop files here, or browse" */
    label?: ReactNode;
    /** A muted line under the label: what's accepted, how big. */
    hint?: ReactNode;
    /** An error to show in place of the hint, such as a failed upload. */
    error?: ReactNode;
    /** A 20px icon on the tile.
     * @default <UploadIcon /> */
    icon?: ReactNode;
    disabled?: boolean;
    /** The form field name for the file input. */
    name?: string;
    className?: string;
}

function matches(file: File, accept: string | undefined) {
    if (!accept) return true;
    return accept.split(",").some((rule) => {
        const pattern = rule.trim().toLowerCase();
        if (!pattern) return false;
        if (pattern.startsWith(".")) return file.name.toLowerCase().endsWith(pattern);
        if (pattern.endsWith("/*")) return file.type.toLowerCase().startsWith(pattern.slice(0, -1));
        return file.type.toLowerCase() === pattern;
    });
}

const formatSize = (bytes: number) =>
    bytes >= 1_048_576 ? `${Math.round(bytes / 104_857.6) / 10} MB` : `${Math.round(bytes / 1024)} KB`;

/**
 * A drop zone for files: drop them on it, or press it to pick them.
 * It checks the type and size and says what was wrong.
 */
export function FileDropZone({
    onFiles,
    accept,
    multiple = false,
    maxSize,
    label = "Drop files here, or browse",
    hint,
    error,
    icon,
    disabled = false,
    name,
    className,
}: FileDropZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const depth = useRef(0);
    const [isDragging, setIsDragging] = useState(false);
    const [problem, setProblem] = useState<string>();
    const hintId = useId();

    function take(list: FileList | null) {
        if (!list || disabled) return;
        const files = [...list].slice(0, multiple ? undefined : 1);
        const wrongType = files.find((file) => !matches(file, accept));
        const tooBig = maxSize ? files.find((file) => file.size > maxSize) : undefined;
        if (!multiple && list.length > 1) setProblem("Drop one file at a time.");
        else if (wrongType) setProblem(`“${wrongType.name}” isn't a file this accepts.`);
        else if (tooBig && maxSize) setProblem(`“${tooBig.name}” is over ${formatSize(maxSize)}.`);
        else {
            setProblem(undefined);
            if (files.length) onFiles(files);
        }
    }

    const hasFiles = (event: DragEvent) => event.dataTransfer.types.includes("Files");

    return (
        <label
            className={cx(
                "ow-dropzone",
                isDragging && "ow-dropzone--dragging",
                Boolean(error || problem) && "ow-dropzone--invalid",
                disabled && "ow-dropzone--disabled",
                className,
            )}
            onDragEnter={(event) => {
                if (!hasFiles(event) || disabled) return;
                event.preventDefault();
                depth.current += 1;
                setIsDragging(true);
            }}
            onDragOver={(event) => {
                if (!hasFiles(event) || disabled) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
            }}
            onDragLeave={() => {
                depth.current = Math.max(0, depth.current - 1);
                if (depth.current === 0) setIsDragging(false);
            }}
            onDrop={(event) => {
                if (!hasFiles(event)) return;
                event.preventDefault();
                depth.current = 0;
                setIsDragging(false);
                take(event.dataTransfer.files);
            }}
        >
            <input
                ref={inputRef}
                type="file"
                className="ow-visually-hidden"
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                name={name}
                aria-describedby={hintId}
                onChange={(event) => {
                    take(event.target.files);
                    event.target.value = "";
                }}
            />
            <span className="ow-dropzone__icon">{icon ?? <UploadIcon size={20} />}</span>
            <span className="ow-dropzone__label">{isDragging ? "Drop to add" : label}</span>
            <span id={hintId} className="ow-dropzone__hint" aria-live="polite">
                {error ?? problem ?? hint}
            </span>
        </label>
    );
}
