import { useState } from "react";

import { FileDropZone, Stack, Tag, TagGroup } from "@openwarelabs/ui";
import { FolderDown } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "FileDropZone",
    category: "Pickers",
    description:
        "Commandr's folder drop zone, for files: drop them on it, or press it to pick them. It checks type and size.",
    source: "components/FileDropZone/FileDropZone.tsx",
    keyboard: [["Enter or Space", "Opens the file picker."]],
    notes: [
        "A visually hidden file input inside a label does the picking, so it works from the keyboard and screen readers.",
        "Problems (wrong type, too big) replace the hint and are announced.",
    ],
    related: ["Field", "ProgressBar"],
};

/** Drop images here, or press it to browse. The files you add are listed below. */
export function Basic() {
    const [files, setFiles] = useState<File[]>([]);
    return (
        <Stack gap="md" style={{ width: 420, maxWidth: "100%" }}>
            <FileDropZone
                multiple
                accept="image/*,.pdf"
                maxSize={5 * 1024 * 1024}
                hint="PNG, JPG or PDF, up to 5 MB each."
                onFiles={(added) => setFiles([...files, ...added])}
            />
            {files.length ? (
                <TagGroup label="Files to upload">
                    {files.map((file, index) => (
                        <Tag
                            key={`${file.name}-${index}`}
                            onRemove={() => setFiles(files.filter((_, i) => i !== index))}
                        >
                            {file.name}
                        </Tag>
                    ))}
                </TagGroup>
            ) : null}
        </Stack>
    );
}

/** Your own icon and words. */
export function Custom() {
    return (
        <div style={{ width: 420, maxWidth: "100%" }}>
            <FileDropZone
                icon={<FolderDown size={20} />}
                label="Or drop a project folder here"
                hint="It's imported where it is. Nothing is moved."
                accept=".zip"
                onFiles={() => undefined}
            />
        </div>
    );
}

/** An error from outside, such as a failed upload, shows in place of the hint. */
export function WithError() {
    return (
        <div style={{ width: 420, maxWidth: "100%" }}>
            <FileDropZone
                error="The upload stopped. Check your connection and try again."
                onFiles={() => undefined}
            />
        </div>
    );
}
