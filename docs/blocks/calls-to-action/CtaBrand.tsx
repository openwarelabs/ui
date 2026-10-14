import { Cta02 } from "@openwarelabs/blocks";
import { ArrowRight } from "lucide-react";

export function CtaBrand() {
    return (
        <Cta02
            eyebrow="Ready when you are"
            title="Spend this week on the work only your team can do"
            description="Hand the dependency bumps, flaky tests and copy changes to agents. Review what they open, and ship it the same afternoon."
            primaryAction={{ label: "Start for free", href: "#start", endIcon: <ArrowRight size={16} /> }}
            secondaryLink={{ label: "Talk to sales", href: "#" }}
            facts={["Free for up to five people", "No card needed", "Your code stays in the EU"]}
        />
    );
}
