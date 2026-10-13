import { useEffect, useRef, useState, type ReactNode } from "react";

import { CheckIcon, CopyIcon } from "../../icons";
import { copyText } from "../../utils/copyText";
import { cx } from "../../utils/cx";

export interface CopyButtonProps {
    /** The text to copy. */
    value: string;
    /** Shown beside the icon, and read out.
     * @default "Copy" */
    label?: string;
    /** Shown for two seconds after copying.
     * @default "Copied" */
    copiedLabel?: string;
    /** Just the icon; the label is still read out.
     * @default false */
    iconOnly?: boolean;
    /** `default` sits on surfaces; `onDark` sits on a code block.
     * @default "default" */
    tone?: "default" | "onDark";
    onCopy?(): void;
    className?: string;
}

/** Copies a value and says so: the icon turns into a check for two seconds and screen readers hear "Copied". */
export function CopyButton({ value, label = "Copy", copiedLabel = "Copied", iconOnly = false, tone = "default", onCopy, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);
    const timer = useRef(0);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    return (
        <button
            type="button"
            className={cx(
                "ow-copy-button",
                tone === "onDark" && "ow-copy-button--on-dark",
                iconOnly && "ow-copy-button--icon-only",
                copied && "ow-copy-button--copied",
                className,
            )}
            aria-label={iconOnly ? (copied ? copiedLabel : label) : undefined}
            onClick={async () => {
                if (await copyText(value)) {
                    setCopied(true);
                    onCopy?.();
                    window.clearTimeout(timer.current);
                    timer.current = window.setTimeout(() => setCopied(false), 2000);
                }
            }}
        >
            <span className="ow-copy-button__icon" aria-hidden="true">
                <CopyIcon size={14} />
                <CheckIcon size={14} />
            </span>
            {iconOnly ? null : <span>{copied ? copiedLabel : label}</span>}
            <span className="ow-visually-hidden" aria-live="polite">
                {copied ? copiedLabel : ""}
            </span>
        </button>
    );
}

export interface CodeBlockProps {
    /** The code, as plain text. It's what the copy button copies. */
    code: string;
    /** Pre-highlighted HTML for the code (from Shiki or Prism, say). Without it the code shows plain. */
    html?: string;
    /** A file name or caption in the header. */
    title?: ReactNode;
    /** Shown on the right of the header, e.g. "tsx". */
    language?: string;
    /** @default false */
    showLineNumbers?: boolean;
    /** @default true */
    copyable?: boolean;
    /** Scrolls past this height (pixels). */
    maxHeight?: number;
    className?: string;
}

/** Code on Commandr's night ground, the same in both themes, with a copy button. */
export function CodeBlock({ code, html, title, language, showLineNumbers = false, copyable = true, maxHeight, className }: CodeBlockProps) {
    const hasHeader = title !== undefined || language !== undefined;
    const lines = code.replace(/\n$/, "").split("\n");
    return (
        <div className={cx("ow-code-block", showLineNumbers && "ow-code-block--numbered", className)}>
            {hasHeader ? (
                <div className="ow-code-block__header">
                    <span className="ow-code-block__title">{title}</span>
                    {language ? <span className="ow-code-block__language">{language}</span> : null}
                    {copyable ? <CopyButton value={code} tone="onDark" iconOnly label="Copy code" /> : null}
                </div>
            ) : copyable ? (
                <CopyButton value={code} tone="onDark" iconOnly label="Copy code" className="ow-code-block__floating-copy" />
            ) : null}
            <pre className="ow-code-block__pre" style={maxHeight ? { maxHeight } : undefined} tabIndex={0}>
                {showLineNumbers ? (
                    <span className="ow-code-block__numbers" aria-hidden="true">
                        {lines.map((_, index) => (
                            <span key={index}>{index + 1}</span>
                        ))}
                    </span>
                ) : null}
                {html ? (
                    <code className="ow-code-block__code" dangerouslySetInnerHTML={{ __html: html }} />
                ) : (
                    <code className="ow-code-block__code">{code.replace(/\n$/, "")}</code>
                )}
            </pre>
        </div>
    );
}

export interface SnippetProps {
    /** The command or value, copied as is. */
    value: string;
    /** A muted prompt before it, such as "$".
     * @default "$" */
    prompt?: string | null;
    className?: string;
}

/** One line to copy: an install command, an API key name, a URL. */
export function Snippet({ value, prompt = "$", className }: SnippetProps) {
    return (
        <div className={cx("ow-snippet", className)}>
            <code className="ow-snippet__code">
                {prompt ? (
                    <span className="ow-snippet__prompt" aria-hidden="true">
                        {prompt}
                    </span>
                ) : null}
                {value}
            </code>
            <CopyButton value={value} iconOnly label={`Copy ${value}`} />
        </div>
    );
}
