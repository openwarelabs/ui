import { Notifications03, type Notifications03Group, type Notifications03Value } from "@openwarelabs/blocks";
import { Mail, Smartphone } from "lucide-react";

const channels = [
    { id: "email", label: "Email", icon: <Mail size={15} aria-hidden="true" /> },
    { id: "push", label: "Push", icon: <Smartphone size={15} aria-hidden="true" /> },
];

const groups: Notifications03Group[] = [
    {
        label: "Reviews",
        events: [
            { id: "review-requested", label: "Someone asks for your review", description: "From a person or an agent." },
            { id: "review-result", label: "Your change is approved or needs work" },
            { id: "mention", label: "Someone mentions you", description: "In a comment, a review or a task." },
        ],
    },
    {
        label: "Agents",
        events: [
            { id: "agent-approval", label: "An agent needs your approval", description: "Before it pushes, deploys or goes over its budget." },
            { id: "agent-failed", label: "An agent run fails" },
            { id: "agent-finished", label: "An agent run finishes" },
        ],
    },
    {
        label: "Deploys",
        events: [
            { id: "deploy-failed", label: "A deploy fails", description: "Only for projects you're a member of." },
            { id: "deploy-live", label: "A deploy goes live" },
        ],
    },
    {
        label: "Workspace",
        events: [
            { id: "member-joined", label: "Someone joins the workspace" },
            { id: "weekly-summary", label: "Weekly summary", description: "What shipped, every Monday at 09:00.", unavailable: ["push"] },
        ],
    },
];

const initial: Notifications03Value = {
    "review-requested": ["email", "push"],
    "review-result": ["email"],
    mention: ["email", "push"],
    "agent-approval": ["push"],
    "agent-failed": ["email", "push"],
    "agent-finished": [],
    "deploy-failed": ["email", "push"],
    "deploy-live": [],
    "member-joined": ["email"],
    "weekly-summary": ["email"],
};

export function NotificationsSettings() {
    return (
        <Notifications03
            title="Notifications"
            description="Choose what reaches you by email and on your phone. Everything still shows in your Acme inbox."
            channels={channels}
            groups={groups}
            defaultValue={initial}
            options={[
                {
                    kind: "select",
                    id: "digest",
                    label: "Send emails",
                    description: "Bundling sends fewer emails; anything that needs you still comes at once.",
                    options: [
                        { value: "instant", label: "As they happen" },
                        { value: "hourly", label: "Once an hour" },
                        { value: "daily", label: "Once a day, at 09:00" },
                    ],
                    defaultValue: "instant",
                },
                {
                    kind: "switch",
                    id: "quiet-hours",
                    label: "Quiet hours",
                    description: "No push notifications from 19:00 to 08:00 or at weekends, except for failed deploys.",
                    defaultValue: true,
                },
            ]}
        />
    );
}
