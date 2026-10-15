export interface RatingLabels {
    /** Names one star's radio for screen readers.
     * @default (value) => value === 1 ? "1 star" : `${value} stars` */
    star?(value: number): string;
    /** Reads out a rating that's shown, not picked.
     * @default (value, max) => `${value} out of ${max} stars` */
    summary?(value: number, max: number): string;
    /** The text after the stars when there's a `count`.
     * @default (count) => `${count} reviews`, with thousands separated */
    count?(count: number): string;
}

export interface RatingProps {
    /** The rating, when you control it. 0 is no rating yet. Read-only, it can be any fraction, like 4.6. */
    value?: number;
    /** The starting rating when uncontrolled.
     * @default 0 */
    defaultValue?: number;
    /** Called with the new rating; 0 when it's cleared. */
    onChange?(value: number): void;
    /** How many stars.
     * @default 5 */
    max?: number;
    /** Lets people pick half stars: the left half of a star is half a point.
     * @default false */
    allowHalf?: boolean;
    /** Choosing the current rating again clears it, back to 0.
     * @default false */
    clearable?: boolean;
    /** sm 16px, md 20px, lg 24px stars.
     * @default "md" */
    size?: "sm" | "md" | "lg";
    /** Shows a rating rather than asking for one: an image read as "4.5 out of 5 stars", filled to any fraction.
     * @default false */
    readOnly?: boolean;
    /** @default false */
    disabled?: boolean;
    /** Shows the number after the stars, like 4.6.
     * @default false */
    showValue?: boolean;
    /** How many ratings it's from, shown after the stars as "1,203 reviews". */
    count?: number;
    /** The form field name: the rating is sent under it (nothing when it's 0). Generated when left out. */
    name?: string;
    /** Asks for a rating before the form can be sent. */
    required?: boolean;
    /** Marks it invalid, with an error colour; Field sets this. */
    isInvalid?: boolean;
    /** The words it uses, for other languages. */
    labels?: RatingLabels;
    /** Names the rating for screen readers when there's no Field label: "Rate this recipe". */
    "aria-label"?: string;
    /** Names the rating by another element's id, such as a Field's label; Field sets this. */
    "aria-labelledby"?: string;
    /** Ids of the hint or error that describe it; Field sets this. */
    "aria-describedby"?: string;
    /** The id of the stars, so a Field's label points at them; Field sets this. */
    id?: string;
    className?: string;
}
