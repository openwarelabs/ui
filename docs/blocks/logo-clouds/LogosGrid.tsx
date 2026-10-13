import type { ReactNode } from "react";

import { Link, SectionHeading, Text } from "@openwarelabs/ui";
import { ArrowRight } from "lucide-react";

import "./LogosGrid.css";

// Invented companies, drawn as a simple shape and a name. Swap in your customers' logos (as SVGs, in one colour).
const logos: Array<{ name: string; slug: string; glyph: ReactNode }> = [
    {
        name: "Halcyon",
        slug: "halcyon",
        glyph: (
            <>
                <path d="M4 12a6 6 0 0 1 12 0z" />
                <rect x="2" y="14" width="16" height="2.2" rx="1.1" />
            </>
        ),
    },
    {
        name: "Quarry",
        slug: "quarry",
        glyph: (
            <>
                <rect x="2.5" y="8.5" width="9" height="9" rx="1.6" />
                <rect x="8.5" y="2.5" width="9" height="9" rx="1.6" opacity="0.55" />
            </>
        ),
    },
    { name: "Basalt", slug: "basalt", glyph: <path d="M10 1.8l7.1 4.1v8.2L10 18.2l-7.1-4.1V5.9z" /> },
    {
        name: "Oakline",
        slug: "oakline",
        glyph: (
            <>
                <rect x="2.5" y="8" width="3.4" height="10" rx="1.7" />
                <rect x="8.3" y="2" width="3.4" height="16" rx="1.7" />
                <rect x="14.1" y="5.5" width="3.4" height="12.5" rx="1.7" />
            </>
        ),
    },
    { name: "Ferro", slug: "ferro", glyph: <path fillRule="evenodd" d="M10 1.5l8.5 8.5-8.5 8.5L1.5 10zm0 5.3L6.8 10l3.2 3.2 3.2-3.2z" /> },
    {
        name: "Lumen",
        slug: "lumen",
        glyph: (
            <>
                <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="2.4" />
                <circle cx="10" cy="10" r="2.6" />
            </>
        ),
    },
    { name: "Pinecrest", slug: "pinecrest", glyph: <path d="M10 1.5l5.2 6.5H4.8zM10 6.5l7 9.5H3z" /> },
    {
        name: "Cobalt",
        slug: "cobalt",
        glyph: (
            <>
                <path d="M9 3a7 7 0 1 0 7 7H9z" />
                <rect x="11.5" y="1.5" width="7" height="7" rx="1.8" />
            </>
        ),
    },
];

export function LogosGrid() {
    return (
        <section className="logos-grid" aria-labelledby="logos-grid-title">
            <div className="logos-grid__inner">
                <SectionHeading
                    align="center"
                    eyebrow="Customers"
                    title={<span id="logos-grid-title">From small studios to public companies</span>}
                    intro="Teams of every size plan, review and ship their software on Acme. Each of these has a story about how."
                />
                <ul className="logos-grid__tiles">
                    {logos.map((logo) => (
                        <li key={logo.name}>
                            <Link href={`#customers/${logo.slug}`} variant="standalone" className="logos-grid__tile">
                                <span className="logos-grid__logo" data-name={logo.name}>
                                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        {logo.glyph}
                                    </svg>
                                    {logo.name}
                                </span>
                                <Text variant="caption" className="logos-grid__more">
                                    Read the story
                                    <ArrowRight size={13} aria-hidden="true" />
                                </Text>
                            </Link>
                        </li>
                    ))}
                </ul>
                <Text variant="body" tone="muted" align="center" className="logos-grid__footer">
                    <Link href="#customers">See all 40 customer stories</Link>
                </Text>
            </div>
        </section>
    );
}
