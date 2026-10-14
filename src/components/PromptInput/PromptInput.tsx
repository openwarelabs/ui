import {
    forwardRef,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type ClipboardEvent,
    type CSSProperties,
    type DragEvent,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
} from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { ArrowUpIcon, FileIcon, UploadIcon, XIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { resizeTextArea } from "../../utils/resizeTextArea";
import { Button } from "../Button/Button";
import { Textarea } from "../Textarea/Textarea";
import { Tooltip } from "../Tooltip/Tooltip";

/** A file attached to the message, shown as a chip above the text. */
export interface PromptAttachment {
    /** Identifies it to onRemoveAttachment, and keys its chip. */
    id: string;
    /** The file name, shown on the chip (a long one is cut short before its extension) and read out by its remove button. */
    name: string;
    /** Bytes, shown under the name: "48 kB". */
    size?: number;
    /** The MIME type, such as "image/png". With the name, it picks the chip's icon when there's no preview. */
    type?: string;
    /** An image to show as the chip's thumbnail: an object URL from URL.createObjectURL, or any image URL. */
    previewUrl?: string;
}

export interface PromptInputProps {
    /** The text, when controlled. Clear it yourself in onSubmit. */
    value?: string;
    /** The starting text when uncontrolled. The box clears itself after each send.
     * @default "" */
    defaultValue?: string;
    /** Called with the text on every change. */
    onChange?(value: string): void;
    /**
     * Called on Enter or the send button with the text (trimmed) and the attachments. It isn't called while there's
     * nothing to send (no text and no attachments), while streaming, or while disabled.
     */
    onSubmit?(value: string, attachments: PromptAttachment[]): void;
    /** The agent is replying: the send button becomes a Stop button and Escape in the box stops it. The next message can
     * be typed meanwhile, but not sent.
     * @default false */
    isStreaming?: boolean;
    /** Called by the Stop button, and by Escape in the box, while streaming. */
    onStop?(): void;
    /** The files attached so far, as chips above the text. You keep the list: add to it in onAttach and take from it in
     * onRemoveAttachment. */
    attachments?: PromptAttachment[];
    /** Called with the files picked with the paperclip, pasted, or dropped on the box. Giving it shows the paperclip. */
    onAttach?(files: File[]): void;
    /** Called with an attachment's id when its remove button is pressed. Giving it shows the remove buttons. */
    onRemoveAttachment?(id: string): void;
    /** File types to accept, as for <input accept>: "image/*,.log,.txt". Other files are turned away with a message. */
    accept?: string;
    /** Lets several files be attached at once.
     * @default true */
    multiple?: boolean;
    /** Controls at the start of the toolbar under the text, after the paperclip: a model Select, a toggle. Buttons here
     * should be size sm. */
    startActions?: ReactNode;
    /** Controls at the end of the toolbar, before the send button. */
    endActions?: ReactNode;
    /** A muted line under the box, such as how to send: "Enter to send, Shift + Enter for a new line". The text box
     * points to it with aria-describedby. */
    hint?: ReactNode;
    /** @default "Message the agent…" */
    placeholder?: string;
    /** Names the text box for screen readers. It's "Message" unless something else labels it: aria-labelledby, or an id
     * that a <label> points to, as in a Field. */
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    /** The text box's id. Field sets it. */
    id?: string;
    /** Marks the box invalid: a danger border, and aria-invalid on the text box. Field sets it from its error.
     * @default false */
    isInvalid?: boolean;
    /** Turns off the text box, its buttons and the controls in the toolbar, and fades the box.
     * @default false */
    disabled?: boolean;
    /** Focuses the text box when it appears. Use it where typing is plainly the next step, such as a new chat.
     * @default false */
    autoFocus?: boolean;
    /** The most characters the text can have. A quiet count shows once it's 80% full. */
    maxLength?: number;
    /** The rows of text the box shows when it's empty.
     * @default 1 */
    minRows?: number;
    /** The most rows it grows to; past that, the text scrolls.
     * @default 8 */
    maxRows?: number;
    /** md for a chat page, sm for a side panel or a reply box.
     * @default "md" */
    size?: "sm" | "md";
    /** The locale for attachment sizes and the character count, such as "de-CH". Defaults to the browser's. */
    locale?: string;
    /** Called for each key in the text box before the box's own keys. Call event.preventDefault() to take a key over, for
     * example the Up arrow to edit the last message. */
    onKeyDown?(event: KeyboardEvent<HTMLTextAreaElement>): void;
    /** Classes for the outer element, which holds the box and the hint. */
    className?: string;
}

const noAttachments: PromptAttachment[] = [];
/** The count shows once the text is this full. */
const counterFrom = 0.8;
/** How long typing has to pause before the count is read out. */
const announceDelay = 1000;

function Glyph({ children }: { children: ReactNode }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {children}
        </svg>
    );
}

