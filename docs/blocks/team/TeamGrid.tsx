import { Team01, type Team01Person } from "@openwarelabs/blocks";
import { Link } from "@openwarelabs/ui";

// Faces take one of three tones (brand, soft, ink), so a row of initials doesn't read as one shape repeated.
const people: Team01Person[] = [
    { name: "Maya Chen", jobTitle: "Co-founder and CEO", tone: "brand" },
    { name: "Jonas Berg", jobTitle: "Co-founder and CTO", tone: "soft" },
    { name: "Clara Novak", jobTitle: "Head of engineering", tone: "ink" },
    { name: "Aiko Tanaka", jobTitle: "Product designer", tone: "soft" },
    { name: "Tomás Reyes", jobTitle: "Product engineer", tone: "ink" },
    { name: "Sam Okafor", jobTitle: "Agent infrastructure", tone: "brand" },
    { name: "Lena Fischer", jobTitle: "Customer engineering", tone: "soft" },
    { name: "Omar Haddad", jobTitle: "Design engineer", tone: "brand" },
];

export function TeamGrid() {
    return (
        <Team01
            eyebrow="Team"
            title="The people behind Acme"
            description="Twenty-two of us in Dublin, Berlin and Lisbon, building the tools we wanted at our last jobs."
            people={people}
            note={
                <>
                    We're hiring for four roles in engineering and design. <Link href="#">See open roles</Link>
                </>
            }
        />
    );
}
