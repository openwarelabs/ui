import { useEffect, useRef, useState } from "react";

import { Badge, Button, CopyButton, Link, toast } from "@openwarelabs/ui";
import { Check, House, RotateCw, X } from "lucide-react";

import "./ErrorServer.css";

const errorId = "err_01JA7K3M9X2VQ4";

const hops = [
    { name: "Your browser", detail: "Request sent", time: "0 ms" },
    { name: "Acme edge", detail: "Dublin", time: "8 ms" },
    { name: "Workspace service", detail: "eu-west-1", time: "34 ms" },
    { name: "Database", detail: "No answer", time: "30 s", failed: true },
];

export function ErrorServer() {
    const [retrying, setRetrying] = useState(false);
    const [tries, setTries] = useState(1);
    const timer = useRef(0);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    // Stands in for loading the page again; here it fails again, so the page stays.
    const tryAgain = () => {
        setRetrying(true);
        timer.current = window.setTimeout(() => {
            setRetrying(false);
            setTries((count) => count + 1);
            toast.error("Still not loading", { description: "We've logged it with your error ID and we're looking into it. Try again in a few minutes." });
        }, 1400);
    };

    return (
        <div className="error-server">
            <header className="error-server__bar">
                <a className="error-server__logo" href="#" aria-label="Acme overview">
                    <span className="error-server__mark" aria-hidden="true" />
                    Acme
                </a>
                <Link href="#" variant="standalone" className="error-server__status-link">
                    <span className="error-server__status-dot" aria-hidden="true" />
                    Some systems slow
                </Link>
            </header>

            <main className="error-server__main">
                <div>
                    <Badge size="sm" variant="danger">
                        Error 500
                    </Badge>
                    <h1 className="error-server__title">Something went wrong on our side</h1>
                    <p className="error-server__text">
                        We couldn't load this page. It isn't something you did, and nothing you've saved is lost. Try again in a moment.
                    </p>
                    <div className="error-server__actions">
                        <Button variant="primary" startIcon={<RotateCw size={16} />} loading={retrying} onClick={tryAgain}>
                            {retrying ? "Trying again…" : "Try again"}
                        </Button>
                        <Button startIcon={<House size={16} />}>Go to overview</Button>
                    </div>

                    <div className="error-server__report">
                        <p className="error-server__report-label">If it keeps happening</p>
                        <p className="error-server__report-text">
                            Send this error ID to <Link href="#">support@example.com</Link> and we'll find exactly what went wrong.
                            {tries > 1 ? ` You've tried ${tries} times.` : ""}
                        </p>
                        <div className="error-server__id">
                            <span className="error-server__id-label">Error ID</span>
                            <code>{errorId}</code>
                            <CopyButton value={errorId} label="Copy ID" />
                        </div>
                    </div>
                </div>

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
            </main>
        </div>
    );
}
