import { useState } from "react";

import { Button, Field, Form, Input, SignaturePad, Stack, Text, toast } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "SignaturePad",
    category: "Inputs",
    description:
        "A box to sign in with a mouse, a finger or a pen, for forms and onboarding, with a typed alternative. Its value is a PNG (or SVG) data URL that a form sends.",
    source: "components/SignaturePad/SignaturePad.tsx",
    props: ["SignaturePadProps", "SignaturePadLabels", "SignaturePadHandle"],
    keyboard: [
        ["Tab", "Moves through Type instead, Undo and Clear. The drawing area isn't a tab stop: it can't be drawn in with keys."],
        ["Enter or Space", "On Type instead, switches to a text box for your name, and moves focus into it."],
    ],
    notes: [
        'Drawing can\'t be done with a keyboard, so "Type instead" offers a text box: the name is set in a script face on the pad and becomes the value.',
        'The pad is an image named for its state, "Signature, empty" or "Signature, signed", after its Field label. Undo, Clear and Type instead are real buttons.',
        "Strokes follow a pen's pressure and are smoothed into curves. The canvas is drawn at the screen's pixel density and redrawn from the strokes when it resizes.",
        "On screen the ink is the text colour, so it follows the theme; the exported value uses exportColor (near-black) on a transparent ground, or penColor and background when set.",
        "With a name, the data URL is sent with a Form, and required stops it being sent unsigned. Only the drawing area takes touch-action: none, so the page still scrolls around it.",
    ],
    related: ["Field", "Form", "FileDropZone", "Input"],
    since: "0.16.0",
};

/** In a Field, which names it. Sign with a mouse, a finger or a pen; Undo takes back the last stroke. */
export function Basic() {
    const [signature, setSignature] = useState("");
    return (
        <div style={{ width: 420, maxWidth: "100%" }}>
            <Field label="Signature" hint={signature ? "Signed. Clear it to start again." : "Draw your signature in the box."}>
                <SignaturePad value={signature} onChange={setSignature} />
            </Field>
        </div>
    );
}
Basic.layout = { align: "start" as const };

/** In a Form: the signature is sent under its name, and required asks for one first. Send it unsigned. */
export function InAForm() {
    return (
        <Form
            style={{ width: 420, maxWidth: "100%" }}
            onSubmit={(values) =>
                toast.success("Agreement signed", {
                    description: `${values.fullName} signed (${Math.round(String(values.signature).length / 1024)} KB PNG).`,
                })
            }
        >
            <Field label="Full name">
                <Input name="fullName" autoComplete="name" required />
            </Field>
            <Field label="Signature" hint="By signing, you agree to the terms." errorMessages="Sign before you send.">
                <SignaturePad name="signature" required />
            </Field>
            <Button type="submit" variant="primary">
                Sign and send
            </Button>
        </Form>
    );
}
InAForm.layout = { align: "start" as const };

/** Type instead sets a typed name in a script face, for people who can't draw. format="svg" keeps it as an SVG; the image below is the value. */
export function Typed() {
    const [signature, setSignature] = useState("");
    return (
        <Stack gap="md" style={{ width: 420, maxWidth: "100%" }}>
            <Field label="Signature">
                <SignaturePad value={signature} onChange={setSignature} format="svg" height={120} />
            </Field>
            <Text variant="caption" tone="muted">
                {signature ? "The value, as an image:" : "Nothing signed yet."}
            </Text>
            {signature ? <img src={signature} alt="The saved signature" style={{ maxWidth: "100%", height: 60, objectFit: "contain", objectPosition: "left" }} /> : null}
        </Stack>
    );
}
Typed.layout = { align: "start" as const };

const saved =
    "data:image/svg+xml," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120"><path fill="none" stroke="#111111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M24 82C34 40 48 30 52 58C55 78 40 92 34 80C30 70 60 52 74 64C84 72 80 86 92 78C104 70 108 48 116 52C124 56 112 88 124 86C136 84 140 60 150 62C160 64 150 84 162 84C176 84 182 50 196 54C206 58 196 82 208 82C222 82 236 60 276 58M60 98C120 90 200 92 250 96"/></svg>',
    );

/** readOnly shows a saved signature, with no buttons. A transparent one is re-inked in the text colour, so it reads in dark mode too. */
export function ReadOnly() {
    return (
        <div style={{ width: 360, maxWidth: "100%" }}>
            <Field label="Signed by Saoirse Doyle" hint="12 March 2026, 14:05">
                <SignaturePad readOnly value={saved} height={120} />
            </Field>
        </div>
    );
}
ReadOnly.layout = { align: "start" as const };
