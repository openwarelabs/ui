import { ErrorPage02 } from "@openwarelabs/blocks";
import { Link, toast } from "@openwarelabs/ui";
import { Check, House, X } from "lucide-react";

import "./ErrorServer.css";

const hops = [
    { name: "Your browser", detail: "Request sent", time: "0 ms" },
    { name: "Acme edge", detail: "Dublin", time: "8 ms" },
    { name: "Workspace service", detail: "eu-west-1", time: "34 ms" },
    { name: "Database", detail: "No answer", time: "30 s", failed: true },
];

// Stands in for loading the page again; here it fails again, so the page stays.
const tryAgain = () =>
    new Promise<void>((resolve) =>
        window.setTimeout(() => {
            resolve();
            toast.error("Still not loading", { description: "We've logged it with your error ID and we're looking into it. Try again in a few minutes." });
        }, 1400),
    );

export function ErrorServer() {
    return (
        <ErrorPage02
            brand={{ name: "Acme", href: "#", logo: <span className="error-server__mark" aria-hidden="true" /> }}
            statusLink={{ label: "Some systems slow", href: "#" }}
            badge="Error 500"
            title="Something went wrong on our side"
            description="We couldn't load this page. It isn't something you did, and nothing you've saved is lost. Try again in a moment."
            onRetry={tryAgain}
            homeAction={{ label: "Go to overview", startIcon: <House size={16} /> }}
            report={
                <>
                    Send this error ID to <Link href="#">support@example.com</Link> and we'll find exactly what went wrong.
                </>
            }
            errorId="err_01JA7K3M9X2VQ4"
            labels={{ home: "Acme overview" }}
            visual={
                <div
                    className="error-server__trace"
                    role="img"
                    aria-label="The request reached the Acme edge in Dublin and the workspace service, but the database didn't answer within 30 seconds."
                >
                    <div className="error-server__trace-head">
                        <code>GET /projects/billing-api</code>
                        <span>12:41:07</span>
                    </div>
                    <ol className="error-server__hops">
                        {hops.map((hop) => (
                            <li key={hop.name} className={`error-server__hop${hop.failed ? " error-server__hop--failed" : ""}`}>
                                <span className="error-server__hop-icon">{hop.failed ? <X size={14} /> : <Check size={14} />}</span>
                                <span className="error-server__hop-name">
                                    <strong>{hop.name}</strong>
                                    <span>{hop.detail}</span>
                                </span>
                                <span className="error-server__hop-time">{hop.time}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            }
        />
    );
}
