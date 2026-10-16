import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { Button } from "@/components/Button/Button";
import { CloseButton } from "@/components/Button/ButtonGroup";
import { useControllableState } from "@/hooks/useControllableState";
import { useModalDialog } from "@/hooks/useModalDialog";
import { ChevronLeftIcon, ChevronRightIcon, ZoomInIcon, ZoomOutIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type { LightboxGesture, LightboxImage, LightboxLabels, LightboxPointer, LightboxProps, LightboxView } from "./Lightbox.types";

export type { LightboxImage, LightboxLabels, LightboxProps } from "./Lightbox.types";

const rest: LightboxView = { scale: 1, x: 0, y: 0 };
/** What a double-click or double-tap zooms to. */
const stepZoom = 2;
/** A swipe has to travel this far to count. */
const swipeDistance = 48;
/** Two taps this close in time and space are a double-tap. */
const doubleTapMs = 320;
const doubleTapDistance = 24;
const positionName = (n: number, count: number) => `${n} of ${count}`;
const round = (value: number) => Math.round(value * 1000) / 1000;

/**
 * A fullscreen viewer for one image or a gallery, on the native <dialog>. The arrow keys, the buttons, a swipe or the
 * strip of thumbnails move between images; a double-tap, the wheel, a pinch or + and - zoom in, and a drag pans.
 */
export function Lightbox({
    open,
    onClose,
    images,
    index,
    defaultIndex = 0,
    onIndexChange,
    zoom = true,
    maxZoom = 4,
    thumbnails,
    loop = false,
    labels = {},
    className,
}: LightboxProps) {
    const count = images.length;
    const captionId = useId();
    const { dialogRef, mounted } = useModalDialog(open, onClose);
    const [current, setCurrent] = useControllableState(index, defaultIndex, onIndexChange);
    const active = Math.max(0, Math.min(current, count - 1));
    const image: LightboxImage | undefined = images[active];
    const position = labels.position ?? positionName;
    const many = count > 1;
    const strip = thumbnails ?? many;

    const stageRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const stripRef = useRef<HTMLUListElement>(null);
    const [view, setViewState] = useState<LightboxView>(rest);
    const viewRef = useRef(view);
    // True while a finger or the pointer moves the image, so it follows without a transition.
    const [dragging, setDragging] = useState(false);
    const pointers = useRef(new Map<number, LightboxPointer>());
    const gesture = useRef<LightboxGesture | null>(null);
    const lastTap = useRef<{ time: number; x: number; y: number } | null>(null);

    /** Keeps the image inside the stage: at rest it's centred, zoomed in its edges can't pass the stage's. */
    const clamp = useCallback(
        (next: LightboxView): LightboxView => {
            const scale = Math.max(1, Math.min(zoom ? maxZoom : 1, next.scale));
            const stage = stageRef.current;
            const img = imageRef.current;
            if (!stage || !img) return { scale, x: 0, y: 0 };
            const maxX = Math.max(0, (img.clientWidth * scale - stage.clientWidth) / 2);
            const maxY = Math.max(0, (img.clientHeight * scale - stage.clientHeight) / 2);
            return { scale, x: Math.max(-maxX, Math.min(maxX, next.x)), y: Math.max(-maxY, Math.min(maxY, next.y)) };
        },
        [zoom, maxZoom],
    );

    const setView = useCallback(
        (next: LightboxView, free = false) => {
            const value = free ? next : clamp(next);
            viewRef.current = value;
            setViewState(value);
        },
        [clamp],
    );

    /** Zooms to `scale`, keeping the point under `focal` (relative to the stage's centre) where it is. */
    const zoomTo = useCallback(
        (scale: number, focal: LightboxPointer = { x: 0, y: 0 }) => {
            const from = viewRef.current;
            const ratio = Math.max(1, Math.min(maxZoom, scale)) / from.scale;
            setView({ scale: from.scale * ratio, x: focal.x - (focal.x - from.x) * ratio, y: focal.y - (focal.y - from.y) * ratio });
        },
        [maxZoom, setView],
    );

    /** A point on the screen, relative to the stage's centre. */
    const fromStage = (clientX: number, clientY: number): LightboxPointer => {
        const rect = stageRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return { x: clientX - rect.left - rect.width / 2, y: clientY - rect.top - rect.height / 2 };
    };

    const go = useCallback(
        (i: number) => {
            if (!many) return;
            const next = loop ? (i + count) % count : Math.max(0, Math.min(i, count - 1));
            setCurrent(next);
        },
        [many, loop, count, setCurrent],
    );

    // The zoom resets when the image changes and each time it opens.
    useEffect(() => {
        viewRef.current = rest;
        setViewState(rest);
    }, [active, open]);

    // The strip scrolls so the current thumbnail is in view.
    useLayoutEffect(() => {
        const list = stripRef.current;
        const item = list?.children[active] as HTMLElement | undefined;
        if (!list || !item || !open) return;
        const left = item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        list.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
    }, [active, open, strip]);

    // The neighbours load ahead, so Next shows them at once.
    useEffect(() => {
        if (!open || !many) return;
        for (const i of [active - 1, active + 1]) {
            const neighbour = images[loop ? (i + count) % count : i];
            if (neighbour) new window.Image().src = neighbour.src;
        }
    }, [open, many, active, images, loop, count]);

    // The wheel zooms toward the pointer. React's wheel listener is passive, so this one is added by hand to stop the
    // page behind from scrolling.
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage || !mounted || !zoom) return;
        const onWheel = (event: WheelEvent) => {
            event.preventDefault();
            const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
            zoomTo(viewRef.current.scale * Math.exp(-delta / 300), fromStage(event.clientX, event.clientY));
        };
        stage.addEventListener("wheel", onWheel, { passive: false });
        return () => stage.removeEventListener("wheel", onWheel);
    }, [mounted, zoom, zoomTo]);

    const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
        const target = event.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        switch (event.key) {
            case "ArrowLeft":
                go(active - 1);
                break;
            case "ArrowRight":
                go(active + 1);
                break;
            case "Home":
                go(0);
                break;
            case "End":
                go(count - 1);
                break;
            case "+":
            case "=":
                if (zoom) zoomTo(viewRef.current.scale * 1.5);
                break;
            case "-":
            case "_":
                if (zoom) zoomTo(viewRef.current.scale / 1.5);
                break;
            case "0":
                if (zoom) setView(rest);
                break;
            default:
                return;
        }
        event.preventDefault();
    };

    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0 && event.pointerType === "mouse") return;
        const stage = event.currentTarget;
        stage.setPointerCapture(event.pointerId);
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const [a, b] = [...pointers.current.values()];
        if (a && b) {
            gesture.current = {
                start: gesture.current?.start ?? a,
                moved: true,
                distance: Math.hypot(b.x - a.x, b.y - a.y),
                middle: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
                onImage: true,
            };
        } else if (a) {
            gesture.current = { start: a, moved: false, distance: 0, middle: a, onImage: event.target === imageRef.current };
        }
        setDragging(true);
    };

    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const previous = pointers.current.get(event.pointerId);
        const state = gesture.current;
        if (!previous || !state) return;
        const point = { x: event.clientX, y: event.clientY };
        pointers.current.set(event.pointerId, point);
        const [a, b] = [...pointers.current.values()];
        const { scale, x, y } = viewRef.current;

        if (a && b) {
            if (!zoom) return;
            // A pinch: zoom by how much the fingers spread, around their middle, and follow the middle as it moves.
            const distance = Math.hypot(b.x - a.x, b.y - a.y);
            const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            if (state.distance > 0) {
                const focal = fromStage(middle.x, middle.y);
                const next = Math.max(1, Math.min(maxZoom, scale * (distance / state.distance)));
                const ratio = next / scale;
                setView({
                    scale: next,
                    x: focal.x - (focal.x - x) * ratio + (middle.x - state.middle.x),
                    y: focal.y - (focal.y - y) * ratio + (middle.y - state.middle.y),
                });
            }
            state.distance = distance;
            state.middle = middle;
            state.moved = true;
            return;
        }

        const dx = point.x - previous.x;
        const dy = point.y - previous.y;
        if (Math.hypot(point.x - state.start.x, point.y - state.start.y) > 6) state.moved = true;
        if (scale > 1) {
            setView({ scale, x: x + dx, y: y + dy });
        } else if (many && state.moved) {
            // At rest, a swipe drags the image sideways until it's let go.
            setView({ scale, x: point.x - state.start.x, y: 0 }, true);
        }
    };

    const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
        const state = gesture.current;
        pointers.current.delete(event.pointerId);
        if (pointers.current.size > 0) {
            // One finger of a pinch lifted: the other carries on as a drag from where it is.
            const [remaining] = [...pointers.current.values()];
            if (state && remaining) {
                state.distance = 0;
                state.start = remaining;
                state.moved = true;
            }
            return;
        }
        setDragging(false);
        gesture.current = null;
        if (!state) return;
        const { scale } = viewRef.current;

        if (state.moved) {
            if (scale === 1) {
                const dx = event.clientX - state.start.x;
                const dy = event.clientY - state.start.y;
                if (many && Math.abs(dx) > swipeDistance && Math.abs(dx) > Math.abs(dy) && (loop || (dx < 0 ? active < count - 1 : active > 0))) {
                    go(dx < 0 ? active + 1 : active - 1);
                } else {
                    setView(rest);
                }
            }
            return;
        }

        // A tap. Two in a row on the image toggle the zoom; one beside the image closes.
        const now = Date.now();
        const tap = lastTap.current;
        lastTap.current = { time: now, x: event.clientX, y: event.clientY };
        if (state.onImage) {
            if (zoom && tap && now - tap.time < doubleTapMs && Math.hypot(event.clientX - tap.x, event.clientY - tap.y) < doubleTapDistance) {
                lastTap.current = null;
                if (scale > 1) setView(rest);
                else zoomTo(Math.min(stepZoom, maxZoom), fromStage(event.clientX, event.clientY));
            }
        } else if (event.target === stageRef.current) {
            onClose();
        }
    };

    const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
        pointers.current.delete(event.pointerId);
        if (pointers.current.size > 0) return;
        gesture.current = null;
        setDragging(false);
        if (viewRef.current.scale === 1) setView(rest);
    };

    if (!mounted || !image) return null;

    const zoomed = view.scale > 1;
    const canZoomIn = zoom && view.scale < maxZoom - 0.001;
    const transform =
        view.scale === 1 && view.x === 0 && view.y === 0 ? undefined : `translate(${round(view.x)}px, ${round(view.y)}px) scale(${round(view.scale)})`;

    return (
        <dialog
            ref={dialogRef}
            className={cx("ow-lightbox", className)}
            data-theme="dark"
            aria-labelledby={image.caption ? captionId : undefined}
            aria-label={image.caption ? undefined : image.alt}
            onKeyDown={onKeyDown}
        >
            <div className="ow-lightbox__bar">
                <CloseButton className="ow-lightbox__close" label={labels.close ?? "Close"} onClick={onClose} />
                {many ? (
                    <span className="ow-lightbox__count" aria-hidden="true">
                        {position(active + 1, count)}
                    </span>
                ) : null}
                {zoom ? (
                    <div className="ow-lightbox__zoom">
                        <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            aria-label={labels.zoomOut ?? "Zoom out"}
                            disabled={!zoomed}
                            onClick={() => zoomTo(viewRef.current.scale / 1.5)}
                        >
                            <ZoomOutIcon size={16} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            aria-label={labels.zoomIn ?? "Zoom in"}
                            disabled={!canZoomIn}
                            onClick={() => zoomTo(viewRef.current.scale * 1.5)}
                        >
                            <ZoomInIcon size={16} />
                        </Button>
                    </div>
                ) : null}
            </div>

            <div
                ref={stageRef}
                className={cx("ow-lightbox__stage", zoomed && "ow-lightbox__stage--zoomed", dragging && "ow-lightbox__stage--dragging")}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
            >
                <img
                    key={image.src}
                    ref={imageRef}
                    className="ow-lightbox__image"
                    src={image.src}
                    srcSet={image.srcSet}
                    sizes={image.sizes}
                    alt={image.alt}
                    draggable={false}
                    decoding="async"
                    style={{ transform }}
                />
            </div>

            {many ? (
                <>
                    <Button
                        variant="ghost"
                        iconOnly
                        className="ow-lightbox__arrow ow-lightbox__arrow--previous"
                        aria-label={labels.previous ?? "Previous image"}
                        disabled={!loop && active === 0}
                        onClick={() => go(active - 1)}
                    >
                        <ChevronLeftIcon size={20} />
                    </Button>
                    <Button
                        variant="ghost"
                        iconOnly
                        className="ow-lightbox__arrow ow-lightbox__arrow--next"
                        aria-label={labels.next ?? "Next image"}
                        disabled={!loop && active === count - 1}
                        onClick={() => go(active + 1)}
                    >
                        <ChevronRightIcon size={20} />
                    </Button>
                </>
            ) : null}

            {image.caption || (strip && many) ? (
                <div className="ow-lightbox__foot">
                    {image.caption ? (
                        <p id={captionId} className="ow-lightbox__caption">
                            {image.caption}
                        </p>
                    ) : null}
                    {strip && many ? (
                        <ul ref={stripRef} className="ow-lightbox__thumbs" aria-label={labels.thumbnails ?? "Images"}>
                            {images.map((item, i) => (
                                <li key={`${item.src}-${i}`} className="ow-lightbox__thumb-item">
                                    <button
                                        type="button"
                                        className="ow-lightbox__thumb"
                                        aria-label={item.alt || position(i + 1, count)}
                                        aria-current={i === active ? "true" : undefined}
                                        onClick={() => go(i)}
                                    >
                                        <img src={item.thumbnail ?? item.src} alt="" loading="lazy" decoding="async" draggable={false} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            ) : null}

            <span className="ow-visually-hidden" aria-live="polite" aria-atomic="true">
                {many ? `${position(active + 1, count)}, ${image.alt}` : null}
            </span>
        </dialog>
    );
}
