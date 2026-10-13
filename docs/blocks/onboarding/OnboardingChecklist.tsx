import { useEffect, useRef, useState } from "react";

import { Button, Link, ProgressBar, Steps, Text, type StepItem } from "@openwarelabs/ui";
import { ArrowRight, LifeBuoy, RotateCcw } from "lucide-react";

import "./OnboardingChecklist.css";

/** Each step's action; in your app these open the invite dialog, the issue picker and so on. */
const steps = [
    {
        title: "Create your workspace",
        description: "Name it and pick the address your team will use.",
        action: "Create workspace",
    },
    {
        title: "Connect GitHub",
        description: "Acme reads issues and opens pull requests in the repositories you choose.",
        action: "Connect GitHub",
    },
    {
        title: "Invite your team",
        description: "Free for up to five people. Each gets an email with a link to join.",
        action: "Invite people",
    },
    {
        title: "Hand a task to an agent",
        description: "Pick a small issue. The agent plans it, writes the change and asks you to review it.",
        action: "Pick an issue",
    },
    {
        title: "Ship your first deploy",
        description: "Merge the reviewed change and watch marketing-site go live.",
        action: "Open deploys",
    },
];

const firstOpenStep = 2;

export function OnboardingChecklist() {
    const [current, setCurrent] = useState(firstOpenStep);
    const [working, setWorking] = useState(false);
    const timer = useRef(0);
    const nextAction = useRef<HTMLButtonElement>(null);
    const moved = useRef(false);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    const finished = current >= steps.length;

    // The finished step's button goes away; keep the keyboard on the next one.
    useEffect(() => {
        if (moved.current) nextAction.current?.focus();
        moved.current = false;
    }, [current]);

    // Stands in for the real work: an invite sent, an issue picked. The step checks off when it's done.
    const complete = () => {
        setWorking(true);
        timer.current = window.setTimeout(() => {
            setWorking(false);
            moved.current = true;
            setCurrent((step) => step + 1);
        }, 700);
    };

    // Steps shows each step's button only while it's the current one, so only that one ever renders.
    const items: StepItem[] = steps.map((step) => ({
        title: step.title,
        description: step.description,
        action: (
            <Button ref={nextAction} size="sm" variant="primary" loading={working} onClick={complete}>
                {step.action}
            </Button>
        ),
    }));

    return (
        <section className="onboarding-checklist" aria-labelledby="onboarding-checklist-title">
            <div className="onboarding-checklist__panel">
                <div className="onboarding-checklist__intro">
                    <Text variant="caption" as="p" className="onboarding-checklist__eyebrow">
                        <span className="onboarding-checklist__dot" aria-hidden="true" />
                        Getting started
                    </Text>
                    <Text variant="heading" as="h2" id="onboarding-checklist-title" className="onboarding-checklist__title">
                        {finished ? "Acme is ready for your team" : "Get Acme ready for your team"}
                    </Text>
                    <Text variant="copy" className="onboarding-checklist__lead">
                        {finished
                            ? "Your team is in, an agent has shipped its first change, and you know where deploys live."
                            : "Five short steps, about ten minutes. You can change any of it later in Settings."}
                    </Text>

                    <ProgressBar
                        className="onboarding-checklist__progress"
                        label="Setup"
                        value={current}
                        max={steps.length}
                        valueLabel={`${Math.round((current / steps.length) * 100)}%`}
                    />

                    {finished ? (
                        <div className="onboarding-checklist__actions">
                            <Button ref={nextAction} variant="primary" endIcon={<ArrowRight size={16} />}>
                                Go to overview
                            </Button>
                            <Button variant="ghost" startIcon={<RotateCcw size={16} />} onClick={() => setCurrent(firstOpenStep)}>
                                Run setup again
                            </Button>
                        </div>
                    ) : (
                        <Text variant="copy" className="onboarding-checklist__help">
                            <LifeBuoy size={16} aria-hidden="true" />
                            <span>
                                Stuck? Read the <Link href="#">setup guide</Link> or ask us in the chat.
                            </span>
                        </Text>
                    )}
                </div>

                <Steps className="onboarding-checklist__steps" title="Set up your workspace" current={current} items={items} />
            </div>
        </section>
    );
}
