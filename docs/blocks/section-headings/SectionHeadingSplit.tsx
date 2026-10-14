import { SectionHeading03 } from "@openwarelabs/blocks";
import { ArrowRight } from "lucide-react";

export function SectionHeadingSplit() {
    return (
        <SectionHeading03
            eyebrow="Agents"
            title="Hand the routine work to agents, and keep the final say"
            description="Assign an issue and an agent branches, writes the change and runs your tests. It comes back as a pull request with its reasoning, ready for review."
            action={{ label: "How agents work", href: "#agents", endIcon: <ArrowRight size={16} /> }}
        />
    );
}
