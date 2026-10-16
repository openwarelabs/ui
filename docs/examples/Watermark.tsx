import { Badge, Button, Card, DescriptionItem, DescriptionList, Field, Input, Stack, Text, Textarea, Watermark } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Watermark",
    category: "Layout",
    description:
        "Text or an image tiled across whatever it wraps, for previews and drafts: \"DRAFT\" over a form, a reader's name and the date over a document, a logo over a proof.",
    source: "components/Watermark/Watermark.tsx",
    imports: ["Watermark"],
    props: ["WatermarkProps"],
    notes: [
        "The layer is aria-hidden and takes no pointer events, so screen readers skip it and everything under it stays clickable and focusable.",
        "By default the text is the theme's text colour at 10%, so the content under it keeps its contrast on both themes. A stronger colour or opacity reads better from across a room but costs the content legibility; keep it light over text people need to read.",
        "One tile is drawn to a canvas at the device's pixel ratio and repeated as a background, so a page of it costs the same as one line. It's redrawn when data-theme changes or the system scheme does.",
        "If a script removes the layer or changes its style, it's put back. That's a deterrent for casual tampering, not a security control: anyone with the dev tools can still take it off, and it never replaces access control on the data itself.",
        "fullPage fixes the layer over the viewport; put it once near the root, with a zIndex above your dialogs if they should carry it too.",
        "An image from another origin needs CORS headers to be drawn; a data URL or a same-origin file always works.",
    ],
    related: ["Card", "Image"],
    since: "0.18.0",
};

/** A form still being written, marked "DRAFT". The fields keep working under it. */
export function Draft() {
    return (
        <Watermark content="DRAFT" fontSize={20} fontWeight={600} style={{ width: 420, maxWidth: "100%" }}>
            <Card padding="lg">
                <Stack gap="md">
                    <Text as="h3" variant="card-title">
                        Request for leave
                    </Text>
                    <Field label="Name">
                        <Input defaultValue="Aoife Brennan" />
                    </Field>
                    <Field label="Dates" hint="Inclusive, in the office's calendar.">
                        <Input defaultValue="3 to 7 November" />
                    </Field>
                    <Field label="Cover">
                        <Textarea rows={3} defaultValue="Cian takes the Tuesday stand-up; the release review moves to the 10th." />
                    </Field>
                    <Stack direction="row" gap="sm" justify="end">
                        <Button variant="secondary">Save draft</Button>
                        <Button variant="primary">Submit</Button>
                    </Stack>
                </Stack>
            </Card>
        </Watermark>
    );
}
Draft.layout = { align: "start" as const };

/** Two lines over an invoice, saying who it was issued to and when, so a copy that leaks says where it came from. */
export function Reader() {
    return (
        <Watermark content={["Confidential · niamh@example.com", "16 October 2026"]} fontSize={14} gap={[80, 60]} style={{ width: 520, maxWidth: "100%" }}>
            <Card padding="lg">
                <Stack gap="md">
                    <Stack direction="row" justify="between" align="center">
                        <Text as="h3" variant="card-title">
                            Invoice 2026-041
                        </Text>
                        <Badge variant="warning">Unpaid</Badge>
                    </Stack>
                    <DescriptionList divided>
                        <DescriptionItem term="Issued to">Saoirse Ní Bhriain, Lúnasa Studio</DescriptionItem>
                        <DescriptionItem term="Date">16 October 2026</DescriptionItem>
                        <DescriptionItem term="Due">15 November 2026</DescriptionItem>
                        <DescriptionItem term="Design, 12 days">€7,200.00</DescriptionItem>
                        <DescriptionItem term="Hosting, October">€48.00</DescriptionItem>
                        <DescriptionItem term="Total">
                            <Text as="span" variant="label">
                                €7,248.00
                            </Text>
                        </DescriptionItem>
                    </DescriptionList>
                </Stack>
            </Card>
        </Watermark>
    );
}
Reader.layout = { align: "start" as const };

/** A small logo drawn as an SVG, so the example loads nothing over the network. */
const logo = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="28" viewBox="0 0 96 28"><circle cx="14" cy="14" r="11" fill="none" stroke="#7a8599" stroke-opacity="0.35" stroke-width="3"/><circle cx="14" cy="14" r="4" fill="#7a8599" fill-opacity="0.35"/><text x="32" y="19" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="600" fill="#7a8599" fill-opacity="0.4">Lúnasa</text></svg>',
)}`;

/** A logo tiled over a proof, turned less and spaced further apart than the default. */
export function Logo() {
    return (
        <Watermark image={logo} rotate={-12} gap={[60, 40]} style={{ width: 480, maxWidth: "100%" }}>
            <Card padding="lg">
                <Stack gap="sm">
                    <Text variant="caption" tone="muted">
                        Proof · not for distribution
                    </Text>
                    <Text as="h3" variant="card-title">
                        Autumn programme
                    </Text>
                    <Text>
                        Three evenings of readings in the old mill, with Oisín Walsh on the Friday and an open session on the
                        Sunday. Doors at seven; the bar is run by the committee.
                    </Text>
                    <Text>
                        Tickets are twelve euro, or thirty for the weekend. Members and students pay half. Proceeds go to the
                        roof fund, which is two thirds of the way there.
                    </Text>
                </Stack>
            </Card>
        </Watermark>
    );
}
Logo.layout = { align: "start" as const };