// Lucide shapes (ISC licence), drawn here like the ones in icons.tsx.
const sheet = "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z";
const fold = "M14 2v5a1 1 0 0 0 1 1h5";

const PaperclipIcon = () => (
    <Glyph>
        <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />
    </Glyph>
);

const StopIcon = () => (
    <Glyph>
        <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />
    </Glyph>
);

const fileIcons = {
    image: (
        <Glyph>
            <path d={sheet} />
            <path d={fold} />
            <circle cx="10" cy="12" r="2" />
            <path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22" />
        </Glyph>
    ),
    code: (
        <Glyph>
            <path d={sheet} />
            <path d={fold} />
            <path d="M10 12.5 8 15l2 2.5" />
            <path d="m14 12.5 2 2.5-2 2.5" />
        </Glyph>
    ),
    text: (
        <Glyph>
            <path d={sheet} />
            <path d={fold} />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
        </Glyph>
    ),
    file: <FileIcon size={16} />,
};

function kindOf({ name, type = "" }: PromptAttachment): keyof typeof fileIcons {
    const lower = name.toLowerCase();
    if (type.startsWith("image/") || /\.(png|jpe?g|gif|webp|avif|heic|svg)$/.test(lower)) return "image";
    if (/\.(tsx?|jsx?|mjs|cjs|py|go|rs|rb|java|kt|swift|c|cc|cpp|h|cs|php|css|scss|html|json|ya?ml|toml|sql|sh)$/.test(lower)) return "code";
    if (type.startsWith("text/") || type === "application/pdf" || /\.(txt|md|log|csv|pdf|docx?|rtf)$/.test(lower)) return "text";
    return "file";
}

/** "screenshot.png" → ["screenshot", ".png"], so the name can be cut short before its extension. */
function splitName(name: string): [string, string] {
    const dot = name.lastIndexOf(".");
    if (dot <= 0 || name.length - dot > 8) return [name, ""];
    return [name.slice(0, dot), name.slice(dot)];
}

function formatBytes(bytes: number, locale: string | undefined): string {
    const units = ["byte", "kilobyte", "megabyte", "gigabyte"] as const;
    let value = bytes;
    let unit = 0;
    while (value >= 1000 && unit < units.length - 1) {
        value /= 1000;
        unit += 1;
    }
    return new Intl.NumberFormat(locale, {
        style: "unit",
        unit: units[unit],
        unitDisplay: unit === 0 ? "long" : "short",
        maximumFractionDigits: unit > 0 && value < 10 ? 1 : 0,
    }).format(value);
}

/** Whether a file matches an <input accept> list. */
function accepts(file: File, accept: string | undefined): boolean {
    if (!accept) return true;
    return accept.split(",").some((rule) => {
        const pattern = rule.trim().toLowerCase();
        if (!pattern) return false;
        if (pattern.startsWith(".")) return file.name.toLowerCase().endsWith(pattern);
        if (pattern.endsWith("/*")) return file.type.toLowerCase().startsWith(pattern.slice(0, -1));
        return file.type.toLowerCase() === pattern;
    });
}

const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer.types).includes("Files");

/**
 * The box you write to the agent in. Enter sends and Shift+Enter starts a new line; it grows with the text, takes files
 * from a picker, the clipboard or a drop, and turns its send button into Stop while the agent replies.
 */
