import {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type ClipboardEvent,
    type DragEvent,
    type KeyboardEvent,
    type ReactNode,
} from "react";

import { Button } from "@/components/Button/Button";
import { ToggleButton } from "@/components/Button/ButtonGroup";
import { Markdown } from "@/components/Markdown/Markdown";
import { Tab, TabList, TabPanel, Tabs } from "@/components/Tabs/Tabs";
import { Textarea } from "@/components/Textarea/Textarea";
import { Toolbar, ToolbarSeparator } from "@/components/Toolbar/Toolbar";
import { Tooltip } from "@/components/Tooltip/Tooltip";
import { useControllableState } from "@/hooks/useControllableState";
import {
    BoldIcon,
    CodeIcon,
    HeadingIcon,
    ItalicIcon,
    LinkIcon,
    ListIcon,
    ListOrderedIcon,
    MinusIcon,
    SquareCheckIcon,
    SquareCodeIcon,
    StrikethroughIcon,
    TextQuoteIcon,
} from "@/icons";
import { cx } from "@/utils/cx";
import { toAriaShortcut } from "@/utils/text";
import type { MarkdownEdit, MarkdownEditorLabels, MarkdownEditorProps, MarkdownEditorTool, MarkdownToolSpec } from "./MarkdownEditor.types";
import { continueList, editFor, isActive } from "./markdownEdits";

export type { MarkdownEditorLabels, MarkdownEditorProps, MarkdownEditorTool } from "./MarkdownEditor.types";

const defaultLabels: Required<MarkdownEditorLabels> = {
    bold: "Bold",
    italic: "Italic",
    strikethrough: "Strikethrough",
    heading: "Heading",
    link: "Link",
    quote: "Quote",
    code: "Code",
    codeBlock: "Code block",
    bulletList: "Bulleted list",
    numberedList: "Numbered list",
    taskList: "Task list",
    divider: "Divider",
    formatting: "Formatting",
    views: "View",
    write: "Write",
    preview: "Preview",
    empty: "Nothing to preview",
    uploading: "Uploading image…",
    uploadFailed: "The image couldn't be uploaded.",
};

export const defaultMarkdownEditorToolbar: MarkdownEditorTool[] = [
    "bold",
    "italic",
    "strikethrough",
    "heading",
    "link",
    "quote",
    "code",
    "codeBlock",
    "bulletList",
    "numberedList",
    "taskList",
    "divider",
];

const tools: Record<MarkdownEditorTool, MarkdownToolSpec> = {
    bold: { label: "bold", group: 0, key: "b", toggles: true },
    italic: { label: "italic", group: 0, key: "i", toggles: true },
    strikethrough: { label: "strikethrough", group: 0, key: "x", shift: true, toggles: true },
    heading: { label: "heading", group: 1, toggles: true },
    link: { label: "link", group: 1, key: "k", toggles: false },
    quote: { label: "quote", group: 1, key: ".", shift: true, toggles: true },
    code: { label: "code", group: 2, key: "e", toggles: true },
    codeBlock: { label: "codeBlock", group: 2, toggles: false },
    bulletList: { label: "bulletList", group: 3, key: "8", shift: true, toggles: true },
    numberedList: { label: "numberedList", group: 3, key: "7", shift: true, toggles: true },
    taskList: { label: "taskList", group: 3, toggles: true },
    divider: { label: "divider", group: 4, toggles: false },
};

const icons: Record<MarkdownEditorTool, ReactNode> = {
    bold: <BoldIcon />,
    italic: <ItalicIcon />,
    strikethrough: <StrikethroughIcon />,
    heading: <HeadingIcon />,
    link: <LinkIcon />,
    quote: <TextQuoteIcon />,
    code: <CodeIcon />,
    codeBlock: <SquareCodeIcon />,
    bulletList: <ListIcon />,
    numberedList: <ListOrderedIcon />,
    taskList: <SquareCheckIcon />,
    divider: <MinusIcon />,
};

/** The shortcut's visible form: "⌘B" on a Mac, "Ctrl+Shift+7" elsewhere. */
function shortcutText(spec: MarkdownToolSpec, mac: boolean): string | undefined {
    if (!spec.key) return undefined;
    const key = spec.key.toUpperCase();
    if (mac) return `⌘${spec.shift ? "⇧" : ""}${key}`;
    return `Ctrl+${spec.shift ? "Shift+" : ""}${key}`;
}

/** Puts an edit into the box, through insertText so the browser's undo keeps it; falls back to setRangeText. */
function applyEdit(box: HTMLTextAreaElement, edit: MarkdownEdit) {
    box.focus();
    box.setSelectionRange(edit.start, edit.end);
    let done = false;
    try {
        done = edit.text ? document.execCommand("insertText", false, edit.text) : document.execCommand("delete");
    } catch {
        done = false;
    }
    if (!done || box.value.slice(edit.start, edit.start + edit.text.length) !== edit.text) {
        box.setRangeText(edit.text, edit.start, edit.end, "end");
        box.dispatchEvent(new Event("input", { bubbles: true }));
    }
    box.setSelectionRange(edit.selectionStart, edit.selectionEnd);
}

