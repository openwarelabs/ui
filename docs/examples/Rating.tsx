import { useState } from "react";

import { Button, Field, Form, Rating, Stack, Text, Textarea, toast } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Rating",
    category: "Choices",
    description:
        "Stars to pick a score, or to show one. Picking, it's a group of native radios that a form sends; read-only, it fills to any fraction.",
    source: "components/Rating/Rating.tsx",
    imports: ["Rating"],
    props: ["RatingProps", "RatingLabels"],
    keyboard: [
        ["Tab", "Moves onto the stars, at the current rating."],
        ["Right or Up", "Adds a star, or half a star with allowHalf."],
        ["Left or Down", "Takes one away; down to none when it's clearable."],
        ["Home or End", "Goes to the lowest or the highest rating."],
        ["Space", "Picks the focused star; on the current rating, clears it when it's clearable."],
    ],
    notes: [
        'Each star is a radio named for screen readers ("3 stars"), in a radiogroup named by its Field label or aria-label.',
        'Read-only, the stars are one image read as "4.5 out of 5 stars"; the count after them is read as text.',
        "Inside a Form, the rating is sent under its name, and required asks for one before the form is sent. Nothing is sent while it's 0.",
        "The pointer previews a rating before it's chosen. Filled stars are brass, one of the few places the accent shows.",
    ],
    related: ["RadioGroup", "Slider", "SegmentedControl"],
    since: "0.14.0",
};

/** In a Field, which names it. clearable lets people take their rating back by choosing it again. */
export function Basic() {
    const [rating, setRating] = useState(4);
    return (
        <Field label="Rate this recipe" hint={rating ? `You gave it ${rating} of 5.` : "Not rated yet."}>
            <Rating value={rating} onChange={setRating} clearable />
        </Field>
    );
}
Basic.layout = { align: "start" as const };

/** allowHalf splits each star: the start half is half a point. */
export function HalfStars() {
    const [rating, setRating] = useState(3.5);
    return (
        <Field label="How was the delivery?">
            <Rating value={rating} onChange={setRating} allowHalf showValue size="lg" />
        </Field>
    );
}
HalfStars.layout = { align: "start" as const };

/** readOnly shows a rating, filled to any fraction, with the number and how many it's from. */
export function ReadOnly() {
    return (
        <Stack gap="lg">
            <Rating readOnly value={4.6} showValue count={1203} />
            <Rating readOnly value={3.2} size="sm" count={48} />
            <Stack direction="row" gap="sm" align="center">
                <Rating readOnly value={5} size="sm" aria-label="Saoirse Doyle" />
                <Text variant="caption" tone="muted">
                    Saoirse Doyle, 2 days ago
                </Text>
            </Stack>
        </Stack>
    );
}
ReadOnly.layout = { align: "start" as const };

/** In a Form: the rating is sent under its name, and required asks for one first. Submit it with no stars. */
export function InAForm() {
    return (
        <Form
            style={{ width: 360, maxWidth: "100%" }}
            onSubmit={(values) =>
                toast.success("Thanks for your review", {
                    description: `You gave your stay ${values.stars} of 5.`,
                })
            }
        >
            <Field label="How was your stay?" errorMessages="Choose a rating.">
                <Rating name="stars" required />
            </Field>
            <Field label="Anything to add?">
                <Textarea name="comment" rows={3} />
            </Field>
            <Button type="submit">Send review</Button>
        </Form>
    );
}
InAForm.layout = { align: "start" as const };

/** Sizes, more stars, and disabled. */
export function Variations() {
    return (
        <Stack gap="lg">
            <Rating aria-label="Small" size="sm" defaultValue={2} />
            <Rating aria-label="Out of ten" max={10} defaultValue={7} />
            <Rating aria-label="Disabled" defaultValue={3} disabled />
        </Stack>
    );
}
Variations.layout = { align: "start" as const };
