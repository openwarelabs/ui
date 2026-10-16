import type { ReactNode } from "react";

/** The formatting tools the toolbar can show, in the order they're listed in `toolbar`. */
export type MarkdownEditorTool =
    | "bold"
    | "italic"
    | "strikethrough"
    | "heading"
    | "link"
    | "quote"
    | "code"
    | "codeBlock"
    | "bulletList"
    | "numberedList"
    | "taskList"
    | "divider";

/** The words it uses, for other languages. Each tool's label names its button and its tooltip. */
export interface MarkdownEditorLabels {
    /** @default "Bold" */
    bold?: string;
    /** @default "Italic" */
    italic?: string;
    /** @default "Strikethrough" */
    strikethrough?: string;
    /** @default "Heading" */
    heading?: string;
    /** @default "Link" */
    link?: string;
    /** @default "Quote" */
    quote?: string;
    /** @default "Code" */
    code?: string;
    /** @default "Code block" */
    codeBlock?: string;
    /** @default "Bulleted list" */
    bulletList?: string;
    /** @default "Numbered list" */
    numberedList?: string;
    /** @default "Task list" */
    taskList?: string;
    /** @default "Divider" */
    divider?: string;
    /** Names the toolbar. @default "Formatting" */
    formatting?: string;
    /** Names the Write and Preview tabs. @default "View" */
    views?: string;
    /** @default "Write" */
    write?: string;
    /** @default "Preview" */
    preview?: string;
    /** Shown in an empty preview. @default "Nothing to preview" */
    empty?: string;
    /** Read out while a pasted or dropped image uploads. @default "Uploading image…" */
    uploading?: string;
    /** Read out when an upload fails. @default "The image couldn't be uploaded." */
    uploadFailed?: string;
}

export interface MarkdownEditorProps {
    /** The Markdown, when you control it. */
    value?: string;
    /** The starting text when uncontrolled. @default "" */
    defaultValue?: string;
    /** Called with the Markdown after every change. */
    onChange?(markdown: string): void;
    /** The field's name: a Form sends the Markdown under it. */
    name?: string;
    placeholder?: string;
    /** Lines of text the box shows at first; it's 120px tall at least. @default 6 */
    rows?: number;
    /** Grows with its text, up to `autoGrowMaxHeight`, then scrolls. @default false */
    autoGrow?: boolean;
    /** The tallest an auto-growing box gets. A number is pixels. @default 400 */
    autoGrowMaxHeight?: number | string;
    /**
     * The tools to show, in order; separators fall between the groups (text styles, blocks, code, lists, divider).
     * `false` hides the toolbar, leaving the keyboard shortcuts.
     * @default ["bold", "italic", "strikethrough", "heading", "link", "quote", "code", "codeBlock", "bulletList", "numberedList", "taskList", "divider"]
     */
    toolbar?: MarkdownEditorTool[] | false;
    /**
     * `tab` has Write and Preview tabs; `split` shows the text and its preview side by side (one above the other when
     * narrow); `none` has no preview.
     * @default "tab"
     */
    preview?: "tab" | "split" | "none";
    /** Rendering size of the preview: `chat` is 14px text with a tight rhythm, `article` the prose style. @default "chat" */
    previewSize?: "chat" | "article";
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    /** The most characters the text may have. */
    maxLength?: number;
    /** Draws the invalid state; Field sets it from its error. @default false */
    isInvalid?: boolean;
    /** The text box's id; Field sets it to point its label at the box. */
    id?: string;
    /** Names the text box when it isn't in a Field with a label. */
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    /**
     * Uploads an image that's pasted or dropped into the text and returns its URL. While it uploads, the text holds
     * `![Uploading name…]()`; the URL takes its place, as `![name](url)`. Without it, images aren't taken.
     */
    onUpload?(file: File): Promise<string>;
    /** The words it uses, for other languages. */
    labels?: MarkdownEditorLabels;
    className?: string;
    /** Content after the toolbar's tools, such as a help link. */
    toolbarEnd?: ReactNode;
}

/** One edit to the text: `text` replaces `start`…`end`, then `selectionStart`…`selectionEnd` is selected. Internal. */
export interface MarkdownEdit {
    start: number;
    end: number;
    text: string;
    selectionStart: number;
    selectionEnd: number;
}

/** One tool's definition. Internal. */
export interface MarkdownToolSpec {
    /** The key of its label. */
    label: keyof MarkdownEditorLabels;
    /** Which group of the toolbar it belongs to; separators fall between groups. */
    group: number;
    /** The letter of its shortcut with Ctrl or ⌘, and whether Shift is held too. */
    key?: string;
    shift?: boolean;
    /** Whether the button reflects the format at the caret with aria-pressed. */
    toggles: boolean;
}
