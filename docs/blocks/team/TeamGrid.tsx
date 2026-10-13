import { Avatar, Link, SectionHeading, Text } from "@openwarelabs/ui";

import "./TeamGrid.css";

// Faces take one of three tones (brand, soft, ink), so a row of initials doesn't read as one shape repeated.
const people = [
    { name: "Maya Chen", role: "Co-founder and CEO", tone: "brand" },
    { name: "Jonas Berg", role: "Co-founder and CTO", tone: "soft" },
    { name: "Clara Novak", role: "Head of engineering", tone: "ink" },
    { name: "Aiko Tanaka", role: "Product designer", tone: "soft" },
    { name: "Tomás Reyes", role: "Product engineer", tone: "ink" },
    { name: "Sam Okafor", role: "Agent infrastructure", tone: "brand" },
    { name: "Lena Fischer", role: "Customer engineering", tone: "soft" },
    { name: "Omar Haddad", role: "Design engineer", tone: "brand" },
];

export function TeamGrid() {
    return (
        <section className="team-grid" aria-labelledby="team-grid-title">
            <div className="team-grid__inner">
                <SectionHeading
                    align="center"
                    eyebrow="Team"
                    title={<span id="team-grid-title">The people behind Acme</span>}
                    intro="Twenty-two of us in Dublin, Berlin and Lisbon, building the tools we wanted at our last jobs."
                />

                <ul className="team-grid__list">
                    {people.map((person) => (
                        <li key={person.name} className="team-grid__person" data-tone={person.tone}>
                            <Avatar name={person.name} size={96} className="team-grid__avatar" />
                            <Text variant="card-title" as="span" className="team-grid__name">
                                {person.name}
                            </Text>
                            <Text variant="body" as="span" tone="muted" className="team-grid__role">
                                {person.role}
                            </Text>
                        </li>
                    ))}
                </ul>

                <Text variant="copy" align="center" className="team-grid__hiring">
                    We're hiring for four roles in engineering and design. <Link href="#">See open roles</Link>
                </Text>
            </div>
        </section>
    );
}