export const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(function PromptInput(
    {
        value,
        defaultValue = "",
        onChange,
        onSubmit,
        isStreaming = false,
        onStop,
        attachments = noAttachments,
        onAttach,
        onRemoveAttachment,
        accept,
        multiple = true,
        startActions,
        endActions,
        hint,
        placeholder = "Message the agent…",
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        id,
        isInvalid = false,
        disabled = false,
        autoFocus = false,
        maxLength,
        minRows = 1,
        maxRows = 8,
        size = "md",
        locale,
        onKeyDown,
        className,
    },
    ref,
) {
    const [text, setText] = useControllableState(value, defaultValue, onChange);
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const actionRef = useRef<HTMLButtonElement>(null);
    const pickerRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const composing = useRef(false);
    const dragDepth = useRef(0);
    const pendingFocus = useRef<{ id: string; index: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [notice, setNotice] = useState<string>();
    const [announcement, setAnnouncement] = useState("");
    const hintId = useId();

    const rows = Math.max(1, Math.round(minRows));
    const maxRowCount = Math.max(rows, Math.round(maxRows));
    const canAttach = Boolean(onAttach) && !disabled;
    const hasContent = text.trim().length > 0 || attachments.length > 0;
    const canSend = hasContent && !disabled && !isStreaming;
    const toolbarStart = Boolean(onAttach || startActions);
    // With nothing in the toolbar but the send button, the button sits at the end of the text instead.
    const inline = !toolbarStart && !endActions;
    const showCounter = maxLength !== undefined && maxLength > 0 && text.length >= maxLength * counterFrom;
    const remaining = maxLength === undefined ? 0 : Math.max(0, maxLength - text.length);
    const number = (count: number) => new Intl.NumberFormat(locale).format(count);
    const shownHint = notice ?? hint;
    const describedBy = [ariaDescribedBy, hint && !notice ? hintId : undefined].filter(Boolean).join(" ") || undefined;
    const name = ariaLabel ?? (ariaLabelledBy || id ? undefined : "Message");

    function setTextAreaRef(element: HTMLTextAreaElement | null) {
        textAreaRef.current = element;
        if (typeof ref === "function") ref(element);
        else if (ref) ref.current = element;
    }

    // The text rewraps when the box gets wider or narrower, so it's measured again.
    useEffect(() => {
        const textArea = textAreaRef.current;
        if (!textArea || typeof ResizeObserver === "undefined") return;
        let width = textArea.clientWidth;
        const observer = new ResizeObserver(() => {
            if (textArea.clientWidth === width) return;
            width = textArea.clientWidth;
            resizeTextArea(textArea);
        });
        observer.observe(textArea);
        return () => observer.disconnect();
    }, []);

    useLayoutEffect(() => {
        if (textAreaRef.current) resizeTextArea(textAreaRef.current);
    }, [size, rows]);

    // When a reply ends with focus on Stop and nothing to send, the button turns into a disabled Send: focus moves to
    // the text box rather than being dropped. Read before the change commits, since a disabled button loses focus.
    const wasStreaming = useRef(isStreaming);
    const actionHadFocus = useRef(false);
    if (wasStreaming.current !== isStreaming) {
        actionHadFocus.current = typeof document !== "undefined" && document.activeElement === actionRef.current;
    }
    useLayoutEffect(() => {
        if (wasStreaming.current && !isStreaming && actionHadFocus.current && !hasContent) textAreaRef.current?.focus();
        wasStreaming.current = isStreaming;
        actionHadFocus.current = false;
    }, [isStreaming, hasContent]);

    // After a chip is removed, focus goes to the next chip's remove button, or the previous one, or the text box.
    useLayoutEffect(() => {
        const pending = pendingFocus.current;
        if (!pending) return;
        pendingFocus.current = null;
        if (attachments.some((attachment) => attachment.id === pending.id)) return;
        const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>(".ow-prompt-input__remove");
        const next = buttons?.length ? buttons[Math.min(pending.index, buttons.length - 1)] : undefined;
        (next ?? textAreaRef.current)?.focus();
    }, [attachments]);

    // Near the limit, the count is read out once typing pauses, not on every key.
    useEffect(() => {
        if (!showCounter || document.activeElement !== textAreaRef.current) return;
        const timer = window.setTimeout(() => {
            setAnnouncement(`${number(remaining)} ${remaining === 1 ? "character" : "characters"} left`);
        }, announceDelay);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- `number` only depends on locale.
    }, [showCounter, remaining, locale]);

    function submit() {
        if (!canSend) return;
        onSubmit?.(text.trim(), attachments);
        setNotice(undefined);
        if (value === undefined) setText("");
    }

    function stop() {
        if (isStreaming && !disabled) onStop?.();
    }

    function take(list: File[]) {
        if (!canAttach || !list.length) return;
        const files = multiple ? list : list.slice(0, 1);
        const refused = files.find((file) => !accepts(file, accept));
        const taken = files.filter((file) => accepts(file, accept));
        let message: string | undefined;
        if (refused) message = `“${refused.name}” isn't a file this accepts.`;
        else if (!multiple && list.length > 1) message = "Attach one file at a time.";
        setNotice(message);
        if (message) setAnnouncement(message);
        if (taken.length) onAttach?.(taken);
    }

    function remove(attachment: PromptAttachment, index: number) {
        if (listRef.current?.contains(document.activeElement)) pendingFocus.current = { id: attachment.id, index };
        onRemoveAttachment?.(attachment.id);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "Enter" && !event.shiftKey) {
            // Enter also ends an IME composition (Japanese, Chinese, Korean input); that Enter isn't a send.
            if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
            event.preventDefault();
            submit();
        } else if (event.key === "Escape" && isStreaming && onStop) {
            event.preventDefault();
            event.stopPropagation();
            stop();
        }
    }

    // Pasting a screenshot attaches it. Text that comes with an image (a range of spreadsheet cells) pastes as text.
    function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
        if (!canAttach) return;
        const files = Array.from(event.clipboardData.files);
        if (!files.length || event.clipboardData.getData("text/plain")) return;
        event.preventDefault();
        take(files);
    }

    // A press on the box's padding or the toolbar's empty space puts the caret in the text.
    function handleMouseDown(event: MouseEvent<HTMLElement>) {
        const target = event.target as HTMLElement;
        if (disabled || (target !== event.currentTarget && !target.hasAttribute("data-prompt-blank"))) return;
        event.preventDefault();
        textAreaRef.current?.focus();
    }

    const attachButton = onAttach ? (
        <Tooltip label="Attach files">
            <Button
                className="ow-prompt-input__attach"
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={multiple ? "Attach files" : "Attach a file"}
                disabled={disabled}
                onClick={() => pickerRef.current?.click()}
            >
                <PaperclipIcon />
            </Button>
        </Tooltip>
    ) : null;

    const actionLabel = isStreaming ? "Stop" : "Send";
    const actionButton = (
        <Tooltip label={actionLabel}>
            <Button
                ref={actionRef}
                className="ow-prompt-input__action"
                variant="primary"
                size="sm"
                iconOnly
                aria-label={actionLabel}
                disabled={disabled || (isStreaming ? !onStop : !hasContent)}
                onClick={() => {
                    if (isStreaming) stop();
                    else submit();
                    textAreaRef.current?.focus();
                }}
            >
                {isStreaming ? <StopIcon /> : <ArrowUpIcon size={16} />}
            </Button>
        </Tooltip>
    );

    return (
        <div
            className={cx(
                "ow-prompt-input",
                `ow-prompt-input--${size}`,
                inline && "ow-prompt-input--inline",
                isInvalid && "ow-prompt-input--invalid",
                disabled && "ow-prompt-input--disabled",
                isDragging && "ow-prompt-input--dragging",
                className,
            )}
            style={{ "--ow-prompt-min-rows": rows, "--ow-prompt-max-rows": maxRowCount } as CSSProperties}
        >
            <fieldset
                role="presentation"
                className="ow-prompt-input__box"
                disabled={disabled}
                onMouseDown={handleMouseDown}
                onDragEnter={(event) => {
                    if (!canAttach || !hasFiles(event)) return;
                    event.preventDefault();
                    dragDepth.current += 1;
                    setIsDragging(true);
                }}
                onDragOver={(event) => {
                    if (!canAttach || !hasFiles(event)) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "copy";
                }}
                onDragLeave={() => {
                    dragDepth.current = Math.max(0, dragDepth.current - 1);
                    if (dragDepth.current === 0) setIsDragging(false);
                }}
                onDrop={(event) => {
                    if (!canAttach || !hasFiles(event)) return;
                    event.preventDefault();
                    dragDepth.current = 0;
                    setIsDragging(false);
                    take(Array.from(event.dataTransfer.files));
                }}
            >
                {attachments.length ? (
                    <ul ref={listRef} className="ow-prompt-input__attachments" aria-label="Attachments">
                        {attachments.map((attachment, index) => {
                            const [base, extension] = splitName(attachment.name);
                            return (
                                <li key={attachment.id} className="ow-prompt-input__attachment">
                                    <span className="ow-prompt-input__thumb" aria-hidden="true">
                                        {fileIcons[kindOf(attachment)]}
                                        {attachment.previewUrl ? (
                                            <img
                                                src={attachment.previewUrl}
                                                alt=""
                                                onError={(event) => {
                                                    event.currentTarget.hidden = true;
                                                }}
                                            />
                                        ) : null}
                                    </span>
                                    <span className="ow-prompt-input__file">
                                        <span className="ow-prompt-input__file-name" title={attachment.name}>
                                            <span className="ow-prompt-input__file-base">{base}</span>
                                            {extension}
                                        </span>
                                        {attachment.size !== undefined ? (
                                            <span className="ow-prompt-input__file-size">{formatBytes(attachment.size, locale)}</span>
                                        ) : null}
                                    </span>
                                    {onRemoveAttachment ? (
                                        <button
                                            type="button"
                                            className="ow-prompt-input__remove"
                                            aria-label={`Remove ${attachment.name}`}
                                            onClick={() => remove(attachment, index)}
                                        >
                                            <XIcon size={14} />
                                        </button>
                                    ) : null}
                                </li>
                            );
                        })}
                    </ul>
                ) : null}

                <Textarea
                    ref={setTextAreaRef}
                    className="ow-prompt-input__textarea"
                    bare
                    autoGrow
                    autoGrowMaxHeight={`calc(var(--ow-prompt-line) * ${maxRowCount} + 2 * var(--ow-prompt-pad))`}
                    rows={rows}
                    id={id}
                    value={text}
                    placeholder={placeholder}
                    aria-label={name}
                    aria-labelledby={ariaLabelledBy}
                    aria-describedby={describedBy}
                    isInvalid={isInvalid}
                    disabled={disabled}
                    autoFocus={autoFocus}
                    maxLength={maxLength}
                    enterKeyHint="send"
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onCompositionStart={() => {
                        composing.current = true;
                    }}
                    onCompositionEnd={() => {
                        composing.current = false;
                    }}
                />

                <div className="ow-prompt-input__toolbar" data-prompt-blank="">
                    {toolbarStart ? (
                        <div className="ow-prompt-input__start" data-prompt-blank="">
                            {attachButton}
                            {startActions}
                        </div>
                    ) : null}
                    <div className="ow-prompt-input__end" data-prompt-blank="">
                        {showCounter ? (
                            <span className={cx("ow-prompt-input__counter", remaining === 0 && "ow-prompt-input__counter--full")} aria-hidden="true">
                                {number(text.length)} / {number(maxLength!)}
                            </span>
                        ) : null}
                        {endActions}
                        {actionButton}
                    </div>
                </div>

                {onAttach ? (
                    <input
                        ref={pickerRef}
                        type="file"
                        hidden
                        tabIndex={-1}
                        accept={accept}
                        multiple={multiple}
                        onChange={(event) => {
                            take(Array.from(event.target.files ?? []));
                            event.target.value = "";
                            textAreaRef.current?.focus();
                        }}
                    />
                ) : null}

                {isDragging ? (
                    <div className="ow-prompt-input__drop" aria-hidden="true">
                        <UploadIcon size={16} />
                        Drop to attach
                    </div>
                ) : null}
            </fieldset>

            {shownHint ? (
                <div
                    className={cx("ow-prompt-input__hint", notice && "ow-prompt-input__hint--notice")}
                    id={notice ? undefined : hintId}
                    aria-hidden={notice ? true : undefined}
                >
                    {shownHint}
                </div>
            ) : null}
            <span className="ow-visually-hidden" role="status">
                {announcement}
            </span>
        </div>
    );
});
