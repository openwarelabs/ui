import {
    forwardRef,
    useContext,
    useEffect,
    useId,
    useImperativeHandle,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type PointerEvent as ReactPointerEvent,
} from "react";

import { FormContext } from "@/components/Form/Form";
import { Slider } from "@/components/Slider/Slider";
import { useControllableState } from "@/hooks/useControllableState";
import { cx } from "@/utils/cx";
import type {
    ImageCrop,
    ImageCropperBox,
    ImageCropperHandle,
    ImageCropperOutput,
    ImageCropperPointer,
    ImageCropperProps,
} from "./ImageCropper.types";

export type { ImageCrop, ImageCropperHandle, ImageCropperLabels, ImageCropperOutput, ImageCropperProps } from "./ImageCropper.types";

const defaultLabels = {
    frame: "Crop the picture",
    instructions: "Use the arrow keys to move the picture, Shift for bigger steps, and plus and minus to zoom.",
    zoom: "Zoom",
    zoomLevel: (percent: number) => `${percent}%`,
    loading: "Loading picture…",
    failed: "The picture couldn't be loaded.",
};

const length = (n: number | string | undefined) => (typeof n === "number" ? `${n}px` : n);
const clamp = (n: number, low: number, high: number) => Math.min(Math.max(n, low), high);
/** Zooms the same from the slider, the keys and the wheel, as a step of the zoom itself. */
const zoomStep = 0.1;
/** Two zooms this close are the same one; keeps the crop and the zoom from chasing each other. */
const epsilon = 1e-3;

/**
 * Crops a picture by moving and zooming it under a fixed frame, for a profile picture or a banner. Drag the picture,
 * use the wheel or a pinch to zoom, or the slider, and the arrow keys from the frame. The crop stays within the picture.
 * The cropped image is made when asked for, through the ref (`getCroppedImage`) or when a Form is sent.
 */
