import { Cta01 } from "@openwarelabs/blocks";
import { ArrowRight, Clock } from "lucide-react";

export function CtaBanner() {
    return (
        <Cta01
            title="Give an agent its first issue today"
            description="Connect a repository, hand over something routine, and review the pull request it opens. Free for teams of up to five."
            primaryAction={{ label: "Start for free", href: "#start", endIcon: <ArrowRight size={16} /> }}
            secondaryAction={{ label: "Book a demo", href: "#demo" }}
            note={
                <>
                    <Clock size={14} aria-hidden="true" />
                    Most teams are set up in ten minutes.
                </>
            }
        />
    );
}
