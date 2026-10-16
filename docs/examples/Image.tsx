import { Image, Stack, Text } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Image",
    category: "Data display",
    description:
        "An image with a pulsing placeholder while it loads and a fallback if it fails, lazy loaded by default, in a box of any shape and with a caption if you want one.",
    source: "components/Image/Image.tsx",
    imports: ["Image"],
    props: ["ImageProps"],
    notes: [
        'alt is required: say what the image shows, or pass alt="" when it only decorates and the text around it says it all.',
        "It takes every <img> prop and forwards its ref to the <img>; className and style go on the box around it, to size and place it.",
        "With ratio it fills a box of that shape as wide as its container, so nothing jumps when it loads. Without one, give it width and height for the same.",
        "It loads lazily and decodes off the main thread. For the main image at the top of a page, pass loading=\"eager\".",
        "If the image fails or there's no src, a muted box with an icon takes its place, announced with the alt text; pass fallback for your own.",
        "With a caption it comes in a <figure>, with the caption as its <figcaption>.",
    ],
    related: ["AspectRatio", "Avatar", "Skeleton", "Lightbox"],
    since: "0.14.0",
};

/** A small landscape drawn as an SVG, so the examples don't load anything over the network. */
function landscape(sky: [string, string], sun: string, hills: [string, string]) {
    return `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs><rect width="1200" height="800" fill="url(#sky)"/><circle cx="820" cy="380" r="90" fill="${sun}"/><path d="M0 520 C 240 420 420 450 620 520 S 1000 450 1200 500 V800 H0Z" fill="${hills[0]}"/><path d="M0 640 C 300 560 560 600 800 660 S 1100 620 1200 630 V800 H0Z" fill="${hills[1]}"/></svg>`,
    )}`;
}

const dusk = landscape(["#1e2a4a", "#c9a46b"], "#f4e3c1", ["#2b3a5c", "#141c30"]);
const noon = landscape(["#8fb8de", "#e6eff7"], "#fff4cf", ["#7aa77f", "#46704f"]);

/** A 3:2 image with the cards' corners. It fills the box, cropped to fit. */
export function Basic() {
    return (
        <Image
            src={dusk}
            alt="Hills at dusk under a low sun"
            ratio={3 / 2}
            radius="container"
            style={{ width: 400, maxWidth: "100%" }}
        />
    );
}

/** With a caption, in a figure. */
export function Caption() {
    return (
        <Image
            src={noon}
            alt="Green hills under a pale midday sky"
            ratio={16 / 9}
            radius="container"
            caption="The view from the north ridge, at midday."
            style={{ width: 400, maxWidth: "100%" }}
        />
    );
}

/** cover fills the square and crops the sides; contain shows the whole picture inside it. */
export function Fit() {
    return (
        <Stack direction="row" gap="lg" wrap>
            {(["cover", "contain"] as const).map((fit) => (
                <Stack key={fit} gap="xs" style={{ width: 160 }}>
                    <Image
                        src={dusk}
                        alt=""
                        ratio={1}
                        fit={fit}
                        radius="control"
                        style={{ border: "1px solid var(--ow-border)" }}
                    />
                    <Text variant="caption">{fit}</Text>
                </Stack>
            ))}
        </Stack>
    );
}

/** An image that fails, one with no src, and one with a fallback of your own. */
export function Fallback() {
    return (
        <Stack direction="row" gap="lg" wrap>
            <Image src="data:," alt="Team photo" width={160} height={120} radius="control" />
            <Image alt="Cover image" width={160} height={120} radius="control" />
            <Image
                src="data:,"
                alt=""
                width={160}
                height={120}
                radius="control"
                fallback={
                    <Text variant="caption" tone="muted">
                        No preview
                    </Text>
                }
                style={{ border: "1px dashed var(--ow-border)" }}
            />
        </Stack>
    );
}