export const ImageCropper = forwardRef<ImageCropperHandle, ImageCropperProps>(function ImageCropper(
    {
        src,
        aspect,
        shape = "rect",
        crop: cropProp,
        defaultCrop,
        onCropChange,
        zoom: zoomProp,
        defaultZoom = 1,
        onZoomChange,
        minZoom = 1,
        maxZoom = 4,
        rotation = 0,
        output,
        name,
        showGrid = false,
        width = 320,
        height = 240,
        crossOrigin,
        disabled = false,
        labels: labelsProp,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        id,
        className,
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const [crop, setCrop] = useControllableState<ImageCrop | undefined>(cropProp, defaultCrop, (next) => {
        if (next) onCropChange?.(next);
    });
    const [zoom, setZoom] = useControllableState(zoomProp, defaultZoom, onZoomChange);
    const [url, setUrl] = useState<string>();
    const [natural, setNatural] = useState<ImageCropperBox | null>(null);
    const [failed, setFailed] = useState(false);
    const [box, setBox] = useState<ImageCropperBox>({ width: 0, height: 0 });
    const [dragging, setDragging] = useState(false);
    const [message, setMessage] = useState("");
    const frameRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pointers = useRef(new Map<number, ImageCropperPointer>());
    const pinch = useRef<{ distance: number; zoom: number } | null>(null);
    const lastRotation = useRef(rotation);
    const instructionsId = useId();

    // A File or Blob gets a URL of its own, dropped when the picture changes.
    useEffect(() => {
        if (typeof src === "string") {
            setUrl(src);
            return;
        }
        const object = URL.createObjectURL(src);
        setUrl(object);
        return () => URL.revokeObjectURL(object);
    }, [src]);

    // A new picture starts from scratch, since the old crop was in the old one's pixels.
    useEffect(() => {
        setNatural(null);
        setFailed(false);
    }, [url]);

    // The frame's size on screen: the picture's scale on screen comes from it.
    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return;
        const measure = () => {
            const rect = frame.getBoundingClientRect();
            setBox((previous) =>
                previous.width === rect.width && previous.height === rect.height ? previous : { width: rect.width, height: rect.height },
            );
        };
        measure();
        if (typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(measure);
        observer.observe(frame);
        return () => observer.disconnect();
    }, []);

    const turned = rotation === 90 || rotation === 270;
    /** The picture's size once turned. */
    const picture = natural ? { width: turned ? natural.height : natural.width, height: turned ? natural.width : natural.height } : null;
    const ready = Boolean(picture && box.width > 0 && box.height > 0);
    /** The scale on screen at a zoom of 1: the picture just covers the frame. */
    const cover = picture && ready ? Math.max(box.width / picture.width, box.height / picture.height) : 1;

    const zoomOf = (c: ImageCrop) => box.width / (c.width * cover);

    /** The crop that keeps `c`'s centre at the zoom `c` implies, clamped to the zoom limits and the picture's edges. */
    function fit(c: ImageCrop): ImageCrop {
        if (!picture) return c;
        const z = clamp(zoomOf(c), minZoom, maxZoom);
        const w = box.width / (cover * z);
        const h = box.height / (cover * z);
        const x = c.x + c.width / 2 - w / 2;
        const y = c.y + c.height / 2 - h / 2;
        return {
            x: w <= picture.width ? clamp(x, 0, picture.width - w) : (picture.width - w) / 2,
            y: h <= picture.height ? clamp(y, 0, picture.height - h) : (picture.height - h) / 2,
            width: w,
            height: h,
        };
    }

    /** The picture centred in the frame at a zoom. */
    function centred(z: number): ImageCrop {
        const w = box.width / (cover * z);
        const h = box.height / (cover * z);
        return fit({ x: picture ? (picture.width - w) / 2 : 0, y: picture ? (picture.height - h) / 2 : 0, width: w, height: h });
    }

    const current: ImageCrop | null = ready ? (crop ? fit(crop) : centred(clamp(zoom, minZoom, maxZoom))) : null;
    const currentZoom = current ? zoomOf(current) : zoom;
    const scale = cover * currentZoom;
    // Handlers and the ref read these, so an export right after a move sees the latest.
    const view = useRef({ current, picture, natural, rotation });
    view.current = { current, picture, natural, rotation };

    // The zoom and the crop say the same thing: when one is set from outside, the other follows.
    useEffect(() => {
        if (!current || Math.abs(zoomOf(current) - zoom) < epsilon) return;
        if (crop) setCrop(fit({ ...current, width: box.width / (cover * zoom), height: box.height / (cover * zoom) }));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- runs when the zoom is set, not on every move
    }, [zoom, ready]);
    useEffect(() => {
        if (!current) return;
        const z = zoomOf(current);
        if (Math.abs(z - zoom) >= epsilon) setZoom(Math.round(z * 1000) / 1000);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- runs when the crop is set, the zoom follows it
    }, [crop, ready]);

    // A turn carries the crop round with the picture.
    useEffect(() => {
        const from = lastRotation.current;
        lastRotation.current = rotation;
        if (from === rotation || !crop || !natural) return;
        let c = crop;
        let w = from === 90 || from === 270 ? natural.height : natural.width;
        let h = from === 90 || from === 270 ? natural.width : natural.height;
        for (let turns = (((rotation - from) / 90) % 4 + 4) % 4; turns > 0; turns -= 1) {
            c = { x: h - c.y - c.height, y: c.x, width: c.height, height: c.width };
            [w, h] = [h, w];
        }
        setCrop(c);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only a turn moves the crop
    }, [rotation]);

    /** Puts the crop where `c` says, within the limits. */
    function apply(c: ImageCrop) {
        setCrop(fit(c));
    }

    /** Moves the picture by screen pixels: dragging it right shows more of its left. */
    function pan(dx: number, dy: number) {
        if (!current) return;
        apply({ ...current, x: current.x - dx / scale, y: current.y - dy / scale });
    }

    /** Zooms to `z`, keeping the point of the picture at (px, py) in the frame where it is. */
    function zoomAt(z: number, px: number, py: number, announce = true) {
        if (!current) return;
        const next = clamp(z, minZoom, maxZoom);
        const s = cover * next;
        const ix = current.x + px / scale;
        const iy = current.y + py / scale;
        const w = box.width / s;
        const h = box.height / s;
        apply({ x: ix - px / s, y: iy - py / s, width: w, height: h });
        setZoom(Math.round(next * 1000) / 1000);
        if (announce) setMessage(`${labels.zoom} ${labels.zoomLevel(Math.round(next * 100))}`);
    }

    function zoomCentre(z: number, announce = true) {
        zoomAt(z, box.width / 2, box.height / 2, announce);
    }

    /** Draws the crop into a canvas at the output's size. */
    function render(options?: ImageCropperOutput): HTMLCanvasElement | null {
        const { current: c, picture: p, natural: n, rotation: r } = view.current;
        const image = imageRef.current;
        if (!c || !p || !n || !image) return null;
        const settings = { ...output, ...options };
        let w = settings.width;
        let h = settings.height;
        if (!w && !h) {
            w = Math.round(c.width);
            h = Math.round(c.height);
        } else if (!w) w = Math.round((h! * c.width) / c.height);
        else if (!h) h = Math.round((w * c.height) / c.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, w);
        canvas.height = Math.max(1, h!);
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        if (settings.type === "image/jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.scale(canvas.width / c.width, canvas.height / c.height);
        ctx.translate(-c.x, -c.y);
        ctx.translate(p.width / 2, p.height / 2);
        ctx.rotate((r * Math.PI) / 180);
        ctx.drawImage(image, -n.width / 2, -n.height / 2, n.width, n.height);
        return canvas;
    }

    function toDataURL(options?: ImageCropperOutput) {
        const canvas = render(options);
        const settings = { ...output, ...options };
        try {
            return canvas?.toDataURL(settings.type ?? "image/png", settings.quality ?? 0.92) ?? "";
        } catch {
            // A picture from another origin without CORS taints the canvas, which then can't be read.
            return "";
        }
    }

    useImperativeHandle(ref, () => ({
        getCroppedImage: (options) =>
            new Promise<Blob>((resolve, reject) => {
                const canvas = render(options);
                if (!canvas) return reject(new Error("The picture hasn't loaded."));
                const settings = { ...output, ...options };
                try {
                    canvas.toBlob(
                        (blob) => (blob ? resolve(blob) : reject(new Error("The cropped image couldn't be made."))),
                        settings.type ?? "image/png",
                        settings.quality ?? 0.92,
                    );
                } catch (error) {
                    reject(error instanceof Error ? error : new Error("The cropped image couldn't be read."));
                }
            }),
        toDataURL,
        getCrop: () => view.current.current,
        reset: () => {
            if (!ready) return;
            setZoom(defaultZoom);
            setCrop(centred(clamp(defaultZoom, minZoom, maxZoom)));
        },
    }));

    // Inside a Form, the cropped image is made as the form is sent, not on every move: the hidden input is filled first.
    const changed = useContext(FormContext)?.changed;
    useEffect(() => {
        const form = inputRef.current?.form;
        if (!form || !name) return;
        const fill = () => {
            if (inputRef.current) inputRef.current.value = toDataURL();
        };
        // FormData built outside a submission has read the inputs already, so the entry is set on it directly.
        const entry = (event: FormDataEvent) => {
            const input = inputRef.current;
            if (input && !input.disabled) event.formData.set(name, input.value || toDataURL());
        };
        form.addEventListener("submit", fill, true);
        form.addEventListener("formdata", entry);
        return () => {
            form.removeEventListener("submit", fill, true);
            form.removeEventListener("formdata", entry);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the listener reads the latest state through refs
    }, [name, url]);
    useEffect(() => {
        if (name && crop) changed?.(name);
    }, [crop, changed, name]);

    // The wheel zooms where the pointer is. React's wheel listener is passive, so the page would scroll too.
    const wheel = useRef<(event: WheelEvent) => void>(() => {});
    wheel.current = (event) => {
        if (disabled || !current) return;
        event.preventDefault();
        const rect = frameRef.current!.getBoundingClientRect();
        const factor = Math.exp(-event.deltaY * (event.deltaMode === 1 ? 0.05 : 0.002));
        zoomAt(currentZoom * factor, event.clientX - rect.left, event.clientY - rect.top);
    };
    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return;
        const handler = (event: WheelEvent) => wheel.current(event);
        frame.addEventListener("wheel", handler, { passive: false });
        return () => frame.removeEventListener("wheel", handler);
    }, []);

    function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
        if (disabled || !current || (event.pointerType === "mouse" && event.button !== 0)) return;
        event.preventDefault();
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
            // A pointer the browser doesn't know (a synthetic one): move without capturing it.
        }
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            pinch.current = { distance: Math.hypot(a!.x - b!.x, a!.y - b!.y), zoom: currentZoom };
        }
        setDragging(true);
    }

    function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
        const previous = pointers.current.get(event.pointerId);
        if (!previous || !current) return;
        const point = { x: event.clientX, y: event.clientY };
        pointers.current.set(event.pointerId, point);
        if (pointers.current.size >= 2 && pinch.current) {
            // Two fingers: zoom by how far apart they are, around the point between them, which also drags.
            const [a, b] = [...pointers.current.values()];
            const rect = event.currentTarget.getBoundingClientRect();
            const distance = Math.hypot(a!.x - b!.x, a!.y - b!.y);
            const mid = { x: (a!.x + b!.x) / 2 - rect.left, y: (a!.y + b!.y) / 2 - rect.top };
            const other = a === point ? b! : a!;
            const previousMid = { x: (previous.x + other.x) / 2 - rect.left, y: (previous.y + other.y) / 2 - rect.top };
            const z = clamp((pinch.current.zoom * distance) / (pinch.current.distance || 1), minZoom, maxZoom);
            const s = cover * z;
            const ix = current.x + previousMid.x / scale;
            const iy = current.y + previousMid.y / scale;
            apply({ x: ix - mid.x / s, y: iy - mid.y / s, width: box.width / s, height: box.height / s });
            setZoom(Math.round(z * 1000) / 1000);
            return;
        }
        pan(point.x - previous.x, point.y - previous.y);
    }

    function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
        if (!pointers.current.delete(event.pointerId)) return;
        if (pointers.current.size < 2) {
            if (pinch.current) setMessage(`${labels.zoom} ${labels.zoomLevel(Math.round(currentZoom * 100))}`);
            pinch.current = null;
        }
        if (!pointers.current.size) setDragging(false);
    }

    function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (disabled || !current) return;
        const step = event.shiftKey ? 10 : 1;
        const moves: Record<string, [number, number]> = {
            ArrowLeft: [-step, 0],
            ArrowRight: [step, 0],
            ArrowUp: [0, -step],
            ArrowDown: [0, step],
        };
        const move = moves[event.key];
        if (move) {
            event.preventDefault();
            pan(move[0], move[1]);
        } else if (event.key === "+" || event.key === "=") {
            event.preventDefault();
            zoomCentre(currentZoom + zoomStep);
        } else if (event.key === "-" || event.key === "_") {
            event.preventDefault();
            zoomCentre(currentZoom - zoomStep);
        }
    }

    // The picture, turned about its centre, then placed and scaled so the crop fills the frame.
    const imageStyle: CSSProperties | undefined =
        natural && picture && current
            ? {
                  width: natural.width,
                  height: natural.height,
                  transform: [
                      `translate(${-current.x * scale}px, ${-current.y * scale}px)`,
                      `scale(${scale})`,
                      `translate(${(picture.width - natural.width) / 2}px, ${(picture.height - natural.height) / 2}px)`,
                      `translate(${natural.width / 2}px, ${natural.height / 2}px)`,
                      `rotate(${rotation}deg)`,
                      `translate(${-natural.width / 2}px, ${-natural.height / 2}px)`,
                  ].join(" "),
              }
            : { visibility: "hidden" };

    return (
        <div
            className={cx(
                "ow-image-cropper",
                shape === "circle" && "ow-image-cropper--circle",
                dragging && "ow-image-cropper--dragging",
                disabled && "ow-image-cropper--disabled",
                className,
            )}
            style={
                {
                    "--ow-image-cropper-width": length(width),
                    "--ow-image-cropper-height": aspect ? undefined : length(height),
                    "--ow-image-cropper-aspect": aspect,
                } as CSSProperties
            }
        >
            <div
                ref={frameRef}
                className="ow-image-cropper__frame"
                id={id}
                role="group"
                tabIndex={disabled ? -1 : 0}
                aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? labels.frame)}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy ? `${instructionsId} ${ariaDescribedBy}` : instructionsId}
                aria-disabled={disabled || undefined}
                onKeyDown={onKeyDown}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            >
                {url && !failed ? (
                    <img
                        ref={imageRef}
                        className="ow-image-cropper__image"
                        src={url}
                        alt=""
                        draggable={false}
                        crossOrigin={crossOrigin}
                        style={imageStyle}
                        onLoad={(event) => {
                            const image = event.currentTarget;
                            setNatural({ width: image.naturalWidth, height: image.naturalHeight });
                        }}
                        onError={() => setFailed(true)}
                    />
                ) : null}
                {showGrid && current ? <span className="ow-image-cropper__grid" aria-hidden="true" /> : null}
                {shape === "circle" && current ? <span className="ow-image-cropper__mask" aria-hidden="true" /> : null}
                {!current ? (
                    <span className="ow-image-cropper__status">
                        {failed ? labels.failed : labels.loading}
                    </span>
                ) : null}
            </div>
            <span id={instructionsId} className="ow-visually-hidden">
                {labels.instructions}
            </span>
            <span className="ow-visually-hidden" aria-live="polite" aria-atomic="true">
                {message}
            </span>
            <Slider
                className="ow-image-cropper__zoom"
                label={labels.zoom}
                min={minZoom}
                max={maxZoom}
                step={0.01}
                value={Math.round(clamp(currentZoom, minZoom, maxZoom) * 100) / 100}
                formatValue={(z) => labels.zoomLevel(Math.round(z * 100))}
                disabled={disabled || !current}
                onChange={(z) => zoomCentre(z, false)}
            />
            {name ? (
                // Carries the data URL for the form, filled as it's sent. Not for people.
                <input
                    ref={inputRef}
                    className="ow-visually-hidden"
                    tabIndex={-1}
                    aria-hidden="true"
                    name={name}
                    defaultValue=""
                    disabled={disabled}
                    autoComplete="off"
                />
            ) : null}
        </div>
    );
});
