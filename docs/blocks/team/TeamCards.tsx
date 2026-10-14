import { Team02, type Team02Person } from "@openwarelabs/blocks";

const people: Team02Person[] = [
    {
        name: "Maya Chen",
        jobTitle: "Co-founder and CEO",
        location: "Dublin",
        bio: "Spends most days with customers, and still writes every release note herself.",
        email: "maya@example.com",
        website: "#",
    },
    {
        name: "Jonas Berg",
        jobTitle: "Co-founder and CTO",
        location: "Berlin",
        bio: "Built the first agent runner over a weekend. Now keeps it fast, cheap and safe.",
        email: "jonas@example.com",
        website: "#",
    },
    {
        name: "Clara Novak",
        jobTitle: "Head of engineering",
        location: "Lisbon",
        bio: "Runs the team behind reviews and deploys, which ship about forty changes a day.",
        email: "clara@example.com",
        website: "#",
    },
    {
        name: "Aiko Tanaka",
        jobTitle: "Product designer",
        location: "Lisbon",
        bio: "Designs the screens you spend your day in, starting with what the keyboard can do.",
        email: "aiko@example.com",
        website: "#",
    },
    {
        name: "Sam Okafor",
        jobTitle: "Agent infrastructure",
        location: "Dublin",
        bio: "Looks after the sandboxes agents work in, and the limits that keep them there.",
        email: "sam@example.com",
        website: "#",
    },
    {
        name: "Lena Fischer",
        jobTitle: "Customer engineering",
        location: "Berlin",
        bio: "Moves teams over from other tools, history and all, usually within a week.",
        email: "lena@example.com",
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
