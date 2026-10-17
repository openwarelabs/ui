import { useState } from "react";

import { Button, Image, Lightbox, Stack, Text, type LightboxImage } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Lightbox",
    category: "Data display",
    description:
        "A fullscreen viewer for one image or a gallery, on the native <dialog>: the arrow keys, a swipe or the strip of thumbnails move between images, and the wheel, a pinch, a double-tap or + and - zoom in.",
    source: "components/Lightbox/Lightbox.tsx",
    imports: ["Lightbox"],
    props: ["LightboxProps", "LightboxImage", "LightboxLabels"],
    keyboard: [
        ["Escape", "Closes it."],
        ["Left or Right", "Shows the previous or next image."],
        ["Home or End", "Shows the first or last image."],
        ["+ or -", "Zooms in or out. 0 fits the image again."],
        ["Tab", "Moves between the close, zoom, previous and next buttons and the thumbnails."],
    ],
    notes: [
        "It's a modal dialog named by the image's caption, or by its alt when there's no caption. Focus starts on the close button.",
        "When another image shows, screen readers hear its place and alt, “2 of 5, Hills at dusk”.",
        "The strip at the bottom is a list of buttons named by each image's alt, with aria-current on the one showing.",
        "A double-click or double-tap zooms to twice the fitted size and back; the wheel zooms toward the pointer; two fingers pinch; a drag pans while zoomed and a swipe changes the image when not. The zoom resets when the image changes.",
        "The ground is dark whatever the theme, so the picture stands out. A tap beside the image closes it.",
        "Images are shown at the size they fit the screen: give src the full-size file and thumbnail a small one for the strip.",
    ],
    related: ["Image", "Carousel", "Dialog"],
    since: "0.18.0",
};

/** A small landscape drawn as an SVG, so the examples don't load anything over the network. */
function landscape(
    sky: [string, string],
    sun: string,
    hills: [string, string],
    width = 1200,
    height = 800,
) {
    return `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs><rect width="1200" height="800" fill="url(#sky)"/><circle cx="820" cy="380" r="90" fill="${sun}"/><path d="M0 520 C 240 420 420 450 620 520 S 1000 450 1200 500 V800 H0Z" fill="${hills[0]}"/><path d="M0 640 C 300 560 560 600 800 660 S 1100 620 1200 630 V800 H0Z" fill="${hills[1]}"/></svg>`,
    )}`;
}

const photos: LightboxImage[] = [
    {
        src: landscape(["#1e2a4a", "#c9a46b"], "#f4e3c1", ["#2b3a5c", "#141c30"]),
        alt: "Hills at dusk under a low sun",
        caption: "Dusk from the north ridge. Photo: Aoife Ní Bhriain.",
    },
    {
        src: landscape(["#8fb8de", "#e6eff7"], "#fff4cf", ["#7aa77f", "#46704f"]),
        alt: "Green hills under a pale midday sky",
        caption: "Midday on the same ridge, after the rain cleared.",
    },
    {
        src: landscape(["#f0a35e", "#fde7c4"], "#fff2d6", ["#8c5a3c", "#4a2e22"]),
        alt: "Hills at sunrise in orange light",
        caption: "Sunrise over the valley, from the bothy door.",
    },
    {
        src: landscape(["#2a2d3e", "#5b6a8a"], "#e9edf5", ["#39425c", "#1b1f2e"], 800, 1000),
        alt: "A tall view of the hills under a moonlit sky",
        caption: "Moonrise, shot upright. Photo: Oisín Murphy.",
    },
    {
        src: landscape(["#b0c9c0", "#eef3f0"], "#ffffff", ["#6b8f80", "#3f5e52"]),
        alt: "Hills under a flat grey sky, in mist",
        caption: "Mist on the last morning.",
    },
];

/** A grid of thumbnails. Click one to open it full screen, then swipe or use the arrows to see the rest. */
export function Gallery() {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);
    return (
        <>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: 8,
                    width: "100%",
                }}
            >
                {photos.map((photo, i) => (
                    <button
                        key={photo.alt}
                        type="button"
                        aria-label={`Open ${photo.alt}`}
                        onClick={() => {
                            setIndex(i);
                            setOpen(true);
                        }}
                        style={{
                            margin: 0,
                            border: 0,
                            padding: 0,
                            background: "none",
                            cursor: "zoom-in",
                            borderRadius: "var(--ow-radius-form)",
                        }}
                    >
                        <Image
                            src={photo.src}
                            alt=""
                            ratio={4 / 3}
                            radius="control"
                            style={{ width: "100%" }}
                        />
                    </button>
                ))}
            </div>
            <Lightbox
                open={open}
                onClose={() => setOpen(false)}
                images={photos}
                index={index}
                onIndexChange={setIndex}
            />
        </>
    );
}
Gallery.layout = { fill: true, align: "start" as const };

const dusk = photos[0] as LightboxImage;

/** One image with a caption: no arrows, no count, no strip. The caption names the dialog. */
export function Single() {
    const [open, setOpen] = useState(false);
    return (
        <Stack gap="sm" align="start">
            <Image
                src={dusk.src}
                alt={dusk.alt}
                ratio={3 / 2}
                radius="container"
                style={{ width: 320, maxWidth: "100%" }}
            />
            <Button onClick={() => setOpen(true)}>View full size</Button>
            <Lightbox open={open} onClose={() => setOpen(false)} images={[dusk]} />
        </Stack>
    );
}
Single.layout = { align: "start" as const };

/** Without the strip, going round and round, starting on the third image. */
export function Loop() {
    const [open, setOpen] = useState(false);
    return (
        <Stack gap="sm" align="start">
            <Text tone="muted">Five photos; Next from the last comes back to the first.</Text>
            <Button onClick={() => setOpen(true)}>Open the gallery</Button>
            <Lightbox
                open={open}
                onClose={() => setOpen(false)}
                images={photos}
                defaultIndex={2}
                thumbnails={false}
                loop
            />
        </Stack>
    );
}
Loop.layout = { align: "start" as const };
