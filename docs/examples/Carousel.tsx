import { useState, type CSSProperties } from "react";

import { Button, Card, Carousel, CarouselSlide, Stack, Text, User } from "@openwarelabs/ui";
import { ArrowRight } from "lucide-react";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Carousel",
    category: "Data display",
    description:
        "Slides in a row that scroll and snap into place, with previous and next buttons, dots and arrow keys. For a gallery, quotes or a few featured things; when people need to compare items, show them all in a grid instead.",
    source: "components/Carousel/Carousel.tsx",
    imports: ["Carousel", "CarouselSlide"],
    props: ["CarouselProps", "CarouselSlideProps"],
    keyboard: [
        ["Tab", "Moves to the buttons, then to the slides, then to the dots."],
        ["Left or Right", "With the slides focused, goes to the previous or next slide."],
        ["Home or End", "With the slides focused, goes to the first or last slide."],
    ],
    notes: [
        "It's a section with the role description carousel, named by label. Each slide is a group with the role description slide, named by its place (“2 of 5”).",
        "It's the browser's own scrolling with scroll-snap, so it follows a finger, a trackpad or a mouse wheel exactly, and needs no library.",
        "When another slide comes to rest, screen readers hear “Slide 2 of 5”. While it plays by itself that's turned off, so it doesn't talk over people.",
        "Autoplay waits while the pointer is over it or focus is in it, has a button to pause (WCAG 2.2.2), and starts paused when the system asks for reduced motion.",
        "With several slides in view, the dots stand for each place it can rest, so there are fewer dots than slides.",
        "To show more slides on wider screens, leave out slidesPerView and set --ow-carousel-per-view in your own CSS, in a media or container query.",
    ],
    related: ["Card", "ScrollShadow", "Pagination"],
    since: "0.14.0",
};

const panel = ([from, to]: readonly [string, string]): CSSProperties => ({
    aspectRatio: "16 / 9",
    borderRadius: "var(--ow-radius-container)",
    background: `linear-gradient(135deg, var(${from}), var(${to}))`,
});

const photos = [
    { title: "Harbour at dawn", colours: ["--ow-chart-1", "--ow-chart-7"] },
    { title: "Orchard in autumn", colours: ["--ow-chart-2", "--ow-chart-4"] },
    { title: "Fields after rain", colours: ["--ow-chart-3", "--ow-chart-6"] },
    { title: "Evening on the pier", colours: ["--ow-chart-5", "--ow-chart-1"] },
    { title: "Lighthouse", colours: ["--ow-chart-7", "--ow-chart-3"] },
] as const;

/** A gallery, one picture at a time, with its caption underneath. */
export function Gallery() {
    return (
        <Carousel label="Photos from the trip" style={{ width: "100%", maxWidth: 560 }}>
            {photos.map((photo) => (
                <CarouselSlide key={photo.title}>
                    <Stack gap="xs">
                        <div role="img" aria-label={photo.title} style={panel(photo.colours)} />
                        <Text variant="caption" tone="muted">
                            {photo.title}
                        </Text>
                    </Stack>
                </CarouselSlide>
            ))}
        </Carousel>
    );
}
Gallery.layout = { fill: true };

const quotes = [
    { name: "Priya Shah", role: "Design lead, Northwind", quote: "We replaced three home-made carousels with this one, and they finally all behave the same." },
    { name: "Tom Becker", role: "Engineer, Lumen", quote: "Swiping feels right on a phone because it's just scrolling. Nothing to tune." },
    { name: "Ana Lima", role: "Product manager, Kite", quote: "The pause button and the keys meant accessibility signed it off first time." },
    { name: "Sam Okafor", role: "Founder, Tidy", quote: "Took ten minutes to put our customer quotes on the home page." },
    { name: "Mei Chen", role: "Frontend developer, Orbit", quote: "It follows the theme and the brand colour without a single override." },
];

/** Quotes, two in view at once, with the buttons outside the cards. */
export function Testimonials() {
    return (
        <Carousel label="What customers say" slidesPerView={2} arrows="outside" style={{ width: "100%" }}>
            {quotes.map((item) => (
                <CarouselSlide key={item.name} style={{ display: "flex" }}>
                    <Card padding="lg" style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
                        <Text variant="copy" style={{ flex: 1 }}>
                            “{item.quote}”
                        </Text>
                        <User name={item.name} description={item.role} />
                    </Card>
                </CarouselSlide>
            ))}
        </Carousel>
    );
}
Testimonials.layout = { fill: true };

const features = [
    { title: "Ship on Fridays again", text: "Previews for every branch, checks that run in parallel, and rollbacks in one click." },
    { title: "Everyone sees the same thing", text: "Comments, reviews and deploys in one place, as they happen." },
    { title: "Pay for what you use", text: "No seats to count. Every plan starts free and grows with you." },
];

/** A hero that moves on every six seconds, round and round, with a button to pause it. */
export function Autoplay() {
    return (
        <Carousel label="What's new" autoplay={6000} loop indicators={false} style={{ width: "100%" }}>
            {features.map((feature) => (
                <CarouselSlide key={feature.title}>
                    <div
                        style={{
                            minHeight: 220,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            gap: 12,
                            padding: "32px 64px",
                            borderRadius: "var(--ow-radius-container)",
                            background: "linear-gradient(135deg, var(--ow-brand-800), var(--ow-brand-600))",
                            color: "var(--ow-brand-50)",
                        }}
                    >
                        <Text variant="section-title" style={{ color: "inherit" }}>
                            {feature.title}
                        </Text>
                        <Text variant="copy" style={{ color: "inherit", maxWidth: 440 }}>
                            {feature.text}
                        </Text>
                    </div>
                </CarouselSlide>
            ))}
        </Carousel>
    );
}
Autoplay.layout = { fill: true };

/** Controlled, centred, with the next and previous slides peeking in and your own buttons to jump. */
export function Controlled() {
    const [index, setIndex] = useState(0);
    return (
        <Stack gap="md" style={{ width: "100%" }}>
            <Carousel label="Colours" slidesPerView={1.5} align="center" gap="sm" loop index={index} onIndexChange={setIndex} indicators={false}>
                {photos.map((photo) => (
                    <CarouselSlide key={photo.title} label={photo.title}>
                        <div style={panel(photo.colours)} />
                    </CarouselSlide>
                ))}
            </Carousel>
            <Stack direction="row" gap="sm" align="center" justify="between" wrap>
                <Text variant="body" tone="muted">
                    {photos[index]?.title}, {index + 1} of {photos.length}
                </Text>
                <Button size="sm" endIcon={<ArrowRight size={16} />} onClick={() => setIndex(photos.length - 1)}>
                    Go to the last
                </Button>
            </Stack>
        </Stack>
    );
}
Controlled.layout = { fill: true };
