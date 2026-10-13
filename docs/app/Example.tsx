import { useState } from "react";

import { CodeBlock } from "@openwarelabs/ui";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { ExampleEntry } from "./types";

const collapsedLines = 12;

/** A live example on a dotted ground, with its code below; long code starts folded. */
export function Example({ example }: { example: ExampleEntry }) {
    const { Component, layout } = example;
    const lineCount = example.code.trimEnd().split("\n").length;
    const foldable = lineCount > collapsedLines + 3;
    const [expanded, setExpanded] = useState(false);
    const folded = foldable && !expanded;

    return (
        <div className="docs-example">
            <div
                className={[
                    "docs-example__preview",
                    `docs-example__preview--${layout.align ?? "center"}`,
                    layout.fill ? "docs-example__preview--fill" : "",
                    layout.ground ? `docs-example__preview--${layout.ground}` : "",
                ].join(" ")}
                style={layout.minHeight ? { minHeight: layout.minHeight } : undefined}
            >
                <div className="docs-example__stage">
                    <Component />
                </div>
            </div>
            <div className={`docs-example__code${folded ? " docs-example__code--folded" : ""}`}>
                <CodeBlock code={example.code} html={example.html} className="docs-example__block" />
                {foldable ? (
                    <button type="button" className="docs-example__toggle" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
                        {expanded ? "Fold code" : `Show all ${lineCount} lines`}
                    </button>
                ) : null}
            </div>
        </div>
    );
}
