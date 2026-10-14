import { useRef, useState } from "react";

import {
    PromptInput,
    PromptSuggestion,
    PromptSuggestions,
    Stack,
    Text,
    toast,
} from "@openwarelabs/ui";
import {
    FileSearch,
    GitPullRequest,
    Lightbulb,
    NotebookPen,
    Rocket,
    TestTubeDiagonal,
} from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "PromptSuggestion",
    category: "AI",
    description:
        "A suggested prompt to start from: a quiet pill, or a card with a line about what the agent will do. PromptSuggestions sets them out as a named group.",
    source: "components/PromptInput/PromptSuggestion.tsx",
    imports: ["PromptSuggestion", "PromptSuggestions"],
    props: ["PromptSuggestionProps", "PromptSuggestionsProps"],
    keyboard: [
        ["Tab", "Moves to the next suggestion."],
        ["Enter or Space", "Picks the suggestion."],
    ],
    notes: [
        'Each suggestion is a button, and PromptSuggestions is a group named by its aria-label ("Suggested prompts" unless you say otherwise), so screen readers hear the set\'s name, then each prompt.',
        "Picking a suggestion usually fills the PromptInput and moves focus there, so the prompt can be edited before it's sent. Send at once only when the prompt needs nothing more.",
        "Pills suit prompts of a few words. Give a longer idea a card, with the detail in its description.",
        "Offer three to six, chosen for where the person is: the repository open, the run that just failed.",
    ],
    related: ["PromptInput", "Button", "ChoiceCard"],
    since: "0.5.0",
};

const starters = [
    "Write tests for invoice dates",
    "Update the API reference",
    "Why did mobile-app fail?",
    "Summarise this week's merges",
];

/** Pills under the box: picking one fills it, ready to edit and send. */
export function Pills() {
    const [task, setTask] = useState("");
    const input = useRef<HTMLTextAreaElement>(null);
    return (
        <div style={{ display: "grid", gap: 14, width: 600, maxWidth: "100%" }}>
            <PromptInput
                ref={input}
                value={task}
                onChange={setTask}
                placeholder="Describe a task…"
                onSubmit={(text) => {
                    toast.success("Task sent to the agent", { description: text });
                    setTask("");
                }}
            />
            <PromptSuggestions align="center" aria-label="Ideas to start from">
                {starters.map((starter) => (
                    <PromptSuggestion
                        key={starter}
                        icon={<Lightbulb size={16} />}
                        onClick={() => {
                            setTask(starter);
                            input.current?.focus();
                        }}
                    >
                        {starter}
                    </PromptSuggestion>
                ))}
            </PromptSuggestions>
        </div>
    );
}

const runs = [
    {
        title: "Review pull request #482",
        description: "Check the invoice date changes and leave comments.",
        icon: <GitPullRequest size={16} />,
    },
    {
        title: "Find flaky tests",
        description: "Compare the last 20 CI runs of billing-api.",
        icon: <TestTubeDiagonal size={16} />,
    },
    {
        title: "Draft the release notes",
        description: "From the pull requests merged since 2.14.0.",
        icon: <NotebookPen size={16} />,
    },
];

/** Cards with a description, in a grid of up to three columns that folds to one on a phone. These send at once. */
export function Cards() {
    return (
        <div style={{ width: 720, maxWidth: "100%" }}>
            <PromptSuggestions layout="grid" columns={3} aria-label="Tasks for the agent">
                {runs.map((run) => (
                    <PromptSuggestion
                        key={run.title}
                        icon={run.icon}
                        description={run.description}
                        onClick={() =>
                            toast.success("Task sent to the agent", { description: run.title })
                        }
                    >
                        {run.title}
                    </PromptSuggestion>
                ))}
            </PromptSuggestions>
        </div>
    );
}
Cards.layout = { fill: true, ground: "canvas" as const };

/** Without icons, lined up at the start. One that can't run yet is disabled, with the reason beside it. */
export function States() {
    return (
        <Stack gap="lg">
            <PromptSuggestions aria-label="Follow-ups">
                <PromptSuggestion onClick={() => toast("Filled the box")}>
                    Explain the change
                </PromptSuggestion>
                <PromptSuggestion onClick={() => toast("Filled the box")}>
                    Add a test for it
                </PromptSuggestion>
                <PromptSuggestion disabled>Deploy to staging</PromptSuggestion>
            </PromptSuggestions>
            <div style={{ display: "grid", gap: 8, width: 340, maxWidth: "100%" }}>
                <PromptSuggestion
                    icon={<FileSearch size={16} />}
                    description="Read the last deploy's logs and explain what went wrong."
                    disabled
                >
                    Why did the deploy fail?
                </PromptSuggestion>
                <Text variant="caption">
                    <Rocket
                        size={12}
                        aria-hidden="true"
                        style={{ verticalAlign: -1, marginRight: 6 }}
                    />
                    Nothing has been deployed from this repository yet.
                </Text>
            </div>
        </Stack>
    );
}
States.layout = { align: "start" as const };
