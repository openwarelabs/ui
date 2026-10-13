import { Avatar, Card, SectionHeading, Text, buttonClassName } from "@openwarelabs/ui";
import { Link as LinkIcon, Mail, MapPin } from "lucide-react";

import "./TeamCards.css";

const people = [
    {
        name: "Maya Chen",
        role: "Co-founder and CEO",
        place: "Dublin",
        about: "Spends most days with customers, and still writes every release note herself.",
        email: "maya@example.com",
    },
    {
        name: "Jonas Berg",
        role: "Co-founder and CTO",
        place: "Berlin",
        about: "Built the first agent runner over a weekend. Now keeps it fast, cheap and safe.",
        email: "jonas@example.com",
    },
    {
        name: "Clara Novak",
        role: "Head of engineering",
        place: "Lisbon",
        about: "Runs the team behind reviews and deploys, which ship about forty changes a day.",
        email: "clara@example.com",
    },
    {
        name: "Aiko Tanaka",
        role: "Product designer",
        place: "Lisbon",
        about: "Designs the screens you spend your day in, starting with what the keyboard can do.",
        email: "aiko@example.com",
    },
    {
        name: "Sam Okafor",
        role: "Agent infrastructure",
        place: "Dublin",
        about: "Looks after the sandboxes agents work in, and the limits that keep them there.",
        email: "sam@example.com",
    },
    {
        name: "Lena Fischer",
        role: "Customer engineering",
        place: "Berlin",
        about: "Moves teams over from other tools, history and all, usually within a week.",
        email: "lena@example.com",
    },
];

export function TeamCards() {
    return (
        <section className="team-cards" aria-labelledby="team-cards-title">
            <div className="team-cards__inner">
                <SectionHeading
                    eyebrow="Team"
                    title={<span id="team-cards-title">Who you'll be working with</span>}
                    intro="A small team, so you'll likely talk to the person who built the thing you're asking about."
                />

                <ul className="team-cards__list">
                    {people.map((person) => (
                        <li key={person.name}>
                            <Card padding="lg" className="team-cards__card">
                                <div className="team-cards__head">
                                    <Avatar name={person.name} size={56} />
                                    <div className="team-cards__who">
                                        <Text variant="card-title">{person.name}</Text>
                                        <Text variant="body" tone="muted" className="team-cards__role">
                                            {person.role}
                                        </Text>
                                    </div>
                                </div>
                                <Text variant="copy" tone="soft" className="team-cards__about">
                                    {person.about}
                                </Text>
                                <div className="team-cards__foot">
                                    <Text variant="caption" className="team-cards__place">
                                        <MapPin size={14} aria-hidden="true" />
                                        {person.place}
                                    </Text>
                                    <span className="team-cards__links">
                                        <a
                                            href={`mailto:${person.email}`}
                                            className={buttonClassName({ variant: "ghost", size: "sm", iconOnly: true })}
                                            aria-label={`Email ${person.name}`}
                                        >
                                            <Mail size={16} />
                                        </a>
                                        <a
                                            href="#"
                                            className={buttonClassName({ variant: "ghost", size: "sm", iconOnly: true })}
                                            aria-label={`${person.name}'s website`}
                                        >
                                            <LinkIcon size={16} />
                                        </a>
                                    </span>
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
