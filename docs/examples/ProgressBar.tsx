import { useEffect, useState } from "react";

import { Button, ProgressBar, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ProgressBar",
    category: "Feedback",
    description:
        "How far a task has got: Commandr's thin pipeline bar, or a sliding segment when the length isn't known.",
    source: "components/Progress/Progress.tsx",
    props: ["ProgressBarProps"],
    notes: [
        "It's a progressbar with its value; leave value out for work of unknown length.",
        "With reduced motion, the unknown-length bar stops sliding and shows as a faint full bar.",
    ],
    related: ["ProgressCircle", "Spinner", "Steps"],
};

/** A label, the value, and valueLabel to say it in words. */
export function Basic() {
    return (
        <Stack gap="2xl" style={{ width: 400, maxWidth: "100%" }}>
            <ProgressBar label="Pipeline" value={3} max={8} valueLabel="Stage 3 of 8" />
            <ProgressBar label="Uploading" value={64} size="md" />
        </Stack>
    );
}

/** Tones for a result: success, warning or danger. */
export function Tones() {
    return (
        <Stack gap="2xl" style={{ width: 400, maxWidth: "100%" }}>
            <ProgressBar label="Tests passing" value={100} tone="success" size="md" />
            <ProgressBar label="Budget used" value={86} tone="warning" size="md" />
            <ProgressBar
                label="Storage"
                value={97}
                tone="danger"
                size="md"
                valueLabel="9.7 of 10 GB"
            />
        </Stack>
    );
}

/** No value: a segment slides across while the length isn't known. */
export function Indeterminate() {
    return (
        <div style={{ width: 400, maxWidth: "100%" }}>
            <ProgressBar label="Checking your licence" />
        </div>
    );
}

/** It animates between values. */
export function Live() {
    const [value, setValue] = useState(0);
    const [running, setRunning] = useState(false);
    useEffect(() => {
        if (!running) return;
        const timer = setInterval(() => setValue((current) => Math.min(100, current + 4)), 120);
        return () => clearInterval(timer);
    }, [running]);
    useEffect(() => {
        if (value >= 100) setRunning(false);
    }, [value]);
    return (
        <Stack gap="lg" style={{ width: 400, maxWidth: "100%" }}>
            <ProgressBar
                label="Installing update"
                value={value}
                size="md"
                tone={value === 100 ? "success" : "primary"}
            />
            <Button
                size="sm"
                onClick={() => {
                    setValue(0);
                    setRunning(true);
                }}
                disabled={running}
            >
                {value === 100 ? "Run again" : "Start"}
            </Button>
        </Stack>
    );
}
