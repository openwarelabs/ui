import { useState, type ReactNode } from "react";

import { Button, Tooltip } from "@openwarelabs/ui";
import { Pause, Play } from "lucide-react";

import "./LogosMarquee.css";

// Invented companies, drawn as a simple shape and a name. Swap in your customers' logos (as SVGs, in one colour).
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

function LogoList({ copy = false }: { copy?: boolean }) {
    return (
        <ul className={copy ? "logos-marquee__list logos-marquee__list--copy" : "logos-marquee__list"} aria-hidden={copy || undefined}>
            {logos.map((logo) => (
                <li key={logo.name} className="logos-marquee__logo" data-name={logo.name}>
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        {logo.glyph}
                    </svg>
                    {logo.name}
                </li>
            ))}
        </ul>
    );
}

export function LogosMarquee() {
    const [paused, setPaused] = useState(false);

    return (
        <section className="logos-marquee" aria-labelledby="logos-marquee-title" data-paused={paused || undefined}>
            <div className="logos-marquee__head">
                <h2 id="logos-marquee-title" className="logos-marquee__title">
                    Teams that ship with Acme
                </h2>
                {/* Moving content needs a way to stop it for good; hover and focus only hold it still for a moment. */}
                <Tooltip label={paused ? "Play the logos" : "Pause the logos"}>
                    <Button
                        className="logos-marquee__toggle"
                        variant="ghost"
                        size="sm"
                        iconOnly
                        aria-label={paused ? "Play the logos" : "Pause the logos"}
                        onClick={() => setPaused((value) => !value)}
                    >
                        {paused ? <Play size={14} /> : <Pause size={14} />}
                    </Button>
                </Tooltip>
            </div>
            {/* Focusable, so a keyboard can hold it still too. */}
            <div className="logos-marquee__viewport" role="region" aria-label="Customer logos" tabIndex={0}>
                <div className="logos-marquee__track">
                    <LogoList />
                    <LogoList copy />
                </div>
            </div>
        </section>
    );
}
