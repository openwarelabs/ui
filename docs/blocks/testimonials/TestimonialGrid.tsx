import { Testimonial02, type Testimonial02Quote } from "@openwarelabs/blocks";

const quotes: Testimonial02Quote[] = [
    {
        name: "Daniel Osei",
        jobTitle: "Staff engineer, Quarry",
        quote: "The agents are the first automation I've trusted near our payments code. Every step is written down, and when a test fails twice it stops and asks instead of guessing.",
    },
    {
        name: "Hana Sato",
        jobTitle: "Product engineer, Lumen",
        quote: "⌘K for everything. I haven't opened the sidebar in months.",
        short: true,
    },
    {
        name: "Marta Kowalska",
        jobTitle: "Engineering manager, Oakline",
        quote: "We moved four teams over in a week. The import kept every issue, comment and link, so nobody lost the history behind a decision.",
    },
    {
        name: "Felix Wagner",
        jobTitle: "Head of platform, Pinecrest",
        quote: "Required reviews apply to agents as well as people. That's what got Acme past our security team, and the audit log did the rest.",
    },
    {
        name: "Nadia Rahman",
        jobTitle: "Founder, Cobalt",
        quote: "We're five people, so the free plan covers us. It's like having a sixth who only does the chores.",
        short: true,
    },
    {
        name: "Owen Gallagher",
        jobTitle: "Lead developer, Halcyon",
        quote: "Rolling back takes one click and no rebuild. We've needed it twice this year, and knowing it's there is why we're happy to ship on a Friday.",
    },
];

export function TestimonialGrid() {
    return (
        <Testimonial02
            eyebrow="Customers"
            title="Teams that ship with Acme"
            description="From five-person start-ups to platform teams of two hundred, in their own words."
            badge="Sample quotes"
            quotes={quotes}
        />
    );
}
