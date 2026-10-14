import { SectionHeading02 } from "@openwarelabs/blocks";

export function SectionHeadingWithLink() {
    return (
        <SectionHeading02
            eyebrow="Changelog"
            title="What we shipped this month"
            description="Agents that open their own pull requests, rollbacks in one click, and forty smaller fixes."
            link={{ label: "All releases", href: "#releases" }}
        />
    );
}
