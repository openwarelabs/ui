import { useState } from "react";

import { Button, Stack, Steps } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Steps",
    category: "Navigation",
    description:
        "Progress through a sequence: a first-run checklist, or a strip across the top of a multi-step form.",
    source: "components/Steps/Steps.tsx",
    imports: ["Steps", "type StepItem"],
    props: ["StepsProps", "StepItem"],
    notes: [
        'It\'s an ordered list. The current step has aria-current="step", and done steps say so to screen readers.',
    ],
    related: ["ProgressBar", "Tabs"],
};

/** A vertical checklist with an action on the current step. */
export function Checklist() {
    const [current, setCurrent] = useState(1);
    return (
        <div style={{ width: 380, maxWidth: "100%" }}>
            <Steps
                title="Get started"
                current={current}
                items={[
                    { title: "Add an API key", description: "Anthropic or OpenAI." },
                    {
                        title: "Open a project",
                        description: "A folder, or start from an idea.",
                        action: (
                            <Button size="sm" variant="primary" onClick={() => setCurrent(2)}>
                                Open
                            </Button>
                        ),
                    },
                    {
                        title: "Run the pipeline",
                        description: "The agents plan, build and review.",
                    },
                    { title: "Ship it", description: "Publish when you're happy." },
                ]}
            />
        </div>
    );
}
Checklist.layout = { align: "start" as const };

/** A horizontal strip for the top of a form. */
export function Horizontal() {
    const [current, setCurrent] = useState(1);
    return (
        <Stack gap="xl" style={{ width: 520, maxWidth: "100%" }}>
            <Steps
                orientation="horizontal"
                label="Checkout"
                current={current}
                items={[
                    { title: "Details" },
                    { title: "Plan" },
                    { title: "Payment" },
                    { title: "Done" },
                ]}
            />
            <Stack direction="row" gap="sm" justify="end">
                <Button disabled={current === 0} onClick={() => setCurrent(current - 1)}>
                    Back
                </Button>
                <Button
                    variant="primary"
                    disabled={current === 4}
                    onClick={() => setCurrent(current + 1)}
                >
                    {current >= 3 ? "Finish" : "Continue"}
                </Button>
            </Stack>
        </Stack>
    );
}
