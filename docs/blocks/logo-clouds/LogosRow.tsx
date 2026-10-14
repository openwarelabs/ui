import type { ReactNode } from "react";

import { Logos01 } from "@openwarelabs/blocks";

import "./LogosRow.css";

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
];

export function LogosRow() {
    return (
        <Logos01
            title="Trusted by more than 4,000 software teams"
            logos={logos.map((logo) => ({
                name: logo.name,
                logo: (
                    <span className="logos-row__logo" data-name={logo.name}>
                        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            {logo.glyph}
                        </svg>
                        {logo.name}
                    </span>
                ),
            }))}
        />
    );
}
