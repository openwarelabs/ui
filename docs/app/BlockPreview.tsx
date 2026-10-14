import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { buttonClassName, CodeBlock, SegmentedControl, Spinner, Tooltip } from "@openwarelabs/ui";
import { ArrowUpRight, Code2, Eye, Monitor, Smartphone, Tablet } from "lucide-react";

import { props as allProps } from "docs:props";

import { blockMarkdown, blockPrompt, type AiBlockInput } from "./ai";
import { CopyForAI } from "./CopyForAI";

type View = "preview" | "code";
type Viewport = "desktop" | "tablet" | "phone";

const widths: Record<Viewport, number | null> = { desktop: null, tablet: 768, phone: 390 };

/** The narrowest the frame can be dragged to: a small phone. */
const minWidth = 320;

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
 * A block, live in a frame you can narrow to a tablet or a phone, or drag to any width by the handle on its right
 * edge, or its code. The frame follows the docs' theme and
 * colour, and grows to fit the block unless the block fills the window, when it gets a fixed `height`.
 */
export function BlockPreview({
    id,
    name,
    height,
    description,
    category,
    component,
}: {
    id: string;
    name: string;
    height?: number;
    /** For "Copy for AI". */
    description: string;
    category: AiBlockInput["category"];
    /** Its component in @openwarelabs/blocks, if it has one. */
    component?: string;
}) {
    const [view, setView] = useState<View>("preview");
    // A preset width, or any width dragged to with the handle (null is the stage's full width).
    const [width, setWidth] = useState<number | null>(null);
    const [dragging, setDragging] = useState(false);
    const [measured, setMeasured] = useState<number | null>(null);
    const [contentHeight, setContentHeight] = useState<number | null>(null);
    const [loaded, setLoaded] = useState(false);
    const frame = useRef<HTMLIFrameElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const device = useRef<HTMLDivElement>(null);
    const drag = useRef({ startX: 0, startWidth: 0 });
    const fits = height === undefined;
    const viewport = (Object.keys(widths) as Viewport[]).find((key) => widths[key] === width) ?? "custom";

    // The width the block is really drawn at, for the readout.
    useEffect(() => {
        const element = device.current;
        if (!element) return undefined;
        const observer = new ResizeObserver(() => setMeasured(Math.round(element.getBoundingClientRect().width)));
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const maxWidth = () => stage.current?.clientWidth ?? Infinity;
    /** Sets a width, or the full width once it reaches the stage's edge. */
    const resize = (next: number) => setWidth(next >= maxWidth() - 1 ? null : Math.max(minWidth, Math.round(next)));

    const startDrag = (event: PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { startX: event.clientX, startWidth: device.current?.getBoundingClientRect().width ?? 0 };
        setDragging(true);
    };
    // The frame is centred, so its edge moves half as far as its width grows: double the pointer's travel to keep
    // the handle under the pointer.
    const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
        if (!dragging) return;
        resize(drag.current.startWidth + (event.clientX - drag.current.startX) * 2);
    };
    const endDrag = () => setDragging(false);
    const nudge = (event: KeyboardEvent<HTMLDivElement>) => {
        const step = event.shiftKey ? 50 : 10;
        const current = measured ?? maxWidth();
        if (event.key === "ArrowLeft") resize(current - step);
        else if (event.key === "ArrowRight") resize(current + step);
        else if (event.key === "Home") resize(minWidth);
        else if (event.key === "End") setWidth(null);
        else return;
        event.preventDefault();
    };

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

    const aiInput = async (): Promise<AiBlockInput> => ({
        id,
        name,
        description,
        category,
        files: await loadCode(id),
        component: component ? { name: component, props: allProps } : undefined,
    });

    const src = `./frame.html?block=${id}${fits ? "&fit=content" : ""}`;
    const frameHeight = fits ? (contentHeight ?? 320) : height;

    return (
        <div className="docs-block" data-view={view} data-viewport={width === null ? "desktop" : "narrow"} data-dragging={dragging || undefined}>
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
                        <span className="docs-block__width" aria-live="polite">
                            {measured ? `${measured} px` : null}
                        </span>
                    ) : null}
                    {view === "preview" ? (
                        <SegmentedControl
                            size="sm"
                            aria-label="Preview width"
                            className="docs-block__viewports"
                            value={viewport}
                            onChange={(value) => setWidth(widths[value as Viewport])}
                            options={[
                                { value: "desktop", label: null, icon: <Monitor size={15} />, "aria-label": "Desktop: the full width" },
                                { value: "tablet", label: null, icon: <Tablet size={15} />, "aria-label": "Tablet: 768 pixels wide" },
                                { value: "phone", label: null, icon: <Smartphone size={15} />, "aria-label": "Phone: 390 pixels wide" },
                            ]}
                        />
                    ) : null}
                    <CopyForAI
                        what={name}
                        prompt={async () => blockPrompt(await aiInput())}
                        markdown={async () => blockMarkdown(await aiInput())}
                        onPrepare={() => void loadCode(id).catch(() => undefined)}
                    />
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
            <div ref={stage} className="docs-block__stage" hidden={view !== "preview"}>
                <div ref={device} className="docs-block__device" style={{ width: width ? `min(${width}px, 100%)` : "100%" }}>
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
                    <div
                        className="docs-block__handle"
                        role="separator"
                        aria-orientation="vertical"
                        aria-label="Preview width: drag, or use the arrow keys"
                        aria-valuemin={minWidth}
                        aria-valuemax={stage.current?.clientWidth}
                        aria-valuenow={measured ?? undefined}
                        tabIndex={0}
                        onPointerDown={startDrag}
                        onPointerMove={moveDrag}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                        onKeyDown={nudge}
                        onDoubleClick={() => setWidth(null)}
                    >
                        <span className="docs-block__grip" aria-hidden="true" />
                    </div>
                </div>
            </div>
            {view === "code" ? <BlockCode id={id} /> : null}
        </div>
    );
}
