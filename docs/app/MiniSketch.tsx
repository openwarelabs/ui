import type { CSSProperties, ReactNode } from "react";

import type { SketchKind } from "./blocks";

/*
 * The blocks sidebar's thumbnails: each category drawn as a 28×20 tile, its 22×14 inside built from 2px bars,
 * 4px boxes and dots in tints of the text colour, so it follows the theme. Only the category kinds appear here;
 * a variant's own sketch kind falls back to its category's.
 */

type Size = { w?: number | string; h?: number };

/** A line of text: light, or strong for a title or a button. */
const Bar = ({ w = 10, h = 2, strong = false }: Size & { strong?: boolean }) => (
    <span className={strong ? "mini-strong" : "mini-ink"} style={{ width: w, height: h }} />
);

/** An outlined box: a field, a card, an image. */
const Box = ({ w = 6, h = 4 }: Size) => <span className="mini-box" style={{ width: w, height: h }} />;

/** A solid block: a primary button, a highlighted card, a figure. */
const Fill = ({ w = 6, h = 4, round = false }: Size & { round?: boolean }) => (
    <span className={round ? "mini-strong mini-round" : "mini-strong mini-square"} style={{ width: w, height: h }} />
);

/** An avatar or a status dot. */
const Dot = ({ size = 4, outline = false }: { size?: number; outline?: boolean }) => (
    <span className={outline ? "mini-box mini-round" : "mini-strong mini-round"} style={{ width: size, height: size }} />
);

const Rule = () => <span className="mini-rule" />;

function Stack({
    row = false,
    gap = 2,
    align,
    justify,
    style,
    children,
}: {
    row?: boolean;
    gap?: number;
    align?: CSSProperties["alignItems"];
    justify?: CSSProperties["justifyContent"];
    style?: CSSProperties;
    children: ReactNode;
}) {
    return (
        <span style={{ display: "flex", flexDirection: row ? "row" : "column", gap, alignItems: align, justifyContent: justify, ...style }}>{children}</span>
    );
}

const Row = (props: Parameters<typeof Stack>[0]) => <Stack row {...props} />;

const full = { width: "100%" } as const;
const fill = { flex: 1, minWidth: 0 } as const;

