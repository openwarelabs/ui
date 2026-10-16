import { useId, useState } from "react";

import { Field, ListBox, Stack, Text } from "@openwarelabs/ui";
import { Bot, Eye, GitBranch, GitPullRequest, User } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ListBox",
    category: "Choices",
    description:
        "A list of options that stays on the page, for a setting or a picker in a panel. It looks like Select's open list and moves the same way.",
    source: "components/ListBox/ListBox.tsx",
    props: ["ListBoxProps", "ListBoxOption", "ListBoxGroup"],
    keyboard: [
        ["Tab", "Moves into the list, onto the first selected option or else the first option."],
        ["Up or Down", "Moves through the options, skipping disabled ones."],
        ["Home or End", "Goes to the first or last option."],
        ["Letters", "Jumps to the next option starting with what's typed."],
        [
            "Space or Enter",
            "Selects the highlighted option. In a multiple list, adds or removes it.",
        ],
        [
            "Shift + Down",
            "In a multiple list, moves down and selects on the way (Shift + Up goes up).",
        ],
        [
            "Shift + End",
            "In a multiple list, selects down to the last option (Shift + Home, up to the first).",
        ],
        [
            "Shift + Space",
            "In a multiple list, selects from the last option chosen to the highlighted one.",
        ],
        [
            "Ctrl + A",
            "In a multiple list, selects every option, or none when they're all selected (⌘ + A on a Mac).",
        ],
    ],
    notes: [
        "Focus stays on the list; the highlighted option follows with aria-activedescendant, as in Select.",
        "In a Field, the Field's label names the list. Elsewhere, give it an aria-label or aria-labelledby.",
        "In single mode, choosing the selected option again clears it. Set disallowEmptySelection when there must always be a choice.",
        "Use Select when the choice can fold away into a form row, and RadioGroup or CheckboxGroup for a few options in a form.",
    ],
    related: ["Select", "Combobox", "CheckboxGroup", "RadioGroup"],
    since: "0.4.0",
};

/** One choice, controlled, in a Field that names it. disallowEmptySelection keeps one option chosen. */
export function Basic() {
    const [handoff, setHandoff] = useState("pull-request");
    return (
        <div style={{ width: 380, maxWidth: "100%" }}>
            <Field label="When an agent finishes a task" hint="You can change this for each task.">
                <ListBox
                    value={handoff}
                    onChange={setHandoff}
                    disallowEmptySelection
                    options={[
                        {
                            value: "pull-request",
                            label: "Open a pull request",
                            description: "Asks the code owners for a review.",
                            icon: <GitPullRequest size={16} />,
                        },
                        {
                            value: "branch",
                            label: "Push to a branch",
                            description: "Nothing is opened until you say so.",
                            icon: <GitBranch size={16} />,
                        },
                        {
                            value: "review",
                            label: "Wait for my review",
                            description: "The changes stay in the agent's workspace.",
                            icon: <Eye size={16} />,
                        },
                    ]}
                />
            </Field>
        </div>
    );
}
Basic.layout = { align: "start" as const };

/**
 * selectionMode="multiple" makes the value an array, in the options' order. Shift with the arrows extends the
 * selection, and Ctrl + A or ⌘ + A selects everything.
 */
export function Multiple() {
    const [events, setEvents] = useState(["failed", "review"]);
    return (
        <div style={{ width: 380, maxWidth: "100%" }}>
            <Field label="Email me about" hint={`${events.length} of 5 selected`}>
                <ListBox
                    selectionMode="multiple"
                    value={events}
                    onChange={setEvents}
                    options={[
                        { value: "failed", label: "Agent runs that fail" },
                        { value: "review", label: "Changes waiting for my review" },
                        { value: "merged", label: "Pull requests merged" },
                        { value: "deploys", label: "Deploys to production" },
                        {
                            value: "digest",
                            label: "A weekly summary",
                            description: "Sent on Monday mornings.",
                        },
                    ]}
                />
            </Field>
        </div>
    );
}
Multiple.layout = { align: "start" as const };

/** A picker in a panel: groups under headings, icons, a disabled option, and maxHeight to scroll. */
export function Picker() {
    const headingId = useId();
    const [assignee, setAssignee] = useState("sonnet");
    return (
        <Stack gap="sm" style={{ width: 300, maxWidth: "100%" }}>
            <Text variant="label" as="h3" id={headingId} style={{ margin: 0 }}>
                Assign “Fix the flaky checkout test”
            </Text>
            <ListBox
                aria-labelledby={headingId}
                maxHeight={264}
                value={assignee}
                onChange={setAssignee}
                options={[
                    {
                        label: "Agents",
                        options: [
                            {
                                value: "sonnet",
                                label: "Claude Sonnet",
                                description: "Quick; right for most fixes",
                                icon: <Bot size={16} />,
                            },
                            {
                                value: "opus",
                                label: "Claude Opus",
                                description: "Slower; for the hard ones",
                                icon: <Bot size={16} />,
                            },
                            {
                                value: "review-bot",
                                label: "Review bot",
                                description: "Busy until 14:00",
                                icon: <Bot size={16} />,
                                disabled: true,
                            },
                        ],
                    },
                    {
                        label: "People",
                        options: [
                            { value: "alex", label: "Alex Silver", icon: <User size={16} /> },
                            { value: "aoife", label: "Aoife O'Sullivan", icon: <User size={16} /> },
                            { value: "caoimhe", label: "Caoimhe Brennan", icon: <User size={16} /> },
                            { value: "sean", label: "Seán McCarthy", icon: <User size={16} /> },
                        ],
                    },
                ]}
            />
            <Text variant="caption">Unassigned tasks go to the next free agent.</Text>
        </Stack>
    );
}
Picker.layout = { align: "start" as const, ground: "canvas" as const };

/** Small lists: invalid in a Field with an error, read-only, disabled, and empty with a message. */
export function States() {
    const environments = [
        { value: "preview", label: "Preview" },
        { value: "staging", label: "Staging" },
        { value: "production", label: "Production" },
    ];
    return (
        <Stack direction="row" gap="xl" wrap align="start" justify="center">
            <div style={{ width: 200 }}>
                <Field label="Deploy to" error="Choose where to deploy.">
                    <ListBox size="sm" options={environments} />
                </Field>
            </div>
            <div style={{ width: 200 }}>
                <Field label="Plan" hint="Only owners can change the plan.">
                    <ListBox
                        size="sm"
                        isReadOnly
                        defaultValue="team"
                        options={[
                            { value: "starter", label: "Starter" },
                            { value: "team", label: "Team" },
                            { value: "business", label: "Business" },
                        ]}
                    />
                </Field>
            </div>
            <div style={{ width: 200 }}>
                <Field label="Branch" hint="Connect GitHub first">
                    <ListBox
                        size="sm"
                        disabled
                        defaultValue="main"
                        options={[
                            { value: "main", label: "main" },
                            { value: "develop", label: "develop" },
                        ]}
                    />
                </Field>
            </div>
            <div style={{ width: 200 }}>
                <Field label="Repository">
                    <ListBox size="sm" options={[]} emptyMessage="No repositories connected yet." />
                </Field>
            </div>
        </Stack>
    );
}
States.layout = { align: "start" as const };
