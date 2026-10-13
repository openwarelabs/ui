import { Badge, Card, SectionHeading, Text, User } from "@openwarelabs/ui";

import "./TestimonialGrid.css";

const quotes: Array<{ name: string; role: string; quote: string; short?: boolean }> = [
    {
        name: "Daniel Osei",
        role: "Staff engineer, Quarry",
        quote: "The agents are the first automation I've trusted near our payments code. Every step is written down, and when a test fails twice it stops and asks instead of guessing.",
    },
    {
        name: "Hana Sato",
        role: "Product engineer, Lumen",
        quote: "⌘K for everything. I haven't opened the sidebar in months.",
        short: true,
    },
    {
        name: "Marta Kowalska",
        role: "Engineering manager, Oakline",
        quote: "We moved four teams over in a week. The import kept every issue, comment and link, so nobody lost the history behind a decision.",
    },
    {
        name: "Felix Wagner",
        role: "Head of platform, Pinecrest",
        quote: "Required reviews apply to agents as well as people. That's what got Acme past our security team, and the audit log did the rest.",
    },
    {
        name: "Nadia Rahman",
        role: "Founder, Cobalt",
        quote: "We're five people, so the free plan covers us. It's like having a sixth who only does the chores.",
        short: true,
    },
    {
        name: "Owen Gallagher",
        role: "Lead developer, Halcyon",
        quote: "Rolling back takes one click and no rebuild. We've needed it twice this year, and knowing it's there is why we're happy to ship on a Friday.",
    },
];

export function TestimonialGrid() {
    return (
        <section className="testimonial-grid" aria-labelledby="testimonial-grid-title">
            <div className="testimonial-grid__inner">
                <div className="testimonial-grid__header">
                    <SectionHeading
                        eyebrow="Customers"
                        title={<span id="testimonial-grid-title">Teams that ship with Acme</span>}
                        intro="From five-person start-ups to platform teams of two hundred, in their own words."
                    />
                    <Badge size="sm" className="testimonial-grid__sample">
                        Sample quotes
                    </Badge>
                </div>

                <ul className="testimonial-grid__list">
                    {quotes.map((item) => (
                        <li key={item.name} className="testimonial-grid__item">
                            <Card padding="lg" className="testimonial-grid__card">
                                <figure className="testimonial-grid__figure">
                                    <blockquote className="testimonial-grid__quote">
                                        {/* Short quotes read as headlines. */}
                                        <Text as="p" variant={item.short ? "heading" : "copy"} tone={item.short ? "default" : "soft"}>
                                            {item.quote}
                                        </Text>
                                    </blockquote>
                                    <figcaption>
                                        <User name={item.name} description={item.role} />
                                    </figcaption>
                                </figure>
                            </Card>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
