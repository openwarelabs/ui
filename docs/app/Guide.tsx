import type { CSSProperties, ReactNode } from "react";

import { CodeBlock } from "@openwarelabs/ui";

/** A highlighted file from docs/snippets, imported with ?highlight. */
export function SnippetBlock({ snippet, title }: { snippet: { code: string; html: string }; title?: string }) {
    return <CodeBlock title={title} code={snippet.code.replace(/\n$/, "")} html={snippet.html} className="docs-snippet" />;
}

/** A live preview on the dotted ground, like an example without its code. */
export function Preview({
    children,
    align = "center",
    ground,
    style,
}: {
    children: ReactNode;
    align?: "center" | "start";
    ground?: "canvas" | "paper";
    style?: CSSProperties;
}) {
    return (
        <div className="docs-example">
            <div
                className={`docs-example__preview docs-example__preview--${align} docs-example__preview--alone${ground ? ` docs-example__preview--${ground}` : ""}`}
                style={style}
            >
                <div className="docs-example__stage">{children}</div>
            </div>
        </div>
    );
}

/** A box with its own theme, and optionally its own brand colour. */
export function ThemePane({ theme, label, style, children }: { theme: "light" | "dark"; label: string; style?: CSSProperties; children: ReactNode }) {
    return (
        <div className="docs-theme-pane" data-theme={theme} style={style}>
            <span className="docs-theme-pane__label">{label}</span>
            {children}
        </div>
    );
}
