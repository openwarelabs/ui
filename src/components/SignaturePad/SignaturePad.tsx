import {
    forwardRef,
    useContext,
    useEffect,
    useId,
    useImperativeHandle,
    useRef,
    useState,
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
} from "react";

import { Button } from "@/components/Button/Button";
import { FormContext } from "@/components/Form/Form";
import { Input } from "@/components/Input/Input";
import { useControllableState } from "@/hooks/useControllableState";
import { cx } from "@/utils/cx";
import type { SignaturePadHandle, SignaturePadProps, SignaturePaint, SignaturePoint } from "./SignaturePad.types";

export type { SignaturePadHandle, SignaturePadLabels, SignaturePadProps } from "./SignaturePad.types";

const defaultLabels = {
    signHere: "Sign here",
    clear: "Clear",
    undo: "Undo",
    typeInstead: "Type instead",
    drawInstead: "Draw instead",
    typeName: "Type your name",
    state: (signed: boolean) => (signed ? "Signature, signed" : "Signature, empty"),
};

/** Handwriting faces most systems have, for a typed signature. */
const script = '"Segoe Script", "Bradley Hand", "Snell Roundhand", "Apple Chancery", "Brush Script MT", "URW Chancery L", cursive';
/** Where the signing line sits, as a share of the height; CSS draws it at the same place. */
const line = 0.72;

const mid = (a: SignaturePoint, b: SignaturePoint) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const r = (n: number) => Math.round(n * 10) / 10;
const xml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Segment `j` of a stroke: a quadratic curve through point j, from the midpoint before it to the midpoint after it,
 * so the line runs smoothly through the samples. Its width is that point's share of the pen width.
 */
function segment(ctx: CanvasRenderingContext2D, points: SignaturePoint[], j: number, k: number, penWidth: number) {
    const point = points[j]!;
    const start = j === 0 ? point : mid(points[j - 1]!, point);
    const next = points[j + 1];
    const end = next ? mid(point, next) : point;
    ctx.lineWidth = penWidth * point.w * k;
    ctx.beginPath();
    ctx.moveTo(start.x * k, start.y * k);
    ctx.quadraticCurveTo(point.x * k, point.y * k, end.x * k, end.y * k);
    ctx.stroke();
}

function dot(ctx: CanvasRenderingContext2D, point: SignaturePoint, k: number, penWidth: number) {
    ctx.beginPath();
    ctx.arc(point.x * k, point.y * k, (penWidth * point.w * k) / 2, 0, Math.PI * 2);
    ctx.fill();
}

/** The font size that fits a typed name across the pad. */
function fit(ctx: CanvasRenderingContext2D, text: string, width: number, height: number) {
    ctx.font = `italic 100px ${script}`;
    return Math.min(height * 0.42, (width * 0.88 * 100) / (ctx.measureText(text).width || 1));
}

/**
 * A box to sign in with a mouse, a finger or a pen, for forms and onboarding. Strokes follow the pen's pressure and are
 * smoothed into curves; Undo takes back the last one. "Type instead" sets a typed name in a script face, for people who
 * can't draw. The value is a PNG (or SVG) data URL, sent with a form under its `name`.
 */