/** A placeholder for an image while it uploads. */
const uploadingText = (name: string) => `![Uploading ${name}…]()`;

/**
 * A text box for Markdown with a formatting toolbar and a preview: comments, descriptions, notes. Each tool wraps
 * or marks what's selected, and the text stays plain Markdown that a form sends like any other field.
 */
export function MarkdownEditor({
    value,
    defaultValue = "",
    onChange,
    name,
    placeholder,
    rows = 6,
    autoGrow = false,
    autoGrowMaxHeight = 400,
    toolbar = defaultMarkdownEditorToolbar,
    preview = "tab",
    previewSize = "chat",
    disabled = false,
    readOnly = false,
    required,
    maxLength,
    isInvalid = false,
    id: idProp,
    onUpload,
    labels: labelsProp,
    className,
    toolbarEnd,
    ...aria
}: MarkdownEditorProps) {
    const labels = { ...defaultLabels, ...labelsProp };
    const [text, setText] = useControllableState(value, defaultValue, onChange);
    const boxRef = useRef<HTMLTextAreaElement | null>(null);
    const generatedId = useId();
    const id = idProp ?? `${generatedId}-box`;
    const [view, setView] = useState("write");
    const [active, setActive] = useState<MarkdownEditorTool[]>([]);
    const [status, setStatus] = useState("");
    const [mac, setMac] = useState(false);
    const editable = !disabled && !readOnly;
    const toolbarKey = toolbar === false ? "" : toolbar.join(",");
    const shown = useMemo<MarkdownEditorTool[]>(
        () => (toolbarKey ? (toolbarKey.split(",") as MarkdownEditorTool[]).filter((tool) => tool in tools) : []),
        [toolbarKey],
    );

    useEffect(() => {
        setMac(/Mac|iPhone|iPad/.test(navigator.platform) || /Mac/.test(navigator.userAgent));
    }, []);

    // Which formats are on at the caret, so the buttons show it. A few string checks on the current line: cheap.
    const refresh = useCallback(() => {
        const box = boxRef.current;
        if (!box) return;
        const { selectionStart, selectionEnd } = box;
        const next = shown.filter((tool) => tools[tool].toggles && isActive(tool, box.value, selectionStart, selectionEnd));
        setActive((current) => (current.length === next.length && current.every((tool, index) => tool === next[index]) ? current : next));
    }, [shown]);

    useEffect(refresh, [refresh, text]);

    function run(tool: MarkdownEditorTool) {
        const box = boxRef.current;
        if (!box || !editable) return;
        const edit = editFor(tool, box.value, box.selectionStart, box.selectionEnd);
        if (edit) applyEdit(box, edit);
        refresh();
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (!editable) return;
        const box = event.currentTarget;
        if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
            if (box.selectionStart !== box.selectionEnd) return;
            const edit = continueList(box.value, box.selectionStart);
            if (!edit) return;
            event.preventDefault();
            applyEdit(box, edit);
            return;
        }
        const modifier = mac ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
        if (!modifier || event.altKey) return;
        const key = event.key.toLowerCase();
        const tool = (Object.keys(tools) as MarkdownEditorTool[]).find((name) => {
            const spec = tools[name];
            return spec.key === key && !!spec.shift === event.shiftKey;
        });
        if (!tool) return;
        event.preventDefault();
        run(tool);
    }

    /** Uploads image files and puts each in the text where the caret is. */
    function takeFiles(files: File[]): boolean {
        const box = boxRef.current;
        const images = files.filter((file) => file.type.startsWith("image/"));
        if (!onUpload || !box || !editable || !images.length) return false;
        for (const file of images) {
            const marker = uploadingText(file.name);
            const at = box.selectionEnd;
            applyEdit(box, { start: at, end: at, text: marker, selectionStart: at + marker.length, selectionEnd: at + marker.length });
            setStatus(labels.uploading);
            onUpload(file)
                .then((url) => {
                    const current = boxRef.current;
                    if (!current) return;
                    const index = current.value.indexOf(marker);
                    if (index === -1) return;
                    const alt = file.name.replace(/\.[^.]+$/, "").replace(/[[\]]/g, "");
                    const image = `![${alt}](${url})`;
                    applyEdit(current, { start: index, end: index + marker.length, text: image, selectionStart: index + image.length, selectionEnd: index + image.length });
                    setStatus("");
                })
                .catch(() => {
                    const current = boxRef.current;
                    const index = current ? current.value.indexOf(marker) : -1;
                    if (current && index !== -1) applyEdit(current, { start: index, end: index + marker.length, text: "", selectionStart: index, selectionEnd: index });
                    setStatus(labels.uploadFailed);
                });
        }
        return true;
    }

    function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
        const files = Array.from(event.clipboardData.files);
        if (!files.length || event.clipboardData.getData("text/plain")) return;
        if (takeFiles(files)) event.preventDefault();
    }

    function handleDrop(event: DragEvent<HTMLTextAreaElement>) {
        const files = Array.from(event.dataTransfer.files);
        if (!files.length) return;
        if (takeFiles(files)) event.preventDefault();
    }

    function toolButton(tool: MarkdownEditorTool) {
        const spec = tools[tool];
        const label = labels[spec.label];
        const shortcut = shortcutText(spec, mac);
        const shared = {
            variant: "ghost" as const,
            size: "sm" as const,
            iconOnly: true,
            "aria-label": label,
            "aria-keyshortcuts": shortcut ? toAriaShortcut(shortcut.replace("⇧", "Shift+")) : undefined,
            disabled: !editable,
            // Keep the caret where it is: the button does its work on the textarea's selection.
            onMouseDown: (event: { preventDefault(): void }) => event.preventDefault(),
            onClick: () => run(tool),
            children: icons[tool],
        };
        return (
            <Tooltip key={tool} label={shortcut ? `${label} (${shortcut})` : label}>
                {spec.toggles ? <ToggleButton {...shared} pressed={active.includes(tool)} onPressedChange={() => undefined} /> : <Button {...shared} />}
            </Tooltip>
        );
    }

    const toolbarNode =
        shown.length || toolbarEnd ? (
            <Toolbar aria-label={labels.formatting} variant="plain" size="sm" className="ow-markdown-editor__toolbar">
                {shown.map((tool, index) => {
                    const previous = shown[index - 1];
                    const separate = previous !== undefined && tools[previous].group !== tools[tool].group;
                    return separate ? [<ToolbarSeparator key={`${tool}-separator`} />, toolButton(tool)] : toolButton(tool);
                })}
                {toolbarEnd ? <div className="ow-markdown-editor__toolbar-end">{toolbarEnd}</div> : null}
            </Toolbar>
        ) : null;

    const box = (
        <Textarea
            {...aria}
            ref={boxRef}
            id={id}
            name={name}
            bare
            className="ow-markdown-editor__box"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            onSelect={refresh}
            onPaste={handlePaste}
            onDrop={handleDrop}
            placeholder={placeholder}
            rows={rows}
            autoGrow={autoGrow}
            autoGrowMaxHeight={autoGrowMaxHeight}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            maxLength={maxLength}
            isInvalid={isInvalid}
            spellCheck
        />
    );

    const previewNode = (
        <div className={cx("ow-markdown-editor__preview", !text.trim() && "ow-markdown-editor__preview--empty")}>
            {text.trim() ? <Markdown size={previewSize}>{text}</Markdown> : <p className="ow-markdown-editor__empty">{labels.empty}</p>}
        </div>
    );

    const rootClass = cx(
        "ow-markdown-editor",
        `ow-markdown-editor--${preview}`,
        isInvalid && "ow-markdown-editor--invalid",
        disabled && "ow-markdown-editor--disabled",
        className,
    );

    const live = (
        <div className="ow-visually-hidden" aria-live="polite">
            {status}
        </div>
    );

    if (preview === "tab") {
        return (
            <Tabs value={view} onValueChange={setView} className={rootClass}>
                <div className="ow-markdown-editor__bar">
                    <TabList aria-label={labels.views} className="ow-markdown-editor__tabs">
                        <Tab value="write">{labels.write}</Tab>
                        <Tab value="preview">{labels.preview}</Tab>
                    </TabList>
                    {view === "write" ? toolbarNode : null}
                </div>
                <TabPanel value="write" keepMounted className="ow-markdown-editor__panel">
                    {box}
                </TabPanel>
                <TabPanel value="preview" className="ow-markdown-editor__panel">
                    {previewNode}
                </TabPanel>
                {live}
            </Tabs>
        );
    }

    return (
        <div className={rootClass}>
            {toolbarNode ? <div className="ow-markdown-editor__bar">{toolbarNode}</div> : null}
            {preview === "split" ? (
                <div className="ow-markdown-editor__split">
                    <div className="ow-markdown-editor__pane">
                        <div className="ow-markdown-editor__caption" aria-hidden="true">
                            {labels.write}
                        </div>
                        {box}
                    </div>
                    <div className="ow-markdown-editor__pane ow-markdown-editor__pane--preview">
                        <div className="ow-markdown-editor__caption">{labels.preview}</div>
                        {previewNode}
                    </div>
                </div>
            ) : (
                box
            )}
            {live}
        </div>
    );
}
