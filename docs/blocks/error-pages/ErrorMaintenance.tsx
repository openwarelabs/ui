import { useEffect, useRef, useState } from "react";

import { Badge, Button, DotGrid, Link, ProgressBar, Steps, toast } from "@openwarelabs/ui";
import { ArrowUpRight, BellRing, Check, Clock, RotateCw } from "lucide-react";

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

export function ErrorMaintenance() {
    const [checking, setChecking] = useState(false);
    const [notify, setNotify] = useState(false);
    const timer = useRef(0);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    // Stands in for reloading: while maintenance runs, it comes back with the same page.
    const checkAgain = () => {
        setChecking(true);
        timer.current = window.setTimeout(() => {
            setChecking(false);
            toast.info("Still under way", { description: "We're on step 3 of 5, and still on track for 07:00 CET." });
        }, 1200);
    };

    return (
        <div className="error-maintenance">
            <DotGrid fade className="error-maintenance__ground">
                <header className="error-maintenance__bar">
                    <a className="error-maintenance__logo" href="#" aria-label="Acme home">
                        <span className="error-maintenance__mark" aria-hidden="true" />
                        Acme
                    </a>
                    <Link href="#" variant="standalone" className="error-maintenance__status">
                        Status page
                        <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                </header>

                <main className="error-maintenance__main">
                    <div>
                        <Badge size="sm" variant="warning">
                            Planned maintenance
                        </Badge>
                        <h1 className="error-maintenance__title">Acme is down for maintenance</h1>
                        <p className="error-maintenance__text">
                            We're moving every workspace to a faster database. Everything you've saved is safe, and paused agent runs will carry on afterwards.
                        </p>

                        <div className="error-maintenance__back">
                            <span className="error-maintenance__clock" aria-hidden="true">
                                <Clock size={20} />
                            </span>
                            <p className="error-maintenance__time">
                                <strong>Back by 07:00 CET</strong>
                                <span>Tuesday 14 Oct, about 40 minutes from now</span>
                            </p>
                        </div>

                        <div className="error-maintenance__actions">
                            <Button variant="primary" startIcon={<RotateCw size={16} />} loading={checking} onClick={checkAgain}>
                                Check again
                            </Button>
                            <Button
                                startIcon={notify ? <Check size={16} /> : <BellRing size={16} />}
                                disabled={notify}
                                onClick={() => {
                                    setNotify(true);
                                    toast.success("We'll email you when Acme is back", { description: "Updates also go to the status page as they happen." });
                                }}
                            >
                                {notify ? "We'll email you" : "Email me when it's back"}
                            </Button>
                        </div>
                    </div>

                    <div className="error-maintenance__plan">
                        <Steps title="Maintenance plan" current={2} items={plan} />
                    </div>
                </main>
            </DotGrid>
        </div>
    );
}
