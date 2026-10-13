import type { ReactNode } from "react";

import { Button, Chip, Text } from "@openwarelabs/ui";
import { ArrowRight } from "lucide-react";

import "./HeroLogos.css";

// Invented companies, drawn as a simple shape and a name. Swap in your customers' logos (as SVGs, in one colour).
// Each name is lettered as its logo, so its type lives in the CSS rather than in a Text style.
const logos: Array<{ name: string; glyph: ReactNode }> = [
    {
        name: "Halcyon",
        glyph: (
            <>
                <path d="M4 12a6 6 0 0 1 12 0z" />
                <rect x="2" y="14" width="16" height="2.2" rx="1.1" />
            </>
        ),
    },
    {
        name: "Quarry",
        glyph: (
            <>
                <rect x="2.5" y="8.5" width="9" height="9" rx="1.6" />
                <rect x="8.5" y="2.5" width="9" height="9" rx="1.6" opacity="0.55" />
            </>
        ),
    },
    { name: "Basalt", glyph: <path d="M10 1.8l7.1 4.1v8.2L10 18.2l-7.1-4.1V5.9z" /> },
    {
        name: "Oakline",
        glyph: (
            <>
                <rect x="2.5" y="8" width="3.4" height="10" rx="1.7" />
                <rect x="8.3" y="2" width="3.4" height="16" rx="1.7" />
                <rect x="14.1" y="5.5" width="3.4" height="12.5" rx="1.7" />
            </>
        ),
    },
    { name: "Ferro", glyph: <path fillRule="evenodd" d="M10 1.5l8.5 8.5-8.5 8.5L1.5 10zm0 5.3L6.8 10l3.2 3.2 3.2-3.2z" /> },
    {
        name: "Lumen",
        glyph: (
            <>
                <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="2.4" />
                <circle cx="10" cy="10" r="2.6" />
            </>
        ),
    },
    { name: "Pinecrest", glyph: <path d="M10 1.5l5.2 6.5H4.8zM10 6.5l7 9.5H3z" /> },
    {
        name: "Cobalt",
        glyph: (
            <>
                <path d="M9 3a7 7 0 1 0 7 7H9z" />
                <rect x="11.5" y="1.5" width="7" height="7" rx="1.8" />
            </>
        ),
    },
];

export function HeroLogos() {
    return (
        <section className="hero-logos" aria-labelledby="hero-logos-title">
            <div className="hero-logos__inner">
                <div className="hero-logos__top">
                    <div className="hero-logos__heading">
                        <Chip>Acme 3.0 is out</Chip>
                        <Text variant="hero" id="hero-logos-title" className="hero-logos__title">
                            Ship more of what you plan
                        </Text>
                    </div>
                    <div>
                        <Text variant="lead">
                            Planning, agents, reviews and deploys in one quiet workspace, so a ticket turns into a release without anyone chasing it.
                        </Text>
                        <div className="hero-logos__actions">
                            <Button variant="primary" shape="pill" size="lg" endIcon={<ArrowRight size={16} />}>
                                Start for free
                            </Button>
                            <Button shape="pill" size="lg">
                                Talk to sales
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="hero-logos__proof">
                    <Text tone="muted" id="hero-logos-proof">
                        These teams ship with Acme every day
                    </Text>
                    <ul className="hero-logos__list" aria-labelledby="hero-logos-proof">
                        {logos.map((logo) => (
                            <li key={logo.name} className="hero-logos__logo" data-name={logo.name}>
                                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    {logo.glyph}
                                </svg>
                                {logo.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
