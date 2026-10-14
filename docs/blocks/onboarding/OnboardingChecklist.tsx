import { Onboarding01 } from "@openwarelabs/blocks";
import { Link } from "@openwarelabs/ui";
import { ArrowRight, LifeBuoy } from "lucide-react";

// Stands in for the real work: an invite sent, an issue picked. The step checks off when it's done.
const wait = () => new Promise<void>((resolve) => window.setTimeout(resolve, 700));

/** Each step's action; in your app these open the invite dialog, the issue picker and so on. */
const steps = [
    {
        title: "Create your workspace",
        description: "Name it and pick the address your team will use.",
        actionLabel: "Create workspace",
        onAction: wait,
    },
    {
        title: "Connect GitHub",
        description: "Acme reads issues and opens pull requests in the repositories you choose.",
        actionLabel: "Connect GitHub",
        onAction: wait,
    },
    {
        title: "Invite your team",
        description: "Free for up to five people. Each gets an email with a link to join.",
        actionLabel: "Invite people",
        onAction: wait,
    },
    {
        title: "Hand a task to an agent",
        description: "Pick a small issue. The agent plans it, writes the change and asks you to review it.",
        actionLabel: "Pick an issue",
        onAction: wait,
    },
    {
        title: "Ship your first deploy",
        description: "Merge the reviewed change and watch marketing-site go live.",
        actionLabel: "Open deploys",
        onAction: wait,
    },
];

export function OnboardingChecklist() {
    return (
        <Onboarding01
            eyebrow="Getting started"
            title="Get Acme ready for your team"
            description="Five short steps, about ten minutes. You can change any of it later in Settings."
            finishedTitle="Acme is ready for your team"
            finishedDescription="Your team is in, an agent has shipped its first change, and you know where deploys live."
            steps={steps}
            stepsTitle="Set up your workspace"
            defaultCompleted={2}
            help={
                <>
                    <LifeBuoy size={16} aria-hidden="true" />
                    <span>
                        Stuck? Read the <Link href="#">setup guide</Link> or ask us in the chat.
                    </span>
                </>
            }
            finishedAction={{ label: "Go to overview", endIcon: <ArrowRight size={16} /> }}
        />
    );
}
