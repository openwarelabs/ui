import type { ReactNode } from "react";

import { Testimonial03 } from "@openwarelabs/blocks";

import "./TestimonialLogo.css";

/* Invented companies, each drawn as a simple shape beside its name. Swap in your customers' real logos. */
const glyphs: Record<string, ReactNode> = {
    Halcyon: (
        <>
            <path d="M3 15a9 9 0 0 1 18 0Z" />
            <rect x="3" y="18" width="18" height="2.5" rx="1.25" />
        </>
    ),
    Quarry: (
        <>
            <rect x="3" y="14" width="18" height="6" rx="1.5" />
            <rect x="6" y="8" width="12" height="5" rx="1.5" />
            <rect x="9" y="3" width="6" height="4" rx="1.5" />
        </>
    ),
    Lumen: (
        <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19Zm0 2.5a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z" />
        </>
    ),
    Pinecrest: <path d="M2 20 9 7l4 7 3-5 6 11Z" />,
};

function Wordmark({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
    return (
        <span className={`testimonial-logo__wordmark testimonial-logo__wordmark--${size}`}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {glyphs[name]}
            </svg>
            <span className="testimonial-logo__wordmark-name">{name}</span>
        </span>
    );
}

const stories = [
    {
        company: "Halcyon",
        about: "Payments infrastructure for marketplaces across Europe.",
        facts: [
            { label: "Engineers", value: "140" },
            { label: "Deploys a week", value: "310 → 1,120" },
            { label: "On Acme since", value: "2024" },
        ],
        quote: "We used to batch releases on Thursdays because review was the bottleneck. Now agents clear the routine changes overnight, and our engineers spend their mornings on the work only they can do.",
        name: "Fionn Gallagher",
        jobTitle: "Lead developer",
    },
    {
        company: "Quarry",
        about: "Accounting software for small firms in the Nordics.",
        facts: [
            { label: "Engineers", value: "38" },
            { label: "Median review", value: "5 h → 40 min" },
            { label: "On Acme since", value: "2025" },
        ],
        quote: "Our auditors ask who approved every change to the ledger. With Acme the answer is one click away, whether a person or an agent made it.",
        name: "Oisín Duffy",
        jobTitle: "Staff engineer",
    },
    {
        company: "Lumen",
        about: "A design tool for print and packaging teams.",
        facts: [
            { label: "Engineers", value: "22" },
            { label: "Agent runs a month", value: "2,400" },
            { label: "On Acme since", value: "2025" },
        ],
        quote: "Every branch has a preview, so our designers review the real thing instead of a screenshot. Half our feedback now arrives before the pull request is even marked ready.",
        name: "Orla MacNamara",
        jobTitle: "Product engineer",
    },
    {
        company: "Pinecrest",
        about: "Booking software for clinics and their patients.",
        facts: [
            { label: "Engineers", value: "210" },
            { label: "Rollbacks", value: "Under a minute" },
            { label: "On Acme since", value: "2023" },
        ],
        quote: "Required reviews apply to agents exactly as they do to people. That one setting is what got Acme through our security review.",
        name: "Padraig Kavanagh",
        jobTitle: "Head of platform",
    },
];

export function TestimonialLogo() {
    return (
        <Testimonial03
            eyebrow="Customer stories"
            title="Why teams move to Acme"
            stories={stories.map((story) => ({
                ...story,
                jobTitle: `${story.jobTitle}, ${story.company}`,
                logo: <Wordmark name={story.company} />,
                largeLogo: <Wordmark name={story.company} size="lg" />,
            }))}
            note="Sample quotes. The companies and people are invented."
        />
    );
}