export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(function SignaturePad(
    {
        value,
        defaultValue = "",
        onChange,
        format = "png",
        name,
        required,
        isInvalid = false,
        penColor,
        exportColor = "#111111",
        background,
        penWidth = 2.5,
        height = 160,
        allowTyping = true,
        disabled = false,
        readOnly = false,
        onClear,
        labels: labelsProp,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        id,
        className,
    },
    ref,
) {
    const [current, setCurrent] = useControllableState(value, defaultValue, onChange);
    const [typing, setTyping] = useState(false);
    const [text, setText] = useState("");
    const [strokeCount, setStrokeCount] = useState(0);
    const [drawing, setDrawing] = useState(false);
    const generatedId = useId();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const strokes = useRef<SignaturePoint[][]>([]);
    const active = useRef<{ id: number; points: SignaturePoint[] } | null>(null);
    /** A signature that didn't come from the pad (a saved one), drawn under the strokes. */
    const base = useRef<HTMLImageElement | null>(null);
    /** The pad's width when the first stroke began: points are kept at that scale and grow or shrink with the pad. */
    const refWidth = useRef(1);
    const size = useRef({ width: 0, height: 0 });
    const emitted = useRef("");
    // Handlers change these before React re-renders, so an export right after sees the new state.
    const view = useRef({ typing, text });
    view.current = { typing, text };
    const labels = { ...defaultLabels, ...labelsProp };
    const interactive = !readOnly && !disabled;
    const signed = current !== "";
    const selfId = id ?? generatedId;
    const padId = typing ? `${selfId}-pad` : selfId;

    const isEmpty = () => (view.current.typing ? !view.current.text.trim() : !strokes.current.length && !base.current);

    function paint(ctx: CanvasRenderingContext2D, { width, height: h, color }: SignaturePaint) {
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.lineCap = ctx.lineJoin = "round";
        if (view.current.typing) {
            const typed = view.current.text.trim();
            if (!typed) return;
            ctx.font = `italic ${fit(ctx, typed, width, h)}px ${script}`;
            ctx.textAlign = "center";
            ctx.fillText(typed, width / 2, h * line - 4);
            return;
        }
        const image = base.current;
        if (image?.complete && image.naturalWidth) {
            const ratio = Math.min(width / image.naturalWidth, h / image.naturalHeight);
            const w = image.naturalWidth * ratio;
            const ih = image.naturalHeight * ratio;
            const at = [(width - w) / 2, (h - ih) / 2, w, ih] as const;
            if (background) ctx.drawImage(image, ...at);
            else {
                // A transparent signature is re-inked in this colour, so a saved one reads in either theme.
                const layer = document.createElement("canvas");
                layer.width = ctx.canvas.width;
                layer.height = ctx.canvas.height;
                const lctx = layer.getContext("2d");
                if (lctx) {
                    lctx.setTransform(ctx.getTransform());
                    lctx.drawImage(image, ...at);
                    lctx.globalCompositeOperation = "source-in";
                    lctx.fillStyle = color;
                    lctx.fillRect(0, 0, width, h);
                    ctx.save();
                    ctx.resetTransform();
                    ctx.drawImage(layer, 0, 0);
                    ctx.restore();
                }
            }
        }
        const k = width / refWidth.current;
        for (const points of strokes.current) {
            if (points.length === 1) dot(ctx, points[0]!, k, penWidth);
            else points.forEach((_, j) => segment(ctx, points, j, k, penWidth));
        }
    }

    /** The canvas's context with the on-screen ink: the pen colour, or the text colour, read from CSS. */
    function screen() {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return null;
        const color = getComputedStyle(canvas).color;
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.lineCap = ctx.lineJoin = "round";
        return { ctx, color };
    }

    function repaint() {
        const target = screen();
        if (!target) return;
        target.ctx.clearRect(0, 0, size.current.width, size.current.height);
        paint(target.ctx, { ...size.current, color: target.color });
    }
    const repaintRef = useRef(repaint);
    repaintRef.current = repaint;

    function exportAs(kind: "png" | "svg") {
        const canvas = canvasRef.current;
        if (!canvas || isEmpty()) return "";
        const { width, height: h } = size.current;
        const color = penColor ? getComputedStyle(canvas).color : exportColor;
        if (kind === "png") {
            const out = document.createElement("canvas");
            out.width = Math.round(width * 2);
            out.height = Math.round(h * 2);
            const ctx = out.getContext("2d");
            if (!ctx) return "";
            ctx.scale(2, 2);
            if (background) {
                ctx.fillStyle = background;
                ctx.fillRect(0, 0, width, h);
            }
            paint(ctx, { width, height: h, color });
            return out.toDataURL("image/png");
        }
        let body = background ? `<rect width="100%" height="100%" fill="${xml(background)}" stroke="none"/>` : "";
        const typed = view.current.text.trim();
        const ctx = canvas.getContext("2d");
        if (view.current.typing && ctx) {
            body += `<text x="${r(width / 2)}" y="${r(h * line - 4)}" font-size="${r(fit(ctx, typed, width, h))}" font-family="${xml(script)}" font-style="italic" text-anchor="middle" fill="${xml(color)}" stroke="none">${xml(typed)}</text>`;
        } else {
            if (base.current) body += `<image href="${xml(base.current.src)}" width="${r(width)}" height="${r(h)}"/>`;
            const k = width / refWidth.current;
            // One path per stroke, at its average width.
            for (const points of strokes.current) {
                const d = points.map((p, j) => {
                    const next = points[j + 1];
                    const end = next ? mid(p, next) : p;
                    return `${j ? "" : `M${r(p.x * k)} ${r(p.y * k)}`}Q${r(p.x * k)} ${r(p.y * k)} ${r(end.x * k)} ${r(end.y * k)}`;
                });
                const w = (points.reduce((sum, p) => sum + p.w, 0) / points.length) * penWidth * k;
                body += `<path d="${d.join("")}" stroke-width="${r(w)}"/>`;
            }
        }
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${r(width)}" height="${r(h)}" viewBox="0 0 ${r(width)} ${r(h)}"><g fill="none" stroke="${xml(color)}" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }

    /** Sends the pad's new value. */
    function commit() {
        const next = isEmpty() ? "" : exportAs(format);
        emitted.current = next;
        setCurrent(next);
        setStrokeCount(strokes.current.length);
    }

    function clear() {
        strokes.current = [];
        base.current = null;
        view.current.text = "";
        setText("");
        repaint();
        commit();
    }

    useImperativeHandle(ref, () => ({
        clear,
        toDataURL: (kind) => exportAs(kind ?? format),
        isEmpty,
    }));

    // A value from outside (a saved signature, or "" to empty it) is drawn in, under any new strokes.
    useEffect(() => {
        if (current === emitted.current) return;
        emitted.current = current;
        strokes.current = [];
        setStrokeCount(0);
        setText("");
        let image: HTMLImageElement | null = null;
        if (current) {
            setTyping(false);
            image = new Image();
            image.onload = () => repaintRef.current();
            image.src = current;
        }
        base.current = image;
    }, [current]);

    // Repaint after every render, which covers the typed name, the mode and the pen colour.
    useEffect(() => repaintRef.current());

    // Size the canvas to its box at the screen's pixel density, and repaint from the strokes when it changes.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(() => {
            const rect = canvas.getBoundingClientRect();
            const ratio = window.devicePixelRatio || 1;
            size.current = { width: rect.width, height: rect.height };
            canvas.width = Math.round(rect.width * ratio);
            canvas.height = Math.round(rect.height * ratio);
            canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
            repaintRef.current();
        });
        observer.observe(canvas);
        return () => observer.disconnect();
    }, []);

    // The ink follows the text colour, so repaint when the theme changes.
    useEffect(() => {
        const update = () => repaintRef.current();
        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
        const scheme = window.matchMedia?.("(prefers-color-scheme: dark)");
        scheme?.addEventListener?.("change", update);
        return () => {
            observer.disconnect();
            scheme?.removeEventListener?.("change", update);
        };
    }, []);

    // Inside a Form, say when the value changes: the input that carries it fires no events of its own.
    const changed = useContext(FormContext)?.changed;
    const lastValue = useRef(current);
    useEffect(() => {
        if (lastValue.current === current) return;
        lastValue.current = current;
        if (name) changed?.(name);
    }, [current, changed, name]);

    function pointAt(event: PointerEvent, previous?: SignaturePoint): SignaturePoint {
        const rect = canvasRef.current!.getBoundingClientRect();
        const k = rect.width / refWidth.current;
        // A pen's pressure (0.5 is a usual press) makes the line thinner or thicker, eased so it doesn't jump.
        const pressure = event.pointerType === "pen" && event.pressure > 0 ? 0.4 + event.pressure * 1.2 : 1;
        return {
            x: (event.clientX - rect.left) / k,
            y: (event.clientY - rect.top) / k,
            w: previous ? previous.w * 0.7 + pressure * 0.3 : pressure,
        };
    }

    function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
        if (!interactive || typing || active.current || (event.pointerType === "mouse" && event.button !== 0)) return;
        event.preventDefault();
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
            // A pointer the browser doesn't know (a synthetic one): draw without capturing it.
        }
        if (!strokes.current.length) refWidth.current = size.current.width || 1;
        const points = [pointAt(event.nativeEvent)];
        strokes.current.push(points);
        active.current = { id: event.pointerId, points };
        const target = screen();
        if (target) dot(target.ctx, points[0]!, size.current.width / refWidth.current, penWidth);
        setDrawing(true);
    }

    function onPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
        const stroke = active.current;
        if (!stroke || stroke.id !== event.pointerId) return;
        const target = screen();
        const k = size.current.width / refWidth.current;
        const samples = event.nativeEvent.getCoalescedEvents?.() ?? [];
        for (const sample of samples.length ? samples : [event.nativeEvent]) {
            const last = stroke.points[stroke.points.length - 1]!;
            const point = pointAt(sample, last);
            if (Math.hypot(point.x - last.x, point.y - last.y) * k < 1.5) continue;
            stroke.points.push(point);
            if (target) segment(target.ctx, stroke.points, stroke.points.length - 2, k, penWidth);
        }
    }

    function onPointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
        const stroke = active.current;
        if (!stroke || stroke.id !== event.pointerId) return;
        active.current = null;
        setDrawing(false);
        repaint();
        commit();
    }

    function undo() {
        strokes.current.pop();
        repaint();
        commit();
        // The button turns off with nothing left to undo: keep focus in the pad.
        if (!strokes.current.length) toggleRef.current?.focus();
    }

    function toggleTyping() {
        view.current.typing = !typing;
        setTyping(!typing);
        repaint();
        commit();
    }

    const state = labels.state(signed);

    return (
        <div
            className={cx(
                "ow-signature-pad",
                isInvalid && "ow-signature-pad--invalid",
                disabled && "ow-signature-pad--disabled",
                readOnly && "ow-signature-pad--readonly",
                typing && "ow-signature-pad--typing",
                drawing && "ow-signature-pad--drawing",
                className,
            )}
            style={{ "--ow-signature-pad-height": typeof height === "number" ? `${height}px` : height } as CSSProperties}
        >
            <div className="ow-signature-pad__surface">
                <canvas
                    ref={canvasRef}
                    id={padId}
                    role="img"
                    className="ow-signature-pad__canvas"
                    style={penColor ? { color: penColor } : undefined}
                    aria-label={ariaLabel ? `${ariaLabel}, ${state}` : state}
                    aria-labelledby={ariaLabelledBy && !typing ? `${ariaLabelledBy} ${padId}` : undefined}
                    aria-describedby={typing ? undefined : ariaDescribedBy}
                    aria-invalid={(isInvalid && !typing) || undefined}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                />
                <span className="ow-signature-pad__line" aria-hidden="true" />
                {!signed && !typing && !drawing && interactive ? (
                    <span className="ow-signature-pad__prompt" aria-hidden="true">
                        {labels.signHere}
                    </span>
                ) : null}
            </div>
            {typing && !readOnly ? (
                <Input
                    id={selfId}
                    value={text}
                    placeholder={labels.typeName}
                    aria-label={id ? undefined : (ariaLabel ?? labels.typeName)}
                    aria-describedby={ariaDescribedBy}
                    isInvalid={isInvalid}
                    disabled={disabled}
                    autoComplete="name"
                    autoFocus
                    onChange={(event) => {
                        view.current.text = event.target.value;
                        setText(event.target.value);
                        repaint();
                        commit();
                    }}
                />
            ) : null}
            {readOnly ? null : (
                <div className="ow-signature-pad__actions">
                    {allowTyping ? (
                        <Button ref={toggleRef} variant="ghost" size="sm" disabled={disabled} onClick={toggleTyping}>
                            {typing ? labels.drawInstead : labels.typeInstead}
                        </Button>
                    ) : null}
                    <span className="ow-signature-pad__edit">
                        {typing ? null : (
                            <Button variant="ghost" size="sm" disabled={disabled || !strokeCount} onClick={undo}>
                                {labels.undo}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={disabled || !signed}
                            onClick={() => {
                                clear();
                                onClear?.();
                                toggleRef.current?.focus();
                            }}
                        >
                            {labels.clear}
                        </Button>
                    </span>
                </div>
            )}
            {name ? (
                // Carries the value for the form, and lets `required` stop it being sent empty. Not for people.
                <input
                    className="ow-visually-hidden"
                    tabIndex={-1}
                    aria-hidden="true"
                    name={name}
                    value={current}
                    required={required}
                    disabled={disabled}
                    autoComplete="off"
                    onChange={() => {}}
                />
            ) : null}
        </div>
    );
});
