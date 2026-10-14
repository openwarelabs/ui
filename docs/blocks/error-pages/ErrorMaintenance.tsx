import { ErrorPage03 } from "@openwarelabs/blocks";
import { ProgressBar, toast } from "@openwarelabs/ui";

import "./ErrorMaintenance.css";

const plan = [
    { title: "Pause agent runs and deploys", description: "Nothing is lost; they wait in the queue." },
    { title: "Copy workspaces to the new database", description: "Every project, review and deploy." },
    {
        title: "Check every copy",
        description: (
            <>
                Comparing each workspace with the original.
                <ProgressBar className="error-maintenance__progress" label="Workspaces checked" value={18} max={24} valueLabel="18 of 24" />
            </>
        ),
    },
    { title: "Switch everyone over", description: "Sign-ins and links work as before." },
    { title: "Resume agent runs and deploys", description: "Paused runs pick up where they stopped." },
];

// Stands in for reloading: while maintenance runs, it comes back with the same page.
const checkAgain = () =>
    new Promise<void>((resolve) =>
        window.setTimeout(() => {
            resolve();
            toast.info("Still under way", { description: "We're on step 3 of 5, and still on track for 07:00 CET." });
        }, 1200),
    );

export function ErrorMaintenance() {
    return (
        <ErrorPage03
            brand={{ name: "Acme", href: "#", logo: <span className="error-maintenance__mark" aria-hidden="true" /> }}
            statusLink={{ label: "Status page", href: "#" }}
            badge="Planned maintenance"
            title="Acme is down for maintenance"
            description="We're moving every workspace to a faster database. Everything you've saved is safe, and paused agent runs will carry on afterwards."
            backTime="Back by 07:00 CET"
            backDetail="Tuesday 14 Oct, about 40 minutes from now"
            onCheckAgain={checkAgain}
            onNotify={() => toast.success("We'll email you when Acme is back", { description: "Updates also go to the status page as they happen." })}
            steps={plan}
            currentStep={2}
            labels={{ home: "Acme home" }}
        />
    );
}
