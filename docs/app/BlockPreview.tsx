import { useEffect, useId, useRef, useState } from "react";

import { buttonClassName, CodeBlock, SegmentedControl, Spinner, Tooltip } from "@openwarelabs/ui";
import { ArrowUpRight, Code2, Eye, Monitor, Smartphone, Tablet } from "lucide-react";

type View = "preview" | "code";
type Viewport = "desktop" | "tablet" | "phone";

const widths: Record<Viewport, number | null> = { desktop: null, tablet: 768, phone: 390 };

interface BlockFile {
    name: string;
    language: string;
    code: string;
    html: string;
}

// Each block's highlighted files, written by scripts/docs.mjs to build/blocks/<id>.json, fetched once.
const codeCache = new Map<string, Promise<BlockFile[]>>();

function loadCode(id: string) {
    let request = codeCache.get(id);
    if (!request) {
        request = fetch(`./build/blocks/${id}.json`)
            .then((response) => {
                if (!response.ok) throw new Error(`${response.status}`);
                return response.json() as Promise<{ files: BlockFile[] }>;
            })
            .then((json) => json.files);
        request.catch(() => codeCache.delete(id));
        codeCache.set(id, request);
    }
    return request;
}

/** The block's .tsx and .css, one at a time, with a copy button for each. */
function BlockCode({ id }: { id: string }) {
    const [files, setFiles] = useState<BlockFile[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [active, setActive] = useState(0);
    const tabsId = useId();

    useEffect(() => {
        let current = true;
        loadCode(id).then(
            (loaded) => current && setFiles(loaded),
            () => current && setFailed(true),
        );
        return () => {
            current = false;
        };
    }, [id]);

    if (failed) return <p className="docs-block__status">The code didn't load. Reload the page to try again.</p>;
    if (!files) {
        return (
            <div className="docs-block__status">
                <Spinner size="sm" label="Loading the code" />
            </div>
        );
    }
    const file = files[Math.min(active, files.length - 1)]!;
    return (
        <CodeBlock
            key={file.name}
            className="docs-block__code"
            code={file.code}
            html={file.html}
            language={file.language}
            maxHeight={640}
            title={
                <span className="docs-block__files" role="tablist" aria-label="Files">
                    {files.map((entry, index) => (
                        <button
                            key={entry.name}
                            type="button"
                            role="tab"
                            id={`${tabsId}-${index}`}
                            aria-selected={index === active}
                            className="docs-block__file"
                            onClick={() => setActive(index)}
                            onKeyDown={(event) => {
                                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                                const next = (index + (event.key === "ArrowRight" ? 1 : files.length - 1)) % files.length;
                                setActive(next);
                                document.getElementById(`${tabsId}-${next}`)?.focus();
                            }}
                            tabIndex={index === active ? 0 : -1}
                        >
                            {entry.name}
                        </button>
                    ))}
                </span>
            }
        />
    );
}

/**
 * A block, live in a frame you can narrow to a tablet or a phone, or its code. The frame follows the docs' theme and
 * colour, and grows to fit the block unless the block fills the window, when it gets a fixed `height`.
 */
export function BlockPreview({ id, name, height }: { id: string; name: string; height?: number }) {
    const [view, setView] = useState<View>("preview");
    const [viewport, setViewport] = useState<Viewport>("desktop");
    const [contentHeight, setContentHeight] = useState<number | null>(null);
    const [loaded, setLoaded] = useState(false);
    const frame = useRef<HTMLIFrameElement>(null);
    const fits = height === undefined;
    const width = widths[viewport];

    useEffect(() => {
        if (!fits) return undefined;
        const onMessage = (event: MessageEvent) => {
            if (event.source !== frame.current?.contentWindow) return;
            const data = event.data as { type?: string; height?: number } | null;
            if (data?.type === "openware-block-height" && typeof data.height === "number") setContentHeight(data.height);
        };
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [fits]);

    const src = `./frame.html?block=${id}${fits ? "&fit=content" : ""}`;
    const frameHeight = fits ? (contentHeight ?? 320) : height;

    return (
        <div className="docs-block" data-view={view} data-viewport={viewport}>
            <div className="docs-block__bar">
                <SegmentedControl
                    size="sm"
                    aria-label={`Show ${name}`}
                    value={view}
                    onChange={(value) => setView(value as View)}
                    options={[
                        { value: "preview", label: "Preview", icon: <Eye size={15} /> },
                        { value: "code", label: "Code", icon: <Code2 size={15} /> },
                    ]}
                />
                <div className="docs-block__tools">
                    {view === "preview" ? (
                        <SegmentedControl
                            size="sm"
                            aria-label="Preview width"
                            className="docs-block__viewports"
                            value={viewport}
                            onChange={(value) => setViewport(value as Viewport)}
                            options={[
                                { value: "desktop", label: null, icon: <Monitor size={15} />, "aria-label": "Desktop: the full width" },
                                { value: "tablet", label: null, icon: <Tablet size={15} />, "aria-label": "Tablet: 768 pixels wide" },
                                { value: "phone", label: null, icon: <Smartphone size={15} />, "aria-label": "Phone: 390 pixels wide" },
                            ]}
                        />
                    ) : null}
                    <Tooltip label="Open in a new tab">
                        <a
                            className={buttonClassName({ variant: "ghost", size: "sm", iconOnly: true })}
                            href={`./frame.html?block=${id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${name} in a new tab`}
                        >
                            <ArrowUpRight size={16} aria-hidden="true" />
                        </a>
                    </Tooltip>
                </div>
            </div>
            <div className="docs-block__stage" hidden={view !== "preview"}>
                <div className="docs-block__device" style={{ width: width ? `min(${width}px, 100%)` : "100%" }}>
                    <iframe
                        ref={frame}
                        className="docs-block__frame"
                        title={`${name}, a live preview`}
                        src={src}
                        loading="lazy"
                        data-loaded={loaded || undefined}
                        onLoad={() => setLoaded(true)}
                        style={{ height: frameHeight }}
                    />
                    {!loaded ? (
                        <div className="docs-block__loading">
                            <Spinner size="sm" label={`Loading ${name}`} />
                        </div>
                    ) : null}
                </div>
            </div>
            {view === "code" ? <BlockCode id={id} /> : null}
        </div>
    );
}
