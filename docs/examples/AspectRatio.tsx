import { AspectRatio, Card, Stack, Text } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "AspectRatio",
    category: "Layout",
    description:
        "A box that keeps its shape as its width changes, such as 16:9 for a video or 1:1 for a thumbnail, with whatever is inside filling it.",
    source: "components/AspectRatio/AspectRatio.tsx",
    imports: ["AspectRatio"],
    notes: [
        "It's as wide as its container and as tall as the ratio makes it, so the page doesn't jump when an image or a video arrives.",
        "Each child fills the box. An image, video, iframe or embed is cropped to cover it; set object-fit on it yourself to change that.",
        "For a picture, Image with ratio wraps itself in one and adds a placeholder while it loads.",
        "It's a plain element: pass as=\"figure\" or as=\"span\" where a div doesn't belong.",
    ],
    related: ["Image", "Card", "Container"],
    since: "0.14.0",
};

/** A small landscape drawn as an SVG, so the example doesn't load anything over the network. */
const landscape = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e2a4a"/><stop offset="1" stop-color="#c9a46b"/></linearGradient></defs><rect width="1200" height="800" fill="url(#sky)"/><circle cx="820" cy="380" r="90" fill="#f4e3c1"/><path d="M0 520 C 240 420 420 450 620 520 S 1000 450 1200 500 V800 H0Z" fill="#2b3a5c"/><path d="M0 640 C 300 560 560 600 800 660 S 1100 620 1200 630 V800 H0Z" fill="#141c30"/></svg>',
)}`;

/** A 16:9 box with an image in it: the image is cropped to fill it, however wide the box gets. */
export function Basic() {
    return (
        <div style={{ width: 400, maxWidth: "100%" }}>
            <AspectRatio ratio={16 / 9} style={{ borderRadius: "var(--ow-radius-container)" }}>
                <img src={landscape} alt="Hills at dusk under a low sun" />
            </AspectRatio>
        </div>
    );
}

const ratios = [
    { label: "1:1", ratio: 1 },
    { label: "4:3", ratio: 4 / 3 },
    { label: "16:9", ratio: 16 / 9 },
    { label: "21:9", ratio: 21 / 9 },
];

/** The common shapes at the same width. Any content fills the box, here a label centred in it. */
export function Ratios() {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 16,
                width: 560,
                maxWidth: "100%",
                alignItems: "start",
            }}
        >
            {ratios.map(({ label, ratio }) => (
                <AspectRatio
                    key={label}
                    ratio={ratio}
                    style={{
                        border: "1px solid var(--ow-border)",
                        borderRadius: "var(--ow-radius-form)",
                        background: "var(--ow-surface-muted)",
                    }}
                >
                    <Stack align="center" justify="center">
                        <Text variant="label">{label}</Text>
                    </Stack>
                </AspectRatio>
            ))}
        </div>
    );
}

/** A cover image at the top of a card: it keeps its space before the image arrives, so the text below doesn't move. */
export function InACard() {
    return (
        <Card padding="none" style={{ width: 320, maxWidth: "100%", overflow: "hidden" }}>
            <AspectRatio ratio={2}>
                <img src={landscape} alt="" />
            </AspectRatio>
            <Stack gap="3xs" style={{ padding: 16 }}>
                <Text as="h3" variant="card-title">
                    Autumn retreat
                </Text>
                <Text variant="caption" tone="muted">
                    Three days in the hills, 14 to 16 November.
                </Text>
            </Stack>
        </Card>
    );
}
