import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { StarIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type { RatingProps } from "./Rating.types";

export type { RatingLabels, RatingProps } from "./Rating.types";

/** 4.56 → "4.6", 4 → "4". */
const formatValue = (value: number) => String(Math.round(value * 10) / 10);
const thousands = new Intl.NumberFormat("en");

const defaultLabels = {
    star: (value: number) => (value === 1 ? "1 star" : `${formatValue(value)} stars`),
    summary: (value: number, max: number) => `${formatValue(value)} out of ${max} stars`,
    count: (count: number) => `${thousands.format(count)} ${count === 1 ? "review" : "reviews"}`,
};

/**
 * Stars to pick a score, or to show one. Picking, it's a group of radios: the arrow keys change the rating,
 * the pointer previews it, and it's sent with a form under its `name`. With `readOnly`, it shows a rating
 * to any fraction, read as "4.5 out of 5 stars", with an optional count of reviews.
 */
export function Rating({
    value,
    defaultValue = 0,
    onChange,
    max = 5,
    allowHalf = false,
    clearable = false,
    size = "md",
    readOnly = false,
    disabled = false,
    showValue = false,
    count,
    name,
    required,
    isInvalid,
    labels: labelsProp,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    id,
    className,
}: RatingProps) {
    const [current, setCurrent] = useControllableState(value, defaultValue, onChange);
    const [hover, setHover] = useState<number | null>(null);
    const generatedId = useId();
    const groupRef = useRef<HTMLSpanElement>(null);
    const labels = { ...defaultLabels, ...labelsProp };
    const step = allowHalf ? 0.5 : 1;
    const interactive = !readOnly && !disabled;
    const shown = interactive && hover !== null ? hover : current;
    const selfId = id ?? generatedId;

    function choose(next: number) {
        setCurrent(next);
        setHover(null);
        const input = groupRef.current?.querySelector<HTMLInputElement>(`input[value="${next || step}"]`);
        input?.focus();
    }

    function onKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const moves: Record<string, number> = {
            ArrowUp: 1,
            ArrowDown: -1,
            ArrowRight: rtl ? -1 : 1,
            ArrowLeft: rtl ? 1 : -1,
        };
        const lowest = clearable ? 0 : step;
        const base = Math.round(current / step) * step;
        let next: number;
        if (event.key in moves) next = Math.min(max, Math.max(lowest, base + moves[event.key]! * step));
        else if (event.key === "Home") next = step;
        else if (event.key === "End") next = max;
        else if (event.key === " " && clearable && current > 0 && Number((event.target as HTMLInputElement).value) === current) {
            // Space on the current rating clears it, as a click does; the browser doesn't click a checked radio.
            event.preventDefault();
            setCurrent(0);
            setHover(null);
            return;
        } else return;
        event.preventDefault();
        choose(next);
    }

    const stars = Array.from({ length: max }, (_, index) => {
        const fill = Math.min(1, Math.max(0, shown - index));
        const values = allowHalf ? [index + 0.5, index + 1] : [index + 1];
        return (
            <span key={index} className="ow-rating__star">
                <span className="ow-rating__glyph" style={{ "--ow-rating-fill": `${Math.round(fill * 1000) / 10}%` } as CSSProperties}>
                    <StarIcon className="ow-rating__icon ow-rating__icon--empty" strokeWidth={1.5} />
                    <span className="ow-rating__fill">
                        <StarIcon className="ow-rating__icon" strokeWidth={1.5} />
                    </span>
                </span>
                {readOnly
                    ? null
                    : values.map((option) => (
                          <input
                              key={option}
                              type="radio"
                              className={cx("ow-rating__input", option % 1 !== 0 && "ow-rating__input--half")}
                              name={name ?? generatedId}
                              value={option}
                              checked={current === option}
                              disabled={disabled}
                              required={required}
                              aria-label={labels.star(option)}
                              onChange={() => setCurrent(option)}
                              onClick={() => {
                                  // A click on the rating it already has clears it.
                                  if (clearable && current === option) {
                                      setCurrent(0);
                                      setHover(null);
                                  }
                              }}
                              onPointerEnter={() => interactive && setHover(option)}
                          />
                      ))}
            </span>
        );
    });

    const summary = labels.summary(current, max);

    return (
        <span
            className={cx(
                "ow-rating",
                `ow-rating--${size}`,
                readOnly && "ow-rating--readonly",
                disabled && "ow-rating--disabled",
                hover !== null && interactive && "ow-rating--previewing",
                className,
            )}
        >
            {readOnly ? (
                <span
                    id={selfId}
                    role="img"
                    className="ow-rating__stars"
                    aria-label={ariaLabel ? `${ariaLabel}: ${summary}` : summary}
                    aria-labelledby={ariaLabelledBy ? `${ariaLabelledBy} ${selfId}` : undefined}
                    aria-describedby={ariaDescribedBy}
                >
                    {stars}
                </span>
            ) : (
                <span
                    ref={groupRef}
                    id={selfId}
                    role="radiogroup"
                    className="ow-rating__stars"
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={isInvalid || undefined}
                    aria-required={required || undefined}
                    onKeyDown={onKeyDown}
                    onPointerLeave={() => setHover(null)}
                >
                    {stars}
                </span>
            )}
            {readOnly && name ? <input type="hidden" name={name} value={current} /> : null}
            {showValue && (readOnly || shown > 0) ? (
                <span className="ow-rating__value" aria-hidden="true">
                    {formatValue(shown)}
                </span>
            ) : null}
            {count !== undefined ? (
                <span className="ow-rating__count">
                    <span aria-hidden="true">· </span>
                    {labels.count(count)}
                </span>
            ) : null}
        </span>
    );
}