const minis: Partial<Record<SketchKind, () => ReactNode>> = {
    header: () => (
        <Stack style={full}>
            <Row justify="space-between" align="center">
                <Fill w={4} h={4} />
                <Bar w={8} />
                <Fill w={6} h={4} round />
            </Row>
            <Rule />
        </Stack>
    ),
    hero: () => (
        <Stack align="center" justify="center" style={full}>
            <Bar w={16} h={4} strong />
            <Bar w={10} />
            <Row>
                <Fill w={6} h={4} round />
                <Box w={6} h={4} />
            </Row>
        </Stack>
    ),
    "section-heading": () => (
        <Stack justify="center">
            <Bar w={6} />
            <Bar w={14} h={4} strong />
            <Bar w={18} />
        </Stack>
    ),
    features: () => (
        <Row align="center" justify="space-between" style={full}>
            {[0, 1, 2].map((key) => (
                <Stack key={key} style={{ width: 6 }}>
                    <Fill w={4} h={4} />
                    <Bar w={6} strong />
                    <Bar w={4} />
                </Stack>
            ))}
        </Row>
    ),
    logos: () => (
        <Stack align="center" justify="center" style={full}>
            <Bar w={10} />
            <Row>
                {[0, 1, 2, 3].map((key) => (
                    <Fill key={key} w={4} h={4} />
                ))}
            </Row>
            <Row>
                {[0, 1, 2].map((key) => (
                    <Fill key={key} w={4} h={4} />
                ))}
            </Row>
        </Stack>
    ),
    stats: () => (
        <Stack justify="center" style={full}>
            <Rule />
            <Row justify="space-between">
                {[0, 1, 2].map((key) => (
                    <Stack key={key} align="center" style={{ width: 6 }}>
                        <Fill w={6} h={4} round />
                        <Bar w={4} />
                    </Stack>
                ))}
            </Row>
            <Rule />
        </Stack>
    ),
    testimonials: () => (
        <Stack justify="center">
            <Bar w={18} strong />
            <Bar w={14} strong />
            <Row align="center">
                <Dot />
                <Bar w={6} />
            </Row>
        </Stack>
    ),
    pricing: () => (
        <Row align="center" justify="center" style={full}>
            <Box w={6} h={12} />
            <Fill w={6} h={14} />
            <Box w={6} h={12} />
        </Row>
    ),
    faq: () => (
        <Stack justify="center" style={full}>
            {[14, 12, 14, 10].map((width, key) => (
                <Row key={key} justify="space-between" align="center">
                    <Bar w={width} />
                    <Fill w={2} h={2} />
                </Row>
            ))}
        </Stack>
    ),
    cta: () => (
        <Stack justify="center" style={full}>
            <span className="mini-strong mini-square mini-plate">
                <span className="mini-on-plate" style={{ width: 10, height: 2 }} />
                <span className="mini-on-plate mini-round" style={{ width: 6, height: 4 }} />
            </span>
        </Stack>
    ),
    newsletter: () => (
        <Stack align="center" justify="center" style={full}>
            <Bar w={12} strong />
            <Bar w={8} />
            <Row>
                <Box w={12} h={4} />
                <Fill w={4} h={4} />
            </Row>
        </Stack>
    ),
    blog: () => (
        <Row align="center" justify="center" style={full}>
            {[0, 1].map((key) => (
                <Stack key={key} style={{ width: 10 }}>
                    <Box w={10} h={6} />
                    <Bar w={8} strong />
                    <Bar w={6} />
                </Stack>
            ))}
        </Row>
    ),
    team: () => (
        <Row align="center" justify="center" style={full}>
            {[0, 1, 2].map((key) => (
                <Stack key={key} align="center" style={{ width: 6 }}>
                    <Dot size={6} />
                    <Bar w={6} />
                </Stack>
            ))}
        </Row>
    ),
    contact: () => (
        <Row align="center" style={full}>
            <Stack style={{ width: 8 }}>
                <Bar w={8} strong />
                <Bar w={6} />
                <Bar w={8} />
            </Stack>
            <Stack style={fill}>
                <Box w="100%" h={4} />
                <Box w="100%" h={4} />
                <Bar w={6} strong />
            </Stack>
        </Row>
    ),
    footer: () => (
        <Stack justify="flex-end" style={full}>
            <Rule />
            <Row justify="space-between">
                {[0, 1, 2, 3].map((key) => (
                    <Stack key={key} style={{ width: 4 }}>
                        <Bar w={4} strong />
                        <Bar w={key % 2 ? 2 : 4} />
                        <Bar w={key % 2 ? 4 : 2} />
                    </Stack>
                ))}
            </Row>
        </Stack>
    ),
    shell: () => (
        <Row style={full}>
            <Box w={6} h={14} />
            <Stack style={fill}>
                <Bar w={10} strong />
                <Box w="100%" h={4} />
                <Box w="100%" h={4} />
            </Stack>
        </Row>
    ),
    "page-heading": () => (
        <Stack justify="center" style={full}>
            <Row justify="space-between" align="center">
                <Bar w={10} h={4} strong />
                <Fill w={6} h={4} round />
            </Row>
            <Bar w={14} />
            <Rule />
        </Stack>
    ),
    dashboard: () => (
        <Stack justify="center" style={full}>
            <Row justify="space-between">
                {[0, 1, 2].map((key) => (
                    <Box key={key} w={6} h={4} />
                ))}
            </Row>
            <Row align="flex-end" justify="space-between" style={{ height: 8 }}>
                {[4, 6, 4, 8, 6, 8].map((height, key) => (
                    <Fill key={key} w={2} h={height} />
                ))}
            </Row>
        </Stack>
    ),
    table: () => (
        <Stack justify="center" style={full}>
            <Bar w="100%" strong />
            {[12, 10, 14].map((width, key) => (
                <Row key={key} justify="space-between">
                    <Bar w={width} />
                    <Bar w={4} />
                </Row>
            ))}
        </Stack>
    ),
    form: () => (
        <Stack justify="center" style={full}>
            <Bar w={6} />
            <Box w="100%" h={4} />
            <Row>
                <Box w={14} h={4} />
                <Fill w={6} h={4} round />
            </Row>
        </Stack>
    ),
    settings: () => (
        <Row style={full}>
            <Stack style={{ width: 5 }}>
                <Bar w={5} strong />
                <Bar w={5} />
                <Bar w={5} />
            </Stack>
            <Stack style={fill}>
                {[8, 10, 6].map((width, key) => (
                    <Row key={key} justify="space-between" align="center">
                        <Bar w={width} />
                        <Fill w={6} h={4} round />
                    </Row>
                ))}
            </Stack>
        </Row>
    ),
    auth: () => (
        <Stack align="center" justify="center" style={full}>
            <Fill w={4} h={4} />
            <Box w={12} h={4} />
            <Bar w={12} strong />
        </Stack>
    ),
    onboarding: () => (
        <Stack justify="center" style={full}>
            <Row gap={0}>
                <Bar w={12} strong />
                <Bar w={10} />
            </Row>
            <Row align="center">
                <Dot />
                <Bar w={10} />
            </Row>
            <Row align="center">
                <Dot outline />
                <Bar w={12} />
            </Row>
        </Stack>
    ),
    empty: () => (
        <Stack align="center" justify="center" style={full}>
            <Dot size={6} outline />
            <Bar w={10} />
            <Bar w={6} strong />
        </Stack>
    ),
    error: () => (
        <Stack align="center" justify="center" style={full}>
            <Row>
                <Fill w={4} h={6} />
                <Fill w={4} h={6} />
                <Fill w={4} h={6} />
            </Row>
            <Bar w={10} />
            <Bar w={6} strong />
        </Stack>
    ),
    notifications: () => (
        <Stack justify="center" style={full}>
            <Bar w={8} strong />
            <Row align="center">
                <Dot />
                <Bar w={12} />
            </Row>
            <Row align="center">
                <Dot outline />
                <Bar w={14} />
            </Row>
        </Stack>
    ),
    chat: () => (
        <Stack justify="center" style={full}>
            <Row>
                <Box w={12} h={4} />
            </Row>
            <Row justify="flex-end">
                <Fill w={10} h={4} round />
            </Row>
            <Row>
                <Box w={14} h={2} />
            </Row>
        </Stack>
    ),
};

/** A category's thumbnail for the blocks sidebar. */
export function MiniSketch({ kind, current = false }: { kind: SketchKind; current?: boolean }) {
    const draw = minis[kind];
    return (
        <span className={current ? "mini mini--current" : "mini"} aria-hidden="true">
            {draw ? draw() : <Bar w={14} />}
        </span>
    );
}
