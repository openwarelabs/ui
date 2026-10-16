import { Team02, type Team02Person } from "@openwarelabs/blocks";

const people: Team02Person[] = [
    {
        name: "Siobhan Murphy",
        jobTitle: "Co-founder and CEO",
        location: "Dublin",
        bio: "Spends most days with customers, and still writes every release note herself.",
        email: "siobhan@example.com",
        website: "#",
    },
    {
        name: "Declan Walsh",
        jobTitle: "Co-founder and CTO",
        location: "Berlin",
        bio: "Built the first agent runner over a weekend. Now keeps it fast, cheap and safe.",
        email: "declan@example.com",
        website: "#",
    },
    {
        name: "Aoife O'Sullivan",
        jobTitle: "Head of engineering",
        location: "Lisbon",
        bio: "Runs the team behind reviews and deploys, which ship about forty changes a day.",
        email: "aoife@example.com",
        website: "#",
    },
    {
        name: "Niamh Byrne",
        jobTitle: "Product designer",
        location: "Lisbon",
        bio: "Designs the screens you spend your day in, starting with what the keyboard can do.",
        email: "niamh@example.com",
        website: "#",
    },
    {
        name: "Seán McCarthy",
        jobTitle: "Agent infrastructure",
        location: "Dublin",
        bio: "Looks after the sandboxes agents work in, and the limits that keep them there.",
        email: "sean@example.com",
        website: "#",
    },
    {
        name: "Róisín O'Brien",
        jobTitle: "Customer engineering",
        location: "Berlin",
        bio: "Moves teams over from other tools, history and all, usually within a week.",
        email: "roisin@example.com",
        website: "#",
    },
];

export function TeamCards() {
    return (
        <Team02
            eyebrow="Team"
            title="Who you'll be working with"
            description="A small team, so you'll likely talk to the person who built the thing you're asking about."
            people={people}
        />
    );
}
